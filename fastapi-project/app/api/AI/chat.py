from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, status, APIRouter, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, Field
from typing import List, Optional, AsyncGenerator, Dict, Any
import google.generativeai as genai
import logging
import json
import uuid
from datetime import datetime
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.api.User.auth import get_current_user, get_token_from_cookie, get_token_from_websocket_cookie, get_current_user_from_token
from app.db.session import get_db
from app.models.user import User
from app.services.chat import GeminiChatService
from app.schemas.chat import ChatMessage, ChatResponse, GenerateTextRequest, GenerateTextResponse
import os
from dotenv import load_dotenv
import asyncio
from sqlalchemy.orm import Session
from urllib.parse import parse_qs

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_chat_service(request: Request) -> GeminiChatService:
    return request.app.state.chat_service

router = APIRouter(
    tags=["AI Chat"],
    prefix="/api"
)


@router.post("/chat", response_model=ChatResponse)
async def chat(
    message: ChatMessage,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # ahora puede recibir request
):
    """REST endpoint para interacción de chat."""
    chat_service = request.app.state.chat_service
    full_response = ""
    async for chunk in chat_service.get_streaming_response(
        message.message,
        message.history
    ):
        full_response += chunk
    return ChatResponse(response=full_response)

@router.post("/generateText", response_model=GenerateTextResponse)
def generate_text_endpoint(
    request_data: GenerateTextRequest,
    chat_service: GeminiChatService = Depends(get_chat_service)
):
    """Endpoint para generación de texto directo sin historial."""
    try:
        generated_text = chat_service.generate_text(request_data.prompt)
        return GenerateTextResponse(generated_text=generated_text)
    except Exception as e:
        logger.error(f"Text generation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error en la generación de texto"
        )


async def get_current_user_ws(
    websocket: WebSocket,
    db: Session = Depends(get_db)
) -> User:
    """Authenticate WebSocket connections by parsing the cookie from the handshake."""
    try:
        token = get_token_from_websocket_cookie(websocket)
        # Run the sync function in a separate thread
        user = await asyncio.to_thread(get_current_user_from_token, token, db)
        return user
    except HTTPException as e:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        raise e
    except Exception as e:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        logger.error(f"WebSocket authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.WS_1008_POLICY_VIOLATION,
            detail="Could not validate credentials in WebSocket."
        )

@router.websocket("/ws/chat")
async def websocket_chat_endpoint(
    websocket: WebSocket,
    current_user: User = Depends(get_current_user_ws),
):
    """WebSocket endpoint for chat with authentication"""
    await websocket.accept()
    chat_service = websocket.app.state.chat_service  # Access your chat service

    try:
        while True:
            data = await websocket.receive_json()
            message = data.get("message")
            history = data.get("history", [])

            if not isinstance(message, str):
                await websocket.send_json({"error": "Invalid message format", "code": "invalid_format"})
                continue

            try:
                async for chunk in chat_service.get_streaming_response(message, history):
                    await websocket.send_json({"chunk": chunk, "done": False})
                await websocket.send_json({"chunk": "", "done": True})
            except Exception as e:
                logger.error(f"Streaming error: {str(e)}")
                await websocket.send_json({"error": str(e), "code": "stream_error"})

    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        if not websocket.client_state.disconnected:
            await websocket.close()

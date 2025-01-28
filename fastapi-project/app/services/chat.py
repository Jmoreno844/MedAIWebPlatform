from google.genai import types
from typing import AsyncGenerator, List, Optional
import logging
from fastapi import HTTPException, status
import asyncio
from app.prompts.medical_prompts import medical_case

logger = logging.getLogger(__name__)

class GeminiChatService:
    """Service for handling Gemini AI chat interactions through Vertex AI."""

    def __init__(self, genai_client):
        """Receive Vertex AI client from the outside (only one instance in the app)."""
        self.client = genai_client
        self.model = "gemini-2.0-flash-exp"
        self.chat_history = []
        self.tools = [
            types.Tool(google_search=types.GoogleSearch())]
        self.safety_settings = [
            types.SafetySetting(
                category="HARM_CATEGORY_HARASSMENT",
                threshold="BLOCK_MEDIUM_AND_ABOVE"
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_HATE_SPEECH",
                threshold="BLOCK_MEDIUM_AND_ABOVE"
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold="BLOCK_MEDIUM_AND_ABOVE"
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold="BLOCK_MEDIUM_AND_ABOVE"
            )
        ]

    def _format_message(self, message: str, role: str = "user") -> types.Part:
        """Format message for Vertex AI with proper parts structure."""
        return types.Part.from_text(message)

    def _format_history(self, history: List[dict]) -> List[types.Content]:
        """Format chat history for Vertex AI."""
        if not history:
            return []
        
        formatted_history = []
        for msg in history:
            # Handle both direct content and parts format
            if "parts" in msg:
                # Message is already in parts format
                content = msg["parts"][0].get("text", "")
                role = msg.get("role")
            else:
                # Message is in content format
                content = msg.get("content")
                role = msg.get("role")
            
            if content and role:
                formatted_msg = types.Content(
                    parts=[self._format_message(content)],
                    role="user" if role == "user" else "model"
                )
                formatted_history.append(formatted_msg)
            else:
                logger.error(f"Invalid message format in history: {msg}")
                    
        return formatted_history

    async def get_streaming_response(
        self,
        message: str,
        history: Optional[List[dict]] = None
    ) -> AsyncGenerator[str, None]:
        """Generate streaming response with chat history."""
        try:
            contents = self._format_history(history or [])
            contents.append(types.Content(
                parts=[self._format_message(message)],
                role="user"
            ))
            generate_config = types.GenerateContentConfig(
                temperature=0.6,
                top_p=0.95,
                top_k=40,
                max_output_tokens=8192,
                response_modalities=["TEXT"],
                safety_settings=self.safety_settings,
                tools=self.tools,
                system_instruction=[
                    types.Part.from_text(medical_case)
                ],
            )
            stream = self.client.models.generate_content_stream(
                model=self.model,
                contents=contents,
                config=generate_config,
            )
            for chunk in stream:
                if chunk.text:
                    yield chunk.text
                    await asyncio.sleep(0.01)
        except Exception as e:
            logger.error(f"Vertex AI error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"AI service error: {str(e)}"
            )

   
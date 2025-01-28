from fastapi import APIRouter, Depends, Request, FastAPI, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.api.User.auth import get_current_user
from app.models.plantilla import Plantilla
from app.models.user import User
from google import genai
from google.genai import types
from app.prompts.medical_prompts import documentation_instruction, generate_documentation_prompt
import os
import google.generativeai as genai

class GenerateRequest(BaseModel):
     transcripcion_consulta: str
     informacion_extra: str
     id_plantilla: int

class GenerateResponse(BaseModel):
    generated_text: str

router = APIRouter(
    tags=["AI Documentacion"],
    prefix="/api",
    dependencies=[Depends(get_current_user)]  # Comment out this line
)

def get_genai_client(request: Request):
    return request.app.state.genai_client

@router.post("/generarDocumento", response_model=GenerateResponse)
async def generate_content(
    request_data: GenerateRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # Comment out this line
):
    """
    Genera contenido utilizando la API de Gemini Vertex.
    """
    try: 
        plantilla = db.query(Plantilla.contenido).filter(Plantilla.id == request_data.id_plantilla).first()
        if not plantilla:
            raise HTTPException(status_code=404, detail="Plantilla no encontrada")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener la plantilla: {str(e)}")
    try:
        # Configure using environment variable
        genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

        # Set up model and generation config
        generation_config = {
            "temperature": 1,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 8192,
            "response_mime_type": "text/plain",
        }

        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash-exp",
            generation_config=generation_config,
        )

        prompt = generate_documentation_prompt(
            transcripcion_consulta=request_data.transcripcion_consulta,
            informacion_extra=request_data.informacion_extra,
            plantilla=plantilla
        )

        chat_session = model.start_chat(history=[])

        response = chat_session.send_message(prompt)

        return GenerateResponse(generated_text=response.text)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al generar contenido: {str(e)}"
        )
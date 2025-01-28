from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.session import db
from app.models.plantilla import Plantilla
from app.prompts.medical_prompts import documentation_instruction, generate_documentation_prompt
import httpx
import json
import os

router = APIRouter(
    prefix="/api"
)


# Se recomienda configurar la URL de Ollama mediante variables de entorno
OLLAMA_API_URL = os.getenv("OLLAMA_API_URL", "http://localhost:11434/api/chat")


class GenerateRequest(BaseModel):
     transcripcion_consulta: str
     informacion_extra: str
     id_plantilla: int

class GenerateResponse(BaseModel):
    generated_text: str


async def call_ollama(payload: dict) -> str:
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Enviar request en modo streaming
            async with client.stream("POST", OLLAMA_API_URL, json=payload) as response:
                response.raise_for_status()
                generated_text = ""
                async for line in response.aiter_lines():
                    if line:
                        data = json.loads(line)
                        if "message" in data and "content" in data["message"]:
                            generated_text += data["message"]["content"]
        return generated_text
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Error al comunicarse con Ollama: {str(e)}")


@router.post("/generate", response_model=GenerateResponse)
async def generate_text(request_data: GenerateRequest,
                        db: Session = Depends(get_db),
):
    try: 
        plantilla = db.query(Plantilla.contenido).filter(Plantilla.id == request_data.id_plantilla).first()
        if not plantilla:
            raise HTTPException(status_code=404, detail="Plantilla no encontrada")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener la plantilla: {str(e)}")
    data = generate_documentation_prompt(transcripcion_consulta=request_data.transcripcion_consulta, 
                                               informacion_extra=request_data.informacion_extra, 
                                               plantilla=plantilla)
    ollama_payload = {
        "model": "llama3.2",
        "messages": [
            {
                "role": "system",
                "content": documentation_instruction
            },
            {
                "role": "user",
                "content": data
            }
        ]
    }

    # Llamar a Ollama
    generated_text = await call_ollama(ollama_payload)
    return GenerateResponse(generated_text=generated_text)

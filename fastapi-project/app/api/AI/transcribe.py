from fastapi import FastAPI, File, UploadFile, APIRouter, HTTPException, Depends
from openai import OpenAI
import os
import logging
from typing import Dict, Union
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.transcripcion import Transcripcion


# Load environment variables
load_dotenv()

router = APIRouter(
    prefix="/api"
)
logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI()


@router.post("/transcribe/{encuentro_id}")
async def transcribe_audio(
    encuentro_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
) -> Dict[str, Union[str, int]]:
    try:
        # Validate file type
        if not file.content_type.startswith('audio/'):
            raise HTTPException(
                status_code=400,
                detail="File must be an audio file"
            )

        # Check if transcription exists
        existing_transcription = db.query(Transcripcion).filter(
            Transcripcion.encuentro_id == encuentro_id
        ).first()

        # Save file temporarily
        temp_file = f"temp_{file.filename}"
        try:
            with open(temp_file, "wb") as f:
                f.write(await file.read())

            # Transcribe using OpenAI API
            with open(temp_file, "rb") as audio_file:
                transcription = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="text",
                    language="es",
                    prompt="Este audio corresponde a una consulta médica con términos clínicos en español. El paciente describe síntomas y el doctor hace preguntas de diagnóstico."
                )

            if existing_transcription:
                # Update existing transcription
                existing_transcription.contenido = transcription
                db.commit()
                db.refresh(existing_transcription)
                transcription_id = existing_transcription.id
            else:
                # Create new transcription record
                db_transcription = Transcripcion(
                    contenido=transcription,
                    origen="transcripcion",
                    encuentro_id=encuentro_id
                )
                db.add(db_transcription)
                db.commit()
                db.refresh(db_transcription)
                transcription_id = db_transcription.id

            return {
                "transcription": transcription,
                "transcription_id": str(transcription_id)
            }

        except Exception as e:
            db.rollback()
            logger.error(f"Transcription error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Error during transcription"
            )
        finally:
            # Clean up temp file
            if os.path.exists(temp_file):
                os.remove(temp_file)

    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )


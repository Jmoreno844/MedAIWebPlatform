import threading  # Import threading instead of asyncio
from fastapi import FastAPI, File, UploadFile, APIRouter, HTTPException, Depends, BackgroundTasks, WebSocket
from sqlalchemy.orm import Session
import os
import logging
import subprocess
import time
import random
import asyncio
import gc
from typing import Dict, Union
from dotenv import load_dotenv
import torch
import whisper
from app.db.session import get_db, db  # Import db instead of SessionLocal
from app.models.transcripcion import Transcripcion

# Add imports
import queue
import threading
from concurrent.futures import ThreadPoolExecutor
from pydantic import BaseModel
from typing import Optional, List
import json
from itertools import cycle

# Load environment variables
load_dotenv()

router = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)

# Initialize Whisper model with device handling
device = "cuda" if torch.cuda.is_available() else "cpu"
try:
    model = whisper.load_model("small").to(device)
    logger.info(f"Whisper model loaded on {device}")
except Exception as e:
    logger.warning(f"Failed to load model on {device}, falling back to CPU")
    model = whisper.load_model("small").to("cpu")

# Semaphore to limit concurrent transcriptions
semaphore = threading.Semaphore(2)  # Limit to 2 concurrent transcriptions

# Create thread-safe queue and model lock
transcription_queue = queue.Queue()
model_lock = threading.Lock()
executor = ThreadPoolExecutor(max_workers=2)  # Limit to 2 worker threads

# Add WebSocket connections store
active_connections = {}

@router.websocket("/ws/transcription/{encuentro_id}")
async def websocket_endpoint(websocket: WebSocket, encuentro_id: str):
    await websocket.accept()
    active_connections[encuentro_id] = websocket
    try:
        while True:
            await websocket.receive_text()
    except Exception:
        active_connections.pop(encuentro_id, None)

def convert_to_wav(source_path: str, target_path: str):
    """Convert MP3 to WAV for better Whisper handling."""
    # Skip conversion if already .wav
    if os.path.splitext(source_path)[1].lower() == ".wav":
        return  # no conversion needed

    try:
        subprocess.run(
            ["ffmpeg", "-y", "-i", source_path, "-ar", "16000", "-ac", "1", target_path],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
    except subprocess.CalledProcessError as e:
        logger.error(f"FFmpeg error: {e.stderr.decode()}")
        raise

def reset_model_state():
    """Reset model state and clear CUDA cache"""
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
    gc.collect()

def get_unique_filename(original_filename: str) -> str:
    """Generate unique filename with timestamp and random suffix."""
    timestamp = int(time.time())
    random_suffix = random.randint(1000, 9999)
    base, ext = os.path.splitext(original_filename)
    return f"temp_{base}_{timestamp}_{random_suffix}{ext}".replace(" ", "_")

def get_audio_duration(file_path: str) -> float:
    """Get duration of audio file in seconds using ffprobe."""
    try:
        result = subprocess.run([
            'ffprobe', 
            '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1',
            file_path
        ], capture_output=True, text=True)
        return float(result.stdout)
    except Exception as e:
        logger.error(f"Error getting audio duration: {e}")
        return 0.0

async def notify_transcription_complete(encuentro_id: str, transcription: str):
    if encuentro_id in active_connections:
        websocket = active_connections[encuentro_id]
        await websocket.send_json({
            "status": "completed",
            "content": transcription
        })

class WhisperModelPool:
    def __init__(self, num_models=2):
        self.models: List[whisper.Whisper] = []
        self.locks: List[threading.Lock] = []
        self.current_model = cycle(range(num_models))
        
        # Initialize models
        device = "cuda" if torch.cuda.is_available() else "cpu"
        for _ in range(num_models):
            try:
                model = whisper.load_model("small").to(device)
                self.models.append(model)
                self.locks.append(threading.Lock())
                logger.info(f"Whisper model loaded on {device}")
            except Exception as e:
                logger.error(f"Failed to load model: {e}")
                raise

    def get_next_model(self):
        idx = next(self.current_model)
        return self.models[idx], self.locks[idx]

# Initialize model pool
model_pool = WhisperModelPool(num_models=2)

def run_transcription_bg(encuentro_id: str, temp_file: str) -> None:
    """Background task: transcribe audio and save to DB."""
    start_time = time.time()
    db_session = db.SessionLocal()
    existing_transcription = None
    try:
        # Acquire a semaphore slot
        with semaphore:
            # Convert to WAV first
            wav_file = temp_file.replace(".mp3", ".wav")
            convert_to_wav(temp_file, wav_file)
            
            audio_duration = get_audio_duration(temp_file)
            encuentro_id_int = int(encuentro_id)
            
            # Get next available model and its lock
            model, model_lock = model_pool.get_next_model()
            
            logger.info(f"Starting background transcription for encuentro {encuentro_id_int}")

            # Get or create transcription record
            existing_transcription = db_session.query(Transcripcion)\
                .filter(Transcripcion.encuentro_id == encuentro_id_int)\
                .first()

            if not existing_transcription:
                existing_transcription = Transcripcion(
                    encuentro_id=encuentro_id_int,
                    origen="transcripcion",
                    status="processing"
                )
                db_session.add(existing_transcription)
                db_session.commit()

            # Update status to processing
            existing_transcription.status = "processing" 
            db_session.commit()

            # Use model-specific lock
            with model_lock:
                reset_model_state()
                transcription_result = model.transcribe(
                    wav_file,
                    language="es",
                    prompt="Este audio corresponde a una consulta médica con términos clínicos en español.",
                    fp16=False
                )

            # Update transcription content
            transcription = transcription_result.get("text", "")
            existing_transcription.contenido = transcription
            existing_transcription.status = "completed"
            db_session.commit()
            
            # Notify via WebSocket
            
            asyncio.run(notify_transcription_complete(encuentro_id, transcription))
            
            logger.info(f"Completed transcription for encuentro {encuentro_id_int} - Process time: {time.time() - start_time:.2f}s, Audio duration: {audio_duration:.2f}s")

    except Exception as e:
        logger.error(f"Background transcription error: {str(e)}")
        if existing_transcription:
            existing_transcription.status = "failed"
            db_session.commit()
    finally:
        db_session.close()
        for f in [temp_file, wav_file]:
            if os.path.exists(f):
                os.remove(f)

@router.post("/transcribe/{encuentro_id}")
async def transcribe_audio_bg(
    encuentro_id: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
) -> Dict[str, Union[str, int]]:
    """Endpoint that triggers background transcription."""
    if not file:
        raise HTTPException(
            status_code=400,
            detail="No file uploaded"
        )

    if not file.content_type.startswith('audio/'):
        raise HTTPException(
            status_code=400,
            detail="File must be an audio file"
        )

    temp_file = get_unique_filename(file.filename)
    try:
        contents = await file.read()
        if not contents:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty"
            )

        with open(temp_file, "wb") as f:
            f.write(contents)

        # Submit to thread pool instead of background tasks
        executor.submit(run_transcription_bg, encuentro_id, temp_file)
        return {
            "status": "processing",
            "encuentro_id": encuentro_id,
            "detail": "Transcription queued"
        }

    except Exception as e:
        if os.path.exists(temp_file):
            os.remove(temp_file)
        logger.error(f"Error starting transcription: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error processing audio"
        )

# Update Pydantic model
class TranscriptionResponse(BaseModel):
    status: str
    transcription_id: int
    content: str = ""  # Default empty string, no Optional

@router.get("/transcribe/{encuentro_id}/status", response_model=TranscriptionResponse)
async def get_transcription_status(
    encuentro_id: str,
    db: Session = Depends(get_db)
) -> TranscriptionResponse:
    """Check transcription status and content."""
    transcription = db.query(Transcripcion).filter(Transcripcion.encuentro_id == encuentro_id).first()

    if not transcription:
        return TranscriptionResponse(
            status="not_found",
            transcription_id=0,
            content=""
        )
        
    # Ensure contenido is never None
    contenido = transcription.contenido if transcription.contenido else ""
    
    return TranscriptionResponse(
        status=transcription.status,
        transcription_id=transcription.id,
        content=contenido
    )
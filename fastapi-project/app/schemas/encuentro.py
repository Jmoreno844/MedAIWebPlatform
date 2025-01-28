from pydantic import BaseModel
from datetime import datetime
from typing import List

from app.schemas.transcripcion import TranscripcionBase
from app.schemas.documentacion import DocumentacionBase

class EncuentroCreate(BaseModel):
    identificador_paciente: int
    created_at: datetime = datetime.utcnow()

    class Config:
        orm_mode = True

class EncuentroBase(BaseModel):
    id: int
    id_paciente: int
    identificador_paciente: int
    created_at: datetime

    class Config:
        orm_mode = True


class EncuentroDetail(EncuentroBase):
    transcripciones: List[TranscripcionBase] = []
    documentaciones: List[DocumentacionBase] = []
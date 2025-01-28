from sqlalchemy import Column, Integer, String, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from app.db.session import Base
from enum import Enum

class TranscriptionStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class Transcripcion(Base):
    __tablename__ = "transcripciones"

    id = Column(Integer, primary_key=True, index=True)
    contenido = Column(Text)
    origen = Column(String(255))
    encuentro_id = Column(Integer, ForeignKey("encuentros.id"))
    status = Column(SQLEnum(TranscriptionStatus), nullable=False, default=TranscriptionStatus.PENDING)

    # Relationships
    encuentro = relationship("Encuentro", back_populates="transcripciones")
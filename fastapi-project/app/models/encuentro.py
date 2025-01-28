from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class Encuentro(Base):
    __tablename__ = "encuentros"

    id = Column(Integer, primary_key=True, index=True)
    id_medico = Column(Integer, ForeignKey("users.id"))
    id_paciente = Column(Integer, ForeignKey("pacientes.id"))
    identificador_paciente = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    medico = relationship("User", back_populates="encuentros")
    paciente = relationship("Paciente", back_populates="encuentros")
    transcripciones = relationship("Transcripcion", back_populates="encuentro")
    documentaciones = relationship("Documentacion", back_populates="encuentro")
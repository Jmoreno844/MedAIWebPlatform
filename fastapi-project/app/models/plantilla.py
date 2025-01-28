from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class Plantilla(Base):
    __tablename__ = "plantilla"

    id = Column(Integer, primary_key=True, index=True)
    id_medico = Column(Integer, ForeignKey("users.id"))
    titulo = Column(String(255), index=True)  # Set VARCHAR length
    contenido = Column(Text(length=65535))    # MEDIUMTEXT for LLM prompts
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    medico = relationship("User", back_populates="plantillas")
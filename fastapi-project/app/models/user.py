from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.paciente import paciente_medico
import enum

class UserRole(str, enum.Enum):
    MEDICO = "medico"
    ADMINISTRADOR = "administrador"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50))
    lastName = Column(String(50))
    email = Column(String(50), unique=True, index=True)
    password = Column(String(100))
    role = Column(Enum(UserRole), default=UserRole.MEDICO)
    
    # Relationships
    pacientes = relationship(
        "Paciente",
        secondary=paciente_medico,
        back_populates="medicos"
    )
    encuentros = relationship("Encuentro", back_populates="medico")
    plantillas = relationship("Plantilla", back_populates="medico")
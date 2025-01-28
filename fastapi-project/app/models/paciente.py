from sqlalchemy import Table, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

# Association table for paciente-medico relationship
paciente_medico = Table(
    'paciente_medico',
    Base.metadata,
    Column('paciente_id', Integer, ForeignKey('pacientes.id')),
    Column('medico_id', Integer, ForeignKey('users.id'))
)

class Paciente(Base):
    __tablename__ = "pacientes"

    id = Column(Integer, primary_key=True, index=True)
    identificador = Column(String(255), unique=True)
    notas = Column(String(255))

    # Many-to-many relationship
    medicos = relationship(
        "User",
        secondary=paciente_medico,
        back_populates="pacientes"
    )
    encuentros = relationship("Encuentro", back_populates="paciente")
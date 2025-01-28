from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class Documentacion(Base):
    __tablename__ = "documentaciones"

    id = Column(Integer, primary_key=True, index=True)
    tipo_documento = Column(String(255))
    contenido = Column(String(10000))
    encuentro_id = Column(Integer, ForeignKey("encuentros.id"))

    # Relationships
    encuentro = relationship("Encuentro", back_populates="documentaciones")
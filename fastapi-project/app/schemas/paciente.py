from pydantic import BaseModel, Field
from typing import Optional

class PacienteCreate(BaseModel):
    identificador: str
    notas: str = ""

    class Config:
        orm_mode = True

class PacienteExistsResponse(BaseModel):
    exists: bool
    paciente_id: Optional[int] = None
class PacienteListResponse(BaseModel):
    id: int
    identificador_paciente: str = Field(..., alias="identificador")  # Usar alias si el modelo usa 'identificador'

    class Config:
        orm_mode = True

class AsociarMedicoPaciente(BaseModel):
    paciente_id: int
    medico_id: int

    class Config:
        orm_mode = True
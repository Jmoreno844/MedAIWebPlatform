from pydantic import BaseModel, EmailStr
from typing import Optional

class PlantillaBase(BaseModel):
    titulo: str
    contenido: str

class PlantillaCreate(PlantillaBase):
    pass

class PlantillaResponse(PlantillaBase):
    id: int
    id_medico: int

    class Config:
        from_attributes = True

class PlantillaSummary(BaseModel):
    id: int
    titulo: str

    class Config:
        orm_mode = True
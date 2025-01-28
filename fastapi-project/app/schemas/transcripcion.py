from pydantic import BaseModel

class TranscripcionBase(BaseModel):
    id: int
    contenido: str
    origen: str
    encuentro_id: int

    class Config:
        orm_mode = True

class TranscripcionCreate(BaseModel):
    contenido: str
    origen: str
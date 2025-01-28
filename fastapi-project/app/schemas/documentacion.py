from pydantic import BaseModel

class DocumentacionBase(BaseModel):
    id: int
    tipo_documento: str
    contenido: str
    encuentro_id: int

    class Config:
        orm_mode = True

class DocumentacionCreate(BaseModel):
    tipo_documento: str
    contenido: str
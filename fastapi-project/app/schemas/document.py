from pydantic import BaseModel

class DocumentInput(BaseModel):
    email: str
    document_text: str

class DocumentOutput(BaseModel):
    email: str
    document_text: str
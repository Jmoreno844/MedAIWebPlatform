from pydantic import BaseModel

class UserCreate(BaseModel):
    name: str
    lastName: str
    email: str
    password: str
    
    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    email: str
    password: str
    
class UserBase(BaseModel):
    id: int
    name: str
    lastName: str
    email: str

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: int
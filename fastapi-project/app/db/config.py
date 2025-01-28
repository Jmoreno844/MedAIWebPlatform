from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

load_dotenv()

class DatabaseSettings(BaseSettings):
    DB_USER: str = os.getenv("DB_USER", "juan")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "6460197-55")
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: str = os.getenv("DB_PORT", "3306")
    DB_NAME: str = os.getenv("DB_NAME", "telemedicine")
    POOL_SIZE: int = 5
    MAX_OVERFLOW: int = 10
    POOL_RECYCLE: int = 3600

    @property
    def DATABASE_URL(self) -> str:
        return f"mysql+mysqldb://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
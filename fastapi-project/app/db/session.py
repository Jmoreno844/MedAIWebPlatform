from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import OperationalError
from app.db.config import DatabaseSettings
from app.db.base import Base  
import logging
import time
from typing import Generator

logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self):
        self.settings = DatabaseSettings()
        self._engine = None
        self._SessionLocal = None
        self.MAX_RETRIES = 3
        self.RETRY_DELAY = 5

    @property
    def engine(self):
        return self._engine

    @property
    def SessionLocal(self):
        if not self._SessionLocal:
            raise RuntimeError("Database not initialized")
        return self._SessionLocal

    def init_db(self):
        for attempt in range(self.MAX_RETRIES):
            try:
                self._engine = create_engine(
                    self.settings.DATABASE_URL,
                    pool_pre_ping=True,
                    pool_size=self.settings.POOL_SIZE,
                    max_overflow=self.settings.MAX_OVERFLOW,
                    pool_recycle=self.settings.POOL_RECYCLE
                )
                self._engine.connect()
                self._SessionLocal = sessionmaker(
                    autocommit=False,
                    autoflush=False,
                    bind=self._engine
                )
                logger.info("Database connection established")
                break
            except OperationalError as e:
                if attempt == self.MAX_RETRIES - 1:
                    logger.error(f"Failed to connect to database: {e}")
                    raise
                logger.warning(f"Attempt {attempt + 1} failed, retrying...")
                time.sleep(self.RETRY_DELAY)

    def get_db(self) -> Generator[Session, None, None]:
        if not self._SessionLocal:
            raise RuntimeError("Database not initialized")
        db = self._SessionLocal()
        try:
            yield db
        finally:
            db.close()

    def dispose(self):
        if self._engine:
            self._engine.dispose()

# Initialize database manager without immediate initialization
db = DatabaseManager()

# Export components
get_db = db.get_db
engine = db.engine
# Remove SessionLocal export since it requires initialization first

__all__ = ['Base', 'engine', 'db', 'get_db']
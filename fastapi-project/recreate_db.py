import os
import sys
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent
sys.path.append(str(project_root))

from app.db.base import Base
from app.db.session import db, engine
from app.models.user import User
from app.models.paciente import Paciente
from app.models.encuentro import Encuentro

def recreate_database():
    try:
        # Initialize database connection
        db.init_db()
        
        print("Dropping all tables...")
        Base.metadata.drop_all(bind=db.engine)
        print("Creating all tables...")
        Base.metadata.create_all(bind=db.engine)
        print("Database recreated successfully!")
    except Exception as e:
        print(f"Error recreating database: {e}")
        sys.exit(1)
    finally:
        db.dispose()

if __name__ == "__main__":
    recreate_database()
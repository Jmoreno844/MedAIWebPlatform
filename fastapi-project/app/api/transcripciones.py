from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from pydantic import BaseModel
from app.db.session import get_db
from app.models.transcripcion import Transcripcion
from app.schemas.transcripcion import TranscripcionBase, TranscripcionCreate
from app.api.User.auth import get_current_user
from app.models.user import User
from app.models.encuentro import Encuentro

class TranscripcionBase(BaseModel):
    id: int
    contenido: Optional[str] = ""  # Handle None values
    origen: str
    encuentro_id: int
    status: str
    
    class Config:
        orm_mode = True

router = APIRouter(
    prefix="/api/transcripciones",
    tags=["Transcripciones"],
    dependencies=[Depends(get_current_user)]
)

@router.get("/{encuentro_id}", response_model=List[TranscripcionBase])
async def get_transcripciones(
    encuentro_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verificar si el encuentro existe y pertenece al usuario actual
    encuentro = db.query(Encuentro).filter(
        Encuentro.id == encuentro_id,
        Encuentro.id_medico == current_user.id
    ).first()
    
    if not encuentro:
        raise HTTPException(status_code=404, detail="Encuentro no encontrado")
    
    transcripciones = db.query(Transcripcion).filter(
        Transcripcion.encuentro_id == encuentro_id
    ).all()
    
    # Convert None contenido to empty string
    for t in transcripciones:
        if t.contenido is None:
            t.contenido = ""
            
    return transcripciones

@router.delete("/{encuentro_id}", response_model=Dict[str, str])
async def delete_transcripciones(
    encuentro_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        # Verify encuentro exists and belongs to current user
        encuentro = db.query(Encuentro).filter(
            Encuentro.id == encuentro_id,
            Encuentro.id_medico == current_user.id
        ).first()
        
        if not encuentro:
            raise HTTPException(status_code=404, detail="Encuentro no encontrado")
        
        # Delete all transcriptions for this encuentro
        result = db.query(Transcripcion).filter(
            Transcripcion.encuentro_id == encuentro_id
        ).delete()
        
        if result == 0:
            raise HTTPException(status_code=404, detail="No hay transcripciones para eliminar")
        
        db.commit()
        return {"message": f"Se eliminaron {result} transcripciones"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al eliminar transcripciones: {str(e)}")


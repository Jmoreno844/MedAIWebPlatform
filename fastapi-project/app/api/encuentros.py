from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from sqlalchemy import and_
from typing import List
from datetime import datetime, timedelta
from app.api.User.auth import get_current_user

from app.models.user import User
from app.models.paciente import Paciente
from app.models.encuentro import Encuentro
from app.models.transcripcion import Transcripcion
from app.models.documentacion import Documentacion

from app.schemas.encuentro import EncuentroCreate, EncuentroBase, EncuentroDetail
from app.schemas.transcripcion import TranscripcionCreate, TranscripcionBase
from app.schemas.documentacion import DocumentacionCreate, DocumentacionBase
router = APIRouter(
    prefix="/api"
)

@router.post("/crear-encuentro", response_model=EncuentroCreate)
async def create_encuentro(
    encuentro: EncuentroCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    paciente = db.query(Paciente).filter(Paciente.identificador == encuentro.identificador_paciente).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")

    nuevo_encuentro = Encuentro(
        id_medico=current_user.id,
        id_paciente=paciente.id,
        identificador_paciente=paciente.identificador,
        created_at=encuentro.created_at
    )
    db.add(nuevo_encuentro)
    db.commit()
    db.refresh(nuevo_encuentro)
    return nuevo_encuentro

@router.get("/encuentros/ultimos", response_model=List[EncuentroBase])
async def get_ultimos_encuentros(
    days: int = 1,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if days not in [1, 7]:
        raise HTTPException(status_code=400, detail="El parámetro 'days' debe ser 1 o 7.")
    
    fecha_limite = datetime.utcnow() - timedelta(days=days)
    encuentros = db.query(Encuentro).filter(
        and_(
            Encuentro.created_at >= fecha_limite,
            Encuentro.id_medico == current_user.id  # Ajusta según tu modelo
        )
    ).order_by(Encuentro.created_at.desc()).all()
    
    return encuentros


@router.get("/encuentros/{encuentro_id}", response_model=EncuentroDetail)
async def get_encuentro_detail(
    encuentro_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    encuentro = db.query(Encuentro).filter(
        Encuentro.id == encuentro_id,
        Encuentro.id_medico == current_user.id
    ).first()
    if not encuentro:
        raise HTTPException(status_code=404, detail="Encuentro no encontrado")
    return encuentro

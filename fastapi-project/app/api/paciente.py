from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db

from app.models.user import User
from app.models.paciente import Paciente, paciente_medico
from app.models.encuentro import Encuentro

from app.schemas.paciente import PacienteCreate, PacienteExistsResponse, PacienteListResponse, AsociarMedicoPaciente
from app.api.User.auth import get_current_user
from typing import List

import logging

router = APIRouter(
    prefix="/api"
)

@router.post("/crear-paciente", response_model=PacienteCreate)
async def create_paciente(
    paciente: PacienteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_paciente = db.query(Paciente).filter(Paciente.identificador == paciente.identificador).first()
    if db_paciente:
        raise HTTPException(status_code=400, detail="Paciente con este identificador ya existe")
    
    nuevo_paciente = Paciente(
        identificador=paciente.identificador,
        notas=paciente.notas,
    )
    # Add the current user as medico using many-to-many relationship
    nuevo_paciente.medicos.append(current_user)
    
    db.add(nuevo_paciente)
    db.commit()
    db.refresh(nuevo_paciente)
    return nuevo_paciente


@router.get("/paciente/{identificador}", response_model=PacienteExistsResponse)
async def get_paciente(
    identificador: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    paciente = db.query(Paciente).filter(Paciente.identificador == identificador).first()
    return {"exists": paciente is not None, "paciente_id": paciente.id if paciente else None}


@router.get("/pacientes", response_model=List[PacienteListResponse])
async def list_pacientes_doctor(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Obtener la lista de pacientes asociados al médico actual.
    Retorna el id y el identificador_paciente de cada paciente.
    """
    try:
        # Query patients using many-to-many relationship
        pacientes = (
            db.query(Paciente)
            .join(paciente_medico)
            .filter(paciente_medico.c.medico_id == current_user.id)
            .all()
        )
        
        logging.debug(f"Encontrados {len(pacientes)} pacientes para el médico ID {current_user.id}")
        return pacientes
    except Exception as e:
        logging.error(f"Error al obtener la lista de pacientes: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.post("/medico-paciente/asociar", status_code=201)
async def asociar_medico_paciente(
    data: AsociarMedicoPaciente, #Validacion de entrada con Pydantic
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Associate a doctor with a patient
    """
    try:
        # Security check - verify current user is the medico being associated
        if data.medico_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="No autorizado para realizar esta operación"
            )

        # Verify patient exists
        paciente = db.query(Paciente).filter(Paciente.id == data.paciente_id).first()
        if not paciente:
            raise HTTPException(
                status_code=404,
                detail="Paciente no encontrado"
            )

        # Check if association already exists
        existing_association = (
            db.query(paciente_medico)
            .filter(
                paciente_medico.c.paciente_id == data.paciente_id,
                paciente_medico.c.medico_id == data.medico_id
            ).first()
        )
        
        if existing_association:
            raise HTTPException(
                status_code=400,
                detail="La asociación ya existe"
            )

        # Create association
        paciente.medicos.append(current_user)
        db.commit()

        logging.info(
            f"Asociación creada: Médico ID {data.medico_id} - Paciente ID {data.paciente_id}"
        )
        
        return {
            "message": "Asociación creada exitosamente",
            "paciente_id": data.paciente_id,
            "medico_id": data.medico_id
        }

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error al crear asociación médico-paciente: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )
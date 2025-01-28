from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from typing import List
from app.api.User.auth import get_current_user
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.plantilla import Plantilla
from app.schemas.plantilla import PlantillaSummary, PlantillaCreate, PlantillaResponse, PlantillaBase

router = APIRouter(
    prefix="/api/plantillas",
    tags=["plantillas"]
)

@router.post("/", response_model=PlantillaResponse, status_code=status.HTTP_201_CREATED)
async def create_plantilla(
    plantilla: PlantillaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Crear una nueva plantilla.
    
    - Requiere autenticación
    - Solo médicos pueden crear plantillas
    - Valida el título y contenido
    """
    if not current_user.role == UserRole.MEDICO:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo médicos pueden crear plantillas"
        )

    db_plantilla = Plantilla(
        titulo=plantilla.titulo,
        contenido=plantilla.contenido,
        id_medico=current_user.id
    )
    
    try:
        db.add(db_plantilla)
        db.commit()
        db.refresh(db_plantilla)
        return db_plantilla
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error creando la plantilla"
        )


@router.get("/resumido", response_model=List[PlantillaSummary])
async def get_plantillas_summary(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener lista de plantillas con solo id y titulo.
    
    - Requiere autenticación
    - Paginación incluida
    - Filtra por médico si el usuario es médico
    """
    if current_user.role == UserRole.MEDICO:
        plantillas = db.query(Plantilla.id, Plantilla.titulo)\
            .filter(Plantilla.id_medico == current_user.id)\
            .offset(skip)\
            .limit(limit)\
            .all()
    else:
        plantillas = db.query(Plantilla.id, Plantilla.titulo)\
            .offset(skip)\
            .limit(limit)\
            .all()
    
    # Transformar tuplas a diccionarios
    plantillas_summary = [{"id": p[0], "titulo": p[1]} for p in plantillas]
    
    return plantillas_summary
    
@router.get("/", response_model=List[PlantillaResponse])
async def get_plantillas(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener lista de plantillas.
    
    - Requiere autenticación
    - Paginación incluida
    - Filtra por médico si el usuario es médico
    """
    if current_user.role == UserRole.MEDICO:
        plantillas = db.query(Plantilla)\
            .filter(Plantilla.id_medico == current_user.id)\
            .offset(skip)\
            .limit(limit)\
            .all()
    else:
        plantillas = db.query(Plantilla)\
            .offset(skip)\
            .limit(limit)\
            .all()
    
    return plantillas

@router.get("/{plantilla_id}", response_model=PlantillaResponse)
async def get_plantilla(
    plantilla_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener una plantilla específica por ID.
    
    - Requiere autenticación
    - Verifica permisos de acceso
    """
    plantilla = db.query(Plantilla)\
        .filter(Plantilla.id == plantilla_id)\
        .first()
    
    if not plantilla:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plantilla no encontrada"
        )
    
    # Verificar permisos
    if current_user.is_medico and plantilla.id_medico != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permiso para acceder a esta plantilla"
        )
    
    return plantilla

@router.put("/{plantilla_id}", response_model=PlantillaResponse)
async def update_plantilla(
    plantilla_id: int,
    new_plantilla_data: PlantillaBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Actualizar una plantilla existente.
    
    - Requiere autenticación
    - Verifica permisos de acceso
    - Actualiza título y contenido
    """
    try:
        plantilla = db.query(Plantilla)\
            .filter(Plantilla.id == plantilla_id)\
            .first()
        
        if not plantilla:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plantilla no encontrada"
            )
        
        # Verificar permisos
        if (current_user.role == UserRole.MEDICO) and plantilla.id_medico != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permiso para acceder a esta plantilla"
            )
            
        # Update fields
        plantilla.titulo = new_plantilla_data.titulo
        plantilla.contenido = new_plantilla_data.contenido
        
        db.commit()
        db.refresh(plantilla)
        
        return plantilla
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error actualizando plantilla: {str(e)}"
        )

@router.delete("/{plantilla_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plantilla(
    plantilla_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Eliminar una plantilla específica.
    
    - Requiere autenticación
    - Solo el médico propietario puede eliminar su plantilla
    """
    try:
        plantilla = db.query(Plantilla)\
            .filter(Plantilla.id == plantilla_id)\
            .first()
        
        if not plantilla:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plantilla no encontrada"
            )
        
        # Verify permissions
        if current_user.role == UserRole.MEDICO and plantilla.id_medico != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permiso para eliminar esta plantilla"
            )
            
        db.delete(plantilla)
        db.commit()
        
        return Response(status_code=status.HTTP_204_NO_CONTENT)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error eliminando plantilla: {str(e)}"
        )
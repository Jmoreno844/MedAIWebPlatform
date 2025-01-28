from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
from app.db.session import get_db
from app.models.documentacion import Documentacion
from app.models.encuentro import Encuentro
from app.schemas.documentacion import DocumentacionBase, DocumentacionCreate
from app.api.User.auth import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/api/documentacion",
    tags=["Documentación"],
    dependencies=[Depends(get_current_user)]
)

@router.put("/{encuentro_id}", response_model=DocumentacionBase)
async def replace_documentacion(
    encuentro_id: int,
    documentacion: DocumentacionCreate,
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
    
    # Obtener la documentación existente
    existing_documentacion = db.query(Documentacion).filter(
        Documentacion.encuentro_id == encuentro_id
    ).first()
    
    if not existing_documentacion:
        raise HTTPException(status_code=404, detail="Documentación no encontrada para este encuentro")
    
    # Reemplazar los campos de la documentación existente
    existing_documentacion.tipo_documento = documentacion.tipo_documento
    existing_documentacion.contenido = documentacion.contenido
    
    db.commit()
    db.refresh(existing_documentacion)
    
    return existing_documentacion

@router.post("/{encuentro_id}", response_model=DocumentacionBase) ##Validacion de salida con Pydantic
async def add_documentacion(
    encuentro_id: int,
    documentacion: DocumentacionCreate, ##Validacion de entrada con Pydantic
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    encuentro = db.query(Encuentro).filter(  
        Encuentro.id == encuentro_id,
        Encuentro.id_medico == current_user.id
    ).first()
    if not encuentro:
        raise HTTPException(status_code=404, detail="Encuentro no encontrado")
    nueva_documentacion = Documentacion(
        tipo_documento=documentacion.tipo_documento,
        contenido=documentacion.contenido,
        encuentro_id=encuentro_id
    )
    db.add(nueva_documentacion)
    db.commit()
    db.refresh(nueva_documentacion)
    return nueva_documentacion

@router.get("/{encuentro_id}", response_model=List[DocumentacionBase])
async def get_documentaciones(
    encuentro_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Obtiene todas las documentaciones asociadas a un encuentro específico.
    Retorna una lista vacía si no se encuentran documentaciones.
    """
    # Verificar si el encuentro existe y pertenece al usuario actual
    encuentro = db.query(Encuentro).filter(
        Encuentro.id == encuentro_id,
        
        Encuentro.id_medico == current_user.id
    ).first()
    
    if not encuentro:
        raise HTTPException(status_code=404, detail="Encuentro no encontrado")
    
    # Obtener todas las documentaciones para el encuentro
    documentaciones = db.query(Documentacion).filter(
        Documentacion.encuentro_id == encuentro_id
    ).all()
    
    # Retornar la lista de documentaciones (puede estar vacía)
    return documentaciones

@router.delete("/{encuentro_id}", response_model=Dict[str, str])
async def delete_documentaciones(
    encuentro_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Elimina todas las documentaciones asociadas a un encuentro específico.
    """
    try:
        # Verificar si el encuentro existe y pertenece al usuario actual
        encuentro = db.query(Encuentro).filter(
            Encuentro.id == encuentro_id,
            Encuentro.id_medico == current_user.id
        ).first()
        
        if not encuentro:
            raise HTTPException(status_code=404, detail="Encuentro no encontrado")
        
        # Eliminar todas las documentaciones para este encuentro
        result = db.query(Documentacion).filter(
            Documentacion.encuentro_id == encuentro_id
        ).delete()
        
        db.commit()
        
        if result == 0:
            return {"message": "No se encontraron documentaciones para eliminar."}
        
        return {"message": f"Se eliminaron {result} documentaciones."}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al eliminar documentaciones: {str(e)}")
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.schemas.document import DocumentInput, DocumentOutput


router = APIRouter(
    prefix="/api",
)


@router.post("/save_document/")
async def save_document(document: DocumentInput, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == document.email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db_user.document_example = document.document_text
    db.commit()
    db.refresh(db_user)
    return {"message": "Document saved successfully", "user": db_user}

@router.get("/get_document/{email}", response_model=DocumentOutput)
async def get_document(email: str, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"email": db_user.email, "document_text": db_user.document_example}

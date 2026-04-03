from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.term import Term
from app.schemas.term import TermCreate, TermUpdate, TermResponse

router = APIRouter(prefix="/api/terms", tags=["Terms"])


@router.get("", response_model=list[TermResponse])
def list_terms(
    type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Term).filter(Term.user_id == current_user.id)
    if type:
        query = query.filter(Term.type == type)
    return query.all()


@router.post("", response_model=TermResponse, status_code=201)
def create_term(
    data: TermCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    term = Term(user_id=current_user.id, **data.model_dump())
    db.add(term)
    db.commit()
    db.refresh(term)
    return term


@router.put("/{term_id}", response_model=TermResponse)
def update_term(
    term_id: int,
    data: TermUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    term = db.query(Term).filter(
        Term.id == term_id,
        Term.user_id == current_user.id
    ).first()

    if not term:
        raise HTTPException(status_code=404, detail="Term not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(term, key, value)

    db.commit()
    db.refresh(term)
    return term


@router.delete("/{term_id}")
def delete_term(
    term_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    term = db.query(Term).filter(
        Term.id == term_id,
        Term.user_id == current_user.id
    ).first()

    if not term:
        raise HTTPException(status_code=404, detail="Term not found")

    db.delete(term)
    db.commit()
    return {"detail": "Term deleted"}

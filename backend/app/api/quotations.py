from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.customer import Customer
from app.models.quotation import Quotation
from app.schemas.document import QuotationCreate, QuotationResponse, LineItemResponse
from app.services.document_service import (
    generate_document_number, calculate_document_totals,
    create_line_items, delete_line_items, get_line_items,
)

router = APIRouter(prefix="/api/quotations", tags=["Quotations"])


def _build_response(q, db):
    items = get_line_items(db, "quotation", q.id)
    customer = db.query(Customer).filter(Customer.id == q.customer_id).first()
    return {
        **{c.key: getattr(q, c.key) for c in q.__table__.columns},
        "line_items": [LineItemResponse.model_validate(i) for i in items],
        "customer": {
            "id": customer.id, "name": customer.name,
            "company_name": customer.company_name, "email": customer.email,
            "mobile": customer.mobile, "gstin": customer.gstin,
        } if customer else None,
    }


@router.get("", response_model=list[QuotationResponse])
def list_quotations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    quotations = db.query(Quotation).filter(
        Quotation.user_id == current_user.id
    ).order_by(Quotation.created_at.desc()).all()

    return [_build_response(q, db) for q in quotations]


@router.get("/{doc_id}", response_model=QuotationResponse)
def get_quotation(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    q = db.query(Quotation).filter(
        Quotation.id == doc_id, Quotation.user_id == current_user.id
    ).first()
    if not q:
        raise HTTPException(status_code=404, detail="Quotation not found")
    return _build_response(q, db)


@router.post("", response_model=QuotationResponse, status_code=201)
def create_quotation(
    data: QuotationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not data.line_items:
        raise HTTPException(status_code=400, detail="At least one line item is required")

    subtotal, tax_amount, total, processed_items = calculate_document_totals(
        data.line_items, data.other_charges, data.other_charges_taxable
    )

    doc_number = generate_document_number(db, "quotation", current_user.id)

    quotation = Quotation(
        user_id=current_user.id,
        customer_id=data.customer_id,
        document_number=doc_number,
        date=data.date,
        valid_until=data.valid_until,
        subtotal=subtotal,
        tax_amount=tax_amount,
        other_charges=data.other_charges,
        other_charges_taxable=data.other_charges_taxable,
        total=total,
        notes=data.notes,
        terms_content=data.terms_content,
    )
    db.add(quotation)
    db.flush()

    create_line_items(db, "quotation", quotation.id, processed_items)
    db.commit()
    db.refresh(quotation)

    return _build_response(quotation, db)


@router.delete("/{doc_id}")
def delete_quotation(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    q = db.query(Quotation).filter(
        Quotation.id == doc_id, Quotation.user_id == current_user.id
    ).first()
    if not q:
        raise HTTPException(status_code=404, detail="Quotation not found")

    delete_line_items(db, "quotation", doc_id)
    db.delete(q)
    db.commit()
    return {"detail": "Quotation deleted"}

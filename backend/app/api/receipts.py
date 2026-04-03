from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.customer import Customer
from app.models.receipt import Receipt
from app.schemas.document import ReceiptCreate, ReceiptResponse, LineItemResponse
from app.services.document_service import (
    generate_document_number, calculate_document_totals,
    create_line_items, delete_line_items, get_line_items,
)

router = APIRouter(prefix="/api/receipts", tags=["Receipts"])


def _build_response(rec, db):
    items = get_line_items(db, "receipt", rec.id)
    customer = db.query(Customer).filter(Customer.id == rec.customer_id).first()
    return {
        **{c.key: getattr(rec, c.key) for c in rec.__table__.columns},
        "line_items": [LineItemResponse.model_validate(i) for i in items],
        "customer": {
            "id": customer.id, "name": customer.name,
            "company_name": customer.company_name, "email": customer.email,
            "mobile": customer.mobile, "gstin": customer.gstin,
        } if customer else None,
    }


@router.get("", response_model=list[ReceiptResponse])
def list_receipts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    receipts = db.query(Receipt).filter(
        Receipt.user_id == current_user.id
    ).order_by(Receipt.created_at.desc()).all()
    return [_build_response(r, db) for r in receipts]


@router.get("/{doc_id}", response_model=ReceiptResponse)
def get_receipt(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    r = db.query(Receipt).filter(
        Receipt.id == doc_id, Receipt.user_id == current_user.id
    ).first()
    if not r:
        raise HTTPException(status_code=404, detail="Receipt not found")
    return _build_response(r, db)


@router.post("", response_model=ReceiptResponse, status_code=201)
def create_receipt(
    data: ReceiptCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not data.line_items:
        raise HTTPException(status_code=400, detail="At least one line item is required")

    subtotal, tax_amount, total, processed_items = calculate_document_totals(
        data.line_items, data.other_charges, False
    )

    doc_number = generate_document_number(db, "receipt", current_user.id)

    receipt = Receipt(
        user_id=current_user.id,
        customer_id=data.customer_id,
        document_number=doc_number,
        date=data.date,
        subtotal=subtotal,
        tax_amount=tax_amount,
        other_charges=data.other_charges,
        total=total,
        notes=data.notes,
        terms_content=data.terms_content,
        payment_method=data.payment_method,
    )
    db.add(receipt)
    db.flush()

    create_line_items(db, "receipt", receipt.id, processed_items)
    db.commit()
    db.refresh(receipt)
    return _build_response(receipt, db)


@router.delete("/{doc_id}")
def delete_receipt(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    r = db.query(Receipt).filter(
        Receipt.id == doc_id, Receipt.user_id == current_user.id
    ).first()
    if not r:
        raise HTTPException(status_code=404, detail="Receipt not found")

    delete_line_items(db, "receipt", doc_id)
    db.delete(r)
    db.commit()
    return {"detail": "Receipt deleted"}

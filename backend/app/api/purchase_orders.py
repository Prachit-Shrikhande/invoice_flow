from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.customer import Customer
from app.models.purchase_order import PurchaseOrder
from app.schemas.document import PurchaseOrderCreate, PurchaseOrderResponse, LineItemResponse
from app.services.document_service import (
    generate_document_number, calculate_document_totals,
    create_line_items, delete_line_items, get_line_items,
)

router = APIRouter(prefix="/api/purchase-orders", tags=["Purchase Orders"])


def _build_response(po, db):
    items = get_line_items(db, "purchase_order", po.id)
    customer = db.query(Customer).filter(Customer.id == po.customer_id).first()
    return {
        **{c.key: getattr(po, c.key) for c in po.__table__.columns},
        "line_items": [LineItemResponse.model_validate(i) for i in items],
        "customer": {
            "id": customer.id, "name": customer.name,
            "company_name": customer.company_name, "email": customer.email,
            "mobile": customer.mobile, "gstin": customer.gstin,
        } if customer else None,
    }


@router.get("", response_model=list[PurchaseOrderResponse])
def list_purchase_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    orders = db.query(PurchaseOrder).filter(
        PurchaseOrder.user_id == current_user.id
    ).order_by(PurchaseOrder.created_at.desc()).all()
    return [_build_response(po, db) for po in orders]


@router.get("/{doc_id}", response_model=PurchaseOrderResponse)
def get_purchase_order(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    po = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == doc_id, PurchaseOrder.user_id == current_user.id
    ).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return _build_response(po, db)


@router.post("", response_model=PurchaseOrderResponse, status_code=201)
def create_purchase_order(
    data: PurchaseOrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not data.line_items:
        raise HTTPException(status_code=400, detail="At least one line item is required")

    subtotal, tax_amount, total, processed_items = calculate_document_totals(
        data.line_items, data.other_charges, data.other_charges_taxable
    )

    doc_number = generate_document_number(db, "purchase_order", current_user.id)

    po = PurchaseOrder(
        user_id=current_user.id,
        customer_id=data.customer_id,
        document_number=doc_number,
        date=data.date,
        expected_date=data.expected_date,
        subtotal=subtotal,
        tax_amount=tax_amount,
        other_charges=data.other_charges,
        other_charges_taxable=data.other_charges_taxable,
        total=total,
        notes=data.notes,
        terms_content=data.terms_content,
    )
    db.add(po)
    db.flush()

    create_line_items(db, "purchase_order", po.id, processed_items)
    db.commit()
    db.refresh(po)
    return _build_response(po, db)


@router.delete("/{doc_id}")
def delete_purchase_order(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    po = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == doc_id, PurchaseOrder.user_id == current_user.id
    ).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")

    delete_line_items(db, "purchase_order", doc_id)
    db.delete(po)
    db.commit()
    return {"detail": "Purchase order deleted"}

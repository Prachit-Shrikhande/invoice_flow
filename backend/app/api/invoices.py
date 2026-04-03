from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.customer import Customer
from app.models.invoice import Invoice
from app.schemas.document import InvoiceCreate, InvoiceUpdate, InvoiceResponse, LineItemResponse
from app.services.document_service import (
    generate_document_number, calculate_document_totals,
    create_line_items, delete_line_items, get_line_items,
)

router = APIRouter(prefix="/api/invoices", tags=["Invoices"])


def _build_response(inv, db):
    items = get_line_items(db, "invoice", inv.id)
    customer = db.query(Customer).filter(Customer.id == inv.customer_id).first()
    return {
        **{c.key: getattr(inv, c.key) for c in inv.__table__.columns},
        "line_items": [LineItemResponse.model_validate(i) for i in items],
        "customer": {
            "id": customer.id, "name": customer.name,
            "company_name": customer.company_name, "email": customer.email,
            "mobile": customer.mobile, "gstin": customer.gstin,
        } if customer else None,
    }


@router.get("", response_model=list[InvoiceResponse])
def list_invoices(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    invoices = db.query(Invoice).filter(
        Invoice.user_id == current_user.id
    ).order_by(Invoice.created_at.desc()).all()

    return [_build_response(inv, db) for inv in invoices]


@router.get("/{doc_id}", response_model=InvoiceResponse)
def get_invoice(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = db.query(Invoice).filter(
        Invoice.id == doc_id, Invoice.user_id == current_user.id
    ).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return _build_response(inv, db)


@router.post("", response_model=InvoiceResponse, status_code=201)
def create_invoice(
    data: InvoiceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not data.line_items:
        raise HTTPException(status_code=400, detail="At least one line item is required")

    subtotal, tax_amount, total, processed_items = calculate_document_totals(
        data.line_items, data.other_charges, data.other_charges_taxable
    )

    doc_number = generate_document_number(db, "invoice", current_user.id)

    invoice = Invoice(
        user_id=current_user.id,
        customer_id=data.customer_id,
        document_number=doc_number,
        date=data.date,
        due_date=data.due_date,
        subtotal=subtotal,
        tax_amount=tax_amount,
        other_charges=data.other_charges,
        other_charges_taxable=data.other_charges_taxable,
        total=total,
        notes=data.notes,
        terms_content=data.terms_content,
        paid_amount=data.paid_amount,
        paid_date=data.paid_date,
        payment_notes=data.payment_notes,
    )
    db.add(invoice)
    db.flush()

    create_line_items(db, "invoice", invoice.id, processed_items)
    db.commit()
    db.refresh(invoice)

    return _build_response(invoice, db)


@router.put("/{doc_id}", response_model=InvoiceResponse)
def update_invoice(
    doc_id: int,
    data: InvoiceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = db.query(Invoice).filter(
        Invoice.id == doc_id, Invoice.user_id == current_user.id
    ).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    update_data = data.model_dump(exclude_unset=True)

    # If line items are being updated, recalculate
    if "line_items" in update_data and update_data["line_items"] is not None:
        other_charges = update_data.get("other_charges", float(inv.other_charges))
        other_charges_taxable = update_data.get("other_charges_taxable", inv.other_charges_taxable)

        subtotal, tax_amount, total, processed_items = calculate_document_totals(
            data.line_items, other_charges, other_charges_taxable
        )

        inv.subtotal = subtotal
        inv.tax_amount = tax_amount
        inv.total = total

        delete_line_items(db, "invoice", doc_id)
        create_line_items(db, "invoice", doc_id, processed_items)

        del update_data["line_items"]

    for key, value in update_data.items():
        setattr(inv, key, value)

    db.commit()
    db.refresh(inv)
    return _build_response(inv, db)


@router.delete("/{doc_id}")
def delete_invoice(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = db.query(Invoice).filter(
        Invoice.id == doc_id, Invoice.user_id == current_user.id
    ).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    delete_line_items(db, "invoice", doc_id)
    db.delete(inv)
    db.commit()
    return {"detail": "Invoice deleted"}

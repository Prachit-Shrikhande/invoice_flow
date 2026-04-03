from decimal import Decimal, ROUND_HALF_UP
from datetime import date
from sqlalchemy.orm import Session

from app.models.line_item import LineItem
from app.models.quotation import Quotation
from app.models.invoice import Invoice
from app.models.purchase_order import PurchaseOrder
from app.models.receipt import Receipt

# Maps document type string to model class
DOC_MODELS = {
    "quotation": Quotation,
    "invoice": Invoice,
    "purchase_order": PurchaseOrder,
    "receipt": Receipt,
}

DOC_PREFIXES = {
    "quotation": "QUO",
    "invoice": "INV",
    "purchase_order": "PO",
    "receipt": "REC",
}


def generate_document_number(db: Session, doc_type: str, user_id: int) -> str:
    """Generate document number like INV-2026-001."""
    model = DOC_MODELS[doc_type]
    prefix = DOC_PREFIXES[doc_type]
    year = date.today().year

    count = db.query(model).filter(model.user_id == user_id).count()
    seq = count + 1

    return f"{prefix}-{year}-{seq:03d}"


def calculate_line_item_amount(quantity: float, unit_price: float) -> Decimal:
    """Calculate line item amount (quantity × unit_price)."""
    q = Decimal(str(quantity))
    p = Decimal(str(unit_price))
    return (q * p).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def calculate_document_totals(line_items_data: list, other_charges: float = 0, other_charges_taxable: bool = False):
    """
    Calculate subtotal, tax_amount, and total from line items.
    Returns (subtotal, tax_amount, total, processed_items).
    """
    subtotal = Decimal("0")
    tax_amount = Decimal("0")
    processed_items = []

    for item in line_items_data:
        quantity = Decimal(str(item.quantity))
        unit_price = Decimal(str(item.unit_price))
        gst_percent = Decimal(str(item.gst_percent))

        amount = (quantity * unit_price).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        item_tax = (amount * gst_percent / Decimal("100")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        subtotal += amount
        tax_amount += item_tax

        processed_items.append({
            "product_id": getattr(item, "product_id", None),
            "product_name": item.product_name,
            "quantity": float(quantity),
            "unit_price": float(unit_price),
            "unit": getattr(item, "unit", "PCS"),
            "gst_percent": float(gst_percent),
            "hsn_code": getattr(item, "hsn_code", None),
            "amount": float(amount),
        })

    other = Decimal(str(other_charges))
    if other_charges_taxable:
        # Apply average tax rate to other charges
        if subtotal > 0:
            avg_rate = tax_amount / subtotal
            other_tax = (other * avg_rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            tax_amount += other_tax

    total = subtotal + tax_amount + other

    return (
        float(subtotal.quantize(Decimal("0.01"))),
        float(tax_amount.quantize(Decimal("0.01"))),
        float(total.quantize(Decimal("0.01"))),
        processed_items,
    )


def create_line_items(db: Session, doc_type: str, doc_id: int, items_data: list):
    """Create line item records for a document."""
    for item in items_data:
        line_item = LineItem(
            document_type=doc_type,
            document_id=doc_id,
            product_id=item.get("product_id"),
            product_name=item["product_name"],
            quantity=item["quantity"],
            unit_price=item["unit_price"],
            unit=item.get("unit", "PCS"),
            gst_percent=item.get("gst_percent", 0),
            hsn_code=item.get("hsn_code"),
            amount=item["amount"],
        )
        db.add(line_item)

    db.flush()


def delete_line_items(db: Session, doc_type: str, doc_id: int):
    """Delete all line items for a document."""
    db.query(LineItem).filter(
        LineItem.document_type == doc_type,
        LineItem.document_id == doc_id,
    ).delete()
    db.flush()


def get_line_items(db: Session, doc_type: str, doc_id: int) -> list:
    """Get all line items for a document."""
    return db.query(LineItem).filter(
        LineItem.document_type == doc_type,
        LineItem.document_id == doc_id,
    ).all()

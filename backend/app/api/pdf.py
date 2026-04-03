from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.business_profile import BusinessProfile
from app.models.customer import Customer
from app.models.quotation import Quotation
from app.models.invoice import Invoice
from app.models.purchase_order import PurchaseOrder
from app.models.receipt import Receipt
from app.services.document_service import get_line_items
from app.services.pdf_service import generate_pdf

router = APIRouter(prefix="/api/pdf", tags=["PDF Generation"])

DOC_MODELS = {
    "quotation": Quotation,
    "invoice": Invoice,
    "purchase_order": PurchaseOrder,
    "receipt": Receipt,
}


def _get_doc_data(doc_type: str, doc_id: int, user: User, db: Session):
    """Fetch all data needed for PDF generation."""
    model = DOC_MODELS.get(doc_type)
    if not model:
        raise HTTPException(status_code=400, detail=f"Invalid document type: {doc_type}")

    document = db.query(model).filter(
        model.id == doc_id, model.user_id == user.id
    ).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    business = db.query(BusinessProfile).filter(
        BusinessProfile.user_id == user.id
    ).first()
    if not business:
        raise HTTPException(status_code=400, detail="Business profile required for PDF generation")

    customer = db.query(Customer).filter(Customer.id == document.customer_id).first()
    if not customer:
        raise HTTPException(status_code=400, detail="Customer not found")

    line_items = get_line_items(db, doc_type, doc_id)

    # Convert to dicts
    doc_dict = {c.key: getattr(document, c.key) for c in document.__table__.columns}
    biz_dict = {c.key: getattr(business, c.key) for c in business.__table__.columns}
    cust_dict = {c.key: getattr(customer, c.key) for c in customer.__table__.columns}
    items_list = [
        {c.key: getattr(item, c.key) for c in item.__table__.columns}
        for item in line_items
    ]

    return doc_dict, biz_dict, cust_dict, items_list


@router.get("/{doc_type}/{doc_id}/preview")
def preview_pdf(
    doc_type: str,
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Preview PDF in browser."""
    doc_dict, biz_dict, cust_dict, items_list = _get_doc_data(
        doc_type, doc_id, current_user, db
    )

    pdf_bytes = generate_pdf(doc_type, doc_dict, biz_dict, cust_dict, items_list)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "inline"}
    )


@router.get("/{doc_type}/{doc_id}/download")
def download_pdf(
    doc_type: str,
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download PDF as attachment."""
    doc_dict, biz_dict, cust_dict, items_list = _get_doc_data(
        doc_type, doc_id, current_user, db
    )

    pdf_bytes = generate_pdf(doc_type, doc_dict, biz_dict, cust_dict, items_list)
    filename = f"{doc_type}_{doc_dict.get('document_number', doc_id)}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

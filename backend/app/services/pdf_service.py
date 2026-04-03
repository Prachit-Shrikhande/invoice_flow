import io
import os
import base64
from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML

from app.services.qr_service import generate_upi_qr


TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))


def _image_to_base64(filepath: str) -> str:
    """Convert local image file to base64 data URI."""
    if not filepath or not os.path.exists(filepath):
        return ""

    ext = os.path.splitext(filepath)[1].lower().replace(".", "")
    mime = {"jpg": "jpeg", "jpeg": "jpeg", "png": "png", "gif": "gif", "svg": "svg+xml"}.get(ext, "png")

    with open(filepath, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")

    return f"data:image/{mime};base64,{b64}"


def generate_pdf(
    document_type: str,
    document: dict,
    business: dict,
    customer: dict,
    line_items: list,
) -> bytes:
    """
    Generate PDF for any document type.
    Returns PDF as bytes.
    """
    template = env.get_template("document_pdf.html")

    # Convert logo and signature to base64
    logo_b64 = _image_to_base64(business.get("logo_path", ""))
    signature_b64 = _image_to_base64(business.get("signature_path", ""))

    # Generate QR code if UPI ID exists
    qr_b64 = ""
    if business.get("upi_id"):
        try:
            amount = float(document.get("total", 0))
            qr_b64 = generate_upi_qr(
                business["upi_id"],
                business.get("business_name", ""),
                amount=amount,
                currency=business.get("currency", "INR"),
            )
        except Exception:
            qr_b64 = ""

    # Document type labels
    type_labels = {
        "quotation": "QUOTATION",
        "invoice": "INVOICE",
        "purchase_order": "PURCHASE ORDER",
        "receipt": "RECEIPT",
    }

    html_content = template.render(
        doc_type=document_type,
        doc_type_label=type_labels.get(document_type, document_type.upper()),
        document=document,
        business=business,
        customer=customer,
        line_items=line_items,
        logo_b64=logo_b64,
        signature_b64=signature_b64,
        qr_b64=qr_b64,
        currency=business.get("currency", "INR"),
    )

    pdf_bytes = HTML(string=html_content).write_pdf()
    return pdf_bytes

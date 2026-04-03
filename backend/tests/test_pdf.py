import pytest
from app.services.qr_service import generate_upi_qr
from app.services.pdf_service import generate_pdf

def test_generate_upi_qr():
    qr_b64 = generate_upi_qr("test@upi", "Test Payee", 100.50)
    assert qr_b64.startswith("data:image/png;base64,")
    assert len(qr_b64) > 100

def test_generate_pdf_structure():
    # Generate a dummy PDF and check if it returns bytes starting with %PDF
    document = {
        "document_number": "INV-2026-001",
        "date": "2026-04-03",
        "due_date": "2026-04-10",
        "subtotal": 100.0,
        "tax_amount": 18.0,
        "total": 118.0,
        "notes": "Test notes",
    }
    business = {
        "business_name": "Test Business",
        "email": "test@biz.com",
        "currency": "INR"
    }
    customer = {
        "name": "Test Customer"
    }
    line_items = [
        {
            "product_name": "Test Prod",
            "quantity": 1,
            "unit": "PCS",
            "unit_price": 100.0,
            "gst_percent": 18.0,
            "amount": 100.0
        }
    ]
    
    pdf_bytes = generate_pdf("invoice", document, business, customer, line_items)
    
    assert isinstance(pdf_bytes, bytes)
    assert pdf_bytes.startswith(b"%PDF")

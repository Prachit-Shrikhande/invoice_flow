from pydantic import BaseModel
from typing import Optional, List
from datetime import date


class LineItemCreate(BaseModel):
    product_id: Optional[int] = None
    product_name: str
    quantity: float = 1
    unit_price: float
    unit: str = "PCS"
    gst_percent: float = 0
    hsn_code: Optional[str] = None


class LineItemResponse(BaseModel):
    id: int
    document_type: str
    document_id: int
    product_id: Optional[int] = None
    product_name: str
    quantity: float
    unit_price: float
    unit: str
    gst_percent: float
    hsn_code: Optional[str] = None
    amount: float

    class Config:
        from_attributes = True


# --- Quotation ---

class QuotationCreate(BaseModel):
    customer_id: int
    date: date
    valid_until: Optional[date] = None
    other_charges: float = 0
    other_charges_taxable: bool = False
    notes: Optional[str] = None
    terms_content: Optional[str] = None
    line_items: List[LineItemCreate]


class QuotationResponse(BaseModel):
    id: int
    user_id: int
    customer_id: int
    document_number: str
    date: date
    valid_until: Optional[date] = None
    subtotal: float
    tax_amount: float
    other_charges: float
    other_charges_taxable: bool
    total: float
    notes: Optional[str] = None
    status: str
    terms_content: Optional[str] = None
    line_items: List[LineItemResponse] = []
    customer: Optional[dict] = None

    class Config:
        from_attributes = True


# --- Invoice ---

class InvoiceCreate(BaseModel):
    customer_id: int
    date: date
    due_date: Optional[date] = None
    other_charges: float = 0
    other_charges_taxable: bool = False
    notes: Optional[str] = None
    terms_content: Optional[str] = None
    paid_amount: float = 0
    paid_date: Optional[date] = None
    payment_notes: Optional[str] = None
    line_items: List[LineItemCreate]


class InvoiceUpdate(BaseModel):
    customer_id: Optional[int] = None
    date: Optional[date] = None
    due_date: Optional[date] = None
    other_charges: Optional[float] = None
    other_charges_taxable: Optional[bool] = None
    notes: Optional[str] = None
    terms_content: Optional[str] = None
    status: Optional[str] = None
    paid_amount: Optional[float] = None
    paid_date: Optional[date] = None
    payment_notes: Optional[str] = None
    line_items: Optional[List[LineItemCreate]] = None


class InvoiceResponse(BaseModel):
    id: int
    user_id: int
    customer_id: int
    document_number: str
    date: date
    due_date: Optional[date] = None
    subtotal: float
    tax_amount: float
    other_charges: float
    other_charges_taxable: bool
    total: float
    notes: Optional[str] = None
    status: str
    terms_content: Optional[str] = None
    paid_amount: float
    paid_date: Optional[date] = None
    payment_notes: Optional[str] = None
    line_items: List[LineItemResponse] = []
    customer: Optional[dict] = None

    class Config:
        from_attributes = True


# --- Purchase Order ---

class PurchaseOrderCreate(BaseModel):
    customer_id: int
    date: date
    expected_date: Optional[date] = None
    other_charges: float = 0
    other_charges_taxable: bool = False
    notes: Optional[str] = None
    terms_content: Optional[str] = None
    line_items: List[LineItemCreate]


class PurchaseOrderResponse(BaseModel):
    id: int
    user_id: int
    customer_id: int
    document_number: str
    date: date
    expected_date: Optional[date] = None
    subtotal: float
    tax_amount: float
    other_charges: float
    other_charges_taxable: bool
    total: float
    notes: Optional[str] = None
    status: str
    terms_content: Optional[str] = None
    line_items: List[LineItemResponse] = []
    customer: Optional[dict] = None

    class Config:
        from_attributes = True


# --- Receipt ---

class ReceiptCreate(BaseModel):
    customer_id: int
    date: date
    other_charges: float = 0
    notes: Optional[str] = None
    terms_content: Optional[str] = None
    payment_method: Optional[str] = None
    line_items: List[LineItemCreate]


class ReceiptResponse(BaseModel):
    id: int
    user_id: int
    customer_id: int
    document_number: str
    date: date
    subtotal: float
    tax_amount: float
    other_charges: float
    total: float
    notes: Optional[str] = None
    status: str
    terms_content: Optional[str] = None
    payment_method: Optional[str] = None
    line_items: List[LineItemResponse] = []
    customer: Optional[dict] = None

    class Config:
        from_attributes = True

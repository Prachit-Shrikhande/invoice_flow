from pydantic import BaseModel
from typing import Optional


class BusinessProfileCreate(BaseModel):
    business_name: str
    contact_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    additional_info: Optional[str] = None
    tax_label: Optional[str] = None
    tax_number: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    account_name: Optional[str] = None
    account_number: Optional[str] = None
    bank_name: Optional[str] = None
    upi_id: Optional[str] = None
    date_format: Optional[str] = "DD/MM/YYYY"
    currency: Optional[str] = "INR"


class BusinessProfileUpdate(BusinessProfileCreate):
    business_name: Optional[str] = None


class BusinessProfileResponse(BaseModel):
    id: int
    user_id: int
    logo_path: Optional[str] = None
    signature_path: Optional[str] = None
    business_name: str
    contact_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    additional_info: Optional[str] = None
    tax_label: Optional[str] = None
    tax_number: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    account_name: Optional[str] = None
    account_number: Optional[str] = None
    bank_name: Optional[str] = None
    upi_id: Optional[str] = None
    date_format: Optional[str] = None
    currency: Optional[str] = None

    class Config:
        from_attributes = True

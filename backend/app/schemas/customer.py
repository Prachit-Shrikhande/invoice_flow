from pydantic import BaseModel
from typing import Optional


class CustomerCreate(BaseModel):
    name: str
    company_name: Optional[str] = None
    email: Optional[str] = None
    mobile: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    address_line3: Optional[str] = None
    gstin: Optional[str] = None
    state: Optional[str] = None
    shipping_address: Optional[str] = None


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    company_name: Optional[str] = None
    email: Optional[str] = None
    mobile: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    address_line3: Optional[str] = None
    gstin: Optional[str] = None
    state: Optional[str] = None
    shipping_address: Optional[str] = None


class CustomerResponse(BaseModel):
    id: int
    user_id: int
    name: str
    company_name: Optional[str] = None
    email: Optional[str] = None
    mobile: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    address_line3: Optional[str] = None
    gstin: Optional[str] = None
    state: Optional[str] = None
    shipping_address: Optional[str] = None

    class Config:
        from_attributes = True

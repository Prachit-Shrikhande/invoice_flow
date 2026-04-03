from pydantic import BaseModel
from typing import Optional


class ProductCreate(BaseModel):
    product_name: str
    price: float
    unit: Optional[str] = "PCS"
    gst_percent: Optional[float] = 0
    description: Optional[str] = None
    hsn_code: Optional[str] = None


class ProductUpdate(BaseModel):
    product_name: Optional[str] = None
    price: Optional[float] = None
    unit: Optional[str] = None
    gst_percent: Optional[float] = None
    description: Optional[str] = None
    hsn_code: Optional[str] = None


class ProductResponse(BaseModel):
    id: int
    user_id: int
    product_name: str
    price: float
    unit: str
    gst_percent: float
    description: Optional[str] = None
    hsn_code: Optional[str] = None

    class Config:
        from_attributes = True

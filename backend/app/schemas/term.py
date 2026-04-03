from pydantic import BaseModel
from typing import Optional


class TermCreate(BaseModel):
    type: str  # quotation, invoice, purchase_order
    content: str


class TermUpdate(BaseModel):
    type: Optional[str] = None
    content: Optional[str] = None


class TermResponse(BaseModel):
    id: int
    user_id: int
    type: str
    content: str

    class Config:
        from_attributes = True

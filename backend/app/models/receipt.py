from sqlalchemy import Column, Integer, String, ForeignKey, Text, Numeric, Date, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.db.database import Base


class Receipt(Base):
    __tablename__ = "receipts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)

    document_number = Column(String(50), nullable=False)
    date = Column(Date, nullable=False)
    subtotal = Column(Numeric(12, 2), default=0)
    tax_amount = Column(Numeric(12, 2), default=0)
    other_charges = Column(Numeric(12, 2), default=0)
    total = Column(Numeric(12, 2), default=0)
    notes = Column(Text, nullable=True)
    status = Column(String(20), default="completed")
    terms_content = Column(Text, nullable=True)
    payment_method = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="receipts")
    customer = relationship("Customer", back_populates="receipts")
    line_items = relationship("LineItem", primaryjoin="and_(LineItem.document_type=='receipt', foreign(LineItem.document_id)==Receipt.id)", viewonly=True)

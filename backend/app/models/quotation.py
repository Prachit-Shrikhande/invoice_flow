from sqlalchemy import Column, Integer, String, ForeignKey, Text, Numeric, Date, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.db.database import Base


class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)

    document_number = Column(String(50), nullable=False)
    date = Column(Date, nullable=False)
    valid_until = Column(Date, nullable=True)
    subtotal = Column(Numeric(12, 2), default=0)
    tax_amount = Column(Numeric(12, 2), default=0)
    other_charges = Column(Numeric(12, 2), default=0)
    other_charges_taxable = Column(Boolean, default=False)
    total = Column(Numeric(12, 2), default=0)
    notes = Column(Text, nullable=True)
    status = Column(String(20), default="draft")
    terms_content = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="quotations")
    customer = relationship("Customer", back_populates="quotations")
    line_items = relationship("LineItem", primaryjoin="and_(LineItem.document_type=='quotation', foreign(LineItem.document_id)==Quotation.id)", viewonly=True)

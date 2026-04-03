from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.db.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    name = Column(String(200), nullable=False)
    company_name = Column(String(200), nullable=True)
    email = Column(String(255), nullable=True)
    mobile = Column(String(20), nullable=True)
    address_line1 = Column(String(200), nullable=True)
    address_line2 = Column(String(200), nullable=True)
    address_line3 = Column(String(200), nullable=True)
    gstin = Column(String(20), nullable=True)
    state = Column(String(100), nullable=True)
    shipping_address = Column(Text, nullable=True)

    user = relationship("User", back_populates="customers")
    quotations = relationship("Quotation", back_populates="customer")
    invoices = relationship("Invoice", back_populates="customer")
    purchase_orders = relationship("PurchaseOrder", back_populates="customer")
    receipts = relationship("Receipt", back_populates="customer")

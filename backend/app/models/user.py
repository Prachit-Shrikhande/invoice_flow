from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    business_profile = relationship("BusinessProfile", back_populates="user", uselist=False)
    customers = relationship("Customer", back_populates="user")
    products = relationship("Product", back_populates="user")
    terms = relationship("Term", back_populates="user")
    quotations = relationship("Quotation", back_populates="user")
    invoices = relationship("Invoice", back_populates="user")
    purchase_orders = relationship("PurchaseOrder", back_populates="user")
    receipts = relationship("Receipt", back_populates="user")

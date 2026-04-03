from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.db.database import Base


class BusinessProfile(Base):
    __tablename__ = "business_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    logo_path = Column(String(500), nullable=True)
    signature_path = Column(String(500), nullable=True)
    business_name = Column(String(200), nullable=False)
    contact_name = Column(String(100), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    address_line1 = Column(String(200), nullable=True)
    address_line2 = Column(String(200), nullable=True)
    additional_info = Column(Text, nullable=True)
    tax_label = Column(String(50), nullable=True)
    tax_number = Column(String(50), nullable=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)

    # Bank details
    account_name = Column(String(200), nullable=True)
    account_number = Column(String(50), nullable=True)
    bank_name = Column(String(200), nullable=True)
    upi_id = Column(String(100), nullable=True)

    # Preferences
    date_format = Column(String(20), default="DD/MM/YYYY")
    currency = Column(String(10), default="INR")

    user = relationship("User", back_populates="business_profile")

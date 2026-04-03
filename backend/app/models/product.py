from sqlalchemy import Column, Integer, String, ForeignKey, Text, Numeric
from sqlalchemy.orm import relationship

from app.db.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    product_name = Column(String(200), nullable=False)
    price = Column(Numeric(12, 2), nullable=False)
    unit = Column(String(20), default="PCS")
    gst_percent = Column(Numeric(5, 2), default=0)
    description = Column(Text, nullable=True)
    hsn_code = Column(String(20), nullable=True)

    user = relationship("User", back_populates="products")

from sqlalchemy import Column, Integer, String, Numeric

from app.db.database import Base


class LineItem(Base):
    __tablename__ = "line_items"

    id = Column(Integer, primary_key=True, index=True)
    document_type = Column(String(20), nullable=False)  # quotation, invoice, purchase_order, receipt
    document_id = Column(Integer, nullable=False)

    product_id = Column(Integer, nullable=True)
    product_name = Column(String(200), nullable=False)
    quantity = Column(Numeric(10, 2), nullable=False, default=1)
    unit_price = Column(Numeric(12, 2), nullable=False)
    unit = Column(String(20), default="PCS")
    gst_percent = Column(Numeric(5, 2), default=0)
    hsn_code = Column(String(20), nullable=True)
    amount = Column(Numeric(12, 2), nullable=False)

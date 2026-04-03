from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.db.base import Base
from app.db.database import engine
from app.core.config import settings

from app.api.auth import router as auth_router
from app.api.business import router as business_router
from app.api.customers import router as customers_router
from app.api.products import router as products_router
from app.api.terms import router as terms_router
from app.api.quotations import router as quotations_router
from app.api.invoices import router as invoices_router
from app.api.purchase_orders import router as purchase_orders_router
from app.api.receipts import router as receipts_router
from app.api.pdf import router as pdf_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="InvoiceFlow API",
    description="Quotation, Invoice, PO, and Receipt Generator",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Register routes
app.include_router(auth_router)
app.include_router(business_router)
app.include_router(customers_router)
app.include_router(products_router)
app.include_router(terms_router)
app.include_router(quotations_router)
app.include_router(invoices_router)
app.include_router(purchase_orders_router)
app.include_router(receipts_router)
app.include_router(pdf_router)


@app.get("/")
def root():
    return {"message": "InvoiceFlow API is running", "version": "1.0.0"}


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

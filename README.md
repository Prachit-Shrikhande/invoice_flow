# InvoiceFlow

InvoiceFlow is a production-level web application designed for modern businesses to generate and manage professional documents including Quotations, Invoices, Purchase Orders, and Receipts. 

Built with FastAPI (Python) and React (Vite/Tailwind CSS), it features dynamic PDF rendering with WeasyPrint, UPI QR code generation, and a fully functional UI with a beautiful dark glassmorphism design.

## Features

- **Business Profile Management**: Setup business details, logo, signature, default currency, and tax configurations.
- **Client & Product Master**: Save customers and products to easily re-use them in documents.
- **Document Generation**: Create Quotations, Invoices, Purchase Orders, and Receipts.
- **Automatic Calculations**: Dynamic subtotal, tax (GST), and total calculations per document.
- **PDF Export**: Generate professional HTML-to-PDF documents via WeasyPrint.
- **Payment Integration**: Auto-generated UPI QR Codes on invoices for instant payments.
- **Modern UI**: Polished dark-mode UI with fluid animations using Framer Motion and Tailwind CSS v4.

## Prerequisites

### System Requirements (Linux/Ubuntu)
You must have Python 3.12, Node.js (v20+), and WeasyPrint dependencies installed on your system.

```bash
# Install Python, pip, venv, and WeasyPrint system dependencies
sudo apt update
sudo apt install -y python3-pip python3.12-venv python3-dev \
    libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf2.0-0 libffi-dev libcairo2
```

## Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server (Default uses SQLite in local directory)
uvicorn app.main:app --reload --port 8000
```
*The backend API will be available at http://localhost:8000. Interactive API documentation is available at http://localhost:8000/docs.*

### 2. Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Start the Vite dev server
npm run dev
```
*The frontend will run at http://localhost:5173. The Vite proxy is automatically configured to route API requests to `http://localhost:8000/api`.*

## Tech Stack

**Backend:**
- Python 3.12, FastAPI, Uvicorn
- SQLAlchemy 2.0 (SQLite by default, ready for PostgreSQL)
- Pydantic Settings
- JWT Auth & PassLib (Bcrypt)
- WeasyPrint & Jinja2 (PDF Generation)
- qrcode (UPI integration)

**Frontend:**
- React 19 (Vite)
- Tailwind CSS v4
- React Router DOM
- Axios
- Framer Motion

## Database Migration Strategy
Currently, `Base.metadata.create_all()` is used on startup for rapid development. For production deployments, it is recommended to replace this with Alembic migrations.

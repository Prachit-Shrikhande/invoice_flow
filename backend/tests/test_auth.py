import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.database import Base
from app.core.dependencies import get_db

# Create an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def teardown_module(module):
    Base.metadata.drop_all(bind=engine)
    import os
    if os.path.exists("./test.db"):
        os.remove("./test.db")

def test_signup():
    response = client.post(
        "/api/auth/signup",
        json={"email": "test@example.com", "password": "password123", "full_name": "Test User"}
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_signup_duplicate_email():
    response = client.post(
        "/api/auth/signup",
        json={"email": "test@example.com", "password": "password123", "full_name": "Test User 2"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

def test_signin():
    response = client.post(
        "/api/auth/signin",
        json={"email": "test@example.com", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data

def test_signin_invalid():
    response = client.post(
        "/api/auth/signin",
        json={"email": "test@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    
def test_get_me():
    # Login first
    response = client.post(
        "/api/auth/signin",
        json={"email": "test@example.com", "password": "password123"}
    )
    token = response.json()["access_token"]
    
    # Get profile
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["full_name"] == "Test User"

from fastapi.testclient import TestClient
from app.main import app
from app import models
from app.database import Base, get_db, engine
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup test DB
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
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

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_register_user():
    response = client.post(
        "/auth/register",
        json={"email": "test@example.com", "password": "password123", "name": "Test User"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_user():
    # Register first
    client.post(
        "/auth/register",
        json={"email": "login@example.com", "password": "password123", "name": "Login User"}
    )
    response = client.post(
        "/auth/login",
        json={"email": "login@example.com", "password": "password123"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

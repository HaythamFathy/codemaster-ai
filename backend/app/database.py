from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
import time
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- Database Configuration ---
# Default to SQLite for local ease, but prefer DATABASE_URL for production
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(os.path.dirname(BASE_DIR), "codemaster.db")
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")

# Fix for Render/Heroku/Vercel postgres:// vs postgresql://
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Engine Creation Logic
if DATABASE_URL.startswith("sqlite"):
    # SQLite Specific args
    connect_args = {"check_same_thread": False}
    engine = create_engine(
        DATABASE_URL, 
        connect_args=connect_args
    )
else:
    # PostgreSQL / Serverless Optimization (Supabase/Vercel)
    # pool_pre_ping: Checks connection liveness before using it (Crucial for serverless)
    # pool_recycle: Recycles connections before they are closed by the server (e.g. 1 hour)
    # pool_size: Max persistent connections (keep low for serverless)
    # max_overflow: Max 'burst' connections
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=1800,  # Recycle every 30 minutes
        pool_size=10,       # Conservative pool size
        max_overflow=20     # Allow spikes
    )

# SessionLocal class for dependency injection
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

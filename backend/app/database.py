from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Default to SQLite for local development ease if Postgres is not set
# DYNAMIC: Use absolute path to avoid confusion between running from root vs backend
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# app/../codemaster.db -> backend/codemaster.db
DB_PATH = os.path.join(os.path.dirname(BASE_DIR), "codemaster.db")
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")

# Render/Heroku fix: SQLAlchemy needs postgresql:// but they offer postgres://
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    engine = create_engine(DATABASE_URL, connect_args=connect_args)
else:
    # Optimized for Vercel/Supabase (Serverless)
    engine = create_engine(
        DATABASE_URL, 
        pool_pre_ping=True, 
        pool_size=10, 
        max_overflow=20,
        pool_recycle=1800 # Recycle connections every 30 mins
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

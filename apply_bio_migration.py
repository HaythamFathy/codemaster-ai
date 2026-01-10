import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Fallback to local SQLite if env var is missing
if not DATABASE_URL:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    # Assuming script is in root (h:\online-edu), and db is in backend/...?
    # database.py says: DB_PATH = os.path.join(os.path.dirname(BASE_DIR), "codemaster.db") where BASE_DIR is backend/app
    # So DB is in backend/codemaster.db ? 
    # Let's check listing content: codemaster.db is in h:\online-edu (root) from list_dir.
    DATABASE_URL = "sqlite:///codemaster.db"
    print(f"Using default SQLite: {DATABASE_URL}")

# Fix for SQLAlchemy URL if needed (e.g. postgres:// -> postgresql://)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as connection:
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;"))
        connection.commit()
    print("Successfully added bio column to users table.")
except Exception as e:
    print(f"Error applying migration: {e}")

import os
import sys
from sqlalchemy import create_engine, inspect
from app.database import Base, engine, SessionLocal
from app.models import User, Course
from app.routers.auth import get_password_hash

def rebuild():
    print("Starting Database Rebuild...")
    
    # 1. Delete existing DB files
    db_files = ["codemaster.db", "app/codemaster.db"]
    for db_file in db_files:
        if os.path.exists(db_file):
            try:
                os.remove(db_file)
                print(f"Deleted {db_file}")
            except Exception as e:
                print(f"Failed to delete {db_file}: {e}")
        else:
            print(f"{db_file} not found.")

    # 2. Create Tables
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    # 3. Verify Schema columns
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns('users')]
    print(f"User columns: {columns}")
    
    if 'xp_points' not in columns:
        print("CRITICAL: xp_points column MISSING!")
        return
    else:
        print("Schema verification passed.")

    # 4. Seed Data
    try:
        from seed_db import seed
        print("Creating initial data...")
        seed()
    except Exception as e:
        print(f"Error seeding data: {e}")
    
    print("Database Rebuild Complete!")

if __name__ == "__main__":
    # Ensure we are in the backend directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    rebuild()

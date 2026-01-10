import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
# Use local fallback if env var is missing or empty
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(DATABASE_URL)

def run_migration():
    with engine.connect() as conn:
        print("Adding is_pro and stripe_customer_id to users table...")
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN is_pro BOOLEAN DEFAULT FALSE;"))
            print("- Added is_pro column.")
        except Exception as e:
            print(f"- Skipped is_pro (might exist): {e}")

        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(255);"))
            print("- Added stripe_customer_id column.")
        except Exception as e:
            print(f"- Skipped stripe_customer_id (might exist): {e}")
            
        conn.commit()
        print("Migration complete.")

if __name__ == "__main__":
    run_migration()

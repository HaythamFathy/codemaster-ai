import os
import sys
from sqlalchemy import create_engine, text

# HARDCODE YOUR CONNECTION STRING HERE FOR TESTING
# Replace this string with the EXACT value you pasted into Vercel
TEST_URL = "postgresql://postgres.ldkywwemutwqdrdamhfz:HaythamPua012345@aws-1-eu-central-1.pooler.supabase.com:6543/postgres"

def test_connection():
    print(f"Testing connection to: {TEST_URL}")
    print("-" * 50)
    
    try:
        if TEST_URL.startswith("sqlite"):
            print("Detected SQLite URL.")
            engine = create_engine(TEST_URL)
        else:
            print("Detected PostgreSQL URL.")
            engine = create_engine(TEST_URL)
        
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("SUCCESS! Connection established.")
            print(f"Test Query Result: {result.fetchone()}")
            
    except Exception as e:
        print("\nCONNECTION FAILED!")
        print("Error details:")
        print(e)
        print("-" * 50)
        print("Troubleshooting tips:")
        print("1. Check your password. If it has special chars like '@', they must be URL encoded (e.g., %40).")
        print("2. Check the hostname. No brackets [].")
        print("3. Check if Supabase project is 'Paused'.")

if __name__ == "__main__":
    try:
        import psycopg2
        print("psycopg2 is installed.")
    except ImportError:
        print("WARNING: psycopg2 is NOT installed. You need it for Postgres.")
        print("Run: pip install psycopg2-binary")
        sys.exit(1)
        
    test_connection()

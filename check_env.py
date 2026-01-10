import os
import sys
from dotenv import load_dotenv

def check_env_vars():
    """
    Validates that all critical environment variables are set.
    Raises a SystemExit if any are missing to prevent app startup in a bad state.
    """
    # Load .env file if present (local dev)
    load_dotenv()
    
    required_vars = [
        "NEXT_PUBLIC_API_URL",  # Frontend API Endpoint
        "DATABASE_URL",         # PostgreSQL Connection
        "OPENAI_API_KEY",       # AI Features
        "STRIPE_SECRET_KEY",    # Payments
        "SECRET_KEY",           # Security / Sessions
    ]
    
    missing_vars = []
    
    print("🔍 Checking Environment Variables...")
    
    for var in required_vars:
        value = os.getenv(var)
        if not value:
            missing_vars.append(var)
        else:
            # Mask keys for security in logs
            masked = value[:4] + "*" * (len(value) - 8) + value[-4:] if len(value) > 8 else "****"
            print(f"  ✅ {var} is set.")

    if missing_vars:
        print("\n❌ CRITICAL ERROR: The following required environment variables are missing:")
        for var in missing_vars:
            print(f"  - {var}")
        print("\nPlease check your .env file or deployment settings.")
        sys.exit(1)
    
    print("\n✨ Environment validation passed. System ready to start.")

if __name__ == "__main__":
    check_env_vars()

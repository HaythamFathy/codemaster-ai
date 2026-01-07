from backend.app.database import SessionLocal
from backend.app import models

def check_users():
    db = SessionLocal()
    try:
        user_count = db.query(models.User).count()
        print(f"User count: {user_count}")
        if user_count == 0:
            print("Creating default user...")
            default_user = models.User(
                email="admin@codemaster.ai",
                name="Admin User",
                hashed_password="hashedpassword123", # Dummy
                role="admin"
            )
            db.add(default_user)
            db.commit()
            print("Default user created (ID: 1).")
        else:
            first_user = db.query(models.User).first()
            print(f"First user ID: {first_user.id}")
    finally:
        db.close()

if __name__ == "__main__":
    check_users()

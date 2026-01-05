from app.database import SessionLocal
from app import models

def test_query():
    db = SessionLocal()
    try:
        print("Querying courses...")
        courses = db.query(models.Course).all()
        print(f"Found {len(courses)} courses.")
        for c in courses:
            print(f"Course: {c.title}")
            print(f"Lessons: {len(c.lessons)}") # Trigger relationship load
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_query()

from app.database import SessionLocal, engine, Base
from app.models import Course, User
from app import models

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    
    courses_to_seed = [
        {
            "title": "Python 101: The Basics",
            "description": "Start your journey here. Learn variables and basic types.",
            "difficulty": "Beginner",
            "lessons": [
                {
                    "title": "Variables & Types",
                    "video_url": "https://www.youtube.com/watch?v=khNv65k2jag",
                    "ai_prompt": "The student is learning about Python variables and data types. If they fail, suggest printing the type() of the variable.",
                    "quiz_data": '[{"question": "What is the correct file extension for Python files?", "options": [".py", ".python", ".pt", ".pi"], "correctAnswer": ".py"}]'
                }
            ]
        },
        {
            "title": "Python Control Flow",
            "description": "Master loops and conditionals.",
            "difficulty": "Intermediate",
            "lessons": [
                {
                    "title": "If/Else & Loops",
                    "video_url": "https://www.youtube.com/watch?v=PqFKRqpHrjw",
                    "ai_prompt": "Topic: If/Else statements and Loops. Key concept: Indentation is crucial in Python. Suggest checking indentation if SyntaxError occurs.",
                    "quiz_data": '[{"question": "Which keyword is used for loops?", "options": ["loop", "for", "repeat", "cycle"], "correctAnswer": "for"}]'
                }
            ]
        },
        {
            "title": "Python Functions & Modules",
            "description": "Learn to write reusable code.",
            "difficulty": "Advanced",
            "lessons": [
                {
                    "title": "Defining Functions",
                    "video_url": "https://www.youtube.com/watch?v=NSbOtYzIQI0",
                    "ai_prompt": "Topic: Def keyword, arguments, and return values. Remind student to define the function before calling it.",
                    "quiz_data": '[{"question": "How do you define a function in Python?", "options": ["func myFunc():", "def myFunc():", "function myFunc():", "define myFunc():"], "correctAnswer": "def myFunc():"}]'
                }
            ]
        }
    ]

    from app.models import Lesson

    for course_data in courses_to_seed:
        existing_course = db.query(Course).filter(Course.title == course_data["title"]).first()
        if not existing_course:
            print(f"Seeding {course_data['title']}...")
            # Extract lessons data
            lessons_data = course_data.pop("lessons")
            
            new_course = Course(**course_data)
            db.add(new_course)
            db.commit()
            db.refresh(new_course)
            
            # Create lessons
            for lesson_data in lessons_data:
                new_lesson = Lesson(**lesson_data, course_id=new_course.id)
                db.add(new_lesson)
            
            db.commit()
            print(f"✅ Created {new_course.title} with {len(lessons_data)} lessons")
        else:
            print(f"ℹ️ {course_data['title']} already exists.")

    # Optional: Seed a test user
    if not db.query(User).filter(User.email == "student@codemaster.com").first():
        from app.routers.auth import get_password_hash
        test_user = User(
            email="student@codemaster.com",
            name="Test Student",
            hashed_password=get_password_hash("password123"),  # In real app, import get_password_hash
            role="student"
        )
        db.add(test_user)
        db.commit()
        print("✅ Test User 'student@codemaster.com' created.")

    # Create Admin User
    if not db.query(User).filter(User.email == "admin@codemaster.com").first():
        from app.routers.auth import get_password_hash
        admin_user = User(
            email="admin@codemaster.com",
            name="Admin User",
            hashed_password=get_password_hash("admin123"),
            role="admin"
        )
        db.add(admin_user)
        db.commit()
        print("✅ Admin User 'admin@codemaster.com' created.")

    db.close()

if __name__ == "__main__":
    seed()

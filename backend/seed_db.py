import sys
import os

# Ensure backend directory is in path so we can import app modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from backend.app.database import SessionLocal, engine
from backend.app import models

def seed():
    # Create tables
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if courses exist
        if db.query(models.Course).first():
            print("Database already seeded.")
            return

        # Create Courses
        courses_data = [
            {
                "title": "Python for Beginners",
                "difficulty": "Beginner",
                "image_url": "https://bit.ly/3tjd7x3",
                "description": "Start your coding journey with Python."
            },
            {
                "title": "Advanced Robotics",
                "difficulty": "Advanced",
                "image_url": "https://bit.ly/3RO0H4S",
                "description": "Master robotics with advanced algorithms."
            },
            {
                "title": "Full Stack Web Dev",
                "difficulty": "Intermediate",
                "image_url": "https://bit.ly/48vj5O5",
                "description": "Build modern web applications."
            }
        ]

        for course_data in courses_data:
            course = models.Course(**course_data)
            db.add(course)
            db.commit()
            db.refresh(course)
            
            # Add sample lessons
            lessons_data = [
                {
                    "title": f"Intro to {course.title}",
                    "video_url": "https://www.youtube.com/watch?v=kqtD5dpn9C8",
                    "content": "Welcome to the course!",
                    "course_id": course.id
                },
                {
                    "title": f"Advanced Concepts in {course.title}",
                    "video_url": "https://www.youtube.com/watch?v=rfscVS0vtbw",
                    "content": "Let's dive deeper.",
                    "course_id": course.id
                }
            ]
            
            for lesson_data in lessons_data:
                lesson = models.Lesson(**lesson_data)
                db.add(lesson)
            
            db.commit()

        print("Seeding complete: 3 courses and 6 lessons added.")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()

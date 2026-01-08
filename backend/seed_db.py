import sys
import os

# Ensure backend directory is in path so we can import app modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from backend.app.database import SessionLocal, engine
from backend.app import models
import json

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
                "slug": "python-for-beginners",
                "thumbnail_url": "https://bit.ly/3tjd7x3",
                "description": "Start your coding journey with Python.",
                "is_published": True
            },
            {
                "title": "Advanced Robotics",
                "slug": "advanced-robotics",
                "thumbnail_url": "https://bit.ly/3RO0H4S",
                "description": "Master robotics with advanced algorithms.",
                "is_published": True
            },
            {
                "title": "Full Stack Web Dev",
                "slug": "full-stack-web-dev",
                "thumbnail_url": "https://bit.ly/48vj5O5",
                "description": "Build modern web applications.",
                "is_published": True
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
                    "course_id": course.id,
                    "order_index": 1
                },
                {
                    "title": f"Advanced Concepts in {course.title}",
                    "video_url": "https://www.youtube.com/watch?v=rfscVS0vtbw",
                    "content": "Let's dive deeper.",
                    "course_id": course.id,
                    "order_index": 2
                }
            ]
            
            for i, lesson_data in enumerate(lessons_data):
                lesson = models.Lesson(**lesson_data)
                db.add(lesson)
                db.commit()
                db.refresh(lesson)

                # Add Challenge for each lesson
                challenge = models.Challenge(
                    lesson_id=lesson.id,
                    slug=f"{course.slug}-lesson-{i+1}",
                    problem_statement=f"Write a function that prints 'Hello {lesson.title}'",
                    starter_code="def solve():\n    # Your code here\n    pass",
                    test_cases=[
                        {"input": "", "expected_output": f"Hello {lesson.title}"}
                    ]
                )
                db.add(challenge)
                db.commit()
            
        print("Seeding complete: Courses, Lessons, and Challenges added.")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed()

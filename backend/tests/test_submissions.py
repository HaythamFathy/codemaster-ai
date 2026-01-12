import unittest
from fastapi.testclient import TestClient
from app.main import app
from app import models
from app.database import Base, get_db, engine
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Setup test DB
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

class TestSubmissions(unittest.TestCase):
    def setUp(self):
        Base.metadata.create_all(bind=engine)
        self.db = TestingSessionLocal()
        self.client = TestClient(app)
        
        # Create Data
        self.instructor = models.User(
            email="inst@test.com", 
            full_name="Instructor", 
            role="instructor",
            is_active=True
        )
        self.db.add(self.instructor)
        self.db.commit()
        
        self.course = models.Course(
            title="Python Test Course",
            slug="py-test",
            instructor_id=self.instructor.id,
            is_published=True
        )
        self.db.add(self.course)
        self.db.commit()
        
        self.lesson = models.Lesson(
            title="Intro Lesson",
            course_id=self.course.id,
            order_index=1,
            content="Lesson content"
        )
        self.db.add(self.lesson)
        self.db.commit()
        
        self.challenge = models.Challenge(
            lesson_id=self.lesson.id,
            slug="hello-world",
            problem_statement="Print 'Hello World'",
            test_cases=[{"input": "", "expected_output": "Hello World"}]
        )
        self.db.add(self.challenge)
        self.db.commit()

    def tearDown(self):
        self.db.close()
        Base.metadata.drop_all(bind=engine)

    def test_code_submission_flow(self):
        # Register and Login Student
        self.client.post("/api/auth/register", json={
            "email": "student@test.com", 
            "password": "pass", 
            "name": "Student"
        })
        
        login_res = self.client.post("/api/auth/login", json={
            "email": "student@test.com", 
            "password": "pass"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Submit Correct Code
        # We assume local execution environment allows 'print' capture
        valid_code = "print('Hello World')"
        response = self.client.post(
            "/api/submissions/submit_code",
            json={"lesson_id": self.lesson.id, "code_submitted": valid_code},
            headers=headers
        )
        
        self.assertEqual(response.status_code, 200, f"Response: {response.text}")
        data = response.json()
        self.assertEqual(data["status"], "Passed")
        self.assertEqual(data["passed_test_cases"], 1)
        
        # Submit Incorrect Code
        invalid_code = "print('Wrong')"
        response_fail = self.client.post(
            "/api/submissions/submit_code",
            json={"lesson_id": self.lesson.id, "code_submitted": invalid_code},
            headers=headers
        )
        
        self.assertEqual(response_fail.status_code, 200)
        fail_data = response_fail.json()
        self.assertTrue(fail_data["status"] in ["Failed", "Error"])

if __name__ == '__main__':
    unittest.main()

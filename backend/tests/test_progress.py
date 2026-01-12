import unittest
from fastapi.testclient import TestClient
from app.main import app
from app import models
from app.database import Base, get_db
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

class TestProgressTracking(unittest.TestCase):
    def setUp(self):
        Base.metadata.create_all(bind=engine)
        self.db = TestingSessionLocal()
        self.client = TestClient(app)
        
        # 1. Setup Data: Instructor, Course, Lesson, Challenge
        self.instructor = models.User(
            email="inst_prog@test.com", 
            full_name="Instructor P", 
            role="instructor",
            is_active=True
        )
        self.db.add(self.instructor)
        self.db.commit()
        
        self.course = models.Course(
            title="Progress Test Course",
            slug="prog-test",
            instructor_id=self.instructor.id,
            is_published=True
        )
        self.db.add(self.course)
        self.db.commit()
        
        self.lesson = models.Lesson(
            title="Lesson 1",
            course_id=self.course.id,
            order_index=1,
            content="Content"
        )
        self.db.add(self.lesson)
        self.db.commit()
        
        self.challenge = models.Challenge(
            lesson_id=self.lesson.id,
            slug="chal-1",
            problem_statement="Solve me",
            test_cases=[{"input": "", "expected_output": "Solved"}]
        )
        self.db.add(self.challenge)
        self.db.commit()

    def tearDown(self):
        self.db.close()
        Base.metadata.drop_all(bind=engine)

    def test_progress_tracking_flow(self):
        # 1. Register and Login Student
        self.client.post("/api/auth/register", json={
            "email": "student_prog@test.com", 
            "password": "pass", 
            "name": "Student P"
        })
        
        login_res = self.client.post("/api/auth/login", json={
            "email": "student_prog@test.com", 
            "password": "pass"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # 2. Enroll in Course
        self.client.post(
            "/api/enrollments",
            json={"course_id": self.course.id},
            headers=headers
        )
        
        # 3. Initial Check: XP=0, No Progress
        me_res = self.client.get("/api/auth/me", headers=headers)
        self.assertEqual(me_res.json()["xp_points"], 0)
        
        enroll_res = self.client.get("/api/enrollments/me", headers=headers)
        data = enroll_res.json()
        self.assertEqual(len(data), 1)
        # Progress might be empty list initially
        self.assertEqual(len(data[0]["progress"]), 0)
        
        # 4. Complete Lesson (Submit Code)
        # Using a valid code submission that matches test case
        # Note: We rely on local execution being enabled or mocked.
        # Simple print matching for now.
        valid_code = "print('Solved')"
        
        sub_res = self.client.post(
            "/api/submissions/submit_code",
            json={"lesson_id": self.lesson.id, "code_submitted": valid_code},
            headers=headers
        )
        self.assertEqual(sub_res.status_code, 200)
        self.assertEqual(sub_res.json()["status"], "Passed")
        
        # 5. Final Check: XP Increased, Progress Updated
        # Check XP (should be +10)
        me_res_after = self.client.get("/api/auth/me", headers=headers)
        self.assertEqual(me_res_after.json()["xp_points"], 10)
        
        # Check Lesson Progress
        enroll_res_after = self.client.get("/api/enrollments/me", headers=headers)
        data_after = enroll_res_after.json()
        progress_list = data_after[0]["progress"]
        
        self.assertGreater(len(progress_list), 0)
        # Find progress for this lesson
        lesson_prog = next((p for p in progress_list if p["lesson_id"] == self.lesson.id), None)
        self.assertIsNotNone(lesson_prog)
        self.assertTrue(lesson_prog["is_completed"])

if __name__ == '__main__':
    unittest.main()

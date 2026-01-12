import unittest
from fastapi.testclient import TestClient
from app.main import app
from app import models, schemas
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

class TestCoursesAPI(unittest.TestCase):
    def setUp(self):
        Base.metadata.create_all(bind=engine)
        self.db = TestingSessionLocal()
        self.client = TestClient(app)
        
        # Create Verify Data
        self.instructor = models.User(
            email="inst_course@test.com", 
            full_name="Prof. X", 
            role="instructor",
            is_active=True
        )
        self.db.add(self.instructor)
        self.db.commit()
        
        self.course = models.Course(
            title="API Test Course",
            slug="api-test",
            description="Desc",
            instructor_id=self.instructor.id,
            is_published=True,
            course_type="pre_recorded"
        )
        self.db.add(self.course)
        self.db.commit()

    def tearDown(self):
        self.db.close()
        Base.metadata.drop_all(bind=engine)

    def test_get_courses_catalog(self):
        # GET /api/courses
        res = self.client.get("/api/courses")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(len(data) > 0)
        
        course_data = data[0]
        self.assertEqual(course_data["title"], "API Test Course")
        self.assertEqual(course_data["course_type"], "pre_recorded")
        
        # Check for Instructor Name (Expected based on requirement, but suspected missing)
        # We expect this to FAIL if we asserted it was present.
        # Instead, we ASSERT it is MISSING to confirm our finding.
        self.assertNotIn("instructor", course_data)
        self.assertIn("instructor_id", course_data)
        
        # Also check Schema doesn't have it
        # (Implicitly checked by absence in dict)

if __name__ == '__main__':
    unittest.main()

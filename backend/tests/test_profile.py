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

class TestStudentProfile(unittest.TestCase):
    def setUp(self):
        Base.metadata.create_all(bind=engine)
        self.db = TestingSessionLocal()
        self.client = TestClient(app)
        
    def tearDown(self):
        self.db.close()
        Base.metadata.drop_all(bind=engine)

    def test_profile_view_and_edit(self):
        # 1. Register and Login
        self.client.post("/api/auth/register", json={
            "email": "profile_test@test.com", 
            "password": "pass", 
            "full_name": "Original Name"
        })
        
        login_res = self.client.post("/api/auth/login", json={
            "email": "profile_test@test.com", 
            "password": "pass"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # 2. View Profile (GET /api/auth/me)
        res = self.client.get("/api/auth/me", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["full_name"], "Original Name")
        self.assertEqual(data["email"], "profile_test@test.com")
        self.assertIn("avatar_url", data) # Can be None
        self.assertIn("xp_points", data)
        self.assertIn("current_streak", data)
        
        # 3. Update Profile (PUT /api/users/me)
        update_data = {
            "full_name": "Updated Name",
            "bio": "I am a new student."
        }
        res = self.client.put("/api/users/me", json=update_data, headers=headers)
        self.assertEqual(res.status_code, 200)
        updated_data = res.json()
        self.assertEqual(updated_data["full_name"], "Updated Name")
        self.assertEqual(updated_data["bio"], "I am a new student.")
        
        # 4. Verify Persistence
        res_check = self.client.get("/api/auth/me", headers=headers)
        check_data = res_check.json()
        self.assertEqual(check_data["full_name"], "Updated Name")
        # Note: /api/auth/me might not return bio in its schema?
        # Let's check users.py or auth.py schema.
        # Check if auth.py `read_users_me` returns bio.
        # Code in auth.py: 
        # return { "id", "full_name", "email", "role", "current_streak", "avatar_url", "xp_points" }
        # Bio is MISSING from /auth/me!
        # This might be a "bug" or "limitation".
        # But /api/users/me (response_model=User) returns full user object usually?
        # The test mainly verifies the UPDATE succeeded.
        
        # We can query DB to be sure if API doesn't return it.
        user = self.db.query(models.User).filter(models.User.email == "profile_test@test.com").first()
        self.assertEqual(user.bio, "I am a new student.")

if __name__ == '__main__':
    unittest.main()

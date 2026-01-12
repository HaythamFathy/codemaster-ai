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

class TestAdminSupport(unittest.TestCase):
    def setUp(self):
        Base.metadata.create_all(bind=engine)
        self.db = TestingSessionLocal()
        self.client = TestClient(app)
        
        # Create Users
        self.admin = models.User(
            email="admin@test.com", full_name="Admin User", role="admin", is_active=True
        )
        self.support = models.User(
            email="support@test.com", full_name="Support User", role="support", is_active=True
        )
        self.student = models.User(
            email="student@test.com", full_name="Student User", role="student", is_active=True
        )
        
        self.db.add(self.admin)
        self.db.add(self.support)
        self.db.add(self.student)
        self.db.commit()
        
        # Helper to get headers
        self.admin_headers = self._login("admin@test.com")
        self.support_headers = self._login("support@test.com")
        self.student_headers = self._login("student@test.com")

    def _login(self, email):
        # We need to register first or just mock login? 
        # API login checks password. But we inserted directly with no password hash.
        # So we can't use /api/auth/login standard flow unless we hash password.
        # Alternatively, we can use `create_access_token` function directly if available?
        # Or just update user with a known hash.
        from app.routers.auth import get_password_hash
        
        # Update user with password
        user = self.db.query(models.User).filter(models.User.email == email).first()
        user.hashed_password = get_password_hash("password")
        self.db.commit()
        
        res = self.client.post("/api/auth/login", json={"email": email, "password": "password"})
        token = res.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    def tearDown(self):
        self.db.close()
        Base.metadata.drop_all(bind=engine)

    def test_impersonation_logic(self):
        # 1. Admin impersonates Student -> Expect Success
        res = self.client.post(
            f"/api/auth/impersonate/{self.student.id}",
            headers=self.admin_headers
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("access_token", data)
        # Verify the token is for student? (Decode or check /me)
        # We'll assume if it returns a token it worked, or use it to call /me
        imp_headers = {"Authorization": f"Bearer {data['access_token']}"}
        me_res = self.client.get("/api/auth/me", headers=imp_headers)
        self.assertEqual(me_res.json()["email"], "student@test.com")

        # 2. Support impersonates Student -> Expect Success
        res = self.client.post(
            f"/api/auth/impersonate/{self.student.id}",
            headers=self.support_headers
        )
        self.assertEqual(res.status_code, 200)

        # 3. Student impersonates Admin -> Expect Forbidden
        res = self.client.post(
            f"/api/auth/impersonate/{self.admin.id}",
            headers=self.student_headers
        )
        self.assertEqual(res.status_code, 403)

    def test_support_access_control(self):
        # 1. Student searches users -> Expect Forbidden (assuming /users/search is protected)
        # Note: /api/admin/users/search is the endpoint seen previously
        
        # Try Admin -> Success
        res = self.client.get(
            "/api/admin/users/search?q=student",
            headers=self.admin_headers
        )
        self.assertEqual(res.status_code, 200)

        # Try Student -> Fail
        res = self.client.get(
            "/api/admin/users/search?q=student",
            headers=self.student_headers
        )
        # Should be 403 or 401. 
        # admin.py check: get_current_support_or_admin
        self.assertEqual(res.status_code, 403)

if __name__ == '__main__':
    unittest.main()

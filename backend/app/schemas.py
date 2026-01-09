from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

# --- Enums & Helpers ---

# --- User Schemas ---
class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    role: str = "student"
    avatar_url: Optional[str] = None
    is_active: bool = True
    current_streak: int = 0
    xp_points: int = 0

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Challenge Schemas ---
class ChallengeBase(BaseModel):
    slug: str
    problem_statement: str
    starter_code: Optional[str] = None
    test_cases: Optional[List[dict]] = None # JSONB list of dicts

class ChallengeCreate(ChallengeBase):
    lesson_id: int

class Challenge(ChallengeBase):
    id: int
    lesson_id: int
    
    class Config:
        from_attributes = True

# --- Lesson Schemas ---
class LessonBase(BaseModel):
    title: str
    video_url: Optional[str] = None
    content: Optional[str] = None
    order_index: int

class LessonCreate(LessonBase):
    course_id: int

class LessonUpdate(BaseModel):
    title: Optional[str] = None
    video_url: Optional[str] = None
    content: Optional[str] = None
    order_index: Optional[int] = None

class Lesson(LessonBase):
    id: int
    course_id: int
    challenge: Optional[Challenge] = None
    
    class Config:
        from_attributes = True

# --- Course Schemas ---
class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    slug: str
    thumbnail_url: Optional[str] = None
    is_published: bool = False
    course_type: str = "pre_recorded"

class CourseCreate(CourseBase):
    instructor_id: Optional[int] = None

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    is_published: Optional[bool] = None
    instructor_id: Optional[int] = None
    course_type: Optional[str] = None

class Course(CourseBase):
    id: int
    instructor_id: Optional[int] = None
    lessons: List[Lesson] = []
    
    class Config:
        from_attributes = True

# --- Submission Schemas ---
class SubmissionBase(BaseModel):
    code_submitted: str

class SubmissionCreate(SubmissionBase):
    lesson_id: int

class Submission(SubmissionBase):
    id: int
    user_id: int
    challenge_id: int
    status: str
    passed_test_cases: int
    total_test_cases: int
    submitted_at: datetime
    
    class Config:
        from_attributes = True

# --- Enrollment Schemas ---
class EnrollmentBase(BaseModel):
    pass

class EnrollmentCreate(EnrollmentBase):
    course_id: int

class LessonProgressResponse(BaseModel):
    lesson_id: int
    is_completed: bool
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class Enrollment(EnrollmentBase):
    id: int
    user_id: int
    course_id: int
    enrolled_at: datetime
    # Optionally include course details or progress summary
    course: Optional[Course] = None 
    progress: List[LessonProgressResponse] = []

    class Config:
        from_attributes = True

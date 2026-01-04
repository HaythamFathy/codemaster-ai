from pydantic import BaseModel
from typing import Optional, List

class UserBase(BaseModel):
    email: str
    name: str
    role: str = "student"
    xp_points: int = 0
    current_streak: int = 0

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class LessonBase(BaseModel):
    title: str
    video_url: str
    content: Optional[str] = None
    ai_prompt: Optional[str] = None
    quiz_data: Optional[str] = None

class LessonCreate(LessonBase):
    course_id: int

class LessonUpdate(BaseModel):
    title: Optional[str] = None
    video_url: Optional[str] = None
    content: Optional[str] = None
    ai_prompt: Optional[str] = None
    quiz_data: Optional[str] = None

class Lesson(LessonBase):
    id: int
    course_id: int
    class Config:
        orm_mode = True

class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    difficulty: str
    image_url: Optional[str] = None

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[str] = None
    image_url: Optional[str] = None

class Course(CourseBase):
    id: int
    lessons: List[Lesson] = []
    class Config:
        orm_mode = True

class SubmissionBase(BaseModel):
    code_content: str

class QuizSubmission(BaseModel):
    score: int

class SubmissionCreate(SubmissionBase):
    pass

class Submission(SubmissionBase):
    id: int
    user_id: int
    passed_boolean: bool
    ai_feedback: Optional[str] = None
    stdout: Optional[str] = None
    stderr: Optional[str] = None
    exit_code: Optional[int] = None
    
    class Config:
        orm_mode = True

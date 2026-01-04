from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
from .database import Base
import enum

class UserRole(str, enum.Enum):
    STUDENT = "student"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default=UserRole.STUDENT)
    xp_points = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    last_active_date = Column(DateTime, nullable=True)

    submissions = relationship("Submission", back_populates="user")

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True) # Added description
    difficulty = Column(String)
    
    lessons = relationship("Lesson", back_populates="course")

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    title = Column(String, index=True)
    video_url = Column(String)
    content = Column(String, nullable=True) # Text content for the lesson
    ai_prompt = Column(String, nullable=True)
    quiz_data = Column(String, nullable=True) # JSON string for quiz questions

    course = relationship("Course", back_populates="lessons")

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    code_content = Column(String)
    passed_boolean = Column(Boolean, default=False)
    ai_feedback = Column(String, nullable=True)
    # New fields for execution output
    stdout = Column(String, nullable=True)
    stderr = Column(String, nullable=True)
    exit_code = Column(Integer, nullable=True)

    user = relationship("User", back_populates="submissions")

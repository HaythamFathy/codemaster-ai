from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Enum, DateTime, Text, Identity
from sqlalchemy.orm import relationship
from sqlalchemy import JSON
from sqlalchemy.sql import func
from .database import Base
import enum

class UserRole(str, enum.Enum):
    STUDENT = "student"
    ADMIN = "admin"
    INSTRUCTOR = "instructor"
    SUPPORT = "support"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, Identity(), primary_key=True)
    email = Column(Text, unique=True, nullable=False)
    hashed_password = Column(Text, nullable=True)
    full_name = Column(Text, nullable=True)
    avatar_url = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.STUDENT)
    is_active = Column(Boolean, default=True)
    google_sub = Column(Text, unique=True, nullable=True)
    current_streak = Column(Integer, default=0)
    xp_points = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    submissions = relationship("Submission", back_populates="user", cascade="all, delete-orphan")
    courses_teaching = relationship("Course", back_populates="instructor")
    enrollments = relationship("Enrollment", back_populates="user", cascade="all, delete-orphan")

class CourseType(str, enum.Enum):
    ONE_ON_ONE = "one_on_one"
    GROUP = "group"
    PRE_RECORDED = "pre_recorded"

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, Identity(), primary_key=True)
    title = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    slug = Column(Text, unique=True, nullable=False)
    thumbnail_url = Column(Text, nullable=True)
    is_published = Column(Boolean, default=False)
    instructor_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    # Using String instead of Enum to avoid SQLAlchemy/Postgres type mismatch issues
    course_type = Column(String, default="pre_recorded")

    instructor = relationship("User", back_populates="courses_teaching")
    lessons = relationship("Lesson", back_populates="course", cascade="all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete-orphan")

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, Identity(), primary_key=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title = Column(Text, nullable=False)
    video_url = Column(Text, nullable=True)
    content = Column(Text, nullable=True)
    order_index = Column(Integer, nullable=False)

    course = relationship("Course", back_populates="lessons")
    challenge = relationship("Challenge", uselist=False, back_populates="lesson", cascade="all, delete-orphan")

class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(Integer, Identity(), primary_key=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), unique=True, nullable=False)
    slug = Column(Text, unique=True, nullable=False)
    problem_statement = Column(Text, nullable=False)
    starter_code = Column(Text, nullable=True)
    test_cases = Column(JSON, nullable=True) # Format: [{"input": "...", "expected_output": "..."}]

    lesson = relationship("Lesson", back_populates="challenge")
    submissions = relationship("Submission", back_populates="challenge", cascade="all, delete-orphan")

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, Identity(), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    challenge_id = Column(Integer, ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False)
    code_submitted = Column(Text, nullable=False)
    status = Column(Text, nullable=False) # 'Passed', 'Failed', 'Error'
    passed_test_cases = Column(Integer, default=0)
    total_test_cases = Column(Integer, default=0)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="submissions")
    challenge = relationship("Challenge", back_populates="submissions")

class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, Identity(), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())
    # Optional: status (active, completed, dropped)
    
    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")
    progress = relationship("LessonProgress", back_populates="enrollment", cascade="all, delete-orphan")

class LessonProgress(Base):
    __tablename__ = "lesson_progress"

    id = Column(Integer, Identity(), primary_key=True)
    enrollment_id = Column(Integer, ForeignKey("enrollments.id", ondelete="CASCADE"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    enrollment = relationship("Enrollment", back_populates="progress")
    lesson = relationship("Lesson")

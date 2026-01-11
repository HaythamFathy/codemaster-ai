# Fix for Python 3.7
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from ..database import get_db
from .. import models, schemas
from .auth import get_current_user
import enum

router = APIRouter()

def get_current_instructor(current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.UserRole.INSTRUCTOR and current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Instructor privileges required")
    return current_user

@router.get("/courses", response_model=List[schemas.Course])
def get_instructor_courses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_instructor)
):
    """Refined to only show courses where instructor_id matches current user"""
    # Admin sees all, Instructor sees only theirs
    if current_user.role == models.UserRole.ADMIN:
         return db.query(models.Course).all()
         
    return db.query(models.Course).filter(models.Course.instructor_id == current_user.id).all()

@router.get("/stats")
def get_instructor_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_instructor)
):
    """Get instructor-specific statistics"""
    # Get courses taught by this instructor
    if current_user.role == models.UserRole.ADMIN:
        courses = db.query(models.Course).all()
    else:
        courses = db.query(models.Course).filter(models.Course.instructor_id == current_user.id).all()
    
    course_ids = [c.id for c in courses]
    
    # Get total enrollments across all courses
    total_enrollments = db.query(models.Enrollment).filter(
        models.Enrollment.course_id.in_(course_ids)
    ).count() if course_ids else 0
    
    # Get total submissions
    lesson_ids = db.query(models.Lesson.id).filter(models.Lesson.course_id.in_(course_ids)).all() if course_ids else []
    lesson_ids = [l[0] for l in lesson_ids]
    
    challenge_ids = db.query(models.Challenge.id).filter(models.Challenge.lesson_id.in_(lesson_ids)).all() if lesson_ids else []
    challenge_ids = [c[0] for c in challenge_ids]
    
    total_submissions = db.query(models.Submission).filter(
        models.Submission.challenge_id.in_(challenge_ids)
    ).count() if challenge_ids else 0
    
    return {
        "total_courses": len(courses),
        "total_students": total_enrollments,
        "total_submissions": total_submissions,
        "courses": courses
    }

@router.get("/submissions")
def get_recent_submissions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_instructor)
):
    """Get recent submissions for instructor's courses"""
    # Get courses taught by this instructor
    if current_user.role == models.UserRole.ADMIN:
        courses = db.query(models.Course).all()
    else:
        courses = db.query(models.Course).filter(models.Course.instructor_id == current_user.id).all()
    
    course_ids = [c.id for c in courses]
    
    # Get lesson IDs
    lesson_ids = db.query(models.Lesson.id).filter(models.Lesson.course_id.in_(course_ids)).all() if course_ids else []
    lesson_ids = [l[0] for l in lesson_ids]
    
    # Get challenge IDs
    challenge_ids = db.query(models.Challenge.id).filter(models.Challenge.lesson_id.in_(lesson_ids)).all() if lesson_ids else []
    challenge_ids = [c[0] for c in challenge_ids]
    
    # Get recent submissions
    submissions = db.query(models.Submission).filter(
        models.Submission.challenge_id.in_(challenge_ids)
    ).order_by(desc(models.Submission.submitted_at)).limit(20).all() if challenge_ids else []
    
    return submissions

@router.get("/students")
def get_instructor_students(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_instructor)
):
    """
    Get all students enrolled in courses taught by this instructor.
    Note: Since we don't have a direct 'Enrollment' table yet (using Open Access for now),
    we might need to infer this or just return all users if the model allows.
    
    For MVP: We will return all students who have submitted code to this instructor's courses.
    """
    # 1. Get Course IDs for this instructor
    course_ids = db.query(models.Course.id).filter(models.Course.instructor_id == current_user.id).subquery()
    
    # 2. Find Lessons in those courses
    lesson_ids = db.query(models.Lesson.id).filter(models.Lesson.course_id.in_(course_ids)).subquery()
    
    # 3. Find Challenges in those lessons
    challenge_ids = db.query(models.Challenge.id).filter(models.Challenge.lesson_id.in_(lesson_ids)).subquery()
    
    # 4. Find Users who have submissions for those challenges
    students = db.query(models.User).join(models.Submission).filter(
        models.Submission.challenge_id.in_(challenge_ids)
    ).distinct().all()
    
    return [
        {
            "id": s.id,
            "full_name": s.full_name,
            "email": s.email,
            "avatar_url": s.avatar_url
        }
        for s in students
    ]

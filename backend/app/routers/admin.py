from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from ..database import get_db
from .. import models, schemas
from .auth import get_current_user
from datetime import datetime, timedelta

router = APIRouter()

def get_current_admin_user(current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user

def get_current_support_or_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.role not in [models.UserRole.ADMIN, models.UserRole.SUPPORT]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Support or Admin privileges required"
        )
    return current_user

@router.get("/users")
def get_all_users(db: Session = Depends(get_db), admin: models.User = Depends(get_current_admin_user)):
    return db.query(models.User).order_by(models.User.id.desc()).all()

@router.get("/users/search")
def search_users(
    q: str = Query(..., description="Search by email, name or ID"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_support_or_admin)
):
    """Search users by email, name or ID - for support/admin"""
    # Try to search by ID first
    if q.isdigit():
        user = db.query(models.User).filter(models.User.id == int(q)).first()
        if user:
            return [user]
    
    # Search by email or full_name
    search_term = f"%{q}%"
    users = db.query(models.User).filter(
        or_(
            models.User.email.ilike(search_term),
            models.User.full_name.ilike(search_term)
        )
    ).limit(10).all()
    return users

@router.get("/users/{user_id}/activity")
def get_user_activity(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_support_or_admin)
):
    """Get user activity log - for support/admin"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get recent submissions
    submissions = db.query(models.Submission).filter(
        models.Submission.user_id == user_id
    ).order_by(desc(models.Submission.submitted_at)).limit(10).all()
    
    # Get enrollments
    enrollments = db.query(models.Enrollment).filter(
        models.Enrollment.user_id == user_id
    ).order_by(desc(models.Enrollment.enrolled_at)).all()
    
    return {
        "user": user,
        "recent_submissions": submissions,
        "enrollments": enrollments,
        "stats": {
            "total_submissions": len(submissions),
            "total_enrollments": len(enrollments),
            "xp_points": user.xp_points,
            "current_streak": user.current_streak
        }
    }

@router.get("/activity")
def get_recent_activity(
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin_user)
):
    """Get recent platform activity - for admin dashboard"""
    # Recent users (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_users = db.query(models.User).filter(
        models.User.created_at >= week_ago
    ).order_by(desc(models.User.created_at)).limit(5).all()
    
    # Recent submissions
    recent_submissions = db.query(models.Submission).order_by(
        desc(models.Submission.submitted_at)
    ).limit(10).all()
    
    # Recent enrollments
    recent_enrollments = db.query(models.Enrollment).order_by(
        desc(models.Enrollment.enrolled_at)
    ).limit(5).all()
    
    return {
        "recent_users": recent_users,
        "recent_submissions": recent_submissions,
        "recent_enrollments": recent_enrollments
    }

@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db), admin: models.User = Depends(get_current_admin_user)):
    user_count = db.query(models.User).count()
    submission_count = db.query(models.Submission).count()
    course_count = db.query(models.Course).count()
    enrollment_count = db.query(models.Enrollment).count()
    
    # Get counts from last 7 days for trends
    week_ago = datetime.utcnow() - timedelta(days=7)
    new_users_week = db.query(models.User).filter(models.User.created_at >= week_ago).count()
    new_submissions_week = db.query(models.Submission).filter(models.Submission.submitted_at >= week_ago).count()
    
    return {
        "total_users": user_count,
        "total_submissions": submission_count,
        "total_courses": course_count,
        "total_enrollments": enrollment_count,
        "new_users_this_week": new_users_week,
        "new_submissions_this_week": new_submissions_week
    }

@router.post("/courses", response_model=schemas.Course)
def create_course(course: schemas.CourseCreate, db: Session = Depends(get_db), admin: models.User = Depends(get_current_admin_user)):
    db_course = models.Course(**course.dict())
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

@router.post("/lessons", response_model=schemas.Lesson)
def create_lesson(lesson: schemas.LessonCreate, db: Session = Depends(get_db), admin: models.User = Depends(get_current_admin_user)):
    # Check if course exists
    course = db.query(models.Course).filter(models.Course.id == lesson.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    db_lesson = models.Lesson(**lesson.dict())
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson

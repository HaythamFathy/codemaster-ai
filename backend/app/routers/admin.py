from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from .auth import get_current_user

router = APIRouter()

def get_current_admin_user(current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user

@router.get("/users")
def get_all_users(db: Session = Depends(get_db), admin: models.User = Depends(get_current_admin_user)):
    return db.query(models.User).order_by(models.User.id.desc()).all()

@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db), admin: models.User = Depends(get_current_admin_user)):
    user_count = db.query(models.User).count()
    submission_count = db.query(models.Submission).count()
    course_count = db.query(models.Course).count()
    return {
        "total_users": user_count,
        "total_submissions": submission_count,
        "total_courses": course_count
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

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from .. import models, schemas
from .auth import get_current_user
from datetime import datetime

router = APIRouter()

@router.post("", response_model=schemas.Enrollment)
def enroll_in_course(
    enrollment: schemas.EnrollmentCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    # 1. Check if course exists
    course = db.query(models.Course).filter(models.Course.id == enrollment.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # 2. Check if already enrolled
    existing_enrollment = db.query(models.Enrollment).filter(
        models.Enrollment.user_id == current_user.id,
        models.Enrollment.course_id == enrollment.course_id
    ).first()
    
    if existing_enrollment:
        raise HTTPException(status_code=400, detail="User already enrolled in this course")

    # 3. Create Enrollment
    new_enrollment = models.Enrollment(
        user_id=current_user.id,
        course_id=enrollment.course_id
    )
    db.add(new_enrollment)
    db.commit()
    db.refresh(new_enrollment)
    
    # 4. Initialize Lesson Progress (Optional but good UX)
    # We could auto-create progress rows for all lessons here, or do it lazily.
    # Lazy is better for performance, but eager is better for "0% complete" UI.
    # Let's leave it for now (progress is 0 if no rows).

    return new_enrollment

@router.get("/me", response_model=List[schemas.Enrollment])
def get_my_enrollments(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    # Eager load course details
    return db.query(models.Enrollment).filter(
        models.Enrollment.user_id == current_user.id
    ).join(models.Course).all()

@router.get("/{course_id}/status", response_model=bool)
def check_enrollment_status(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    enrollment = db.query(models.Enrollment).filter(
        models.Enrollment.user_id == current_user.id,
        models.Enrollment.course_id == course_id
    ).first()
    return enrollment is not None

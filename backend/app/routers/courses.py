from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from typing import List

router = APIRouter()

@router.get("/", response_model=List[schemas.Course])
def get_courses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    courses = db.query(models.Course).offset(skip).limit(limit).all()
    return courses

@router.get("/{course_id}", response_model=schemas.Course)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

from .auth import get_current_user
from datetime import datetime, timedelta

@router.post("/{course_id}/complete_quiz")
def complete_quiz(course_id: int, submission: schemas.QuizSubmission, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # 1. Award XP
    xp_gained = submission.score
    current_user.xp_points += xp_gained
    
    # 2. Update Streak (Simplified logic: if active yesterday, increment. If active today, do nothing. If gap, reset.)
    now = datetime.utcnow()
    today = now.date()
    
    if current_user.last_active_date:
        last_active = current_user.last_active_date.date()
        if last_active == today - timedelta(days=1):
            current_user.current_streak += 1
        elif last_active < today - timedelta(days=1):
            current_user.current_streak = 1
         # If today, keep streak
    else:
        current_user.current_streak = 1
        
    current_user.last_active_date = now
    
    db.commit()
    db.refresh(current_user)
    
    return {"message": "Quiz completed", "xp_earned": xp_gained, "total_xp": current_user.xp_points, "streak": current_user.current_streak}

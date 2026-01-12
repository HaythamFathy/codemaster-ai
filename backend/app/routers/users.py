from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..routers.auth import get_current_user
from typing import List

router = APIRouter()

@router.put("/me", response_model=schemas.User)
def update_me(
    user_update: schemas.UserUpdate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.avatar_url is not None:
        current_user.avatar_url = user_update.avatar_url
    if user_update.bio is not None:
        current_user.bio = user_update.bio
        
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/leaderboard", response_model=List[schemas.UserLeaderboard])
def get_leaderboard(limit: int = 10, db: Session = Depends(get_db)):
    users = db.query(models.User).order_by(models.User.xp_points.desc()).limit(limit).all()
    return users

from sqlalchemy import desc
from sqlalchemy.orm import joinedload

@router.get("/me/activity")
def get_my_activity(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    """Get recent activity for the current user"""
    submissions = db.query(models.Submission).options(
        joinedload(models.Submission.challenge).joinedload(models.Challenge.lesson)
    ).filter(models.Submission.user_id == current_user.id).order_by(desc(models.Submission.submitted_at)).limit(5).all()

    enrollments = db.query(models.Enrollment).options(
        joinedload(models.Enrollment.course)
    ).filter(models.Enrollment.user_id == current_user.id).order_by(desc(models.Enrollment.enrolled_at)).limit(5).all()
    
    return {
        "recent_submissions": submissions,
        "recent_enrollments": enrollments
    }

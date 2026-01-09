from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from typing import List

router = APIRouter()

@router.get("/leaderboard", response_model=List[schemas.UserLeaderboard])
def get_leaderboard(limit: int = 10, db: Session = Depends(get_db)):
    users = db.query(models.User).order_by(models.User.xp_points.desc()).limit(limit).all()
    return users

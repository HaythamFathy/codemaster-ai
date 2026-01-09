from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from .auth import get_current_admin
from typing import List, Optional

router = APIRouter()

@router.get("/{course_id}", response_model=List[schemas.Lesson])
def get_lessons(course_id: int, db: Session = Depends(get_db)):
    lessons = db.query(models.Lesson).filter(models.Lesson.course_id == course_id).all()
    return lessons

@router.post("/", response_model=schemas.Lesson)
def create_lesson(lesson: schemas.LessonCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin)):
    db_lesson = models.Lesson(**lesson.dict())
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson

@router.put("/{lesson_id}", response_model=schemas.Lesson)
def update_lesson(lesson_id: int, lesson_update: schemas.LessonUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin)):
    db_lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not db_lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    update_data = lesson_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_lesson, key, value)

    db.commit()
    db.refresh(db_lesson)
    return db_lesson

@router.delete("/{lesson_id}")
def delete_lesson(lesson_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin)):
    db_lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not db_lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    db.delete(db_lesson)
    db.commit()
    return {"message": "Lesson deleted successfully"}

# --- Challenge Endpoints ---

@router.get("/{lesson_id}/challenge", response_model=Optional[schemas.Challenge])
def get_challenge(lesson_id: int, db: Session = Depends(get_db)):
    return db.query(models.Challenge).filter(models.Challenge.lesson_id == lesson_id).first()

@router.post("/{lesson_id}/challenge", response_model=schemas.Challenge)
def create_or_update_challenge(
    lesson_id: int, 
    challenge: schemas.ChallengeBase, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_admin)
):
    # Check if challenge exists
    db_challenge = db.query(models.Challenge).filter(models.Challenge.lesson_id == lesson_id).first()
    
    if db_challenge:
        # Update existing
        db_challenge.slug = challenge.slug
        db_challenge.problem_statement = challenge.problem_statement
        db_challenge.starter_code = challenge.starter_code
        db_challenge.test_cases = challenge.test_cases
    else:
        # Create new
        db_challenge = models.Challenge(
            lesson_id=lesson_id,
            slug=challenge.slug,
            problem_statement=challenge.problem_statement,
            starter_code=challenge.starter_code,
            test_cases=challenge.test_cases
        )
        db.add(db_challenge)
    
    db.commit()
    db.refresh(db_challenge)
    return db_challenge

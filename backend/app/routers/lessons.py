from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from .auth import get_current_admin
from typing import List

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

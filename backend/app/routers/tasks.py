from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from .auth import get_current_user
from ..ai_tutor import generate_challenge
import json

router = APIRouter()

@router.get("/lessons/{lesson_id}/task")
def get_lesson_task(lesson_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # 1. Check if task already exists for this user + lesson
    existing_task = db.query(models.UserTask).filter(
        models.UserTask.user_id == current_user.id,
        models.UserTask.lesson_id == lesson_id
    ).first()

    if existing_task:
        try:
            return json.loads(existing_task.task_json)
        except:
            return {"error": "Failed to parse saved task"}

    # 2. If not, generate new task
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    # Use lesson title + AI prompt as context
    topic = f"{lesson.title}. Context: {lesson.ai_prompt or 'General coding'}"
    
    # Generate
    challenge_data = generate_challenge(topic)
    
    # 3. Save to DB
    new_task = models.UserTask(
        user_id=current_user.id,
        lesson_id=lesson_id,
        task_json=json.dumps(challenge_data)
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    
    return challenge_data

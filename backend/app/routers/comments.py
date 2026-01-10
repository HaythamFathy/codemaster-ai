from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Comment, User
from ..schemas import CommentCreate, Comment as CommentSchema
from ..auth import get_current_user

router = APIRouter(
    prefix="/comments",
    tags=["comments"]
)

@router.get("/lesson/{lesson_id}", response_model=List[CommentSchema])
def get_comments(lesson_id: int, db: Session = Depends(get_db)):
    comments = db.query(Comment).filter(
        Comment.lesson_id == lesson_id, 
        Comment.parent_id == None # Get top-level comments
    ).order_by(Comment.created_at.desc()).all()
    return comments

@router.post("/", response_model=CommentSchema)
def create_comment(
    comment: CommentCreate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    db_comment = Comment(
        content=comment.content,
        lesson_id=comment.lesson_id,
        user_id=current_user.id,
        parent_id=comment.parent_id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

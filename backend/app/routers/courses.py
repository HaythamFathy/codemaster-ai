from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from ..database import get_db
from .. import models, schemas
from typing import List

router = APIRouter()

from typing import List, Optional

@router.get("", response_model=List[schemas.Course])
def get_courses(
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = None,
    course_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    try:
        query = db.query(models.Course).options(joinedload(models.Course.instructor))
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (models.Course.title.ilike(search_term)) | 
                (models.Course.description.ilike(search_term))
            )
            
        if course_type and course_type != "all":
            query = query.filter(models.Course.course_type == course_type)
            
        courses = query.offset(skip).limit(limit).all()
        return courses
    except Exception as e:
        print(f"Error fetching courses: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{course_id}", response_model=schemas.Course)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(models.Course).options(joinedload(models.Course.instructor)).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

from .auth import get_current_user, get_current_admin # Import admin dependency
from datetime import datetime, timedelta

@router.post("", response_model=schemas.Course)
def create_course(course: schemas.CourseCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin)):
    try:
        db_course = models.Course(**course.dict())
        db.add(db_course)
        db.commit()
        db.refresh(db_course)
        return db_course
    except Exception as e:
        print(f"Error creating course: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{course_id}", response_model=schemas.Course)
def update_course(course_id: int, course_update: schemas.CourseUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin)):
    db_course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    update_data = course_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_course, key, value)

    db.commit()
    db.refresh(db_course)
    return db_course

@router.delete("/{course_id}")
def delete_course(course_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin)):
    db_course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    db.delete(db_course)
    db.commit()
    return {"message": "Course deleted successfully"}



from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db

router = APIRouter()

@router.get("/")
def get_analytics():
    return {"message": "Analytics module placeholder"}

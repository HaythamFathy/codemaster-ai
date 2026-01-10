from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from datetime import datetime, timedelta
from ..database import get_db
from .. import models, schemas
from .auth import get_current_admin

router = APIRouter(
    prefix="/admin/stats",
    tags=["Analytics"],
    dependencies=[Depends(get_current_admin)]
)

@router.get("/overview")
def get_overview_stats(db: Session = Depends(get_db)):
    """
    Returns high-level counters for the admin dashboard.
    """
    total_users = db.query(models.User).count()
    active_students = db.query(models.User).filter(models.User.is_active == True, models.User.role == models.UserRole.STUDENT).count()
    total_courses = db.query(models.Course).count()
    total_enrollments = db.query(models.Enrollment).count()
    
    # Calculate Total Revenue (Simple sum of all payments if we had a payments table, 
    # but currently we track is_pro. For MVP, let's assume $10/mo for each pro user)
    pro_users = db.query(models.User).filter(models.User.is_pro == True).count()
    estimated_revenue = pro_users * 10
    
    return {
        "total_users": total_users,
        "active_students": active_students,
        "total_courses": total_courses,
        "total_enrollments": total_enrollments,
        "total_revenue": estimated_revenue,
        "active_pro_users": pro_users
    }

@router.get("/growth")
def get_growth_stats(days: int = 30, db: Session = Depends(get_db)):
    """
    Returns time-series data for User Signups and Enrollments.
    """
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # 1. User Growth
    users_daily = db.query(
        func.date(models.User.created_at).label('date'),
        func.count(models.User.id).label('count')
    ).filter(
        models.User.created_at >= start_date
    ).group_by(
        func.date(models.User.created_at)
    ).all()
    
    # 2. Enrollment Growth
    enrollments_daily = db.query(
        func.date(models.Enrollment.enrolled_at).label('date'),
        func.count(models.Enrollment.id).label('count')
    ).filter(
        models.Enrollment.enrolled_at >= start_date
    ).group_by(
        func.date(models.Enrollment.enrolled_at)
    ).all()
    
    # Format for Frontend (e.g. Recharts)
    # merged structure: [{date: '2023-01-01', users: 5, enrollments: 2}, ...]
    
    data_map = {}
    
    # Initialize map with 0s for missing days (optional, but good for charts)
    delta = timedelta(days=1)
    curr = start_date
    while curr <= end_date:
        d_str = curr.strftime('%Y-%m-%d')
        data_map[d_str] = {"date": d_str, "users": 0, "enrollments": 0}
        curr += delta

    for r in users_daily:
        d_str = str(r.date)
        if d_str in data_map:
            data_map[d_str]["users"] = r.count
            
    for r in enrollments_daily:
        d_str = str(r.date)
        if d_str in data_map:
            data_map[d_str]["enrollments"] = r.count
            
    return sorted(data_map.values(), key=lambda x: x['date'])

@router.get("/performance")
def get_performance_stats(db: Session = Depends(get_db)):
    """
    Returns Challenge Pass/Fail rates.
    """
    # Simply aggregate all submissions
    total = db.query(models.Submission).count()
    passed = db.query(models.Submission).filter(models.Submission.status == 'Passed').count()
    failed = db.query(models.Submission).filter(models.Submission.status != 'Passed').count()
    
    pass_rate = (passed / total * 100) if total > 0 else 0
    
    return {
        "total_submissions": total,
        "passed": passed,
        "failed": failed,
        "pass_rate": round(pass_rate, 1)
    }

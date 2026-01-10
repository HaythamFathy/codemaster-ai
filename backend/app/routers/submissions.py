from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from .auth import get_current_user, get_optional_current_user
from typing import Optional
from datetime import datetime, timedelta
import subprocess
import json
import os

router = APIRouter()

@router.post("/submit_code", response_model=schemas.Submission)
def submit_code(submission: schemas.SubmissionCreate, db: Session = Depends(get_db), current_user: Optional[models.User] = Depends(get_optional_current_user)): 
    try:
        # 1. Lookup Challenge via Lesson ID
        challenge = db.query(models.Challenge).filter(models.Challenge.lesson_id == submission.lesson_id).first()
        if not challenge:
            # For now, allow submission even if challenge lookup fails (or handle gracefully)
            pass 

        # 2. Execute Code
        code = submission.code_submitted
        mode = os.getenv("EXECUTION_MODE", "unsafe_local")
        executor_result = execute_code_docker(code) if mode == "docker" else execute_code_local(code)

        # 3. Validation Logic
        passed_count = 0
        total_count = 0
        status = "Failed"
        
        if challenge and challenge.test_cases:
            test_cases = challenge.test_cases # JSONB list
            total_count = len(test_cases)
            
            if isinstance(test_cases, list) and len(test_cases) > 0:
                expected = test_cases[0].get("expected_output", "").strip()
                actual = executor_result.get("stdout", "").strip()
                if expected in actual: 
                    passed_count = total_count
                    status = "Passed"
        else:
            if executor_result["exit_code"] == 0:
                status = "Passed"
                passed_count = 1
                total_count = 1
            else:
                status = "Error"
                
        # 4. Save Submission
        user_id = current_user.id if current_user else 1 
        
        db_submission = models.Submission(
            user_id=user_id,
            challenge_id=challenge.id if challenge else 0, 
            code_submitted=code,
            status=status,
            passed_test_cases=passed_count,
            total_test_cases=total_count,
        )
        
        # 5. Gamification (Streak & XP)
        if status == "Passed" and current_user:
            current_user.xp_points += 10
            
            # --- NEW: Update Lesson Progress ---
            try:
                # 1. Get Course ID from Lesson
                lesson = db.query(models.Lesson).filter(models.Lesson.id == submission.lesson_id).first()
                if lesson:
                    # 2. Find Enrollment
                    enrollment = db.query(models.Enrollment).filter(
                        models.Enrollment.user_id == current_user.id,
                        models.Enrollment.course_id == lesson.course_id
                    ).first()
                    
                    if enrollment:
                        # 3. Find/Create LessonProgress
                        progress = db.query(models.LessonProgress).filter(
                            models.LessonProgress.enrollment_id == enrollment.id,
                            models.LessonProgress.lesson_id == lesson.id
                        ).first()
                        
                        if not progress:
                            progress = models.LessonProgress(
                                enrollment_id=enrollment.id,
                                lesson_id=lesson.id,
                                is_completed=True,
                                completed_at=datetime.utcnow()
                            )
                            db.add(progress)
                        else:
                            if not progress.is_completed:
                                progress.is_completed = True
                                progress.completed_at = datetime.utcnow()
                                db.add(progress)
            except Exception as e:
                print(f"Error updating progress: {e}")
                # Don't fail the submission just because progress update failed
            
            last_submission = db.query(models.Submission).filter(
                models.Submission.user_id == current_user.id
            ).order_by(models.Submission.submitted_at.desc()).first()
            
            now = datetime.utcnow()
            if last_submission:
                last_date = last_submission.submitted_at.date()
                today = now.date()
                if last_date == today - timedelta(days=1):
                    current_user.current_streak += 1
                elif last_date < today - timedelta(days=1):
                    current_user.current_streak = 1
            else:
                current_user.current_streak = 1
                
            db.add(current_user)

        db.add(db_submission)
        db.commit()
        db.refresh(db_submission)
        return db_submission

    except Exception as e:
        print(f"Error submitting code: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def execute_code_local(code: str):
    import sys
    import io
    from contextlib import redirect_stdout, redirect_stderr
    
    # Secure-ish execution using exec() within the same process
    # This avoids subprocess and filesystem permission issues on Vercel
    stdout_capture = io.StringIO()
    stderr_capture = io.StringIO()
    
    try:
        with redirect_stdout(stdout_capture), redirect_stderr(stderr_capture):
            exec(code, {"__builtins__": __builtins__}, {})
        return {
            "stdout": stdout_capture.getvalue(),
            "stderr": stderr_capture.getvalue(),
            "exit_code": 0
        }
    except Exception as e:
        return {
            "stdout": stdout_capture.getvalue(),
            "stderr": f"{stderr_capture.getvalue()}\nRuntime Error: {str(e)}",
            "exit_code": 1
        }
    finally:
        stdout_capture.close()
        stderr_capture.close()

def execute_code_docker(code: str):
    # Stub for Docker execution
    # Similar to local but using docker run
    try:
        res = subprocess.run(
            ["docker", "run", "-i", "--rm", "codemaster-runner"], 
            input=code, capture_output=True, text=True, timeout=10
        )
        return {"stdout": res.stdout, "stderr": res.stderr, "exit_code": res.returncode}
    except Exception as e:
        return {"stdout": "", "stderr": str(e), "exit_code": -1}


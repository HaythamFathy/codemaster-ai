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
        code = submission.code_content
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
    import tempfile
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as tmp:
        tmp.write(code)
        tmp_path = tmp.name
    
    try:
        res = subprocess.run([sys.executable, tmp_path], capture_output=True, text=True, timeout=5)
        return {"stdout": res.stdout, "stderr": res.stderr, "exit_code": res.returncode}
    except Exception as e:
         return {"stdout": "", "stderr": str(e), "exit_code": -1}
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

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


from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
import subprocess
import json
import os

router = APIRouter()

@router.post("/submit_code", response_model=schemas.Submission)
def submit_code(submission: schemas.SubmissionCreate, db: Session = Depends(get_db)):
    """
    Executes student code using the secure Docker executor.
    """
    # 1. Prepare to run code
    code = submission.code_content
    
    executor_result = {
        "stdout": "",
        "stderr": "",
        "exit_code": -1,
        "error": None
    }
    
    # 2. Determine Execution Mode
    # Render/Heroku Free Tier usually blocks Docker.
    execution_mode = os.getenv("EXECUTION_MODE", "docker")
    
    try:
        if execution_mode == "unsafe_local":
            # --- UNSAFE MODE (Demo Only) ---
            # Runs code directly on the host server.
            # WARNING: No isolation. Vulnerable to malicious code.
            import sys
            import tempfile
            
            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as tmp:
                tmp.write(code)
                tmp_path = tmp.name
            
            local_process = subprocess.run(
                [sys.executable, tmp_path],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            executor_result["stdout"] = local_process.stdout
            executor_result["stderr"] = local_process.stderr
            executor_result["exit_code"] = local_process.returncode
            
            os.unlink(tmp_path)
            
        else:
            # --- DOCKER MODE (Secure) ---
            process = subprocess.run(
                ["docker", "run", "-i", "--rm", "--network", "none", "codemaster-runner"],
                input=code,
                text=True,
                capture_output=True,
                timeout=10
            )
            
            raw_output = process.stdout
            
            if process.returncode != 0:
                executor_result["stderr"] = process.stderr or "Unknown Execution Error"
                executor_result["exit_code"] = process.returncode
            else:
                 try:
                     output_json = json.loads(raw_output)
                     executor_result = output_json
                 except json.JSONDecodeError:
                     executor_result["stdout"] = raw_output
                     executor_result["stderr"] = "Failed to parse executor output"

    except Exception as e:
        executor_result["stderr"] = f"Execution Error ({execution_mode}): {str(e)}"
        executor_result["exit_code"] = -1

    # 3. Analyze Result (Basic Output Matching for MVP)
    # In a real app, we'd fetch the specific test cases for this lesson from the DB.
    # For now, we hardcode the check for Lesson 1 ("Hello World").
    
    stdout_clean = executor_result.get("stdout", "").strip()
    
    # Logic: Pass if exit_code is 0 AND output contains "Hello World"
    # (Or if it's just a generic playground, pass if exit_code is 0)
    
    is_correct_output = "Hello World" in stdout_clean
    passed = (executor_result["exit_code"] == 0 and is_correct_output)
    
    if passed:
        feedback = "Great job! You successfully defined the variable and printed it."
    elif executor_result["exit_code"] != 0:
        feedback = "Code Error: Your code crashed. Check the Stderr tab."
    else:
        feedback = f"Incorrect Output. Expected 'Hello World', but got: '{stdout_clean}'"

    
    # 4. Save to DB
    # Start assuming user_id=1 for MVP
    user_id = 1
    
    # GAMIFICATION LOGIC
    if passed:
        from datetime import datetime, timedelta
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user:
            # 1. Award XP
            user.xp_points += 50
            
            # 2. Update Streak
            now = datetime.utcnow()
            today = now.date()
            
            if user.last_active_date:
                last_active = user.last_active_date.date()
                if last_active == today - timedelta(days=1):
                    # Continue streak
                    user.current_streak += 1
                elif last_active < today - timedelta(days=1):
                    # Broke streak
                    user.current_streak = 1
                # If last_active == today, do nothing
            else:
                # First time active
                user.current_streak = 1
                
            user.last_active_date = now
            # User will be committed along with submission

    db_submission = models.Submission(
        user_id=user_id, 
        code_content=submission.code_content,
        passed_boolean=passed,
        ai_feedback=feedback,
        stdout=executor_result.get("stdout", ""),
        stderr=executor_result.get("stderr", "") or executor_result.get("error", ""),
        exit_code=executor_result.get("exit_code", 0)
    )
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    return db_submission

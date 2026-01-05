from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
import subprocess
import json
import os

router = APIRouter()

from .auth import get_current_user

@router.post("/submit_code", response_model=schemas.Submission)
def submit_code(submission: schemas.SubmissionCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
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

    # 3. Analyze Result
    # Fetch proper test cases from the UserTask if available
    user_task = db.query(models.UserTask).filter(
        models.UserTask.user_id == current_user.id,
        models.UserTask.lesson_id == submission.lesson_id
    ).first()

    passed = False
    feedback = "Unknown Error"
    
    if user_task:
        try:
            task_data = json.loads(user_task.task_json)
            test_cases = task_data.get("test_cases", [])
            
            # For MVP, we check just the first test case output match
            # In real system, we'd run code with inputs. Here we just check stdout match.
            if test_cases:
                expected_output = test_cases[0].get("output", "").strip()
                stdout_clean = executor_result.get("stdout", "").strip()
                
                # Check for partial match or exact match depending on lenient logic
                if expected_output.lower() in stdout_clean.lower():
                    passed = True
                    feedback = "Test Passed! Your output matches the expected result."
                else:
                    passed = False
                    feedback = f"Incorrect Output. Expected something like '{expected_output}', but got:\n{stdout_clean}"
            else:
                # Fallback if no test cases
                passed = (executor_result["exit_code"] == 0)
                feedback = "Run Successful! (No test cases defined)"
        except:
             passed = (executor_result["exit_code"] == 0)
             feedback = "Run Successful! (Failed to parse test cases)"
    else:
        # Fallback if no UserTask found (legacy behavior)
        passed = (executor_result["exit_code"] == 0)
        feedback = "Run Successful! (Generic Check)"

    if executor_result["exit_code"] != 0:
        passed = False
        feedback = "Runtime Error: Your code crashed. Check the Stderr tab."

    
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

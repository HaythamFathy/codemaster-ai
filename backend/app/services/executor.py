import sys
import io
import contextlib
import traceback

def execute_code_unsafe(code: str) -> dict:
    """
    Executes Python code in a restricted local environment.
    
    WARNING: This execution mode is 'unsafe_local'. 
    It runs code directly in the host process using exec().
    It is intended for MVP / Serverless environments (like Vercel) where 
    Docker containers are not available.
    
    SECURITY NOTE: 
    - This offers minimal isolation. 
    - Destructive operations are not strictly prevented.
    - In a production environment, this MUST be replaced by a Docker-based 
      solution or a secure sandbox (e.g., gVisor, Firecracker).
    """
    
    # Capture stdout and stderr
    stdout_capture = io.StringIO()
    stderr_capture = io.StringIO()
    
    # Restricted globals to prevent accidental damage (not a security guarantee)
    safe_globals = {
        "__builtins__": {
            "print": print,
            "range": range,
            "len": len,
            "int": int,
            "float": float,
            "str": str,
            "list": list,
            "dict": dict,
            "set": set,
            "tuple": tuple,
            "bool": bool,
            "sum": sum,
            "min": min,
            "max": max,
            "abs": abs,
            "sorted": sorted,
            "enumerate": enumerate,
            "zip": zip,
            "map": map,
            "filter": filter,
        }
    }
    
    try:
        with contextlib.redirect_stdout(stdout_capture), contextlib.redirect_stderr(stderr_capture):
            exec(code, safe_globals, {})
            
        return {
            "stdout": stdout_capture.getvalue(),
            "stderr": stderr_capture.getvalue(),
            "exit_code": 0
        }
        
    except Exception:
        # Capture the full traceback for debugging (or limit it for users)
        error_message = traceback.format_exc()
        return {
            "stdout": stdout_capture.getvalue(),
            "stderr": f"{stderr_capture.getvalue()}\n{error_message}",
            "exit_code": 1
        }
        
    finally:
        stdout_capture.close()
        stderr_capture.close()

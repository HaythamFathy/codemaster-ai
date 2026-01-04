import sys
import subprocess
import json
import tempfile
import os

def run_code(code_str):
    # Create a temporary file to hold the user's code
    # We use delete=False to close it before running, then unlink manually
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as temp_file:
        temp_file.write(code_str)
        temp_file_path = temp_file.name

    result = {
        "stdout": "",
        "stderr": "",
        "exit_code": 0,
        "error": None
    }

    try:
        # Run the code in a subprocess with a timeout
        # Capture output (text=True ensures we get string instead of bytes)
        completed_process = subprocess.run(
            [sys.executable, temp_file_path],
            capture_output=True,
            text=True,
            timeout=5  # 5-second timeout
        )
        
        result["stdout"] = completed_process.stdout
        result["stderr"] = completed_process.stderr
        result["exit_code"] = completed_process.returncode

    except subprocess.TimeoutExpired:
        result["error"] = "Execution timed out (limit: 5s)"
        result["exit_code"] = 124  # Standard timeout exit code
    except Exception as e:
        result["error"] = str(e)
        result["exit_code"] = -1
    finally:
        # Cleanup
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)

    return result

if __name__ == "__main__":
    # Expecting code to be passed via stdin (standard input)
    # This avoids issues with command line argument limits
    try:
        user_code = sys.stdin.read()
        if not user_code.strip():
            print(json.dumps({"error": "No code provided"}))
        else:
            output = run_code(user_code)
            print(json.dumps(output))
    except Exception as boot_err:
        print(json.dumps({"error": f"Runner wrapper error: {str(boot_err)}"}))

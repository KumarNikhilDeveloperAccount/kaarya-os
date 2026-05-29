import docker
import subprocess
import tempfile
import os
import shutil
from typing import Dict, Any
from app.config import settings

def run_code_in_sandbox(code: str, language: str = "python", timeout_seconds: int = 5) -> Dict[str, Any]:
    """
    Executes code in an isolated Docker container or a local subprocess fallback.
    Returns: {"output": "...", "error": "...", "status": "success|failed|timeout"}
    """
    if settings.USE_DOCKER_SANDBOX:
        try:
            # Initialize docker client connecting to local daemon
            client = docker.from_env()
            
            # Define image and run command based on language
            if language.lower() == "python":
                image = "python:3.10-alpine"
                command = ["python", "-c", code]
            elif language.lower() in ("javascript", "js"):
                image = "node:18-alpine"
                command = ["node", "-e", code]
            else:
                return {"output": "", "error": f"Unsupported language: {language}", "status": "failed"}

            # Run container synchronously but detached so we can handle timeouts
            container = client.containers.run(
                image,
                command=command,
                detach=True,
                mem_limit="128m", # strict memory limit
                cpu_period=100000,
                cpu_quota=50000, # 50% of CPU limit
                network_mode="none" # Disable network access
            )
            
            result = container.wait(timeout=timeout_seconds)
            logs = container.logs().decode("utf-8")
            container.remove(force=True)
            
            if result['StatusCode'] == 0:
                return {"output": logs, "error": "", "status": "success"}
            else:
                return {"output": "", "error": logs, "status": "failed"}
                
        except Exception as e:
            # If docker fails, we fall back to subprocess if allowed
            print(f"Docker Sandbox failed: {e}. Falling back to subprocess...")
            pass

    # Subprocess Fallback (Less secure, but works without Docker)
    temp_dir = tempfile.mkdtemp()
    try:
        if language.lower() == "python":
            file_path = os.path.join(temp_dir, "solution.py")
            with open(file_path, "w") as f:
                f.write(code)
            cmd = ["python", file_path]
        elif language.lower() in ("javascript", "js"):
            file_path = os.path.join(temp_dir, "solution.js")
            with open(file_path, "w") as f:
                f.write(code)
            cmd = ["node", file_path]
        else:
            return {"output": "", "error": f"Unsupported language: {language}", "status": "failed"}

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout_seconds
        )
        
        if result.returncode == 0:
            return {"output": result.stdout, "error": "", "status": "success"}
        else:
            return {"output": result.stdout, "error": result.stderr, "status": "failed"}

    except subprocess.TimeoutExpired:
        return {"output": "", "error": "Execution timed out.", "status": "timeout"}
    except Exception as e:
        return {"output": "", "error": f"Sandbox panic: {str(e)}", "status": "failed"}
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

from fastapi import APIRouter, Body, HTTPException
import subprocess
import tempfile
import os

router = APIRouter()

@router.post("/execute")
def execute_code(code: str = Body(..., embed=True), language: str = Body("python", embed=True)):
    supported_langs = ["python", "c", "cpp", "java"]
    if language not in supported_langs:
        raise HTTPException(status_code=400, detail=f"Language {language} is not supported. Supported: {', '.join(supported_langs)}")
    
    import uuid
    # Create temp dir
    temp_dir = tempfile.mkdtemp()
    file_id = uuid.uuid4().hex[:8]
    
    try:
        if language == "python":
            tmp_path = os.path.join(temp_dir, f"{file_id}.py")
            with open(tmp_path, "w") as f:
                f.write(code)
            result = subprocess.run(["python", tmp_path], capture_output=True, text=True, timeout=5)
            output = result.stdout + ("\n" + result.stderr if result.stderr else "")
            success = result.returncode == 0
            
        elif language == "c":
            tmp_path = os.path.join(temp_dir, f"{file_id}.c")
            out_path = os.path.join(temp_dir, f"{file_id}.exe")
            with open(tmp_path, "w") as f:
                f.write(code)
            compile_res = subprocess.run(["gcc", tmp_path, "-o", out_path], capture_output=True, text=True, timeout=5)
            if compile_res.returncode != 0:
                output = "Compilation Error:\n" + compile_res.stderr
                success = False
            else:
                result = subprocess.run([out_path], capture_output=True, text=True, timeout=5)
                output = result.stdout + ("\n" + result.stderr if result.stderr else "")
                success = result.returncode == 0

        elif language == "cpp":
            tmp_path = os.path.join(temp_dir, f"{file_id}.cpp")
            out_path = os.path.join(temp_dir, f"{file_id}.exe")
            with open(tmp_path, "w") as f:
                f.write(code)
            compile_res = subprocess.run(["g++", tmp_path, "-o", out_path], capture_output=True, text=True, timeout=5)
            if compile_res.returncode != 0:
                output = "Compilation Error:\n" + compile_res.stderr
                success = False
            else:
                result = subprocess.run([out_path], capture_output=True, text=True, timeout=5)
                output = result.stdout + ("\n" + result.stderr if result.stderr else "")
                success = result.returncode == 0

        elif language == "java":
            # Java requires class name to match file name. We assume class Main
            tmp_path = os.path.join(temp_dir, "Main.java")
            with open(tmp_path, "w") as f:
                f.write(code)
            compile_res = subprocess.run(["javac", tmp_path], capture_output=True, text=True, timeout=5)
            if compile_res.returncode != 0:
                output = "Compilation Error:\n" + compile_res.stderr
                success = False
            else:
                result = subprocess.run(["java", "-cp", temp_dir, "Main"], capture_output=True, text=True, timeout=5)
                output = result.stdout + ("\n" + result.stderr if result.stderr else "")
                success = result.returncode == 0
                
        if not output.strip():
            output = "Execution completed with no output."
            
        return {"output": output, "success": success}
        
    except subprocess.TimeoutExpired:
        return {"output": "Error: Execution timed out (5s limit).", "success": False}
    except Exception as e:
        return {"output": f"Server Error: {str(e)}\nMake sure compiler (gcc/g++/java) is installed.", "success": False}
    finally:
        # Cleanup
        import shutil
        shutil.rmtree(temp_dir, ignore_errors=True)

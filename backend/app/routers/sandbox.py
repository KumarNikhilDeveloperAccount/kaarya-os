from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.services.sandbox import run_code_in_sandbox
from app import database, auth, models, deps

router = APIRouter()

class CodeExecutionRequest(BaseModel):
    code: str
    language: str

class CodeExecutionResponse(BaseModel):
    stdout: str
    stderr: str
    exit_code: int

@router.post("/run", response_model=CodeExecutionResponse)
async def run_simulation_code(
    request: CodeExecutionRequest,
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Executes code in a secure, isolated Docker container.
    Only allows 'python' or 'javascript' for now.
    """
    if request.language not in ["python", "javascript"]:
        raise HTTPException(status_code=400, detail="Unsupported language")
    
    # We use a timeout of 10s for the simulation
    result = run_code_in_sandbox(request.code, request.language, timeout=10)
    
    return CodeExecutionResponse(
        stdout=result.get("stdout", ""),
        stderr=result.get("stderr", ""),
        exit_code=result.get("exit_code", 1)
    )

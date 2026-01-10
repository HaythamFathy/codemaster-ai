from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..ai_tutor import analyze_submission, generate_challenge, generate_success_message
from typing import Optional

router = APIRouter()

class HintRequest(BaseModel):
    student_code: str
    error_log: str
    challenge_description: Optional[str] = ""

class SuccessRequest(BaseModel):
    stdout: str

class ChallengeRequest(BaseModel):
    video_topic: str

class VoiceRequest(BaseModel):
    lesson_id: int
    code_snippet: str
    user_question: str

@router.post("/hint")
async def voice_hint(request: VoiceRequest):
    from ..ai_tutor import get_voice_response
    hint = get_voice_response(request.code_snippet, request.user_question)
    return {"hint": hint}

@router.post("/get_hint")
async def get_hint(request: HintRequest):
    hint = analyze_submission(request.student_code, request.error_log, request.challenge_description)
    return {"hint": hint}

@router.post("/get_success")
async def get_success(request: SuccessRequest):
    message = generate_success_message(request.stdout)
    return {"message": message}

@router.post("/generate_challenge")
async def create_challenge(request: ChallengeRequest):
    challenge = generate_challenge(request.video_topic)
    if "error" in challenge:
        raise HTTPException(status_code=500, detail=challenge["error"])
    return challenge

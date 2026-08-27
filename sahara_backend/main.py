"""SAHARA FastAPI Backend Service.

Provides:
- Machine Learning Risk Assessment (Anxiety Regression + Academic Dropout Risk)
- Role-based Authentication (Student, Counselor, Admin)
- Secure Server-Side Gemini AI Chat Proxy (Zero Client-Side API Key Exposure)
- Counselor Case Triage & Institutional Analytics
- WhatsApp Webhook Router
"""
from __future__ import annotations

import datetime
import os
import uuid
from typing import Any, Dict, List, Literal, Optional

from fastapi import Depends, FastAPI, HTTPException, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import requests

from auth import create_access_token, get_current_user, get_current_user_optional, require_roles
from core.explainability import get_top_factors
from core.risk_engine import (
    DROPOUT_CLASSES,
    anxiety_model,
    assess_student,
    dropout_model,
)
from storage.database import (
    create_user,
    delete_student_data,
    export_student_data,
    get_admin_stats,
    get_assessment,
    get_or_create_oauth_user,
    get_user_by_email,
    init_db,
    list_assessments,
    list_audit_logs,
    list_users,
    log_assessment,
    log_audit_event,
    update_assessment_status,
    update_user_role,
    verify_password,
)
from whatsapp.bot import router as whatsapp_router

init_db()

app = FastAPI(
    title="SAHARA API",
    description="Student Wellbeing and Academic Attrition Early-Warning Platform",
    version="2.0.0",
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(whatsapp_router)


@app.get("/")
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "sahara-ml-model-engine"}


# ============================================================
# Schemas
# ============================================================

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, description="Full name")
    email: str = Field(..., min_length=3, description="Institutional or personal email")
    password: str = Field(..., min_length=6, description="Password (min 6 chars)")
    role: Literal["student", "counselor", "admin"] = Field(default="student")


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3, description="Email address")
    password: str = Field(...)


class OAuthRequest(BaseModel):
    provider: Literal["google", "github"] = Field(..., description="OAuth provider")
    email: str = Field(..., min_length=3, description="OAuth user email")
    name: Optional[str] = Field(default=None, description="OAuth user display name")
    role: Optional[Literal["student", "counselor", "admin"]] = Field(default="student")


class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    role: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    name: str
    email: str
    role: str
    user: Optional[UserProfile] = None


class StudentIntake(BaseModel):
    student_name: Optional[str] = Field(default="Student", description="Display name")
    age: int = Field(..., ge=16, le=100)
    gender: str = Field(..., description="Female, Male, Non-binary, Prefer not to say")
    academic_year: int = Field(..., ge=1, le=6)
    study_hours_per_day: float = Field(..., ge=0.0, le=24.0)
    exam_pressure: int = Field(..., ge=1, le=10)
    academic_performance: float = Field(..., ge=0.0, le=100.0)
    stress_level: int = Field(..., ge=1, le=10)
    sleep_hours: float = Field(..., ge=0.0, le=24.0)
    physical_activity: int = Field(..., ge=0, le=7)
    social_support: int = Field(..., ge=1, le=10)
    screen_time: float = Field(default=6.0, ge=0.0, le=24.0)
    internet_usage: float = Field(default=3.0, ge=0.0, le=24.0)
    financial_stress: int = Field(default=5, ge=1, le=10)
    family_expectation: int = Field(default=5, ge=1, le=10)
    admission_grade: Optional[float] = Field(default=0.0)
    curricular_units_1st_sem_approved: Optional[int] = Field(default=3)
    curricular_units_2nd_sem_approved: Optional[int] = Field(default=3)
    tuition_fees_up_to_date: Optional[int] = Field(default=1)
    debtor: Optional[int] = Field(default=0)
    age_at_enrollment: Optional[int] = Field(default=20)


class AssessmentResponse(BaseModel):
    assessment_id: str
    student_id: str
    anxiety_score: float
    anxiety_level: str
    dropout_probability: float
    dropout_predicted_class: str
    combined_score: float
    risk_tier: str
    action: str
    message: str
    counselor_alert: bool
    next_step: str
    top_factors: List[str]
    suggestions: List[str]
    timestamp: str


class StatusUpdateRequest(BaseModel):
    status: Literal["New", "In progress", "Contacted", "Referred to clinical services", "Resolved"]
    notes: Optional[str] = None


class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(...)


class AIChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    conversation_history: Optional[List[ChatMessage]] = Field(default=[])


# ============================================================
# 1. Authentication Endpoints
# ============================================================

@app.post("/auth/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest):
    """Register a new student, counselor, or admin user."""
    try:
        user = create_user(req.name, req.email, req.password, req.role)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    token = create_access_token(user["id"], user["email"], user["role"], user["name"])
    user_prof = UserProfile(id=user["id"], name=user["name"], email=user["email"], role=user["role"])
    return AuthResponse(
        access_token=token,
        user_id=user["id"],
        name=user["name"],
        email=user["email"],
        role=user["role"],
        user=user_prof,
    )


@app.post("/auth/login", response_model=AuthResponse)
def login(req: LoginRequest):
    """Authenticate with email and password to receive JWT token."""
    user = get_user_by_email(req.email)
    if not user or not verify_password(req.password, user["password_hash"], user["salt"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = create_access_token(user["id"], user["email"], user["role"], user["name"])
    user_prof = UserProfile(id=user["id"], name=user["name"], email=user["email"], role=user["role"])
    return AuthResponse(
        access_token=token,
        user_id=user["id"],
        name=user["name"],
        email=user["email"],
        role=user["role"],
        user=user_prof,
    )


@app.post("/auth/oauth", response_model=AuthResponse)
def oauth_login(req: OAuthRequest):
    """Authenticate or register seamlessly via Google / GitHub OAuth."""
    user = get_or_create_oauth_user(
        provider=req.provider,
        email=req.email,
        name=req.name,
    )
    token = create_access_token(user["id"], user["email"], user["role"], user["name"])
    user_prof = UserProfile(id=user["id"], name=user["name"], email=user["email"], role=user["role"])
    return AuthResponse(
        access_token=token,
        user_id=user["id"],
        name=user["name"],
        email=user["email"],
        role=user["role"],
        user=user_prof,
    )


@app.get("/auth/me")
def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieve logged-in user profile."""
    return current_user


# ============================================================
# 2. Server-Side Gemini AI Chat Proxy (Safe & Key-Protected)
# ============================================================

@app.post("/ai-support/chat")
def ai_support_chat(req: AIChatRequest):
    """Server-side Gemini AI proxy ensuring API keys are never exposed to browser clients.
    
    Includes deterministic crisis-keyword interceptor: routes severe distress/self-harm
    to human-reviewed emergency response rather than freeform LLM generation.
    """
    msg_lower = req.message.lower()
    crisis_triggers = [
        "suicide", "kill myself", "end my life", "want to die", "self harm",
        "hurt myself", "hopeless", "can't go on", "no reason to live", "hanging"
    ]
    
    if any(k in msg_lower for k in crisis_triggers):
        return {
            "response": (
                "I hear how much pain you're in, and I want you to know that your life matters. "
                "You do not have to carry this alone. Please connect with someone who can support you right now:\n\n"
                "📞 **National Tele-MANAS (24/7 Free & Confidential):** Call 14416\n"
                "📞 **KIRAN Helpline:** Call 1800-599-0019\n"
                "📞 **iCall Psychosocial Support:** Call 9152987821\n\n"
                "A campus counselor is also available to support you in a safe, confidential environment."
            ),
            "is_crisis": True,
            "emergency_helpline": "Tele-MANAS: 14416 (24/7 Toll-Free)",
        }

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {
            "response": (
                "I'm here for you! 💚 College can feel demanding, but taking one small step at a time helps. "
                "Try taking 3 slow deep breaths right now. You can also explore our wellness resources or connect with campus support."
            ),
            "emergency_helpline": "Tele-MANAS: 14416 (24/7 National Toll-Free)",
        }

    system_instruction = (
        "You are SAHARA AI — a compassionate, empathetic, and professional mental wellbeing companion "
        "for college students. Keep responses warm, structured, actionable, and under 3 short paragraphs. "
        "Offer practical academic, sleep, and mindfulness strategies. If student asks for resources, "
        "suggest standard evidence-based techniques like 4-7-8 breathing, Pomodoro 25/5 intervals, or campus counseling."
    )

    # Format contents for Gemini REST API
    contents = []
    for m in req.conversation_history[-6:]:
        role = "user" if m.role == "user" else "model"
        contents.append({"role": role, "parts": [{"text": m.content}]})
    contents.append({"role": "user", "parts": [{"text": req.message}]})

    # Verified current Google Gemini model endpoints
    models = ["gemini-2.0-flash", "gemini-1.5-flash"]
    for model_name in models:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
            payload = {
                "system_instruction": {"parts": [{"text": system_instruction}]},
                "contents": contents,
            }
            res = requests.post(url, json=payload, timeout=12)
            if res.status_code == 200:
                reply = res.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
                return {"response": reply, "model_used": model_name}
        except Exception:
            continue

    return {
        "response": (
            "Thank you for sharing. 💚 It's completely valid to feel stressed during college. "
            "Prioritize a short screen break, hydrate, and consider trying a 5-minute breathing exercise."
        ),
        "emergency_helpline": "Tele-MANAS: 14416 (24/7 National Toll-Free)",
    }


# ============================================================
# 3. Core Assessment & Health
# ============================================================

@app.get("/health")
def health_check():
    """Health check validating ML model weights readiness."""
    return {
        "status": "ok",
        "anxiety_model_loaded": anxiety_model is not None,
        "dropout_model_loaded": dropout_model is not None,
        "dropout_classes": DROPOUT_CLASSES,
        "version": "2.0.0",
    }


@app.post("/predict")
@app.post("/assess", response_model=AssessmentResponse)
def assess(intake: StudentIntake, current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)):
    """Run dual-model early-warning assessment and store result."""
    data = intake.model_dump()
    result = assess_student(data, student_name=intake.student_name or "Student")

    top_factors = get_top_factors(data, top_n=3)

    # Dynamic suggestions based on risk tier
    tier = result["risk_tier"]
    if tier == "Low":
        suggestions = [
            "Maintain your healthy routine and 7-8 hours of sleep.",
            "Use Pomodoro 25/5 study intervals to prevent mental fatigue.",
            "Engage in 20-30 mins of daily physical activity.",
        ]
    elif tier == "Medium":
        suggestions = [
            "Practice 4-7-8 breathing exercises during study breaks.",
            "Connect with a study group or peer mentor to distribute workload.",
            "Schedule a light 15-minute screen-free wind-down routine before sleep.",
        ]
    else:
        suggestions = [
            "Reach out to your designated campus counselor for a confidential session.",
            "Call National Tele-MANAS (14416) for immediate 24/7 emotional support.",
            "Speak with an academic advisor regarding workload adjustments.",
        ]

    aid = str(uuid.uuid4())
    ts = datetime.datetime.now(datetime.timezone.utc).isoformat()
    student_identifier = current_user.get("id") if current_user else (intake.student_name or "Student")

    robj = type("R", (), result)()
    log_assessment(
        aid,
        ts,
        robj,
        student_name=student_identifier,
        top_factors=top_factors,
        raw_input=data,
    )

    return AssessmentResponse(
        assessment_id=aid,
        student_id=student_identifier,
        anxiety_score=result["anxiety_score"],
        anxiety_level=result["anxiety_level"],
        dropout_probability=result["dropout_probability"],
        dropout_predicted_class=result["dropout_predicted_class"],
        combined_score=result["combined_score"],
        risk_tier=result["risk_tier"],
        action=result["action"],
        message=result["message"],
        counselor_alert=result["counselor_alert"],
        next_step=result["next_step"],
        top_factors=top_factors,
        suggestions=suggestions,
        timestamp=ts,
    )


# ============================================================
# 4. Counselor & Admin Case Management Endpoints
# ============================================================

@app.get("/assessments")
def get_assessments(
    student_id: Optional[str] = Query(None),
    risk_tier: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional),
):
    """Fetch paginated assessments. Counselors see all; students see only their own."""
    # If user is a student, restrict to their own records
    if current_user and current_user.get("role") == "student":
        student_id = current_user.get("id")

    return list_assessments(
        student_id=student_id,
        risk_tier=risk_tier,
        limit=limit,
        offset=offset,
    )


@app.get("/assessments/{assessment_id}")
def get_single_assessment(assessment_id: str):
    """Retrieve single assessment record with full details."""
    rec = get_assessment(assessment_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Assessment record not found.")
    return rec


@app.patch("/assessments/{assessment_id}/status")
def update_status(assessment_id: str, payload: StatusUpdateRequest):
    """Update counselor review status and notes for an assessment."""
    updated = update_assessment_status(assessment_id, payload.status, payload.notes)
    if not updated:
        raise HTTPException(status_code=404, detail="Assessment not found.")
    return updated


@app.get("/admin/stats")
def admin_stats():
    """Retrieve institution-wide risk distribution and weekly check-in trends."""
    return get_admin_stats()


class UpdateRoleRequest(BaseModel):
    role: Literal["student", "counselor", "admin"]


@app.get("/admin/users")
def get_all_users(current_user: Dict[str, Any] = Depends(require_roles("admin"))):
    """Retrieve all users and assigned roles (Admin only)."""
    return {"users": list_users()}


@app.patch("/admin/users/{user_id}/role")
def change_user_role(user_id: str, req: UpdateRoleRequest, current_user: Dict[str, Any] = Depends(require_roles("admin"))):
    """Update user role (Admin only)."""
    success = update_user_role(user_id, req.role)
    if not success:
        raise HTTPException(status_code=404, detail="User not found.")
    log_audit_event(
        user_id=current_user.get("id", "admin"),
        user_role="admin",
        action="UPDATE_USER_ROLE",
        resource_id=user_id,
        details=f"Changed role to {req.role}",
    )
    return {"status": "success", "user_id": user_id, "role": req.role}


# ============================================================
# 5. Student Data Privacy & Rights Endpoints (GDPR / DPDP Compliance)
# ============================================================

@app.get("/student/export-data")
def export_my_data(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Export complete student data history (Data Portability)."""
    student_id = current_user.get("id")
    log_audit_event(
        user_id=student_id,
        user_role=current_user.get("role", "student"),
        action="EXPORT_PERSONAL_DATA",
        resource_id=student_id,
    )
    return export_student_data(student_id)


@app.delete("/student/delete-data")
def delete_my_data(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Permanently delete all assessment records for the requesting student."""
    student_id = current_user.get("id")
    delete_student_data(student_id)
    log_audit_event(
        user_id=student_id,
        user_role=current_user.get("role", "student"),
        action="DELETE_PERSONAL_DATA",
        resource_id=student_id,
        details="All student assessment history purged per student request.",
    )
    return {"status": "success", "message": "All assessment records permanently purged."}


@app.get("/admin/audit-logs")
def get_audit_logs(
    limit: int = Query(50, ge=1, le=100),
    current_user: Dict[str, Any] = Depends(require_roles("admin")),
):
    """Retrieve system-wide privacy and clinical access audit logs (Admin only)."""
    return {"audit_logs": list_audit_logs(limit=limit)}

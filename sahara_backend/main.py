from __future__ import annotations

import datetime
import uuid
from typing import Literal, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import database
from explainability import get_top_factors
from gemini_suggestions import get_gemini_suggestions
import phase2_merged_final as sahara

app = FastAPI(
    title="SAHARA API",
    description="Student wellbeing and dropout-risk early-warning system API",
    version="1.2.0",
)

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8443",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:8443",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Schemas
# ============================================================
class StudentIntake(BaseModel):
    student_name: Optional[str] = Field(default="Student", description="Display name only")
    age: int = Field(..., ge=16, le=100, description="Age between 16 and 100")
    gender: str = Field(..., description="Gender identity")
    academic_year: int = Field(..., description="College year 1-4")
    study_hours_per_day: float = Field(..., ge=0.0, le=24.0, description="Daily study hours 0-24")
    exam_pressure: int = Field(..., ge=0, le=10, description="Exam pressure 0-10")
    academic_performance: float = Field(..., description="GPA or percentage score")
    stress_level: int = Field(..., ge=0, le=10, description="Stress level 0-10")
    sleep_hours: float = Field(..., ge=0.0, le=24.0, description="Nightly sleep hours 0-24")
    physical_activity: int = Field(..., description="Physical activity days or scale")
    social_support: int = Field(..., ge=0, le=10, description="Social support 0-10")
    screen_time: float = Field(..., ge=0.0, le=24.0, description="Screen hours 0-24")
    internet_usage: float = Field(..., ge=0.0, le=24.0, description="Internet hours 0-24")
    financial_stress: int = Field(..., ge=0, le=10, description="Financial stress 0-10")
    family_expectation: int = Field(..., ge=0, le=10, description="Family expectation 0-10")

    # Optional dropout-specific fields
    admission_grade: Optional[float] = Field(default=0.0)
    curricular_units_1st_sem_approved: Optional[int] = Field(default=0)
    curricular_units_2nd_sem_approved: Optional[int] = Field(default=0)
    tuition_fees_up_to_date: Optional[int] = Field(default=0)
    debtor: Optional[int] = Field(default=0)
    age_at_enrollment: Optional[int] = None


class AssessmentResponse(BaseModel):
    assessment_id: str
    timestamp: str
    anxiety_score: float
    anxiety_level: str
    dropout_probability: float
    combined_score: float
    risk_tier: str
    action: str
    message: str
    counselor_alert: bool
    next_step: str
    top_factors: list[str] = Field(default_factory=list)
    suggestions: list[str] = Field(default_factory=list)


class StatusUpdateRequest(BaseModel):
    status: Literal["New", "In progress", "Contacted"]
    notes: Optional[str] = None


def to_model_dict(payload: StudentIntake) -> dict:
    return {
        "age": payload.age,
        "study_hours_per_day": payload.study_hours_per_day,
        "exam_pressure": payload.exam_pressure,
        "academic_performance": payload.academic_performance,
        "stress_level": payload.stress_level,
        "sleep_hours": payload.sleep_hours,
        "physical_activity": payload.physical_activity,
        "social_support": payload.social_support,
        "screen_time": payload.screen_time,
        "internet_usage": payload.internet_usage,
        "financial_stress": payload.financial_stress,
        "family_expectation": payload.family_expectation,
        "gender": payload.gender,
        "academic_year": payload.academic_year,
        "Admission grade": payload.admission_grade or 0,
        "Curricular units 1st sem (approved)": payload.curricular_units_1st_sem_approved or 0,
        "Curricular units 2nd sem (approved)": payload.curricular_units_2nd_sem_approved or 0,
        "Tuition fees up to date": payload.tuition_fees_up_to_date if payload.tuition_fees_up_to_date is not None else 0,
        "Debtor": payload.debtor or 0,
        "Age at enrollment": payload.age_at_enrollment or payload.age,
    }


# ============================================================
# Core Endpoints
# ============================================================
@app.get("/health")
def health():
    """Confirm service status and ML model state."""
    return {
        "status": "ok",
        "anxiety_model_loaded": sahara.anxiety_model is not None,
        "dropout_model_loaded": sahara.dropout_model is not None,
        "dropout_classes": list(sahara.DROPOUT_CLASSES) if hasattr(sahara, "DROPOUT_CLASSES") else ["Dropout", "Enrolled", "Graduate"],
    }


@app.post("/assess", response_model=AssessmentResponse)
def assess(payload: StudentIntake):
    """Assess a student using real anxiety & dropout ML models."""
    student_data = to_model_dict(payload)
    try:
        result = sahara.assess_student(student_data, student_name=payload.student_name or "Student")
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Assessment computation failed: {str(e)}")

    assessment_id = str(uuid.uuid4())
    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()

    risk_tier = result.get("risk_tier", "Low")
    top_factors = (
        get_top_factors(student_data)
        if risk_tier in {"Medium", "High"}
        else []
    )

    suggestions = (
        get_gemini_suggestions(student_data)
        if risk_tier == "Low"
        else []
    )

    # Clean numbers per spec
    anxiety_score = round(float(result.get("anxiety_score", 0.0)), 2)
    dropout_probability = round(float(result.get("dropout_probability", 0.0)), 3)
    combined_score = round(0.5 * (anxiety_score / 10.0) + 0.5 * dropout_probability, 3)

    response_data = {
        "assessment_id": assessment_id,
        "timestamp": timestamp,
        "anxiety_score": anxiety_score,
        "anxiety_level": result.get("anxiety_level", "Low"),
        "dropout_probability": dropout_probability,
        "combined_score": combined_score,
        "risk_tier": risk_tier,
        "action": result.get("action", "show_suggestions"),
        "message": result.get("message", f"Assessment completed for {payload.student_name}"),
        "counselor_alert": risk_tier == "High",
        "next_step": result.get("next_step", "Self-care guidelines provided"),
        "top_factors": top_factors,
        "suggestions": suggestions,
    }

    # Persist record
    robj = type("AssessmentResult", (), response_data)()
    database.log_assessment(
        assessment_id=assessment_id,
        timestamp=timestamp,
        result=robj,
        student_name=payload.student_name,
        top_factors=top_factors,
        raw_input=payload.model_dump(),
    )

    return response_data


@app.get("/assessments")
def get_assessments(
    student_id: Optional[str] = Query(None, description="Filter by anonymized student ID"),
    risk_tier: Optional[str] = Query(None, description="Filter by Low, Medium, or High"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """List historical assessments for counselor dashboard and reporting."""
    if risk_tier and risk_tier not in {"Low", "Medium", "High"}:
        raise HTTPException(status_code=400, detail="risk_tier must be Low, Medium, or High")
    return database.list_assessments(
        student_id=student_id, risk_tier=risk_tier, limit=limit, offset=offset
    )


@app.get("/assessments/{assessment_id}")
def get_single_assessment(assessment_id: str):
    row = database.get_assessment(assessment_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return row


@app.patch("/assessments/{assessment_id}/status")
def update_status(assessment_id: str, payload: StatusUpdateRequest):
    """Counselor marks assessment status (New / In progress / Contacted) with notes."""
    updated = database.update_assessment_status(
        assessment_id=assessment_id, status=payload.status, notes=payload.notes
    )
    if updated is None:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return updated


@app.patch("/assessments/{assessment_id}/contacted")
def mark_contacted_legacy(assessment_id: str):
    """Legacy endpoint alias for mark as contacted."""
    updated = database.update_assessment_status(
        assessment_id=assessment_id, status="Contacted", notes="Contacted via dashboard"
    )
    if updated is None:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return updated


@app.get("/admin/stats")
def get_admin_statistics():
    """Institution-wide aggregated metrics across all assessments."""
    return database.get_admin_stats()


# ============================================================
# WhatsApp Integration Router
# ============================================================
try:
    from whatsapp_router import router as whatsapp_router
    app.include_router(whatsapp_router)
except Exception as e:
    print(f"WhatsApp router notice: {e}")


@app.get("/")
def root():
    return {
        "service": "SAHARA API",
        "docs": "/docs",
        "endpoints": [
            "GET /health",
            "POST /assess",
            "GET /assessments",
            "GET /assessments/{assessment_id}",
            "PATCH /assessments/{assessment_id}/status",
            "GET /admin/stats",
            "POST /whatsapp-webhook",
            "GET /whatsapp-health",
        ],
    }


if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)


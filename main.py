# main.py — SAHARA Backend Entry Point
# Run with: python -m uvicorn main:app --reload --port 8000

import os
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

# ============================================================
# FastAPI App Setup
# ============================================================
app = FastAPI(
    title="SAHARA Backend API",
    description="Student wellbeing assessment & WhatsApp chatbot backend",
    version="1.0.0"
)

# Allow React frontend to call this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# Health Check
# ============================================================
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "SAHARA Backend",
        "version": "1.0.0"
    }

# ============================================================
# Simple Risk Assessment (no ML model needed for demo)
# ============================================================
from pydantic import BaseModel
from typing import Optional

class StudentIntake(BaseModel):
    student_name: Optional[str] = "Anonymous"
    age: int = 20
    gender: str = "Prefer not to say"
    academic_year: int = 1
    sleep_hours: float = 7.0
    study_hours_per_day: float = 5.0
    physical_activity: int = 3
    screen_time: float = 6.0
    internet_usage: float = 4.0
    exam_pressure: int = 5
    stress_level: int = 5
    financial_stress: int = 5
    family_expectation: int = 5
    social_support: int = 5
    academic_performance: float = 60.0
    admission_grade: float = 100.0
    curricular_units_1st_sem_approved: int = 3
    curricular_units_2nd_sem_approved: int = 3
    tuition_fees_up_to_date: int = 1

@app.post("/assess")
def assess_student(student: StudentIntake):
    """
    Calculate student wellbeing risk score and return tier + message.
    Uses rule-based scoring for hackathon demo (replace with ML model for production).
    """
    # Risk scoring
    risk_score = 0

    # Sleep (less = more risk)
    if student.sleep_hours < 5:
        risk_score += 25
    elif student.sleep_hours < 6:
        risk_score += 15
    elif student.sleep_hours < 7:
        risk_score += 5

    # Stress level (higher = more risk)
    risk_score += (student.stress_level - 1) * 3  # max 27

    # Exam pressure
    risk_score += (student.exam_pressure - 1) * 2  # max 18

    # Financial stress
    risk_score += (student.financial_stress - 1) * 2  # max 18

    # Family expectation
    risk_score += (student.family_expectation - 1) * 1  # max 9

    # Social support (inverse — less support = more risk)
    risk_score += (10 - student.social_support) * 2  # max 18

    # Academic performance (low = more risk)
    if student.academic_performance < 40:
        risk_score += 20
    elif student.academic_performance < 60:
        risk_score += 10

    # Physical activity (none = more risk)
    if student.physical_activity == 0:
        risk_score += 10
    elif student.physical_activity <= 1:
        risk_score += 5

    # Tuition not up to date
    if student.tuition_fees_up_to_date == 0:
        risk_score += 10

    # Normalize to 0-100
    max_possible = 25 + 27 + 18 + 18 + 9 + 18 + 20 + 10 + 10
    risk_pct = min(100, int((risk_score / max_possible) * 100))

    # Determine tier
    if risk_pct < 35:
        tier = "Low"
        message = (
            "You seem to be managing well! Your wellbeing indicators look healthy. "
            "Keep maintaining good sleep, exercise, and social connections. 💚"
        )
        helplines = []
    elif risk_pct < 65:
        tier = "Medium"
        message = (
            "We've noticed some stress indicators. It's completely normal during academic life — "
            "but don't hesitate to reach out for support. A counselor can make a big difference. 🌟"
        )
        helplines = ["Campus Counselor: +91 98765 43210", "iCall: 9152987821"]
    else:
        tier = "High"
        message = (
            "We've detected elevated stress and risk factors. Please reach out to a counselor immediately — "
            "you don't have to face this alone. Help is available 24/7. 🆘"
        )
        helplines = [
            "Tele-MANAS (24/7 Free): 14416",
            "iCall: 9152987821",
            "Campus Counselor: +91 98765 43210"
        ]

    return {
        "student_name": student.student_name,
        "risk_score": risk_pct,
        "risk_tier": tier,
        "message": message,
        "helplines": helplines,
        "anxiety_score": risk_pct,
        "dropout_probability": round(risk_pct / 100, 2)
    }

# ============================================================
# WhatsApp Chatbot Routes
# ============================================================
from whatsapp_chatbot import setup_whatsapp_routes

@app.on_event("startup")
async def startup_event():
    await setup_whatsapp_routes(app)
    print("\n[OK] SAHARA Backend is running!")
    print("[+] WhatsApp webhook: POST /whatsapp-webhook")
    print("[+] Health check:     GET  /health")
    print("[+] Assessment:       POST /assess\n")

# ============================================================
# Run locally
# ============================================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

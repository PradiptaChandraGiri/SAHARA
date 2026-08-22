"""Twilio WhatsApp webhook — full 17-question SAHARA intake flow."""
from __future__ import annotations
import datetime
import os
import uuid
from typing import Any

from fastapi import APIRouter, Form
from fastapi.responses import Response

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

router = APIRouter(tags=["WhatsApp"])

SESSIONS: dict[str, dict[str, Any]] = {}

QUESTIONS: list[tuple[str, str, str]] = [
    ("age",                               "Hi! I am the SAHARA wellbeing assistant.\n\nQ1/17: How old are you? (e.g. 20)", "number"),
    ("gender",                            "Q2/17: What is your gender?\n1 - Female\n2 - Male\n3 - Non-binary\n4 - Prefer not to say\nReply 1, 2, 3 or 4", "choice4"),
    ("academic_year",                     "Q3/17: Which year of college?\n1 - 1st year\n2 - 2nd year\n3 - 3rd year\n4 - 4th year\nReply 1-4", "choice4"),
    ("sleep_hours",                       "Q4/17: Average hours of sleep per night? (e.g. 6.5)", "number"),
    ("study_hours_per_day",               "Q5/17: Hours per day studying or in class? (e.g. 5)", "number"),
    ("physical_activity",                 "Q6/17: Days per week you exercise? (0-7)", "number"),
    ("screen_time",                       "Q7/17: Hours per day on screens (phone/laptop)? (e.g. 8)", "number"),
    ("internet_usage",                    "Q8/17: Hours per day on social media or browsing? (e.g. 4)", "number"),
    ("stress_level",                      "Q9/17: Overall stress level 1-10?\n(1=very calm, 10=extremely stressed)", "scale"),
    ("exam_pressure",                     "Q10/17: Exam pressure 1-10?\n(1=none, 10=extreme)", "scale"),
    ("financial_stress",                  "Q11/17: Financial stress 1-10?\n(1=none, 10=very stressed)", "scale"),
    ("family_expectation",                "Q12/17: Family expectation pressure 1-10?\n(1=none, 10=very high)", "scale"),
    ("social_support",                    "Q13/17: How supported do you feel 1-10?\n(1=very alone, 10=very supported)", "scale"),
    ("academic_performance",              "Q14/17: Current academic percentage? (e.g. 65)", "number"),
    ("admission_grade",                   "Q15/17: Entrance/admission grade? (Enter 0 if unknown)", "number"),
    ("curricular_units_1st_sem_approved", "Q16/17: Course units passed last semester? (e.g. 4)", "number"),
    ("tuition_fees_up_to_date",           "Q17/17 (last one!): Is tuition up to date?\n1 - Yes\n2 - No\nReply 1 or 2", "choice2"),
]

GENDER_MAP  = {"1": "Female", "2": "Male", "3": "Non-binary", "4": "Prefer not to say"}
TUITION_MAP = {"1": 1, "2": 0}


def _twiml(message: str) -> Response:
    safe = message.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    xml = f'<?xml version="1.0" encoding="UTF-8"?><Response><Message>{safe}</Message></Response>'
    return Response(content=xml, media_type="application/xml")


def _parse(text: str, input_type: str):
    t = text.strip()
    if input_type == "choice4":
        if t not in {"1", "2", "3", "4"}:
            raise ValueError("Reply 1, 2, 3 or 4.")
        return t
    if input_type == "choice2":
        if t not in {"1", "2"}:
            raise ValueError("Reply 1 or 2.")
        return t
    return float(t)


@router.post("/whatsapp-webhook")
async def whatsapp_webhook(From: str = Form(...), Body: str = Form("")) -> Response:
    phone, text = From, Body.strip()

    if text.lower() in {"stop", "quit", "cancel", "reset", "restart"}:
        SESSIONS.pop(phone, None)
        return _twiml("Check-in paused. Send 'hi' any time to restart.")

    session = SESSIONS.setdefault(phone, {"step": 0, "answers": {}})

    if session["step"] == 0:
        session["step"] = 1
        return _twiml(QUESTIONS[0][1])

    q_index = session["step"] - 1
    if q_index < len(QUESTIONS):
        field, _, input_type = QUESTIONS[q_index]
        try:
            raw = _parse(text, input_type)
        except ValueError:
            return _twiml(f"Invalid input. {QUESTIONS[q_index][1]}")

        if field == "gender":
            session["answers"]["gender"] = GENDER_MAP[raw]
        elif field == "tuition_fees_up_to_date":
            session["answers"]["tuition_fees_up_to_date"] = TUITION_MAP[raw]
        elif field == "academic_year":
            session["answers"]["academic_year"] = int(raw)
        else:
            session["answers"][field] = raw

        session["step"] += 1
        if session["step"] - 1 < len(QUESTIONS):
            return _twiml(QUESTIONS[session["step"] - 1][1])

    # All 17 answered — run the real ML
    try:
        from phase2_merged_final import assess_student
        import database

        ans = session["answers"]
        student_data = {
            "age":                                    int(ans.get("age", 20)),
            "gender":                                 ans.get("gender", "Prefer not to say"),
            "academic_year":                          int(ans.get("academic_year", 1)),
            "sleep_hours":                            float(ans.get("sleep_hours", 7)),
            "study_hours_per_day":                    float(ans.get("study_hours_per_day", 5)),
            "physical_activity":                      int(ans.get("physical_activity", 3)),
            "screen_time":                            float(ans.get("screen_time", 6)),
            "internet_usage":                         float(ans.get("internet_usage", 3)),
            "stress_level":                           int(ans.get("stress_level", 5)),
            "exam_pressure":                          int(ans.get("exam_pressure", 5)),
            "financial_stress":                       int(ans.get("financial_stress", 5)),
            "family_expectation":                     int(ans.get("family_expectation", 5)),
            "social_support":                         int(ans.get("social_support", 5)),
            "academic_performance":                   float(ans.get("academic_performance", 60)),
            "Admission grade":                        float(ans.get("admission_grade", 0)),
            "Curricular units 1st sem (approved)":    int(ans.get("curricular_units_1st_sem_approved", 0)),
            "Curricular units 2nd sem (approved)":    int(ans.get("curricular_units_1st_sem_approved", 0)),
            "Tuition fees up to date":                int(ans.get("tuition_fees_up_to_date", 0)),
            "Debtor":                                 0,
            "Age at enrollment":                      int(ans.get("age", 20)),
        }

        result  = assess_student(student_data, student_name="WhatsApp User")
        tier    = result.get("risk_tier", "Unknown")
        anxiety = result.get("anxiety_score", 0)
        dropout = result.get("dropout_probability", 0)
        msg     = result.get("message", "Check-in complete.")

        aid  = str(uuid.uuid4())
        ts   = datetime.datetime.now(datetime.timezone.utc).isoformat()
        robj = type("R", (), result)()
        database.log_assessment(aid, ts, robj, student_name="WA:" + phone[-4:])

        reply = (
            f"Check-in complete!\n\n"
            f"Wellbeing Level: {tier}\n"
            f"Anxiety Score: {anxiety:.1f}/10\n"
            f"Dropout Risk: {dropout*100:.0f}%\n\n"
            f"{msg}"
        )
        if tier == "High":
            reply += "\n\nImmediate Help:\nTele-MANAS: 14416 (24/7 Free)\niCall: 9152987821"

        SESSIONS.pop(phone, None)
        return _twiml(reply)

    except Exception:
        SESSIONS.pop(phone, None)
        return _twiml("Could not complete check-in. Please contact a counselor: iCall 9152987821")


@router.get("/whatsapp-health")
def whatsapp_health():
    acct = os.getenv("TWILIO_ACCOUNT_SID", "")
    return {
        "status":               "ok" if acct.startswith("AC") else "unconfigured",
        "twilio_enabled":       acct.startswith("AC"),
        "active_conversations": len(SESSIONS),
        "backend_url":          os.getenv("SAHARA_BACKEND_URL", "http://localhost:8000"),
        "sandbox_number":       os.getenv("TWILIO_WHATSAPP_NUMBER", "not set"),
    }

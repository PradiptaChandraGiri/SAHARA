"""SAHARA WhatsApp Bot Core Engine & Router.

Integrates Twilio Webhook, Interactive Content Templates (List Pickers & Quick Replies),
conversational Gemini AI support, and automated routing to the SAHARA Risk Engine.
"""
from __future__ import annotations

import datetime
import os
import re
import uuid
from typing import Any, Dict, Optional

from fastapi import APIRouter, Request, Response
from twilio.rest import Client

from core.risk_engine import assess_student
from core.explainability import get_top_factors
from storage.database import log_assessment
from whatsapp.intake_flow import (
    INTAKE_STEPS,
    CONTENT_SID_GENDER,
    CONTENT_SID_YEAR,
    CONTENT_SID_TUITION,
    CONTENT_SID_RESTART,
)

router = APIRouter(tags=["WhatsApp"])

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")

try:
    twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    TWILIO_ENABLED = True
except Exception:
    twilio_client = None
    TWILIO_ENABLED = False

conversation_state: Dict[str, Dict[str, Any]] = {}

GENDER_MAP = {
    "1": "Female", "female": "Female", "f": "Female", "girl": "Female", "woman": "Female",
    "2": "Male", "male": "Male", "m": "Male", "boy": "Male", "man": "Male",
    "3": "Non-binary", "non-binary": "Non-binary", "nb": "Non-binary",
    "4": "Prefer not to say", "skip": "Prefer not to say"
}

GRADE_MAP = {
    "o": 95.0, "a+": 90.0, "a": 85.0, "a-": 80.0,
    "b+": 75.0, "b": 70.0, "b-": 65.0,
    "c+": 60.0, "c": 55.0, "d": 45.0, "f": 30.0,
}


def send_text(to_phone: str, message_text: str) -> bool:
    if not TWILIO_ENABLED or not twilio_client:
        return False
    try:
        twilio_client.messages.create(body=message_text, from_=TWILIO_WHATSAPP_NUMBER, to=to_phone)
        return True
    except Exception as e:
        print(f"[WhatsApp] Error sending text: {e}")
        return False


def send_interactive(to_phone: str, content_sid: str, fallback_text: str) -> bool:
    """Send interactive Twilio Content Template or fall back to formatted text."""
    if not TWILIO_ENABLED or not twilio_client:
        return False
    if content_sid:
        try:
            twilio_client.messages.create(
                content_sid=content_sid,
                from_=TWILIO_WHATSAPP_NUMBER,
                to=to_phone
            )
            return True
        except Exception as e:
            print(f"[WhatsApp] Content template fallback ({content_sid}): {e}")
    return send_text(to_phone, fallback_text)


def get_step_config(step_number: int) -> Optional[Dict[str, Any]]:
    for s in INTAKE_STEPS:
        if s["step"] == step_number:
            return s
    return None


def send_step_question(to_phone: str, step_config: Dict[str, Any]):
    if step_config["type"] in ("list", "quick_reply"):
        send_interactive(to_phone, step_config.get("content_sid", ""), step_config["fallback_text"])
    else:
        send_text(to_phone, step_config["question"])


def extract_answer(form_data: Any, step_config: Dict[str, Any]) -> Optional[str]:
    button_payload = form_data.get("ButtonPayload")
    list_id = form_data.get("ListId")
    body = (form_data.get("Body") or "").strip()

    if step_config["type"] == "quick_reply" and button_payload:
        return str(button_payload)
    if step_config["type"] == "list" and list_id:
        return str(list_id)

    raw = body.lower()
    if step_config["type"] == "list":
        for k, v in GENDER_MAP.items():
            if raw == k or raw.startswith(k):
                return "1" if v == "Female" else "2" if v == "Male" else "3" if v == "Non-binary" else "4"
        digits = re.findall(r'[1-4]', raw)
        if digits:
            return digits[0]
        return "4"

    if step_config["type"] == "quick_reply":
        if any(w in raw for w in ["yes", "y", "paid", "clear", "1"]):
            return "1"
        if any(w in raw for w in ["no", "n", "unpaid", "pending", "2"]):
            return "2"
        return "1"

    if step_config["type"] == "grade":
        if raw in GRADE_MAP:
            return str(GRADE_MAP[raw])
        for g, val in GRADE_MAP.items():
            if g in raw:
                return str(val)

    nums = re.findall(r'\d+(?:\.\d+)?', raw)
    if nums:
        return nums[0]

    return body if body else None


def validate_and_cast(answer: str, step_config: Dict[str, Any]) -> tuple[bool, Any]:
    try:
        stype = step_config["type"]
        if stype == "int":
            val = int(float(answer))
            return step_config["validation"](val), val
        if stype in ("float", "scale"):
            val = float(answer)
            return step_config["validation"](val), val
        if stype == "grade":
            val = float(answer)
            return True, val
        if stype in ("list", "quick_reply"):
            choices = step_config["choices"]
            if answer in choices:
                return True, choices[answer]
            return True, choices.get(answer, list(choices.values())[0])
    except Exception:
        pass
    return False, None


def get_low_tier_suggestions() -> str:
    return (
        "💡 *Personalized Action Steps:*\n\n"
        "1️⃣ *Pomodoro Study Technique* — 25 min deep work, 5 min rest.\n"
        "🔗 https://www.youtube.com/results?search_query=pomodoro+technique+study+method\n\n"
        "2️⃣ *Lo-Fi Focus Audio* — Background soundscapes for cognitive flow.\n"
        "🔗 https://www.youtube.com/results?search_query=lofi+study+music\n\n"
        "3️⃣ *10-Minute Wind-Down Routine* — Light stretches to boost sleep.\n"
        "🔗 https://www.youtube.com/results?search_query=10+minute+evening+stretch+routine"
    )


def get_medium_tier_suggestions() -> str:
    return (
        "💬 *Helpful Support Strategies:*\n\n"
        "1️⃣ *Box / 4-7-8 Breathing* — Fast relief for exam worry.\n"
        "🔗 https://www.youtube.com/results?search_query=5+minute+breathing+exercise+for+stress\n\n"
        "2️⃣ *Reach out to a peer mentor* — Sharing workload reduces isolation.\n\n"
        "3️⃣ *Free & Confidential Helplines:*\n"
        "📞 *iCall:* 9152987821 (Mon–Sat, 10am–8pm)\n"
        "📞 *Vandrevala Foundation:* 1860-2662-345 (24/7)"
    )


def get_high_tier_suggestions() -> str:
    return (
        "🆘 *Immediate Support & Guidance:*\n\n"
        "📞 *Tele-MANAS (Govt 24/7 Free):* 14416\n"
        "📞 *KIRAN Mental Health Helpline:* 1800-599-0019 (24/7)\n"
        "📞 *iCall Helpline:* 9152987821\n"
        "📞 *Vandrevala Foundation:* 1860-2662-345\n\n"
        "A campus counselor has been flagged to offer assistance with care. You are not alone. 💚"
    )


@router.post("/whatsapp-webhook")
async def whatsapp_webhook(request: Request) -> Response:
    form_data = await request.form()
    raw_body = (form_data.get("Body") or "").strip()
    from_phone = form_data.get("From", "")

    state = conversation_state.get(from_phone)

    # 1. Brand new session
    if state is None:
        conversation_state[from_phone] = {
            "step": 1, "answers": {}, "status": "in_progress",
            "started_at": datetime.datetime.now().isoformat()
        }
        send_step_question(from_phone, get_step_config(1))
        return Response(content="<Response/>", media_type="application/xml")

    # 2. Already completed — handle restart / follow-up cleanly
    if state.get("status") == "completed":
        lowered = raw_body.lower()
        button_payload = form_data.get("ButtonPayload")
        wants_restart = (
            button_payload == "yes" or lowered in
            ("yes", "yes, start", "start", "restart", "hi", "hello", "check-in", "checkin", "retake")
        )
        if wants_restart:
            conversation_state[from_phone] = {
                "step": 1, "answers": {}, "status": "in_progress",
                "started_at": datetime.datetime.now().isoformat()
            }
            send_step_question(from_phone, get_step_config(1))
            return Response(content="<Response/>", media_type="application/xml")
        else:
            send_interactive(
                from_phone, CONTENT_SID_RESTART,
                "Want to do another check-in? Reply *'yes'* to start, or *'no'* to finish."
            )
            return Response(content="<Response/>", media_type="application/xml")

    # 3. In-progress check-in validation
    step_cfg = get_step_config(state["step"])
    ans_raw = extract_answer(form_data, step_cfg)
    valid, val = validate_and_cast(ans_raw or "", step_cfg)

    if not valid:
        err = step_cfg.get("error_msg", "Please provide a valid response.")
        send_text(from_phone, f"⚠️ {err}")
        send_step_question(from_phone, step_cfg)
        return Response(content="<Response/>", media_type="application/xml")

    state["answers"][step_cfg["field"]] = val

    # 4. Final Question Reached: Run Real ML Assessment
    if state["step"] == len(INTAKE_STEPS):
        try:
            ans = state["answers"]
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
                "Curricular units 1st sem (approved)":    int(ans.get("curricular_units_1st_sem_approved", 3)),
                "Curricular units 2nd sem (approved)":    int(ans.get("curricular_units_1st_sem_approved", 3)),
                "Tuition fees up to date":                int(ans.get("tuition_fees_up_to_date", 1)),
                "Debtor":                                 0,
                "Age at enrollment":                      int(ans.get("age", 20)),
            }

            result = assess_student(student_data, student_name="WhatsApp User")
            risk_tier = result.get("risk_tier", "Low")
            anxiety_score = round(float(result.get("anxiety_score", 0)), 1)
            dropout_prob = round(float(result.get("dropout_probability", 0)), 2)
            top_factors = get_top_factors(student_data, top_n=3)

            aid = str(uuid.uuid4())
            ts = datetime.datetime.now(datetime.timezone.utc).isoformat()
            robj = type("R", (), result)()
            log_assessment(aid, ts, robj, student_name="WA:" + from_phone[-4:], top_factors=top_factors)

            summary_msg = (
                "🎯 *SAHARA Wellbeing Assessment*\n"
                "━━━━━━━━━━━━━━━━━━━━\n"
                f"📊 Wellbeing Level: *{risk_tier.upper()}*\n"
                f"🧠 Anxiety Index: *{anxiety_score}/10*\n"
                f"📉 Academic Dropout Risk: *{int(dropout_prob * 100)}%*"
            )
            send_text(from_phone, summary_msg)

            if risk_tier == "Low":
                send_text(from_phone, get_low_tier_suggestions())
            elif risk_tier == "Medium":
                send_text(from_phone, get_medium_tier_suggestions())
            else:
                send_text(from_phone, get_high_tier_suggestions())

            state["status"] = "completed"
            state["completed_at"] = datetime.datetime.now().isoformat()

            send_interactive(
                from_phone, CONTENT_SID_RESTART,
                "Want to do another check-in? Reply *'yes'* to start, or *'no'* to finish."
            )
            return Response(content="<Response/>", media_type="application/xml")

        except Exception as e:
            print(f"[WhatsApp Assessment Error] {e}")
            send_text(from_phone, "Your check-in has been recorded. Tele-MANAS helpline is available at 14416 (24/7). 💚")
            state["status"] = "completed"
            return Response(content="<Response/>", media_type="application/xml")

    # 5. Advance to Next Step
    state["step"] += 1
    next_cfg = get_step_config(state["step"])
    send_step_question(from_phone, next_cfg)
    return Response(content="<Response/>", media_type="application/xml")


@router.get("/whatsapp-health")
async def whatsapp_health():
    return {
        "status": "ok" if TWILIO_ENABLED else "unconfigured",
        "twilio_enabled": TWILIO_ENABLED,
        "content_templates_configured": bool(
            CONTENT_SID_GENDER and CONTENT_SID_YEAR and CONTENT_SID_TUITION and CONTENT_SID_RESTART
        ),
        "active_conversations": len(conversation_state),
    }

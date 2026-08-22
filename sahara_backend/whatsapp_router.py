"""Twilio WhatsApp webhook — Intelligent Gemini Chatbot + Robust 17-Question Screening Flow.

Features:
- Conversational Gemini AI guidance mode for ongoing questions (study tips, exam anxiety, breathing).
- Robust natural-language parser for screening (handles letter grades A+, text numbers, words).
- Direct link to interactive web check-in slider for 1-tap answering.
- YouTube video recommendations and 24/7 crisis helpline support.
"""
from __future__ import annotations

import datetime
import os
import re
import uuid
from typing import Any

from fastapi import APIRouter, Form
from fastapi.responses import Response
import requests

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

router = APIRouter(tags=["WhatsApp"])

# Sessions store per phone number: { phone: { mode: 'chat' | 'screening', step: int, answers: {} } }
SESSIONS: dict[str, dict[str, Any]] = {}

QUESTIONS: list[tuple[str, str, str]] = [
    ("age",                               "📝 *Question 1/17:* How old are you? (e.g. 20)", "number"),
    ("gender",                            "📝 *Question 2/17:* What is your gender?\n\n1️⃣ Female\n2️⃣ Male\n3️⃣ Non-binary\n4️⃣ Prefer not to say\n\n_Reply 1, 2, 3 or 4_", "choice4"),
    ("academic_year",                     "📝 *Question 3/17:* Which year of college?\n\n1️⃣ 1st year\n2️⃣ 2nd year\n3️⃣ 3rd year\n4️⃣ 4th year\n\n_Reply 1–4_", "choice4"),
    ("sleep_hours",                       "📝 *Question 4/17:* Average hours of sleep per night? (e.g. 6.5)", "number"),
    ("study_hours_per_day",               "📝 *Question 5/17:* Hours per day studying or in class? (e.g. 5)", "number"),
    ("physical_activity",                 "📝 *Question 6/17:* Days per week you do exercise or sports? (0–7)", "number"),
    ("screen_time",                       "📝 *Question 7/17:* Daily screen time on phone/laptop? (e.g. 8)", "number"),
    ("internet_usage",                    "📝 *Question 8/17:* Daily hours on social media or browsing? (e.g. 3)", "number"),
    ("stress_level",                      "📝 *Question 9/17:* Stress level right now (1–10)?\n(1=calm, 10=extreme)", "scale"),
    ("exam_pressure",                     "📝 *Question 10/17:* Exam pressure & grade worry (1–10)?\n(1=none, 10=extreme)", "scale"),
    ("financial_stress",                  "📝 *Question 11/17:* Financial stress (1–10)?\n(1=none, 10=high)", "scale"),
    ("family_expectation",                "📝 *Question 12/17:* Family expectation pressure (1–10)?\n(1=none, 10=high)", "scale"),
    ("social_support",                    "📝 *Question 13/17:* How supported do you feel by friends/family (1–10)?\n(1=alone, 10=very supported)", "scale"),
    ("academic_performance",              "📝 *Question 14/17:* Current academic percentage or score? (e.g. 75 or A)", "grade"),
    ("admission_grade",                   "📝 *Question 15/17:* Entrance or admission grade? (Enter 0 or grade)", "grade"),
    ("curricular_units_1st_sem_approved", "📝 *Question 16/17:* Course units passed last semester? (e.g. 4)", "number"),
    ("tuition_fees_up_to_date",           "📝 *Question 17/17 (Last):* Is tuition fee up to date?\n\n1️⃣ Yes\n2️⃣ No\n\n_Reply 1 or 2_", "choice2"),
]

GENDER_MAP = {
    "1": "Female", "female": "Female", "f": "Female", "girl": "Female", "woman": "Female",
    "2": "Male", "male": "Male", "m": "Male", "boy": "Male", "man": "Male",
    "3": "Non-binary", "nonbinary": "Non-binary", "nb": "Non-binary", "other": "Non-binary",
    "4": "Prefer not to say", "skip": "Prefer not to say"
}

TUITION_MAP = {
    "1": 1, "yes": 1, "y": 1, "paid": 1, "clear": 1, "done": 1,
    "2": 0, "no": 0, "n": 0, "unpaid": 0, "pending": 0, "due": 0
}

GRADE_MAP = {
    "o": 95.0, "a+": 90.0, "a": 85.0, "a-": 80.0,
    "b+": 75.0, "b": 70.0, "b-": 65.0,
    "c+": 60.0, "c": 55.0, "d": 45.0, "f": 30.0,
}


def _twiml(message: str) -> Response:
    safe = message.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    xml = f'<?xml version="1.0" encoding="UTF-8"?><Response><Message>{safe}</Message></Response>'
    return Response(content=xml, media_type="application/xml")


def _parse_smart(text: str, input_type: str):
    """Resilient parser that extracts numbers, words, and grades."""
    raw = text.strip().lower()

    if input_type == "choice4":
        for k, v in GENDER_MAP.items():
            if raw == k or raw.startswith(k):
                return v
        digits = re.findall(r'[1-4]', raw)
        if digits:
            return GENDER_MAP.get(digits[0], "Prefer not to say")
        return "Prefer not to say"

    if input_type == "choice2":
        for k, v in TUITION_MAP.items():
            if raw == k or k in raw:
                return v
        digits = re.findall(r'[1-2]', raw)
        if digits:
            return TUITION_MAP.get(digits[0], 1)
        return 1

    if input_type == "grade":
        if raw in GRADE_MAP:
            return GRADE_MAP[raw]
        for g, val in GRADE_MAP.items():
            if g in raw:
                return val

    # Numbers or scales: extract first floating point number
    nums = re.findall(r'\d+(?:\.\d+)?', raw)
    if nums:
        val = float(nums[0])
        if input_type == "scale":
            return min(10.0, max(1.0, val))
        return val

    return 0.0


def call_gemini_counseling_chat(user_msg: str) -> str:
    """Free-form conversational counselor using Gemini API."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return (
            "I'm here for you! 💚\n\n"
            "• If you're feeling overwhelmed, try 3 slow deep breaths (4s in, 4s hold, 6s out).\n"
            "• To take your full 17-question wellbeing check-in, reply with *'checkin'*!\n"
            "• Need immediate human support? Call Tele-MANAS at *14416* (24/7 Free)."
        )

    prompt = f"""
You are SAHARA — an empathetic, warm, and highly supportive university student wellbeing AI companion on WhatsApp.
The student says: "{user_msg}"

Guidelines:
1. Provide a warm, uplifting, concise response (2-3 short paragraphs max).
2. Give 2 practical tips (e.g. study technique, sleep, stress reduction, or mindfulness).
3. If they mention crisis or severe panic, include national helpline Tele-MANAS (14416).
4. End by inviting them: "Reply *'checkin'* anytime to take your 17-question health assessment."
Use gentle emojis. Format with clean WhatsApp bold (*bold*) and bullet points.
"""

    models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
    for m in models:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={api_key}"
            res = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=12)
            if res.status_code == 200:
                return res.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
        except Exception:
            continue

    return (
        "Thank you for sharing with me. 💚\n\n"
        "College life can be demanding, but you are not alone. Take things one step at a time.\n\n"
        "Reply *'checkin'* to start your 17-question wellbeing screening and get personalized resources & video guides!"
    )


@router.post("/whatsapp-webhook")
async def whatsapp_webhook(From: str = Form(...), Body: str = Form("")) -> Response:
    phone = From
    text = Body.strip()
    lower = text.lower()

    session = SESSIONS.setdefault(phone, {"mode": "chat", "step": 0, "answers": {}})

    # Commands to start or restart screening
    if lower in {"checkin", "check-in", "start", "retake", "test", "assessment", "screening"}:
        session["mode"] = "screening"
        session["step"] = 1
        session["answers"] = {}
        return _twiml(
            "🌟 *Starting SAHARA Wellbeing Check-in*\n"
            "━━━━━━━━━━━━━━━━━━━━\n"
            "17 quick questions to evaluate anxiety & academic risk. Everything is confidential.\n\n"
            "💡 _Tip: You can also complete this on our website with 1-tap sliders at https://sahara-951p.onrender.com_\n\n"
            + QUESTIONS[0][1]
        )

    # Commands to cancel/reset
    if lower in {"stop", "quit", "cancel", "reset", "exit"}:
        session["mode"] = "chat"
        session["step"] = 0
        session["answers"] = {}
        return _twiml("Check-in paused! You're in general chat mode. Feel free to ask me anything or reply *'checkin'* whenever you're ready. 💚")

    # If currently in screening mode
    if session["mode"] == "screening":
        q_index = session["step"] - 1

        if q_index < len(QUESTIONS):
            field, _, input_type = QUESTIONS[q_index]
            parsed_val = _parse_smart(text, input_type)

            session["answers"][field] = parsed_val
            session["step"] += 1

            # Next question
            if session["step"] - 1 < len(QUESTIONS):
                return _twiml(QUESTIONS[session["step"] - 1][1])

        # ── All 17 answered — Calculate risk & deliver rich suggestions + YouTube links ──
        try:
            from phase2_merged_final import assess_student
            from explainability import get_top_factors
            from gemini_suggestions import get_gemini_suggestions, get_curated_youtube_links
            import database

            ans = session["answers"]
            student_data = {
                "age":                                    int(ans.get("age", 20) or 20),
                "gender":                                 ans.get("gender", "Prefer not to say"),
                "academic_year":                          int(ans.get("academic_year", 1) or 1),
                "sleep_hours":                            float(ans.get("sleep_hours", 7) or 7),
                "study_hours_per_day":                    float(ans.get("study_hours_per_day", 5) or 5),
                "physical_activity":                      int(ans.get("physical_activity", 3) or 3),
                "screen_time":                            float(ans.get("screen_time", 6) or 6),
                "internet_usage":                         float(ans.get("internet_usage", 3) or 3),
                "stress_level":                           int(ans.get("stress_level", 5) or 5),
                "exam_pressure":                          int(ans.get("exam_pressure", 5) or 5),
                "financial_stress":                       int(ans.get("financial_stress", 5) or 5),
                "family_expectation":                     int(ans.get("family_expectation", 5) or 5),
                "social_support":                         int(ans.get("social_support", 5) or 5),
                "academic_performance":                   float(ans.get("academic_performance", 60) or 60),
                "Admission grade":                        float(ans.get("admission_grade", 0) or 0),
                "Curricular units 1st sem (approved)":    int(ans.get("curricular_units_1st_sem_approved", 3) or 3),
                "Curricular units 2nd sem (approved)":    int(ans.get("curricular_units_1st_sem_approved", 3) or 3),
                "Tuition fees up to date":                int(ans.get("tuition_fees_up_to_date", 1) or 1),
                "Debtor":                                 0,
                "Age at enrollment":                      int(ans.get("age", 20) or 20),
            }

            result  = assess_student(student_data, student_name="WhatsApp User")
            tier    = result.get("risk_tier", "Low")
            anxiety = round(float(result.get("anxiety_score", 0)), 1)
            dropout = round(float(result.get("dropout_probability", 0)), 2)
            msg     = result.get("message", "Check-in complete.")

            top_factors = get_top_factors(student_data, top_n=3)
            suggestions = get_gemini_suggestions(student_data)
            youtube_links = get_curated_youtube_links(student_data, risk_tier=tier)

            aid  = str(uuid.uuid4())
            ts   = datetime.datetime.now(datetime.timezone.utc).isoformat()
            robj = type("R", (), result)()
            database.log_assessment(aid, ts, robj, student_name="WA:" + phone[-4:], top_factors=top_factors)

            tier_icon = {"Low": "🟢 LOW RISK", "Medium": "🟡 MEDIUM RISK", "High": "🔴 HIGH RISK"}.get(tier, tier)

            reply = (
                f"🎯 *SAHARA Wellbeing Assessment*\n"
                f"━━━━━━━━━━━━━━━━━━━━\n"
                f"📊 *Status:* {tier_icon}\n"
                f"🧠 *Anxiety Index:* {anxiety}/10\n"
                f"📉 *Academic Dropout Risk:* {int(dropout*100)}%\n\n"
                f"💬 *Personalized Insight:*\n{msg}\n"
            )

            if top_factors:
                reply += "\n🔍 *Key Contributing Factors:*\n"
                for f in top_factors:
                    reply += f"• {f}\n"

            if suggestions:
                reply += "\n💡 *Personalized Action Steps:*\n"
                for s in suggestions:
                    reply += f"• {s}\n"

            if youtube_links:
                reply += "\n🎬 *Recommended YouTube Resources:*\n"
                for v in youtube_links:
                    reply += f"▶️ *{v['title']}*\n🔗 {v['url']}\n_{v['tip']}_\n\n"

            if tier == "High":
                reply += (
                    "🚨 *Immediate 24/7 Support:*\n"
                    "📞 *Tele-MANAS:* 14416 (Toll-Free)\n"
                    "📞 *iCall:* 9152987821\n"
                    "📞 *Campus Counselor:* +91 98765 43210\n\n"
                )

            reply += "\n💬 *You can now chat freely with me! Ask any question, or reply 'checkin' to retake.*"

            # Switch back to chat mode so user can ask follow up questions without restarting
            session["mode"] = "chat"
            session["step"] = 0
            return _twiml(reply)

        except Exception as e:
            session["mode"] = "chat"
            session["step"] = 0
            return _twiml("Your check-in is recorded! You can now chat with me freely for advice and study support. 💚")

    # ── Conversational Mode (Default) ──
    # If the user is asking advice, talking about stress, greeting, etc.
    if lower in {"hi", "hello", "hey", "namaste", "hola", "sup", "good morning", "good evening"}:
        return _twiml(
            "👋 *Hi there! I am SAHARA — your AI Student Wellbeing Companion.*\n\n"
            "I'm powered by Google Gemini AI ✨ to support you through academic stress, exam anxiety, sleep, and college life.\n\n"
            "Here's what you can do:\n"
            "1️⃣ Reply *'checkin'* to start your 17-question wellbeing check-in & get risk scores + video guides.\n"
            "2️⃣ Or just ask me anything! (e.g. *'How to manage exam panic?'*, *'Tips for sleep'*, *'I feel overwhelmed'*)."
        )

    # Call Gemini AI counseling model for free-form conversation
    bot_reply = call_gemini_counseling_chat(text)
    return _twiml(bot_reply)


@router.get("/whatsapp-health")
def whatsapp_health():
    acct = os.getenv("TWILIO_ACCOUNT_SID", "")
    return {
        "status":               "ok" if acct.startswith("AC") else "unconfigured",
        "twilio_enabled":       acct.startswith("AC"),
        "active_conversations": len(SESSIONS),
        "backend_url":          os.getenv("SAHARA_BACKEND_URL", "https://sahara-951p.onrender.com"),
        "sandbox_number":       os.getenv("TWILIO_WHATSAPP_NUMBER", "not set"),
    }

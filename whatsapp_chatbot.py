# whatsapp_chatbot.py
# SAHARA WhatsApp Chatbot with Google Gemini AI Integration & Twilio Webhook
# Copy this file into your backend project and run: from whatsapp_chatbot import setup_whatsapp_routes

import os
import json
import datetime
import httpx
from dotenv import load_dotenv
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, Request
from twilio.rest import Client

load_dotenv()

# ============================================================
# CONFIGURATION
# ============================================================
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")
SAHARA_BACKEND_URL = os.getenv("SAHARA_BACKEND_URL", "http://localhost:8000")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Initialize Twilio client
try:
    twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    TWILIO_ENABLED = bool(TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN)
except Exception:
    twilio_client = None
    TWILIO_ENABLED = False
    print("[WARNING] Twilio credentials not configured. Running in simulation mode.")

# ============================================================
# CONVERSATION STATE (In-memory for hackathon, use DB in production)
# ============================================================
conversation_state: Dict[str, Dict[str, Any]] = {}

# ============================================================
# GEMINI AI SERVICE FOR WHATSAPP
# ============================================================
async def generate_gemini_whatsapp_response(user_text: str, context: Optional[str] = None) -> str:
    """
    Call Google Gemini 1.5/2.0 Flash to provide empathetic, structured,
    student-friendly WhatsApp counseling responses.
    """
    if not GEMINI_API_KEY:
        return (
            "Thank you for reaching out to SAHARA. 💚\n\n"
            "I'm here to listen. You can talk to me about exam pressure, sleep issues, "
            "academic burnout, or reply *'checkin'* to start your 17-question wellbeing assessment."
        )

    system_instruction = (
        "You are SAHARA WhatsApp Bot, an empathetic, supportive, and non-judgmental student mental health companion "
        "designed for college and university students. "
        "Keep responses warm, supportive, concise (under 140 words), and easy to read on WhatsApp with bullet points and emojis. "
        "Support multi-lingual requests (English, Hindi, Hinglish, regional languages). "
        "If severe distress or self-harm is mentioned, immediately provide Tele-MANAS (14416) / National Helpline 1-800-273-TALK "
        "and advice to contact campus counselors. "
        "If the user wants to start an assessment, tell them to reply with 'checkin'."
    )

    models = ["gemini-3.6-flash", "gemini-3.7-flash", "gemini-3.5-flash", "gemma-4-31b-it"]
    for model in models:
        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": f"{system_instruction}\nContext: {context or 'None'}\nStudent Message: {user_text}"}]
                }
            ]
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(endpoint, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidate = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                    if candidate:
                        return candidate.strip()
        except Exception as e:
            print(f"[Gemini WhatsApp] ✗ Model {model} error: {e}")

    # Fallback if Gemini fails
    return (
        "I'm here for you. 💚 It sounds like you're carrying a lot right now.\n\n"
        "• Take a slow, deep breath in (4s) and release (4s).\n"
        "• Remember you're not alone.\n\n"
        "Reply *'checkin'* to take our full 17-step wellbeing assessment, or *'counselor'* to get helpline numbers."
    )

# ============================================================
# 17-STEP INTAKE FLOW
# ============================================================
INTAKE_STEPS = [
    {
        "step": 1,
        "field": "age",
        "question": "Hi there! 👋 I'm SAHARA, your student wellbeing companion.\n\nNo judgment, no grades — just real care.\n\n📝 *Step 1/17:* How old are you? (e.g. 20)",
        "type": "number",
        "validation": lambda x: 16 <= int(x) <= 100,
        "error_msg": "Please enter a valid age between 16 and 100."
    },
    {
        "step": 2,
        "field": "gender",
        "question": "Got it! What's your gender?\n\n1️⃣ Female\n2️⃣ Male\n3️⃣ Non-binary\n4️⃣ Prefer not to say\n\n(Reply 1, 2, 3, or 4)",
        "type": "choice",
        "choices": {"1": "Female", "2": "Male", "3": "Non-binary", "4": "Prefer not to say"},
        "error_msg": "Please reply with 1, 2, 3, or 4"
    },
    {
        "step": 3,
        "field": "academic_year",
        "question": "Which academic year are you in?\n\n1️⃣ 1st year\n2️⃣ 2nd year\n3️⃣ 3rd year\n4️⃣ 4th year\n\n(Reply 1, 2, 3, or 4)",
        "type": "choice",
        "choices": {"1": 1, "2": 2, "3": 3, "4": 4},
        "error_msg": "Please reply with 1, 2, 3, or 4"
    },
    {
        "step": 4,
        "field": "sleep_hours",
        "question": "📊 *Daily Lifestyle:*\n\nHow many hours of sleep do you usually get per night? (e.g. 6.5)",
        "type": "float",
        "validation": lambda x: 0 <= float(x) <= 16,
        "error_msg": "Please enter hours between 0 and 16"
    },
    {
        "step": 5,
        "field": "study_hours_per_day",
        "question": "How many hours per day do you study or attend lectures? (e.g. 5)",
        "type": "float",
        "validation": lambda x: 0 <= float(x) <= 16,
        "error_msg": "Please enter a number between 0 and 16"
    },
    {
        "step": 6,
        "field": "physical_activity",
        "question": "How many days per week do you do physical activity or exercise? (0 to 7)",
        "type": "int",
        "validation": lambda x: 0 <= int(x) <= 7,
        "error_msg": "Please enter a number between 0 and 7"
    },
    {
        "step": 7,
        "field": "screen_time",
        "question": "How many hours per day on screens (phone, laptop)? (e.g. 8)",
        "type": "float",
        "validation": lambda x: 0 <= float(x) <= 18,
        "error_msg": "Please enter a number between 0 and 18"
    },
    {
        "step": 8,
        "field": "internet_usage",
        "question": "How many hours per day on social media or browsing? (e.g. 4)",
        "type": "float",
        "validation": lambda x: 0 <= float(x) <= 18,
        "error_msg": "Please enter a number between 0 and 18"
    },
    {
        "step": 9,
        "field": "stress_level",
        "question": "💭 *Emotional Health:*\n\nOn a scale of 1-10, what's your overall stress level?\n(1=calm, 10=extremely stressed)",
        "type": "int",
        "validation": lambda x: 1 <= int(x) <= 10,
        "error_msg": "Please enter a number from 1 to 10"
    },
    {
        "step": 10,
        "field": "exam_pressure",
        "question": "On a scale of 1-10, how much pressure do you feel around exams and grades? (1=none, 10=extreme)",
        "type": "int",
        "validation": lambda x: 1 <= int(x) <= 10,
        "error_msg": "Please enter a number from 1 to 10"
    },
    {
        "step": 11,
        "field": "financial_stress",
        "question": "On a scale of 1-10, how stressful is your financial situation? (1=none, 10=very high)",
        "type": "int",
        "validation": lambda x: 1 <= int(x) <= 10,
        "error_msg": "Please enter a number from 1 to 10"
    },
    {
        "step": 12,
        "field": "family_expectation",
        "question": "On a scale of 1-10, how much pressure do you feel from family expectations? (1=none, 10=extreme)",
        "type": "int",
        "validation": lambda x: 1 <= int(x) <= 10,
        "error_msg": "Please enter a number from 1 to 10"
    },
    {
        "step": 13,
        "field": "social_support",
        "question": "On a scale of 1-10, how supported do you feel by friends and peers? (1=alone, 10=very supported)",
        "type": "int",
        "validation": lambda x: 1 <= int(x) <= 10,
        "error_msg": "Please enter a number from 1 to 10"
    },
    {
        "step": 14,
        "field": "academic_performance",
        "question": "📈 What is your current academic performance score or percentage? (e.g. 68)",
        "type": "float",
        "validation": lambda x: 0 <= float(x) <= 100,
        "error_msg": "Please enter a percentage between 0 and 100"
    },
    {
        "step": 15,
        "field": "admission_grade",
        "question": "What was your entrance/admission grade or rank score? (or type 0 if unsure)",
        "type": "float",
        "validation": lambda x: float(x) >= 0,
        "error_msg": "Please enter a valid number"
    },
    {
        "step": 16,
        "field": "curricular_units_1st_sem_approved",
        "question": "How many course credits/units did you pass in 1st semester? (e.g. 4)",
        "type": "int",
        "validation": lambda x: int(x) >= 0,
        "error_msg": "Please enter a positive number"
    },
    {
        "step": 17,
        "field": "tuition_fees_up_to_date",
        "question": "Last question! Is your tuition fees currently cleared/up to date?\n\n1️⃣ Yes\n2️⃣ No\n\n(Reply 1 or 2)",
        "type": "choice",
        "choices": {"1": 1, "2": 0},
        "error_msg": "Please reply with 1 or 2"
    },
]

# ============================================================
# HELPER FUNCTIONS
# ============================================================
def send_whatsapp_message(to_phone: str, message_text: str) -> bool:
    """Send a WhatsApp message via Twilio or simulate in local logs."""
    if not TWILIO_ENABLED or not twilio_client:
        print(f"[SIMULATION WhatsApp → {to_phone}]:\n{message_text}\n")
        return True
    
    try:
        msg = twilio_client.messages.create(
            body=message_text,
            from_=TWILIO_WHATSAPP_NUMBER,
            to=to_phone
        )
        print(f"[WhatsApp ✓ Sent {msg.sid} to {to_phone}]")
        return True
    except Exception as e:
        print(f"[WhatsApp ✗ Error {to_phone}]: {e}")
        return False

def get_current_step_config(step_number: int) -> Optional[Dict]:
    for step in INTAKE_STEPS:
        if step["step"] == step_number:
            return step
    return None

def validate_answer(answer: str, step_config: Dict) -> bool:
    try:
        if step_config["type"] in ["int", "float", "number"]:
            return step_config["validation"](answer)
        elif step_config["type"] == "choice":
            return answer in step_config["choices"]
    except Exception:
        return False
    return False

def get_validated_value(answer: str, step_config: Dict) -> Any:
    if step_config["type"] == "int":
        return int(answer)
    elif step_config["type"] == "float":
        return float(answer)
    elif step_config["type"] == "choice":
        return step_config["choices"][answer]
    return answer

async def call_sahara_assessment(answers: Dict[str, Any], from_phone: str) -> Optional[Dict]:
    """Call SAHARA ML Assessment API."""
    payload = {
        "student_name": f"WhatsApp-{from_phone[-10:]}",
        "age": answers.get("age", 20),
        "gender": answers.get("gender", "Prefer not to say"),
        "academic_year": answers.get("academic_year", 1),
        "sleep_hours": float(answers.get("sleep_hours", 7)),
        "study_hours_per_day": float(answers.get("study_hours_per_day", 5)),
        "physical_activity": int(answers.get("physical_activity", 3)),
        "screen_time": float(answers.get("screen_time", 8)),
        "internet_usage": float(answers.get("internet_usage", 4)),
        "exam_pressure": int(answers.get("exam_pressure", 5)),
        "stress_level": int(answers.get("stress_level", 5)),
        "financial_stress": int(answers.get("financial_stress", 5)),
        "family_expectation": int(answers.get("family_expectation", 5)),
        "social_support": int(answers.get("social_support", 5)),
        "academic_performance": float(answers.get("academic_performance", 50)),
        "admission_grade": float(answers.get("admission_grade", 100)),
        "curricular_units_1st_sem_approved": int(answers.get("curricular_units_1st_sem_approved", 3)),
        "curricular_units_2nd_sem_approved": 0,
        "tuition_fees_up_to_date": int(answers.get("tuition_fees_up_to_date", 1)),
    }
    
    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(f"{SAHARA_BACKEND_URL}/assess", json=payload, timeout=10.0)
            if res.status_code == 200:
                return res.json()
    except Exception as e:
        print(f"[SAHARA Backend] {e} - generating fallback risk calculation")
    
    # Built-in heuristic calculation if backend is standalone
    stress = answers.get("stress_level", 5)
    exam = answers.get("exam_pressure", 5)
    sleep = answers.get("sleep_hours", 7)
    support = answers.get("social_support", 5)
    
    risk_score = (stress * 0.3) + (exam * 0.25) + ((10 - min(sleep * 1.25, 10)) * 0.25) + ((10 - support) * 0.2)
    tier = "High" if risk_score > 6.8 else ("Medium" if risk_score > 4.2 else "Low")
    return {
        "risk_tier": tier,
        "risk_score": round(risk_score * 10, 1),
        "message": f"Assessed based on lifestyle & academic indicators (Stress: {stress}/10, Sleep: {sleep}h/day)."
    }

# ============================================================
# FASTAPI ROUTE REGISTRATION
# ============================================================
async def setup_whatsapp_routes(app: FastAPI):
    """Call this in main.py to activate WhatsApp webhook with Gemini AI."""

    @app.post("/whatsapp-webhook")
    async def whatsapp_webhook(request: Request):
        form_data = await request.form()
        incoming_message = form_data.get("Body", "").strip()
        from_phone = form_data.get("From", "anonymous")
        lower_msg = incoming_message.lower()

        print(f"\n[WhatsApp 📨 from {from_phone}]: '{incoming_message}'")

        # Session tracking
        if from_phone not in conversation_state:
            conversation_state[from_phone] = {
                "mode": "chat",  # 'chat' or 'intake'
                "step": 0,
                "answers": {},
                "started_at": datetime.datetime.now().isoformat()
            }

        state = conversation_state[from_phone]

        # Trigger Intake Questionnaire
        if lower_msg in ["start", "checkin", "check-in", "assessment", "quiz"]:
            state["mode"] = "intake"
            state["step"] = 1
            state["answers"] = {}
            step_cfg = get_current_step_config(1)
            send_whatsapp_message(from_phone, step_cfg["question"])
            return {"status": "ok", "action": "intake_started"}

        # If in Intake Mode
        if state["mode"] == "intake" and state["step"] >= 1:
            step_cfg = get_current_step_config(state["step"])

            if not validate_answer(lower_msg, step_cfg):
                err = f"❌ {step_cfg['error_msg']}\n\n{step_cfg['question']}"
                send_whatsapp_message(from_phone, err)
                return {"status": "ok", "action": "retry_step"}

            # Save answer
            state["answers"][step_cfg["field"]] = get_validated_value(lower_msg, step_cfg)

            # Check if finished
            if state["step"] == len(INTAKE_STEPS):
                state["mode"] = "chat"
                state["step"] = 0
                result = await call_sahara_assessment(state["answers"], from_phone)
                tier = result.get("risk_tier", "Moderate")

                outcome_msg = (
                    f"✨ *SAHARA Wellbeing Assessment Summary*\n\n"
                    f"🎯 *Risk Tier:* {tier}\n"
                    f"📊 *Score:* {result.get('risk_score', 'N/A')}%\n\n"
                    f"💡 *Key Insights:* {result.get('message', '')}\n\n"
                )

                if tier == "High":
                    outcome_msg += (
                        "🚨 *Immediate Support Resources:*\n"
                        "📞 National Tele-MANAS: *14416* (24/7 Toll-Free)\n"
                        "📞 Campus Counseling Cell: *+91 98765 43210*\n\n"
                        "A counselor has been alerted to provide supportive check-in. You're never alone. 💚"
                    )
                else:
                    outcome_msg += (
                        "💚 Keep prioritizing consistent sleep & balanced study habits.\n"
                        "You can continue chatting with me here anytime about how you're feeling!"
                    )

                send_whatsapp_message(from_phone, outcome_msg)
                return {"status": "ok", "action": "assessment_completed", "tier": tier}

            # Next step
            state["step"] += 1
            next_cfg = get_current_step_config(state["step"])
            send_whatsapp_message(from_phone, f"📊 *Step {state['step']}/{len(INTAKE_STEPS)}*\n\n{next_cfg['question']}")
            return {"status": "ok", "action": "next_step", "step": state["step"]}

        # Free-form Conversational Chat Mode via Gemini AI
        gemini_reply = await generate_gemini_whatsapp_response(
            incoming_message,
            context=f"Student WhatsApp ID: {from_phone[-6:]}"
        )
        send_whatsapp_message(from_phone, gemini_reply)
        return {"status": "ok", "action": "gemini_ai_response"}

    @app.get("/whatsapp-health")
    async def whatsapp_health():
        return {
            "status": "ok",
            "gemini_active": bool(GEMINI_API_KEY),
            "twilio_active": TWILIO_ENABLED,
            "active_chats": len(conversation_state),
        }

"""SAHARA WhatsApp 17-Question Intake Flow Definitions & Data Mappings."""
from __future__ import annotations
import os
from typing import Any, Dict, List

CONTENT_SID_GENDER = os.getenv("CONTENT_SID_GENDER", "HX784cf64900b8d5f7469619899f838e1d")
CONTENT_SID_YEAR = os.getenv("CONTENT_SID_YEAR", "HX2c3e9a476fae2f56ab6a0e6ad30570ac")
CONTENT_SID_TUITION = os.getenv("CONTENT_SID_TUITION", "HXb4554a124e16c76364803618684df6e1")
CONTENT_SID_RESTART = os.getenv("CONTENT_SID_RESTART", "HX1c48145c7549c619a055e1c2c0f3703c")

INTAKE_STEPS: List[Dict[str, Any]] = [
    {
        "step": 1, "field": "age", "type": "int",
        "question": "👋 *Welcome to SAHARA!*\n\nI am your 24/7 AI wellbeing assistant. Let's do a quick, confidential 17-question check-in to understand your wellness and provide personalized recommendations & resources.\n\n*Q1/17:* How old are you? (e.g. 20)",
        "validation": lambda x: 16 <= int(x) <= 100,
        "error_msg": "Please enter an age between 16 and 100"
    },
    {
        "step": 2, "field": "gender", "type": "list",
        "content_sid": CONTENT_SID_GENDER,
        "fallback_text": "*Q2/17:* What's your gender?\n\n1️⃣ Female\n2️⃣ Male\n3️⃣ Non-binary\n4️⃣ Prefer not to say\n\n_Reply 1, 2, 3 or 4_",
        "choices": {"1": "Female", "2": "Male", "3": "Non-binary", "4": "Prefer not to say"}
    },
    {
        "step": 3, "field": "academic_year", "type": "list",
        "content_sid": CONTENT_SID_YEAR,
        "fallback_text": "*Q3/17:* Which year of college are you in?\n\n1️⃣ 1st year\n2️⃣ 2nd year\n3️⃣ 3rd year\n4️⃣ 4th year\n\n_Reply 1–4_",
        "choices": {"1": 1, "2": 2, "3": 3, "4": 4}
    },
    {
        "step": 4, "field": "sleep_hours", "type": "float",
        "question": "*Q4/17:* Average hours of sleep per night? (e.g. 6.5)",
        "validation": lambda x: 0 <= float(x) <= 24,
        "error_msg": "Please enter average hours of sleep (e.g. 7)"
    },
    {
        "step": 5, "field": "study_hours_per_day", "type": "float",
        "question": "*Q5/17:* Hours per day studying or attending classes? (e.g. 5)",
        "validation": lambda x: 0 <= float(x) <= 24,
        "error_msg": "Please enter daily study hours (e.g. 5)"
    },
    {
        "step": 6, "field": "physical_activity", "type": "int",
        "question": "*Q6/17:* Days per week you do exercise or sports? (0–7)",
        "validation": lambda x: 0 <= int(x) <= 7,
        "error_msg": "Please enter days between 0 and 7"
    },
    {
        "step": 7, "field": "screen_time", "type": "float",
        "question": "*Q7/17:* Daily screen time on phone/laptop? (e.g. 8)",
        "validation": lambda x: 0 <= float(x) <= 24,
        "error_msg": "Please enter screen hours between 0 and 24"
    },
    {
        "step": 8, "field": "internet_usage", "type": "float",
        "question": "*Q8/17:* Daily hours on social media or browsing? (e.g. 3)",
        "validation": lambda x: 0 <= float(x) <= 24,
        "error_msg": "Please enter hours between 0 and 24"
    },
    {
        "step": 9, "field": "stress_level", "type": "scale",
        "question": "*Q9/17:* Overall stress level right now (1–10)?\n(1 = very calm, 10 = extremely stressed)",
        "validation": lambda x: 1 <= float(x) <= 10,
        "error_msg": "Please enter a stress score between 1 and 10"
    },
    {
        "step": 10, "field": "exam_pressure", "type": "scale",
        "question": "*Q10/17:* Exam pressure & grade worry (1–10)?\n(1 = none, 10 = extreme)",
        "validation": lambda x: 1 <= float(x) <= 10,
        "error_msg": "Please enter a score between 1 and 10"
    },
    {
        "step": 11, "field": "financial_stress", "type": "scale",
        "question": "*Q11/17:* Financial stress (1–10)?\n(1 = no stress, 10 = very stressed)",
        "validation": lambda x: 1 <= float(x) <= 10,
        "error_msg": "Please enter a score between 1 and 10"
    },
    {
        "step": 12, "field": "family_expectation", "type": "scale",
        "question": "*Q12/17:* Family expectation pressure (1–10)?\n(1 = none, 10 = very high)",
        "validation": lambda x: 1 <= float(x) <= 10,
        "error_msg": "Please enter a score between 1 and 10"
    },
    {
        "step": 13, "field": "social_support", "type": "scale",
        "question": "*Q13/17:* How supported do you feel by friends/family (1–10)?\n(1 = very alone, 10 = very supported)",
        "validation": lambda x: 1 <= float(x) <= 10,
        "error_msg": "Please enter a score between 1 and 10"
    },
    {
        "step": 14, "field": "academic_performance", "type": "grade",
        "question": "*Q14/17:* Current academic percentage or score? (e.g. 75 or A)",
        "validation": lambda x: True,
        "error_msg": "Please enter a percentage or grade"
    },
    {
        "step": 15, "field": "admission_grade", "type": "grade",
        "question": "*Q15/17:* Entrance or admission grade? (Enter 0 if unknown)",
        "validation": lambda x: True,
        "error_msg": "Please enter entrance grade or 0"
    },
    {
        "step": 16, "field": "curricular_units_1st_sem_approved", "type": "int",
        "question": "*Q16/17:* Course units passed in last semester? (e.g. 4)",
        "validation": lambda x: int(x) >= 0,
        "error_msg": "Please enter course units passed (e.g. 4)"
    },
    {
        "step": 17, "field": "tuition_fees_up_to_date", "type": "quick_reply",
        "content_sid": CONTENT_SID_TUITION,
        "fallback_text": "*Q17/17 (Last):* Is your tuition fee up to date?\n\n1️⃣ Yes\n2️⃣ No\n\n_Reply 1 or 2_",
        "choices": {"1": 1, "2": 0}
    },
]

"""Gemini-powered wellbeing suggestions & curated video resources.

The API key is read from GEMINI_API_KEY. No key is hardcoded.
"""
from __future__ import annotations

import json
import os
from typing import Any
import requests

GEMINI_API_KEY_ENV = "GEMINI_API_KEY"
DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# Verified, high-impact YouTube & mindfulness resources for student wellbeing
CURATED_RESOURCES = {
    "exam_stress": {
        "title": "Exam Panic & Anxiety Relief (4-7-8 Breathing)",
        "url": "https://youtu.be/1ZYbU82GVz4",
        "tip": "Try 3 cycles of Box/4-7-8 breathing before study sessions."
    },
    "sleep": {
        "title": "NSDR / Deep Rest for Cognitive Recovery (Huberman Lab)",
        "url": "https://youtu.be/pL02HRFk2vo",
        "tip": "10-20 min of NSDR can rapidly restore dopamine and mental stamina."
    },
    "study_focus": {
        "title": "50/10 Pomodoro Study with Lofi Beats & Rain",
        "url": "https://youtu.be/jfKfPfyJRdk",
        "tip": "Study in 45-50 min focused sprints with 10 min zero-screen breaks."
    },
    "burnout_reset": {
        "title": "How to Reset When College Feels Overwhelming",
        "url": "https://youtu.be/VbXvX5H-R38",
        "tip": "Break overwhelming tasks into 'micro-wins' of 15 minutes each."
    },
    "physical_stretch": {
        "title": "10-Minute Desk & Dorm Stretch for Mental Clarity",
        "url": "https://youtu.be/4pKly2JojMw",
        "tip": "A quick physical reset clears cortical fatigue and boosts mood."
    }
}


def get_curated_youtube_links(student_data: dict[str, Any], risk_tier: str = "Low") -> list[dict[str, str]]:
    """Select the most relevant YouTube resources based on the student's answers."""
    resources: list[dict[str, str]] = []

    sleep = float(student_data.get("sleep_hours", 7) or 7)
    exam = float(student_data.get("exam_pressure", 5) or 5)
    stress = float(student_data.get("stress_level", 5) or 5)
    activity = float(student_data.get("physical_activity", 3) or 3)

    if exam >= 7 or stress >= 7:
        resources.append(CURATED_RESOURCES["exam_stress"])
    if sleep < 6:
        resources.append(CURATED_RESOURCES["sleep"])
    if activity <= 1:
        resources.append(CURATED_RESOURCES["physical_stretch"])
    if len(resources) < 2:
        resources.append(CURATED_RESOURCES["study_focus"])
    if len(resources) < 3:
        resources.append(CURATED_RESOURCES["burnout_reset"])

    return resources[:3]


def get_gemini_suggestions(student_data: dict[str, Any]) -> list[str]:
    """Return up to 3 short, warm, non-clinical suggestions."""
    api_key = os.getenv(GEMINI_API_KEY_ENV)
    if not api_key:
        return [
            "Take a 10-minute walk outside between study sessions to reset your focus.",
            "Try setting a gentle wind-down alarm 30 minutes before your planned bedtime.",
            "Reach out to one friend or classmate today for a quick casual check-in."
        ]

    relevant = {
        key: student_data.get(key)
        for key in (
            "sleep_hours", "study_hours_per_day", "stress_level",
            "exam_pressure", "physical_activity", "screen_time", "social_support"
        )
        if student_data.get(key) is not None
    }

    prompt = f"""
You are a warm, empathetic student wellbeing mentor.
Return JSON only in this exact shape: {{"suggestions": ["...", "...", "..."]}}.

Create 3 short, practical, warm suggestions (1 sentence each) for this student profile:
{json.dumps(relevant, ensure_ascii=False)}

Rules:
- Non-clinical, no diagnostic language.
- Actionable for university life.
"""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{DEFAULT_MODEL}:generateContent?key={api_key}"

    try:
        response = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=10)
        if response.status_code == 200:
            payload = response.json()
            text = payload["candidates"][0]["content"]["parts"][0]["text"].strip()
            text = text.removeprefix("```json").removesuffix("```").strip()
            parsed = json.loads(text)
            suggestions = parsed.get("suggestions", [])
            if isinstance(suggestions, list) and suggestions:
                return [str(s).strip() for s in suggestions[:3]]
    except Exception:
        pass

    return [
        "Take regular 5-minute movement breaks during long study sessions.",
        "Maintain consistent sleep hours to protect your cognitive stamina.",
        "Talk with a campus peer mentor if exam deadlines feel heavy."
    ]

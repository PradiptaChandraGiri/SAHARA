"""Gemini-powered low-tier wellbeing suggestions.

The API key is read only from GEMINI_API_KEY. No key is hardcoded.
"""
from __future__ import annotations

import json
import os
from typing import Any

import requests


GEMINI_API_KEY_ENV = "GEMINI_API_KEY"
DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")


def get_gemini_suggestions(student_data: dict[str, Any]) -> list[str]:
    """Return exactly up to 3 short, warm, non-clinical suggestions.

    If Gemini is unavailable or no key is configured, return [] so the main
    assessment flow can continue rather than failing.
    """
    api_key = os.getenv(GEMINI_API_KEY_ENV)
    if not api_key:
        return []

    relevant = {
        key: student_data.get(key)
        for key in (
            "sleep_hours",
            "sleep_hours_per_day",
            "study_hours_per_day",
            "stress_level",
            "exam_pressure",
            "physical_activity_days",
            "physical_activity_days_per_week",
            "screen_time",
            "social_support",
        )
        if student_data.get(key) is not None
    }

    prompt = f"""
You are a wellbeing-support assistant for university students.
Return JSON only in this exact shape: {{"suggestions": ["...", "...", "..."]}}.

Create 3 short, practical, warm, non-clinical suggestions based only on:
{json.dumps(relevant, ensure_ascii=False)}

Rules:
- Never diagnose or mention a disorder.
- Do not give medication or medical treatment advice.
- No fear, guilt, shame, or pressure.
- Each suggestion should be one sentence.
- Prefer small actions involving study habits, rest, breaks, movement, or social support.
"""

    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{DEFAULT_MODEL}:generateContent?key={api_key}"
    )

    try:
        response = requests.post(
            url,
            json={"contents": [{"parts": [{"text": prompt}]}]},
            timeout=20,
        )
        response.raise_for_status()
        payload = response.json()
        text = payload["candidates"][0]["content"]["parts"][0]["text"].strip()
        text = text.removeprefix("```json").removesuffix("```").strip()
        parsed = json.loads(text)
        suggestions = parsed.get("suggestions", [])
        if not isinstance(suggestions, list):
            return []
        return [str(item).strip() for item in suggestions[:3] if str(item).strip()]
    except (requests.RequestException, KeyError, IndexError, TypeError, json.JSONDecodeError):
        return []

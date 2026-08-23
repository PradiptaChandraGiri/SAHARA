"""SAHARA Explainability & Contributing Factor Analysis Module.

Identifies the top N contributing risk drivers from intake attributes using domain-weighted
feature deviation analysis.
"""
from __future__ import annotations
from typing import Any, Dict, List

FACTOR_LABELS: Dict[str, str] = {
    "sleep_hours": "Low sleep hours",
    "stress_level": "High stress level",
    "financial_stress": "High financial stress",
    "family_expectation": "High family expectation pressure",
    "social_support": "Low social support",
    "curricular_units_1st_sem_approved": "Low units passed this semester",
    "tuition_fees_up_to_date": "Tuition not up to date",
    "academic_performance": "Declining academic performance",
    "screen_time": "High screen time",
    "exam_pressure": "High exam pressure",
    "physical_activity": "Low physical activity",
    "study_hours_per_day": "Extreme study hours",
}


def _get_float(data: dict[str, Any], *keys: str) -> float | None:
    for k in keys:
        if k in data and data[k] is not None:
            try:
                return float(data[k])
            except (ValueError, TypeError):
                pass
    return None


def get_top_factors(student_data: dict[str, Any], top_n: int = 3) -> List[str]:
    """Compute top contributing risk factors ranked by severity.

    Args:
        student_data: Standardized intake dictionary.
        top_n: Maximum number of top factors to return.

    Returns:
        List of human-readable factor descriptions.
    """
    candidates: List[tuple[float, str]] = []

    # Sleep hours (< 6 hours)
    sleep = _get_float(student_data, "sleep_hours", "sleep_hours_per_day")
    if sleep is not None and sleep < 6:
        severity = (6.0 - sleep) * 1.5
        candidates.append((severity, FACTOR_LABELS["sleep_hours"]))

    # Stress level (>= 7)
    stress = _get_float(student_data, "stress_level")
    if stress is not None and stress >= 7:
        severity = (stress - 6.0) * 1.2
        candidates.append((severity, FACTOR_LABELS["stress_level"]))

    # Exam pressure (>= 7)
    exam = _get_float(student_data, "exam_pressure")
    if exam is not None and exam >= 7:
        severity = (exam - 6.0) * 1.1
        candidates.append((severity, FACTOR_LABELS["exam_pressure"]))

    # Financial stress (>= 7)
    financial = _get_float(student_data, "financial_stress")
    if financial is not None and financial >= 7:
        severity = (financial - 6.0) * 1.3
        candidates.append((severity, FACTOR_LABELS["financial_stress"]))

    # Family expectation pressure (>= 7)
    family = _get_float(student_data, "family_expectation", "family_expectations")
    if family is not None and family >= 7:
        severity = (family - 6.0) * 1.0
        candidates.append((severity, FACTOR_LABELS["family_expectation"]))

    # Social support (<= 3)
    support = _get_float(student_data, "social_support")
    if support is not None and support <= 3:
        severity = (4.0 - support) * 1.2
        candidates.append((severity, FACTOR_LABELS["social_support"]))

    # Academic performance (< 50)
    perf = _get_float(student_data, "academic_performance")
    if perf is not None and perf < 50:
        severity = (50.0 - perf) / 10.0
        candidates.append((severity, FACTOR_LABELS["academic_performance"]))

    # Screen time (>= 8 hours)
    screen = _get_float(student_data, "screen_time")
    if screen is not None and screen >= 8:
        severity = (screen - 7.0) * 0.8
        candidates.append((severity, FACTOR_LABELS["screen_time"]))

    # Physical activity (<= 1 day/week)
    phys = _get_float(student_data, "physical_activity", "physical_activity_days")
    if phys is not None and phys <= 1:
        severity = (2.0 - phys) * 0.7
        candidates.append((severity, FACTOR_LABELS["physical_activity"]))

    # Tuition fees not up to date
    tuition = _get_float(student_data, "Tuition fees up to date", "tuition_fees_up_to_date")
    if tuition is not None and tuition == 0:
        candidates.append((2.0, FACTOR_LABELS["tuition_fees_up_to_date"]))

    # Approved units in 1st semester (< 3)
    units = _get_float(student_data, "Curricular units 1st sem (approved)", "curricular_units_1st_sem_approved")
    if units is not None and units < 3:
        candidates.append(((3.0 - units) * 0.8, FACTOR_LABELS["curricular_units_1st_sem_approved"]))

    candidates.sort(key=lambda item: item[0], reverse=True)
    return [label for _, label in candidates[:top_n]]

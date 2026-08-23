"""SAHARA Risk Inference Engine.

Combines Random Forest Regression for Student Anxiety with Random Forest Classification
for Academic Dropout Risk into a unified, fused early-warning score.

Design Decisions:
- Weighting: 50% Anxiety Score + 50% Dropout Probability.
  Rationale: Balanced emphasis between immediate psychological distress (anxiety)
  and institutional academic vulnerability (dropout probability).
- Risk Tiers:
  - Low (< 0.33): Self-directed wellbeing resources and academic tips.
  - Medium (0.33 - 0.66): Proactive gentle check-in and peer support.
  - High (> 0.66): Immediate counselor alert and 24/7 crisis helpline routing.
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Dict

import joblib
import pandas as pd

# ------------------------------------------------------------
# 1. Model Loading with Dynamic Path Resolution
# ------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"


def _load_asset(filename: str):
    """Attempt loading asset from models/ directory, falling back to backend root."""
    target = MODELS_DIR / filename
    if not target.exists():
        target = BASE_DIR / filename
    return joblib.load(str(target))


anxiety_model = _load_asset("final_anxiety_model.pkl")
dropout_model = _load_asset("final_dropout_model.pkl")
dropout_label_encoder = _load_asset("dropout_label_encoder.pkl")

DROPOUT_CLASSES = list(dropout_label_encoder.classes_)
ANXIETY_COLUMNS = _load_asset("anxiety_columns.pkl")
DROPOUT_COLUMNS = _load_asset("dropout_columns.pkl")


# ------------------------------------------------------------
# 2. Anxiety Prediction
# ------------------------------------------------------------
def predict_anxiety(student_dict: Dict[str, Any], model=anxiety_model, reference_columns=ANXIETY_COLUMNS) -> float:
    """Predict anxiety score (0-10) using Random Forest Regression.

    Args:
        student_dict: Dictionary containing demographic and lifestyle metrics.
        model: Trained scikit-learn regression model.
        reference_columns: Exact one-hot column list from model training.

    Returns:
        Predicted anxiety score clamped between 0.0 and 10.0.
    """
    new_df = pd.DataFrame([student_dict])
    cat_cols_present = [c for c in ["gender", "academic_year"] if c in new_df.columns]
    if cat_cols_present:
        new_df = pd.get_dummies(new_df, columns=cat_cols_present, drop_first=False)

    new_df_reindexed = new_df.reindex(columns=reference_columns, fill_value=0)
    raw_prediction = model.predict(new_df_reindexed)[0]
    return float(max(0.0, min(10.0, raw_prediction)))


def interpret_anxiety(score: float) -> str:
    """Classify numeric anxiety score into Low, Moderate, or High severity tiers."""
    if score < 3.5:
        return "Low"
    elif score <= 6.0:
        return "Moderate"
    else:
        return "High"


# ------------------------------------------------------------
# 3. Dropout Risk Prediction
# ------------------------------------------------------------
def predict_dropout_probability(
    student_dict: Dict[str, Any],
    model=dropout_model,
    encoder=dropout_label_encoder,
    reference_columns=DROPOUT_COLUMNS,
) -> tuple[float, str]:
    """Predict student academic dropout probability and predicted class.

    Args:
        student_dict: Dictionary containing UCI academic features.
        model: Trained Random Forest Classifier.
        encoder: LabelEncoder mapping Dropout, Enrolled, Graduate.
        reference_columns: Exact feature column list from model training.

    Returns:
        tuple (dropout_probability: float 0-1, predicted_label: str).
    """
    new_df = pd.DataFrame([student_dict])
    new_df_reindexed = new_df.reindex(columns=reference_columns, fill_value=0)
    predicted_numeric = model.predict(new_df_reindexed)[0]
    predicted_label = encoder.inverse_transform([predicted_numeric])[0]

    probabilities = model.predict_proba(new_df_reindexed)[0]
    dropout_idx = list(encoder.classes_).index("Dropout")
    dropout_prob = float(probabilities[dropout_idx])

    return dropout_prob, str(predicted_label)


# ------------------------------------------------------------
# 4. Risk Fusion and Intervention Routing
# ------------------------------------------------------------
def compute_combined_risk(
    anxiety_score: float,
    dropout_prob: float,
    anxiety_weight: float = 0.5,
    dropout_weight: float = 0.5,
) -> tuple[float, str]:
    """Compute fused multi-modal risk score and categorize into risk tiers.

    Formula: 0.5 * (anxiety_score / 10.0) + 0.5 * dropout_prob
    Thresholds: <0.33 -> Low, 0.33-0.66 -> Medium, >0.66 -> High.
    """
    normalized_anxiety = anxiety_score / 10.0
    combined_score = (anxiety_weight * normalized_anxiety) + (dropout_weight * dropout_prob)

    if combined_score < 0.33:
        risk_tier = "Low"
    elif combined_score <= 0.66:
        risk_tier = "Medium"
    else:
        risk_tier = "High"

    return float(combined_score), risk_tier


def route_intervention(
    risk_tier: str,
    anxiety_score: float,
    dropout_prob: float,
    student_name: str = "Student",
) -> dict[str, Any]:
    """Determine automated actionable intervention policy based on risk tier."""
    if risk_tier == "Low":
        action = "show_suggestions"
        message = (
            f"Great job, {student_name}! Your wellbeing indicators look healthy. "
            "Explore our study tips and focus tools to keep momentum."
        )
        counselor_alert = False
        next_step = "Self-care guidelines provided"
    elif risk_tier == "Medium":
        action = "gentle_checkin"
        message = (
            f"Hey {student_name}, we noticed some elevated stress factors. "
            "Consider trying our 5-minute breathing exercises or checking in with a peer mentor."
        )
        counselor_alert = False
        next_step = "Prompted peer support & mindfulness resources"
    else:
        action = "counselor_alert"
        message = (
            f"{student_name}, college can be overwhelming sometimes. "
            "A campus counselor has been flagged to offer supportive guidance, and 24/7 helplines are available."
        )
        counselor_alert = True
        next_step = "Counselor alerted; national crisis resources displayed"

    return {
        "action": action,
        "message": message,
        "counselor_alert": counselor_alert,
        "next_step": next_step,
    }


def assess_student(student_dict: Dict[str, Any], student_name: str = "Student") -> dict[str, Any]:
    """Execute complete end-to-end SAHARA assessment for a student."""
    anxiety_score = predict_anxiety(student_dict)
    anxiety_level = interpret_anxiety(anxiety_score)

    dropout_prob, predicted_class = predict_dropout_probability(student_dict)
    combined_score, risk_tier = compute_combined_risk(anxiety_score, dropout_prob)

    routing = route_intervention(risk_tier, anxiety_score, dropout_prob, student_name=student_name)

    return {
        "anxiety_score": round(anxiety_score, 2),
        "anxiety_level": anxiety_level,
        "dropout_probability": round(dropout_prob, 3),
        "dropout_predicted_class": predicted_class,
        "combined_score": round(combined_score, 3),
        "risk_tier": risk_tier,
        **routing,
    }

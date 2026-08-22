# ============================================================
# PHASE 2 (FINAL): MERGED RISK SCORE + INTERVENTION ROUTING
# ============================================================
# This merges your two models exactly as they were each built:
#   - Anxiety model: uses YOUR predict_anxiety() logic verbatim
#     (regression, get_dummies on gender/academic_year)
#   - Dropout model: uses the classifier from Phase 1/2
#     (already reindexes to the training columns directly)
#
# Requires, in the same folder:
#   final_anxiety_model.pkl
#   final_dropout_model.pkl
#   dropout_label_encoder.pkl
#
# Also requires the exact training column lists for both models —
# see Section 1, filled in from your two notebooks.
# ============================================================

import joblib
import pandas as pd

# ------------------------------------------------------------
# 1. LOAD MODELS + REFERENCE COLUMNS
# ------------------------------------------------------------
# WHAT'S HAPPENING: both models need to know the EXACT column
# order they were trained on, because a trained model doesn't
# store column names — it just expects "the same 14 numbers in
# the same order" every time. reindex(columns=..., fill_value=0)
# is what enforces that.
#
# ANXIETY_COLUMNS: paste the output of `X_train.columns.tolist()`
# from your anxiety notebook here — it will look something like
# ["age", "study_hours_per_day", ..., "gender_Male",
#  "gender_Other", "academic_year_2", "academic_year_3", ...]
# (exact one-hot names depend on which categories exist in your data)
#
# DROPOUT_COLUMNS: paste the output of `X_train.columns.tolist()`
# from your dropout notebook here (36 UCI feature names).

anxiety_model = joblib.load("final_anxiety_model.pkl")
dropout_model = joblib.load("final_dropout_model.pkl")
dropout_label_encoder = joblib.load("dropout_label_encoder.pkl")

DROPOUT_CLASSES = list(dropout_label_encoder.classes_)

ANXIETY_COLUMNS = joblib.load("anxiety_columns.pkl")
DROPOUT_COLUMNS = joblib.load("dropout_columns.pkl")


# ------------------------------------------------------------
# 2. ANXIETY PREDICTION — your exact function, unchanged
# ------------------------------------------------------------
# This is your predict_anxiety() function from the anxiety
# notebook, kept as-is so the model sees data prepared exactly
# the way it was trained.

def predict_anxiety(student_dict, model, reference_columns):
    new_df = pd.DataFrame([student_dict])
    cat_cols_present = [c for c in ["gender", "academic_year"] if c in new_df.columns]
    if cat_cols_present:
        new_df = pd.get_dummies(new_df, columns=cat_cols_present, drop_first=True)
    new_df = new_df.reindex(columns=reference_columns, fill_value=0)
    return model.predict(new_df)[0]


def interpret_anxiety(score):
    """Same thresholds as your original notebook."""
    if score < 3.5:
        return "Low"
    elif score < 6.0:
        return "Moderate"
    else:
        return "High"


# ------------------------------------------------------------
# 3. DROPOUT PREDICTION — from Phase 1/2
# ------------------------------------------------------------

def predict_dropout_probability(student_dict, model, reference_columns):
    """Returns the probability the model assigns to the 'Dropout' class."""
    new_df = pd.DataFrame([student_dict])
    new_df = new_df.reindex(columns=reference_columns, fill_value=0)
    probs = model.predict_proba(new_df)[0]
    dropout_index = DROPOUT_CLASSES.index("Dropout")
    return float(probs[dropout_index])


# ------------------------------------------------------------
# 4. COMBINE BOTH SIGNALS INTO ONE RISK SCORE
# ------------------------------------------------------------
# anxiety_score is 0-10 (your model's native scale).
# dropout_probability is 0-1.
# Both are normalized to 0-1 before combining, so neither one
# dominates just because of its scale.

ANXIETY_WEIGHT = 0.5
DROPOUT_WEIGHT = 0.5

def compute_combined_risk(anxiety_score: float, dropout_probability: float) -> dict:
    normalized_anxiety = anxiety_score / 10.0
    combined_score = (
        ANXIETY_WEIGHT * normalized_anxiety
        + DROPOUT_WEIGHT * dropout_probability
    )

    if combined_score < 0.33:
        tier = "Low"
    elif combined_score < 0.66:
        tier = "Medium"
    else:
        tier = "High"

    return {
        "anxiety_score": round(anxiety_score, 2),
        "anxiety_level": interpret_anxiety(anxiety_score),
        "dropout_probability": round(dropout_probability, 3),
        "combined_score": round(combined_score, 3),
        "risk_tier": tier,
    }


# ------------------------------------------------------------
# 5. INTERVENTION ROUTING
# ------------------------------------------------------------

def route_intervention(risk_tier: str, student_name: str = "Student") -> dict:
    if risk_tier == "Low":
        return {
            "action": "show_suggestions",
            "message": f"Hey {student_name}! Here are a few personalized tips to help you stay on track.",
            "counselor_alert": False,
            "next_step": "Call Gemini API for personalized suggestions (Phase 4)",
        }
    elif risk_tier == "Medium":
        return {
            "action": "gentle_checkin",
            "message": f"Hi {student_name}, just checking in — how are things going lately?",
            "counselor_alert": False,
            "next_step": "Prompt optional self check-in form",
        }
    else:
        return {
            "action": "counselor_alert",
            "message": f"We've noticed patterns suggesting {student_name} could use extra support. A counselor has been notified.",
            "counselor_alert": True,
            "next_step": "Send flagged student (anonymized ID + risk tier) to counselor dashboard",
        }


# ------------------------------------------------------------
# 6. END-TO-END ASSESSMENT
# ------------------------------------------------------------
# student_data should contain BOTH sets of fields in one dict —
# the anxiety-model fields (age, study_hours_per_day, gender, ...)
# AND the dropout-model fields (Admission grade, Debtor, ...).
# Each function below only pulls out what it needs via reindex,
# so extra fields from the other model are simply ignored.

def assess_student(student_data: dict, student_name: str = "Student") -> dict:
    anxiety_score = predict_anxiety(student_data, anxiety_model, ANXIETY_COLUMNS)
    dropout_prob = predict_dropout_probability(student_data, dropout_model, DROPOUT_COLUMNS)

    risk = compute_combined_risk(anxiety_score, dropout_prob)
    intervention = route_intervention(risk["risk_tier"], student_name)

    return {**risk, **intervention}


if __name__ == "__main__":
    example_student = {
        # anxiety-model fields (from your notebook's example_student)
        "age": 20, "study_hours_per_day": 5, "exam_pressure": 8,
        "academic_performance": 55, "stress_level": 8, "sleep_hours": 5,
        "physical_activity": 1, "social_support": 3, "screen_time": 7,
        "internet_usage": 6, "financial_stress": 7, "family_expectation": 8,
        "gender": "Female", "academic_year": 2,
        # dropout-model fields (subset — fill in the rest from your UCI columns)
        "Admission grade": 110.0, "Curricular units 1st sem (approved)": 2,
        "Curricular units 2nd sem (approved)": 1, "Tuition fees up to date": 0,
        "Debtor": 1, "Age at enrollment": 20,
    }

    result = assess_student(example_student, student_name="Test Student")

    print("\n=== SAHARA combined risk assessment ===")
    for key, value in result.items():
        print(f"{key}: {value}")

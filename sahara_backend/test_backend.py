import json
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

with open("sample_student.json", encoding="utf-8") as f:
    sample_payload = json.load(f)

def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert data["anxiety_model_loaded"] is True
    assert data["dropout_model_loaded"] is True
    assert "dropout_classes" in data

def test_assess_contract():
    r = client.post("/assess", json=sample_payload)
    assert r.status_code == 200
    data = r.json()
    required_fields = [
        "assessment_id", "timestamp", "anxiety_score", "anxiety_level",
        "dropout_probability", "combined_score", "risk_tier", "action",
        "message", "counselor_alert", "next_step", "top_factors", "suggestions"
    ]
    for field in required_fields:
        assert field in data
    assert data["risk_tier"] in {"Low", "Medium", "High"}
    assert isinstance(data["counselor_alert"], bool)

def test_validation_rules():
    # Invalid age (< 16)
    bad_payload = dict(sample_payload, age=12)
    r = client.post("/assess", json=bad_payload)
    assert r.status_code == 422

    # Invalid stress level (> 10)
    bad_payload2 = dict(sample_payload, stress_level=15)
    r = client.post("/assess", json=bad_payload2)
    assert r.status_code == 422

def test_counselor_endpoints():
    assessment = client.post("/assess", json=sample_payload).json()
    aid = assessment["assessment_id"]

    # List
    r = client.get("/assessments")
    assert r.status_code == 200
    res = r.json()
    assert "total" in res
    assert "assessments" in res
    assert any(row["assessment_id"] == aid for row in res["assessments"])

    # Detail
    r = client.get(f"/assessments/{aid}")
    assert r.status_code == 200
    assert r.json()["assessment_id"] == aid

    # Status update
    r = client.patch(f"/assessments/{aid}/status", json={"status": "Contacted", "notes": "Reached out via email"})
    assert r.status_code == 200
    assert r.json()["status"] == "Contacted"
    assert r.json()["notes"] == "Reached out via email"

def test_admin_stats():
    r = client.get("/admin/stats")
    assert r.status_code == 200
    data = r.json()
    assert "total_students" in data
    assert "by_tier" in data
    assert "by_tier_percent" in data
    assert "top_factors_institution_wide" in data

def test_whatsapp_health():
    r = client.get("/whatsapp-health")
    assert r.status_code == 200
    data = r.json()
    assert "status" in data
    assert "twilio_enabled" in data

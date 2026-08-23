import json
from pathlib import Path
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

TESTS_DIR = Path(__file__).resolve().parent / "tests"
if not TESTS_DIR.exists():
    TESTS_DIR = Path(__file__).resolve().parent

def _load_sample(name: str):
    p = TESTS_DIR / name
    if not p.exists():
        p = Path(__file__).resolve().parent / name
    with open(p, encoding="utf-8") as f:
        return json.load(f)

sample_low = _load_sample("sample_student_low.json")
sample_med = _load_sample("sample_student_medium.json")
sample_high = _load_sample("sample_student_high.json")

def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert data["anxiety_model_loaded"] is True
    assert data["dropout_model_loaded"] is True
    assert "dropout_classes" in data

def test_assess_low_tier():
    r = client.post("/assess", json=sample_low)
    assert r.status_code == 200
    data = r.json()
    assert data["risk_tier"] == "Low"
    assert data["counselor_alert"] is False
    assert "suggestions" in data

def test_assess_high_tier():
    r = client.post("/assess", json=sample_high)
    assert r.status_code == 200
    data = r.json()
    assert data["risk_tier"] == "High"
    assert data["counselor_alert"] is True
    assert len(data["top_factors"]) > 0

def test_validation_rules():
    bad_payload = dict(sample_low, age=12)
    r = client.post("/assess", json=bad_payload)
    assert r.status_code == 422

def test_counselor_endpoints():
    assessment = client.post("/assess", json=sample_med).json()
    aid = assessment["assessment_id"]

    r = client.get("/assessments")
    assert r.status_code == 200
    res = r.json()
    assert "total" in res
    assert any(row["assessment_id"] == aid for row in res["assessments"])

    r = client.patch(f"/assessments/{aid}/status", json={"status": "Contacted", "notes": "Followed up"})
    assert r.status_code == 200
    assert r.json()["status"] == "Contacted"

def test_admin_stats():
    r = client.get("/admin/stats")
    assert r.status_code == 200
    data = r.json()
    assert "total_students" in data
    assert "by_tier" in data

def test_whatsapp_health():
    r = client.get("/whatsapp-health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] in ("ok", "unconfigured")

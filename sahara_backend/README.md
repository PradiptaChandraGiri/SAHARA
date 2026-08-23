# SAHARA Backend Service

FastAPI machine learning inference service and WhatsApp webhook router.

---

## Folder Structure

```
sahara_backend/
├── main.py                  <- FastAPI app and all REST endpoints
├── requirements.txt         <- Python dependencies
├── models/                  <- Trained model weights (.pkl)
│   ├── final_anxiety_model.pkl
│   ├── final_dropout_model.pkl
│   ├── dropout_label_encoder.pkl
│   ├── anxiety_columns.pkl
│   └── dropout_columns.pkl
├── core/                    <- Machine Learning & explainability
│   ├── risk_engine.py       <- Dual-stream inference engine
│   └── explainability.py    <- Top risk factor attribution
├── whatsapp/                <- Twilio WhatsApp router & templates
│   ├── bot.py               <- Webhook handler & Gemini integration
│   ├── intake_flow.py       <- 17-question intake definitions
│   └── create_templates.py  <- Content API template generator
├── storage/                 <- Persistence layer
│   └── database.py          <- SQLite storage & anonymization
└── tests/                   <- Unit tests and sample fixtures
    ├── sample_student_low.json
    ├── sample_student_medium.json
    └── sample_student_high.json
```

---

## Local Execution

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run API server
uvicorn main:app --reload --port 8000
```

---

## Verification Tests

```bash
python test_backend.py
```

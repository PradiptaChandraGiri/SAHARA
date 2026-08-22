# SAHARA Backend

Integrated from the supplied SAHARA backend source and task list.

## Important note
The original project supplied `anxiety_columns.pkl` but did not supply the separate
`dropout_columns.pkl`. The dropout model reports 36 input features and the source
identifies these as the 36 UCI dropout features. Therefore this build creates
`dropout_columns.pkl` from that schema. Verify its ordering against the original
training notebook before production use.

## Run
```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Test
```bash
curl http://localhost:8000/health
curl -X POST http://localhost:8000/assess   -H "Content-Type: application/json"   --data @sample_student.json
```

## Environment
Set `GEMINI_API_KEY` to enable Low-tier suggestions. Without it, assessment still works.

## Endpoints
POST /assess
GET /health
GET /
GET /assessments?risk_tier=High
GET /assessments/{id}
PATCH /assessments/{id}/contacted
POST /whatsapp-webhook

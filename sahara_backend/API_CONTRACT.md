# SAHARA API Contract

This contract is based on the supplied `main.py`. Existing `/assess` fields are
kept unchanged; `top_factors` and `suggestions` are additive.

## Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/assess` | Run anxiety + dropout assessment |
| GET | `/health` | API/model health |
| GET | `/` | Service metadata |
| GET | `/assessments` | Counselor assessment history |
| GET | `/assessments/{id}` | One assessment |
| PATCH | `/assessments/{id}/contacted` | Mark counselor contact |
| POST | `/whatsapp-webhook` | Twilio WhatsApp webhook |

## POST /assess request

Required:
- `student_name: string`
- `age: integer`
- `study_hours_per_day: number`
- `exam_pressure: integer 0..10`
- `academic_performance: number`
- `stress_level: integer 0..10`
- `sleep_hours: number`
- `physical_activity: integer`
- `social_support: integer 0..10`
- `screen_time: number`
- `internet_usage: number`
- `financial_stress: integer 0..10`
- `family_expectation: integer 0..10`
- `gender: string`
- `academic_year: integer`

Optional:
- `admission_grade: number|null`
- `curricular_units_1st_sem_approved: integer|null`
- `curricular_units_2nd_sem_approved: integer|null`
- `tuition_fees_up_to_date: integer|null`
- `debtor: integer|null`
- `age_at_enrollment: integer|null`

## POST /assess response

Existing fields:
- `assessment_id: string`
- `timestamp: string`
- `anxiety_score: number`
- `anxiety_level: string`
- `dropout_probability: number`
- `combined_score: number`
- `risk_tier: string`
- `action: string`
- `message: string`
- `counselor_alert: boolean`
- `next_step: string`

Additive fields:
- `top_factors: string[]` — populated for Medium/High
- `suggestions: string[]` — populated for Low when Gemini is configured

## Example

Request: see `sample_student.json`.

Verified local output for the supplied sample included:
- `anxiety_score`: 6.27
- `anxiety_level`: High
- `dropout_probability`: 0.701
- `combined_score`: 0.664
- `risk_tier`: High
- `action`: counselor_alert
- `top_factors`: High exam pressure, High stress, High family pressure

The exact IDs/timestamps are generated per request.

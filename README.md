# SAHARA — Smart AI-driven Holistic Assessment & Response Assistant

SAHARA is an AI-driven student mental wellbeing and academic early-warning platform designed for universities and higher education institutions. By fusing dual-stream machine learning (psychological anxiety regression and academic dropout risk classification) with accessible multi-channel engagement (web dashboard and 24/7 WhatsApp bot), SAHARA detects early indicators of distress and provides personalized self-care interventions, peer mentorship, and counselor escalation.

---

## Project Structure

```
sahara/
├── docs/                        <- Comprehensive architecture, briefings, and checklists
│   ├── project-overview.md
│   ├── presenter-briefing.md
│   ├── ppt-content.md
│   ├── deployment-checklist.md
│   └── requirements-checklist.md
├── sahara_backend/              <- FastAPI Backend & ML Risk Engine
│   ├── main.py                  <- FastAPI application & endpoints
│   ├── requirements.txt         <- Backend dependencies
│   ├── models/                  <- Pretrained Random Forest models (.pkl)
│   ├── core/                    <- ML inference & explainability engine
│   │   ├── risk_engine.py
│   │   └── explainability.py
│   ├── whatsapp/                <- WhatsApp bot router & interactive flow
│   │   ├── bot.py
│   │   ├── intake_flow.py
│   │   └── create_templates.py
│   ├── storage/                 <- SQLite database & student ID anonymizer
│   │   └── database.py
│   └── tests/                   <- Test suites & sample tiered student fixtures
├── src/                         <- React + TypeScript + Tailwind CSS Frontend
│   ├── pages/                   <- Home, CheckIn, CounselorPortal, WhatsAppSupport, etc.
│   ├── components/              <- Reusable UI components
│   └── App.tsx
├── .env.example                 <- Environment variable documentation template
└── package.json                 <- Frontend dependencies & scripts
```

---

## Quick Start

### 1. Backend Setup

```bash
cd sahara_backend
pip install -r requirements.txt
cp ../.env.example .env # fill in values
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
npm install
npm run dev
```

### 3. WhatsApp Bot Setup

1. Send `join no-different` to Twilio Sandbox number: `+1 415 523 8886`.
2. Configure webhook URL in Twilio Console to: `https://sahara-951p.onrender.com/whatsapp-webhook` (HTTP POST).
3. Generate Content Templates (one-time):
   ```bash
   cd sahara_backend
   python whatsapp/create_templates.py
   ```

---

## Key Documents
- [Project Overview](file:///docs/project-overview.md)
- [Presenter Briefing & Q&A](file:///docs/presenter-briefing.md)
- [Presentation Outline](file:///docs/ppt-content.md)
- [Deployment Checklist](file:///docs/deployment-checklist.md)
- [Requirements Checklist](file:///docs/requirements-checklist.md)

---

## Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Vite
- **Backend**: FastAPI, Uvicorn, Python 3.10+, SQLite3
- **Machine Learning**: Scikit-Learn, Pandas, NumPy, Joblib (Dual Random Forest)
- **Integrations**: Twilio WhatsApp API, Twilio Content API, Google Gemini AI Flash
- **Cloud Hosting**: Render (Backend API), Vercel (Frontend SPA)

---

## License / Team
**SAHARA Core Team** — Developed for Smart India Hackathon (SIH) & University Mental Health AI Initiatives.

# SAHARA — Slide-by-Slide Presentation Outline (SIH / Hackathon)

---

## Slide 1: Title & Vision
- **Title**: SAHARA (Smart AI-driven Holistic Assessment & Response Assistant)
- **Subtitle**: Proactive Mental Wellbeing & Academic Attrition Early-Warning System for Higher Education
- **Team**: Innovators / SAHARA Core

---

## Slide 2: The Challenge
- High academic pressure, isolation, and unaddressed anxiety lead to student dropouts.
- Counseling centers are understaffed and reactive.
- Stigma prevents 80% of struggling students from visiting campus counselors early.

---

## Slide 3: The SAHARA Solution
- Multi-channel early detection (Web assessment + 24/7 WhatsApp Chatbot).
- Dual-lens AI fusing emotional wellbeing metrics and academic performance.
- Automated triage: self-help resources, peer mentorship, and counselor intervention.

---

## Slide 4: System Architecture & Data Flow
- **Frontend**: React 19 + TypeScript + Tailwind CSS with counselor dashboard and student portal.
- **Backend API**: FastAPI on Render with sub-millisecond inference and SQLite persistence.
- **Machine Learning Core**:
  - Anxiety Regression Model (0–10).
  - Dropout Risk Multi-Class Classifier (0–100%).
- **Explainability**: Severity-ranked top factor extraction.

---

## Slide 5: Live WhatsApp Bot & Conversational AI
- Powered by Twilio WhatsApp Sandbox + Google Gemini AI.
- Native interactive List Pickers (Gender, Year) and Quick Reply buttons (Tuition).
- Tier-specific YouTube video recommendations and 24/7 Indian Crisis Helplines (Tele-MANAS 14416).

---

## Slide 6: Counselor Dashboard & Privacy
- One-way SHA-256 student ID hashing (`STU-XXXXXX`) ensures zero personal data exposure.
- Real-time caseload triage: Filter by risk tier, update contact status (`New` → `In progress` → `Contacted`).
- Institution-wide wellbeing analytics and trend radar.

---

## Slide 7: Impact & Scalability
- Zero-install student experience on mobile.
- Cloud-native architecture ready for campus-wide rollout.
- Measurably reduces dropout rates through early, compassionate intervention.

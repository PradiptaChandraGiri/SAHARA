# SAHARA — Smart AI-Driven Holistic Assessment & Response Assistant

## Executive Summary
SAHARA is a proactive, AI-driven student mental wellbeing and academic early-warning platform designed for universities and higher education institutions. By fusing dual-stream machine learning (psychological anxiety regression and academic dropout risk classification) with accessible multi-channel engagement (web dashboard and 24/7 WhatsApp bot), SAHARA detects early indicators of distress and provides personalized self-care interventions, peer mentorship, and counselor escalation.

---

## Key Capabilities
1. **Dual-Model ML Risk Inference Engine**:
   - **Anxiety Index (0–10)**: Random Forest Regressor trained on student lifestyle and psychological distress data.
   - **Academic Dropout Risk (0–100%)**: Multi-class Random Forest Classifier trained on UCI academic performance metrics.
   - **Harmonized Fusion**: 50/50 weighted combination producing triaged tiers (*Low*, *Medium*, *High*).

2. **Transparent Explainability**:
   - Feature attribution ranking identifying the top 3 contributing factors (e.g. *Low sleep hours*, *High exam pressure*, *Tuition unpaid*).

3. **Multi-Channel Student Interaction**:
   - **Interactive Web App**: Modern React + Tailwind UI with live risk simulator, counselor portal, and student hub.
   - **WhatsApp Chatbot**: 24/7 Twilio-powered intake featuring interactive list pickers, quick-reply buttons, Gemini AI counseling, and video guidance.

4. **Institutional Triage & Privacy**:
   - Real-time counselor dashboard with status tracking (`New`, `In progress`, `Contacted`).
   - One-way SHA-256 student ID anonymization (`STU-XXXXXX`) guaranteeing student confidentiality.
   - Aggregate institutional analytics for campus wellbeing administrators.

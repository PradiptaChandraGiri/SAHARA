# SAHARA — Pre-Deployment & Verification Checklist

## 1. Backend (Render)
- [x] Python 3.10+ runtime with dependencies listed in `sahara_backend/requirements.txt`.
- [x] Trained ML model assets present in `sahara_backend/models/`.
- [x] Environment variables configured in Render Dashboard:
  - `GEMINI_API_KEY`
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_WHATSAPP_NUMBER`
  - `CONTENT_SID_GENDER`
  - `CONTENT_SID_YEAR`
  - `CONTENT_SID_TUITION`
  - `CONTENT_SID_RESTART`
- [x] Health check endpoint `GET /health` responding with `{ status: "ok" }`.
- [x] Assessment endpoint `POST /assess` executing inferences under 50ms.

## 2. Frontend (Vercel)
- [x] Framework: Vite / React 19 + Tailwind CSS v4.
- [x] Environment variable `VITE_API_URL` pointing to live backend (`https://sahara-951p.onrender.com`).
- [x] `vercel.json` rewrite configured for Single Page Application client-side routing.
- [x] WhatsApp direct launcher links configured (`https://wa.me/14155238886?text=join%20no-different`).

## 3. WhatsApp Integration (Twilio)
- [x] Twilio Sandbox join code active (`join no-different`).
- [x] Webhook URL configured in Twilio Console: `https://sahara-951p.onrender.com/whatsapp-webhook` (HTTP POST).
- [x] Twilio Content API templates generated and active.

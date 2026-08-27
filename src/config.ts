// src/config.ts
// When deployed on Vercel (e.g. https://sahara-roan.vercel.app/), relative requests to `/api/...`
// hit the Vercel serverless function or rewrites with zero CORS and zero mixed-content issues.
// In local dev, Vite automatically proxies `/api` to the backend on http://127.0.0.1:8080.
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

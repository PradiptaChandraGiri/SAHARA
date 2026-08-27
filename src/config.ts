// src/config.ts
// Intelligent API_BASE configuration:
// 1. If VITE_API_URL is explicitly set, use it.
// 2. If running locally in a browser on localhost / 127.0.0.1, connect directly to http://127.0.0.1:8080.
// 3. In production (e.g. Vercel deployment), use relative '' path to call /api/* serverless endpoints.

export const API_BASE = (() => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '')
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    if (host === 'localhost' || host === '127.0.0.1' || host.includes('.local')) {
      return 'http://127.0.0.1:8080'
    }
  }
  return ''
})()

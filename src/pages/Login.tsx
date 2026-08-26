import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

/**
 * DawnArc — signature visual motif for SAHARA:
 * Catching academic distress and wellbeing signs at first light.
 */
function DawnArc({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      style={style}
      viewBox="0 0 600 400"
      fill="none"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14243D" />
          <stop offset="100%" stopColor="#1D3357" />
        </linearGradient>
        <linearGradient id="sunGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8B563" />
          <stop offset="100%" stopColor="#B8791F" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#skyGrad)" />
      <circle cx="300" cy="330" r="90" fill="url(#sunGrad)" opacity="0.9" />
      <rect y="332" width="600" height="68" fill="#14243D" />
      {[1, 2, 3].map(i => (
        <path
          key={i}
          d={`M 0 ${330 - i * 34} Q 300 ${330 - i * 34 - 46} 600 ${330 - i * 34}`}
          stroke="#E8B563"
          strokeOpacity={0.16 + i * 0.06}
          strokeWidth="1.5"
          fill="none"
        />
      ))}
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  )
}

interface LoginProps {
  onSuccess: () => void
  onExploreGuest?: () => void
}

export default function Login({ onSuccess, onExploreGuest }: LoginProps) {
  const { loginWithOAuth } = useAuth()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError('')
    setSubmitting(true)
    const result = await loginWithOAuth(provider)
    setSubmitting(false)
    if (result.ok) {
      onSuccess()
    } else {
      setError(result.error || `Could not sign in with ${provider}.`)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--slate-50)' }}>
      {/* Left — Brand Hero Panel */}
      <div style={{
        flex: '0 0 46%', position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 56px', minWidth: 420,
      }}>
        <DawnArc style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: 'var(--amber-500)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(217, 154, 52, 0.3)',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M2 18 Q12 8 22 18" stroke="#14243D" strokeWidth="2.4" strokeLinecap="round" />
                <circle cx="12" cy="13" r="3.2" fill="#14243D" />
              </svg>
            </div>
            <span className="display" style={{ color: '#fff', fontSize: 22, fontWeight: 700, letterSpacing: '0.02em' }}>SAHARA</span>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 410 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 18,
            border: '1px solid rgba(232,181,99,0.35)', borderRadius: 99, padding: '4px 14px',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber-400)' }} />
            <span style={{ fontSize: 12.5, color: 'var(--amber-400)', fontWeight: 600 }}>
              Institutional Student Wellbeing &amp; Early-Warning
            </span>
          </div>
          <h1 className="display" style={{ color: '#fff', fontSize: 36, fontWeight: 600, lineHeight: 1.25, marginBottom: 16 }}>
            Early signs, caught at first light.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.76)', fontSize: 15, lineHeight: 1.7 }}>
            A unified early-warning system for student wellbeing and academic risk —
            connecting students, faculty mentors, and counselors before challenges escalate.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 1, fontSize: 12.5, color: 'rgba(255,255,255,0.55)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Confidential &amp; Anonymized by Default</span>
          <span className="mono">Institutional Single Sign-On</span>
        </div>
      </div>

      {/* Right — Single Sign-On Panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px' }}>
        <div className="dawn-in" style={{ width: '100%', maxWidth: 400 }}>
          
          <div style={{ marginBottom: 32 }}>
            <h2 className="display" style={{ fontSize: 28, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 8 }}>
              Sign in to SAHARA
            </h2>
            <p style={{ fontSize: 14.5, color: 'var(--ink-500)', lineHeight: 1.6 }}>
              Continue with your verified Google or GitHub account. Your institutional role (Student, Counselor, or Admin) will be automatically recognized.
            </p>
          </div>

          {error && (
            <div style={{
              background: 'var(--coral-100)', border: `1px solid var(--coral-500)`, color: 'var(--coral-600)',
              borderRadius: 'var(--radius-sm)', padding: '12px 14px', fontSize: 13.5, marginBottom: 20,
            }} role="alert">
              {error}
            </div>
          )}

          {/* Primary OAuth Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={submitting}
              style={oauthPrimaryBtnStyle}
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuth('github')}
              disabled={submitting}
              style={oauthSecondaryBtnStyle}
            >
              <GitHubIcon />
              <span>Continue with GitHub</span>
            </button>
          </div>

          <div style={{
            background: '#F0FDFA', borderRadius: 'var(--radius-sm)',
            padding: '14px 16px', border: '1px solid #CCFBF1', marginBottom: 28,
          }}>
            <p style={{ fontSize: 12.5, color: '#0F766E', margin: 0, lineHeight: 1.5 }}>
              🔒 <strong>We only use your account to sign you in securely:</strong> Student check-ins are pseudonymized with cryptographic IDs (e.g., <code>STU-XXXXXX</code>) to protect individual privacy by default.
            </p>
          </div>

          {/* Distinct Guest / Preview Section */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--ink-400)', marginBottom: 10 }}>
              Need to test or preview without an account?
            </p>
            <button
              type="button"
              onClick={onExploreGuest || onSuccess}
              style={{
                background: 'transparent', border: 'none', color: 'var(--navy-700)',
                fontSize: 13.5, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline',
                padding: '4px 8px',
              }}
            >
              Explore platform as Guest →
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

const oauthPrimaryBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
  width: '100%', padding: '13px 20px', borderRadius: 'var(--radius-sm)',
  border: '1.5px solid var(--border)', background: '#fff',
  color: 'var(--ink-900)', fontSize: 14.5, fontWeight: 600,
  cursor: 'pointer', transition: 'all 0.2s ease',
  boxShadow: 'var(--shadow-sm)',
}

const oauthSecondaryBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
  width: '100%', padding: '13px 20px', borderRadius: 'var(--radius-sm)',
  border: '1.5px solid var(--navy-900)', background: 'var(--navy-950)',
  color: '#fff', fontSize: 14.5, fontWeight: 600,
  cursor: 'pointer', transition: 'all 0.2s ease',
  boxShadow: 'var(--shadow-sm)',
}

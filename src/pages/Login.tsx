import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

/**
 * DawnArc — the signature visual element for SAHARA.
 * A horizon line with a rising arc: the idea of catching something
 * at first light, before it becomes a crisis. Used here as an ambient
 * backdrop, and reused (smaller) as a loading/progress motif elsewhere.
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

interface LoginProps {
  onSuccess: () => void
}

export default function Login({ onSuccess }: LoginProps) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showDemo, setShowDemo] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Enter your email and password to continue.')
      return
    }
    setSubmitting(true)
    const result = await login(email.trim(), password)
    setSubmitting(false)
    if (result.ok) onSuccess()
    else setError(result.error || 'Something went wrong. Please try again.')
  }

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('sahara-demo')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--slate-50)' }}>
      {/* Left — brand panel */}
      <div style={{
        flex: '0 0 44%', position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 56px', minWidth: 420,
      }}>
        <DawnArc style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, background: 'var(--amber-500)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M2 18 Q12 8 22 18" stroke="#14243D" strokeWidth="2.2" strokeLinecap="round" />
                <circle cx="12" cy="13" r="3.2" fill="#14243D" />
              </svg>
            </div>
            <span className="display" style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>SAHARA</span>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 380 }}>
          <h1 className="display" style={{ color: '#fff', fontSize: 34, fontWeight: 500, lineHeight: 1.25, marginBottom: 16 }}>
            Early signs, caught early.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 15, lineHeight: 1.7 }}>
            A shared early-warning system for student wellbeing and academic risk —
            built so support reaches students before a difficult term becomes a crisis.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 1, fontSize: 12.5, color: 'rgba(255,255,255,0.5)' }}>
          Smart India Hackathon 2026 · Smart Education
        </div>
      </div>

      {/* Right — form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div className="dawn-in" style={{ width: '100%', maxWidth: 380 }}>
          <h2 className="display" style={{ fontSize: 26, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 6 }}>
            Sign in
          </h2>
          <p style={{ fontSize: 14, color: 'var(--ink-500)', marginBottom: 32 }}>
            Students, counselors, and administrators all sign in here — your account
            determines what you can see.
          </p>

          {error && (
            <div style={{
              background: 'var(--coral-100)', border: `1px solid var(--coral-500)`, color: 'var(--coral-600)',
              borderRadius: 'var(--radius-sm)', padding: '11px 14px', fontSize: 13.5, marginBottom: 20,
            }} role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-700)', marginBottom: 6 }}>
              Email address
            </label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="you@institution.edu"
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, marginBottom: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-700)' }}>Password</label>
              <span style={{ fontSize: 12.5, color: 'var(--navy-700)' }}>Institutional SSO</span>
            </div>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="••••••••"
            />

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%', marginTop: 28, padding: '12px 0', borderRadius: 'var(--radius-sm)',
                border: 'none', background: submitting ? 'var(--navy-700)' : 'var(--navy-900)',
                color: '#fff', fontSize: 14.5, fontWeight: 600, fontFamily: 'var(--font-body)',
                cursor: submitting ? 'default' : 'pointer', transition: 'background 0.15s ease',
              }}
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 18 }}>
            <button
              onClick={() => setShowDemo(v => !v)}
              style={{ background: 'none', border: 'none', color: 'var(--ink-500)', fontSize: 12.5, cursor: 'pointer', padding: 0 }}
            >
              {showDemo ? 'Hide' : 'Reviewing for the hackathon? View'} demo accounts
            </button>
            {showDemo && (
              <div className="dawn-in" style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { role: 'Student', email: 'demo.student@sahara.app' },
                  { role: 'Counselor', email: 'demo.counselor@sahara.app' },
                  { role: 'Admin', email: 'demo.admin@sahara.app' },
                ].map(d => (
                  <div
                    key={d.role}
                    onClick={() => fillDemoAccount(d.email)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', fontSize: 12.5,
                      background: 'var(--slate-100)', borderRadius: 6, padding: '8px 12px',
                      cursor: 'pointer', border: '1px solid var(--border)',
                    }}
                    title="Click to auto-fill"
                  >
                    <span style={{ fontWeight: 600, color: 'var(--ink-700)' }}>{d.role}</span>
                    <span className="mono" style={{ color: 'var(--navy-700)' }}>{d.email}</span>
                  </div>
                ))}
                <p style={{ fontSize: 11.5, color: 'var(--ink-400)', marginTop: 2 }}>
                  Password for all demo accounts: <span className="mono">sahara-demo</span> (Click any to auto-fill)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 'var(--radius-sm)',
  border: '1.5px solid var(--border)', fontSize: 14, fontFamily: 'var(--font-body)',
  color: 'var(--ink-900)', outline: 'none', background: '#fff',
}

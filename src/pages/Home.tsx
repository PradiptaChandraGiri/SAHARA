import type { Page } from '../App'
import { useAuth } from '../context/AuthContext'

interface HomeProps {
  onNavigate: (page: Page) => void
}

const pillars = [
  {
    title: 'Wellbeing check-ins',
    desc: 'A short, conversational check-in on sleep, stress, and study load — phrased around everyday behavior, never clinical labels.',
    accent: 'var(--sage-500)',
    bg: 'var(--sage-100)',
  },
  {
    title: 'Academic risk signal',
    desc: 'A model trained on real academic outcomes flags early signs of dropout risk alongside the wellbeing signal, not instead of it.',
    accent: 'var(--navy-700)',
    bg: 'var(--navy-100)',
  },
  {
    title: 'Routed, human support',
    desc: 'Every result routes to the right next step — a suggestion, a check-in prompt, or a real counselor. The system flags; a person decides.',
    accent: 'var(--amber-600)',
    bg: 'var(--amber-100)',
  },
]

const flow = ['Check-in', 'Risk model', 'Counselor review', 'Support']

export default function Home({ onNavigate }: HomeProps) {
  const { user } = useAuth()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--slate-50)' }}>
      {/* Hero */}
      <section style={{ background: 'var(--navy-950)', padding: '76px 64px 64px', position: 'relative', overflow: 'hidden' }}>
        <svg
          viewBox="0 0 1200 300" preserveAspectRatio="none" aria-hidden="true"
          style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 180, opacity: 0.5 }}
        >
          <circle cx="600" cy="300" r="160" fill="var(--amber-500)" opacity="0.16" />
          {[1, 2, 3].map(i => (
            <path key={i} d={`M0 ${300 - i * 40} Q 600 ${300 - i * 40 - 60} 1200 ${300 - i * 40}`}
              stroke="var(--amber-400)" strokeOpacity={0.14 + i * 0.05} strokeWidth="1.5" fill="none" />
          ))}
        </svg>

        <div style={{ maxWidth: 620, position: 'relative', zIndex: 1 }} className="dawn-in">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24,
            border: '1px solid rgba(232,181,99,0.35)', borderRadius: 99, padding: '5px 14px',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber-400)' }} />
            <span style={{ fontSize: 12.5, color: 'var(--amber-400)', fontWeight: 600 }}>
              Student wellbeing &amp; academic risk, in one signal
            </span>
          </div>

          <h1 className="display" style={{ fontSize: 46, fontWeight: 500, color: '#fff', lineHeight: 1.2, marginBottom: 20 }}>
            Understand risk. Reach students at first light.
          </h1>
          <p style={{ fontSize: 16.5, color: 'rgba(255,255,255,0.68)', lineHeight: 1.75, marginBottom: 36, maxWidth: 520 }}>
            SAHARA reads the everyday signals — sleep, stress, academic performance — that
            usually show up before a student struggles, and routes each result to the support
            that actually fits: a nudge, a check-in, or a counselor.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={() => onNavigate('checkin')} style={btnPrimary}>
              Start a check-in
            </button>
            {(user?.role === 'counselor' || user?.role === 'admin') && (
              <button onClick={() => onNavigate('counselor')} style={btnGhostDark}>
                Open counselor dashboard
              </button>
            )}
            <button onClick={() => onNavigate('whatsapp')} style={btnGhostDark}>
              WhatsApp Bot (24/7)
            </button>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section style={{ padding: '56px 64px 16px', maxWidth: 1180, margin: '0 auto' }}>
        <h2 className="display" style={{ fontSize: 24, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 8 }}>
          How SAHARA works
        </h2>
        <p style={{ fontSize: 14.5, color: 'var(--ink-500)', marginBottom: 32 }}>
          Three parts, working together on one shared signal.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {pillars.map(p => (
            <div key={p.title} style={{
              background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
              padding: 26, borderTop: `3px solid ${p.accent}`,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: p.bg,
                marginBottom: 16,
              }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-900)', marginBottom: 8 }}>{p.title}</h3>
              <p style={{ fontSize: 13.5, color: 'var(--ink-500)', lineHeight: 1.6 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Flow strip */}
      <section style={{ padding: '40px 64px 72px', maxWidth: 1180, margin: '0 auto' }}>
        <div style={{
          background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
          padding: '28px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {flow.map((step, i) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="mono" style={{
                  fontSize: 12, color: 'var(--amber-600)', background: 'var(--amber-100)',
                  borderRadius: 6, padding: '2px 7px',
                }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-900)' }}>{step}</span>
              </div>
              {i < flow.length - 1 && (
                <div style={{ flex: 1, height: 1, background: 'var(--border)', margin: '0 18px' }} />
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

const btnPrimary: React.CSSProperties = {
  padding: '12px 24px', borderRadius: 'var(--radius-sm)', border: 'none',
  background: 'var(--amber-500)', color: 'var(--navy-950)', fontWeight: 700,
  fontSize: 14.5, cursor: 'pointer',
}
const btnGhostDark: React.CSSProperties = {
  padding: '12px 24px', borderRadius: 'var(--radius-sm)', background: 'transparent',
  border: '1.5px solid rgba(255,255,255,0.3)', color: '#fff', fontWeight: 600, fontSize: 14.5, cursor: 'pointer',
}

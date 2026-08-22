import type { Page } from '../App'

interface HomeProps {
  onNavigate: (page: Page) => void
}

const features = [
  {
    icon: '✨',
    title: 'Gemini AI Wellbeing Companion',
    desc: 'Powered by Google Gemini 1.5 Flash for 24/7 empathetic student counseling, study stress relief, and crisis helpline triage.',
    color: '#EFF3FF',
    accent: '#4F7BF7',
  },
  {
    icon: '💬',
    title: 'Zero-Barrier WhatsApp Bot',
    desc: 'Twilio WhatsApp Sandbox + Gemini AI stateful check-in. Students chat naturally without installing any new apps.',
    color: '#F0FDF4',
    accent: '#25D366',
  },
  {
    icon: '📊',
    title: 'Academic & Dropout Risk ML',
    desc: 'Multi-indicator AI analyzes sleep, screen time, exam pressure & grades to alert campus counselors before crisis occurs.',
    color: '#F5F3FF',
    accent: '#8B5CF6',
  },
]

const stats = [
  { value: '94%', label: 'Early Detection Rate', sub: 'vs 34% traditional screening' },
  { value: '2.4×', label: 'Counselor Efficiency', sub: 'with AI-prioritized alerts' },
  { value: '78%', label: 'Students Helped', sub: 'who would have gone unnoticed' },
]

const flowSteps = [
  { icon: '👤', label: 'Student', desc: 'Completes 5-min check-in' },
  { icon: '🤖', label: 'AI Analysis', desc: 'Evaluates 15+ indicators' },
  { icon: '⚠️', label: 'Risk Score', desc: 'Low / Medium / High' },
  { icon: '💙', label: 'Counselor', desc: 'Receives alert & intervenes' },
]

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #312E81 100%)',
        padding: '72px 60px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* BG decoration */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 400, height: 400, borderRadius: '50%',
          background: 'rgba(79,123,247,0.15)',
          filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: 200,
          width: 300, height: 300, borderRadius: '50%',
          background: 'rgba(139,92,246,0.15)',
          filter: 'blur(60px)',
        }} />

        <div style={{ maxWidth: 680, position: 'relative', zIndex: 1 }} className="animate-fade-in">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(79,123,247,0.2)',
            border: '1px solid rgba(79,123,247,0.4)',
            borderRadius: 99, padding: '6px 16px', marginBottom: 28,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4F7BF7' }} className="animate-pulse-ring" />
            <span style={{ fontSize: 13, color: '#93C5FD', fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}>
              AI-Powered Student Wellbeing Platform
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 56, fontWeight: 800, color: 'white',
            lineHeight: 1.1, marginBottom: 16,
          }}>
            Understand risk.<br />
            <span style={{
              background: 'linear-gradient(90deg, #93C5FD, #C4B5FD)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Reach students early.</span>
          </h1>

          <p style={{
            fontSize: 18, color: '#94A3B8', lineHeight: 1.7,
            marginBottom: 40, maxWidth: 540,
            fontFamily: "'Inter', sans-serif",
          }}>
            An AI-powered student wellbeing and academic support system designed to identify early warning signs and connect students with the right support — before a challenge becomes a crisis.
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ fontSize: 16, padding: '14px 28px' }} onClick={() => onNavigate('checkin')}>
              Start Student Check-in →
            </button>
            <a
              href="https://wa.me/14155238886?text=join%20no-different"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 16,
                padding: '14px 24px',
                background: 'linear-gradient(135deg, #25D366, #128C7E)',
                color: 'white',
                borderRadius: 12,
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 16px rgba(37,211,102,0.4)',
                transition: 'all 0.2s ease',
              }}
            >
              <span>💬 Open WhatsApp Bot</span>
            </a>
            <button className="btn-secondary" style={{ fontSize: 16, padding: '14px 24px', background: 'transparent', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }} onClick={() => onNavigate('counselor')}>
              Counselor View
            </button>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #E2E8F0',
        padding: '24px 60px',
        display: 'flex',
        gap: 0,
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            flex: 1,
            borderRight: i < stats.length - 1 ? '1px solid #F1F5F9' : 'none',
            padding: '0 40px 0 0',
            marginRight: i < stats.length - 1 ? 40 : 0,
          }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 36, fontWeight: 800, color: '#4F7BF7' }}>{s.value}</div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 600, color: '#0F172A', marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: "'Inter', sans-serif" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '60px 60px' }}>
        {/* Features */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 32, fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>
              Everything a university needs
            </h2>
            <p style={{ fontSize: 16, color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
              Three pillars of proactive student care, powered by AI.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {features.map((f, i) => (
              <div key={i} className="card card-hover animate-fade-in" style={{
                padding: 32,
                animationDelay: `${i * 0.1}s`,
                borderTop: `3px solid ${f.accent}`,
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: f.color, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 28, marginBottom: 20,
                }}>{f.icon}</div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, fontFamily: "'Inter', sans-serif" }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Flow diagram */}
        <div className="card" style={{ padding: 48, marginBottom: 64 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
              How SAHARA Works
            </h2>
            <p style={{ fontSize: 15, color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
              From a 5-minute check-in to counselor intervention — automated, intelligent, and compassionate.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
            {flowSteps.map((step, i) => (
              <>
                <div key={i} style={{ textAlign: 'center', flex: 1, maxWidth: 160 }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: i === 0 ? '#EFF3FF' : i === 1 ? '#F5F3FF' : i === 2 ? '#FFFBEB' : '#F0FDF4',
                    border: `2px solid ${i === 0 ? '#4F7BF7' : i === 1 ? '#8B5CF6' : i === 2 ? '#F59E0B' : '#22C55E'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 30, margin: '0 auto 16px',
                  }}>{step.icon}</div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
                    {step.label}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B', fontFamily: "'Inter', sans-serif" }}>{step.desc}</div>
                </div>
                {i < flowSteps.length - 1 && (
                  <div key={`arrow-${i}`} style={{ flex: 0, padding: '0 12px', color: '#CBD5E1', fontSize: 24, paddingBottom: 24 }}>→</div>
                )}
              </>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          background: 'linear-gradient(135deg, #4F7BF7, #8B5CF6)',
          borderRadius: 20, padding: '48px 60px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 8 }}>
              Ready to start your wellbeing check-in?
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', fontFamily: "'Inter', sans-serif" }}>
              Takes just 5 minutes. Private, confidential, and designed to help — not judge.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
            <button
              className="btn-primary"
              style={{ background: 'white', color: '#4F7BF7', fontSize: 16, padding: '14px 28px', whiteSpace: 'nowrap' }}
              onClick={() => onNavigate('checkin')}
            >
              Start Check-in
            </button>
            <button
              className="btn-secondary"
              style={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', background: 'transparent', fontSize: 16, padding: '14px 28px', whiteSpace: 'nowrap' }}
              onClick={() => onNavigate('counselor')}
            >
              Counselor Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

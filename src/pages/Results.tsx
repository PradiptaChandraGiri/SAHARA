import type { Page } from '../App'
import type { CheckInData } from '../App'

interface ResultsProps {
  data: CheckInData | null
  onNavigate: (page: Page) => void
}

function CircleGauge({ value, label, color }: { value: number; label: string; color: string }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 130, height: 130, margin: '0 auto 12px' }}>
        <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="65" cy="65" r={r} fill="none" stroke="#F1F5F9" strokeWidth="10" />
          <circle
            cx="65" cy="65" r={r} fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column',
        }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 800, color: '#0F172A' }}>{value}%</span>
        </div>
      </div>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: '#64748B' }}>{label}</div>
    </div>
  )
}

const defaultData: CheckInData = {
  riskScore: 72,
  riskLevel: 'high',
  anxietyRisk: 75,
  dropoutRisk: 68,
  factors: ['High exam pressure', 'Insufficient sleep', 'Financial concerns', 'Low social support'],
} as unknown as CheckInData

const recommendationsByRisk = {
  high: [
    { icon: '💬', text: 'Schedule a session with a university counselor as soon as possible.', color: '#EFF3FF' },
    { icon: '😴', text: 'Aim for 7–8 hours of sleep. Your brain needs rest to process and retain information.', color: '#F5F3FF' },
    { icon: '📚', text: 'Connect with an academic mentor or study group to reduce academic isolation.', color: '#F0FDFA' },
    { icon: '🧘', text: 'Practice brief daily mindfulness — even 10 minutes can reduce cortisol levels.', color: '#FFFBEB' },
    { icon: '💰', text: 'Explore student financial aid options available through the student services office.', color: '#FEF2F2' },
    { icon: '🫂', text: 'Reach out to a trusted friend, family member, or peer support group.', color: '#F0FDF4' },
  ],
  medium: [
    { icon: '😴', text: 'Aim for 7–8 hours of sleep per night to support cognitive function.', color: '#F5F3FF' },
    { icon: '📅', text: 'Build a structured weekly study schedule with planned breaks using the Pomodoro technique.', color: '#EFF3FF' },
    { icon: '🏃', text: 'Add 20–30 minutes of light exercise to your daily routine.', color: '#F0FDFA' },
    { icon: '💬', text: 'Consider a casual consultation with a counselor to discuss strategies.', color: '#FFFBEB' },
  ],
  low: [
    { icon: '✅', text: 'You are managing well! Keep maintaining your healthy habits.', color: '#F0FDF4' },
    { icon: '📅', text: 'Continue your current study schedule and stay consistent.', color: '#EFF3FF' },
    { icon: '🤝', text: 'Check in with peers who may need support — being a support to others also helps you.', color: '#F5F3FF' },
  ],
}

export default function Results({ data, onNavigate }: ResultsProps) {
  const d = data || defaultData
  const risk = d.riskLevel || 'high'

  const riskColor = risk === 'high' ? '#EF4444' : risk === 'medium' ? '#F59E0B' : '#22C55E'
  const riskBg = risk === 'high' ? '#FEF2F2' : risk === 'medium' ? '#FFFBEB' : '#F0FDF4'
  const riskLabel = risk === 'high' ? 'HIGH RISK' : risk === 'medium' ? 'MEDIUM RISK' : 'LOW RISK'

  const anxietyRisk = d.anxietyRisk || Math.min(d.riskScore + 3, 95)
  const dropoutRisk = d.dropoutRisk || Math.max(d.riskScore - 5, 5)

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '40px 60px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 32, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
              Your Wellbeing Snapshot
            </h1>
            <p style={{ fontSize: 15, color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
              Based on your check-in on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button className="btn-secondary" onClick={() => onNavigate('checkin')} style={{ whiteSpace: 'nowrap' }}>
            Retake Check-in
          </button>
        </div>

        {/* Risk level banner */}
        <div className="card animate-count-up" style={{
          padding: '28px 36px', marginBottom: 24,
          background: riskBg, borderColor: riskColor + '33',
          display: 'flex', alignItems: 'center', gap: 24,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: riskColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, flexShrink: 0, boxShadow: `0 0 20px ${riskColor}40`,
          }}>
            {risk === 'high' ? '⚠️' : risk === 'medium' ? '⚡' : '✅'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, color: riskColor, letterSpacing: '0.08em', marginBottom: 4 }}>
              OVERALL ASSESSMENT
            </div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
              {riskLabel}
            </div>
            <div style={{ fontSize: 14, color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
              {risk === 'high'
                ? 'Your responses indicate elevated wellbeing risk. We strongly recommend connecting with support resources.'
                : risk === 'medium'
                ? 'Some areas need attention. Proactive steps now can prevent future challenges.'
                : 'Your wellbeing indicators look positive. Keep maintaining your healthy habits!'}
            </div>
          </div>
          <div style={{
            padding: '8px 20px', background: riskColor, color: 'white',
            borderRadius: 99, fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 20,
            flexShrink: 0,
          }}>
            {d.riskScore}%
          </div>
        </div>

        {/* Gauges */}
        <div className="card" style={{ padding: '32px 40px', marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 28 }}>
            Detailed Risk Scores
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 24 }}>
            <CircleGauge value={anxietyRisk} label="Anxiety Risk" color="#8B5CF6" />
            <CircleGauge value={dropoutRisk} label="Dropout Risk" color="#EF4444" />
            <CircleGauge value={d.riskScore} label="Overall Risk" color={riskColor} />
          </div>
        </div>

        {/* Factors */}
        {d.factors && d.factors.length > 0 && (
          <div className="card" style={{ padding: '32px 36px', marginBottom: 24 }}>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
              What influenced your result?
            </h3>
            <p style={{ fontSize: 14, color: '#64748B', marginBottom: 20, fontFamily: "'Inter', sans-serif" }}>
              These factors contributed most to your wellbeing score.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {d.factors.map((factor, i) => (
                <div key={i} style={{
                  padding: '10px 16px', borderRadius: 10,
                  background: i % 3 === 0 ? '#FEF2F2' : i % 3 === 1 ? '#FFFBEB' : '#F5F3FF',
                  border: `1px solid ${i % 3 === 0 ? '#FECACA' : i % 3 === 1 ? '#FDE68A' : '#DDD6FE'}`,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: i % 3 === 0 ? '#EF4444' : i % 3 === 1 ? '#F59E0B' : '#8B5CF6',
                  }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', fontFamily: "'Outfit', sans-serif" }}>{factor}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="card" style={{ padding: '32px 36px', marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
            Your Personalized Support Plan
          </h3>
          <p style={{ fontSize: 14, color: '#64748B', marginBottom: 20, fontFamily: "'Inter', sans-serif" }}>
            Tailored recommendations based on your specific indicators.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(recommendationsByRisk[risk] || recommendationsByRisk.high).map((rec, i) => (
              <div key={i} className="animate-fade-in" style={{
                display: 'flex', gap: 14, padding: '14px 18px',
                background: rec.color, borderRadius: 12, alignItems: 'flex-start',
                animationDelay: `${i * 0.08}s`,
              }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{rec.icon}</span>
                <p style={{ fontSize: 14, color: '#0F172A', lineHeight: 1.6, fontFamily: "'Inter', sans-serif", margin: 0 }}>{rec.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Support message */}
        <div style={{
          background: 'linear-gradient(135deg, #4F7BF7, #8B5CF6)',
          borderRadius: 16, padding: '28px 36px', marginBottom: 24, textAlign: 'center',
        }}>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 600, color: 'white', marginBottom: 4 }}>
            💙 You don't have to handle everything alone.
          </p>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', fontFamily: "'Inter', sans-serif" }}>
            Support is available — and reaching out is a sign of strength, not weakness.
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ fontSize: 15, padding: '13px 26px' }} onClick={() => onNavigate('counselor')}>
            👤 Talk to a Counselor
          </button>
          <button className="btn-secondary" style={{ fontSize: 15, padding: '13px 26px' }} onClick={() => onNavigate('ai-support')}>
            🤖 Chat with AI Support
          </button>
          <button className="btn-ghost" style={{ fontSize: 15, padding: '13px 26px' }} onClick={() => onNavigate('whatsapp')}>
            💬 WhatsApp Support
          </button>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { mockStudents } from '../data/mockData'
import type { Page } from '../App'

interface StudentProfileProps {
  studentId: string | null
  onNavigate: (page: Page) => void
  studentStatuses: Record<string, string>
  onUpdateStatus: (id: string, status: string) => void
}

function CircleGauge({ value, label, color, size = 100 }: { value: number; label: string; color: string; size?: number }) {
  const r = size * 0.4
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size, margin: '0 auto 8px' }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F5F9" strokeWidth="8" />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: size * 0.2, fontWeight: 800, color: '#0F172A' }}>{value}%</span>
        </div>
      </div>
      <div style={{ fontSize: 12, color: '#64748B', fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>{label}</div>
    </div>
  )
}

export default function StudentProfile({ studentId, onNavigate, studentStatuses, onUpdateStatus }: StudentProfileProps) {
  const [showSuccess, setShowSuccess] = useState(false)
  const student = mockStudents.find(s => s.id === studentId) || mockStudents[0]
  const status = studentStatuses[student.id] || 'New'

  const handleMarkContacted = () => {
    onUpdateStatus(student.id, 'Contacted')
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const riskColor = student.riskLevel === 'high' ? '#EF4444' : student.riskLevel === 'medium' ? '#F59E0B' : '#22C55E'
  const timelineIcons = { checkin: '✅', ai: '🤖', risk: '⚠️', counselor: '💙' }
  const timelineColors = { checkin: '#4F7BF7', ai: '#8B5CF6', risk: '#EF4444', counselor: '#14B8A6' }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '36px 48px' }}>
      {/* Success toast */}
      {showSuccess && (
        <div className="animate-slide-in" style={{
          position: 'fixed', top: 24, right: 24, zIndex: 999,
          background: '#22C55E', color: 'white', padding: '14px 24px', borderRadius: 12,
          fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 600,
          boxShadow: '0 8px 24px rgba(34,197,94,0.4)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span>✅</span> Status updated to CONTACTED
        </div>
      )}

      {/* Back */}
      <button onClick={() => onNavigate('counselor')} style={{
        background: 'none', border: 'none', color: '#64748B', cursor: 'pointer',
        fontFamily: "'Outfit', sans-serif", fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24,
      }}>
        ← Back to Dashboard
      </button>

      {/* Header card */}
      <div className="card animate-fade-in" style={{ padding: '28px 32px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: `linear-gradient(135deg, ${riskColor}22, ${riskColor}44)`,
              border: `3px solid ${riskColor}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: riskColor,
            }}>{student.avatar}</div>
            <div>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                {student.name}
              </h1>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, color: '#64748B', fontFamily: "'Inter', sans-serif" }}>🎓 {student.year}</span>
                <span style={{ fontSize: 13, color: '#64748B', fontFamily: "'Inter', sans-serif" }}>🏛️ {student.dept}</span>
                <span style={{ fontSize: 13, color: '#64748B', fontFamily: "'Inter', sans-serif" }}>🆔 {student.id}</span>
                <span style={{ fontSize: 13, color: '#64748B', fontFamily: "'Inter', sans-serif" }}>📧 {student.email}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className={`tag-${student.riskLevel}`} style={{ fontSize: 13, padding: '6px 14px' }}>
              {student.riskLevel.toUpperCase()} RISK
            </span>
            <span className={`tag-${status.toLowerCase()}`} style={{ fontSize: 13, padding: '6px 14px' }}>
              {status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 24, paddingTop: 24, borderTop: '1px solid #F1F5F9' }}>
          {[
            { label: 'GPA / CGPA', value: `${student.gpa}/10`, icon: '📊' },
            { label: 'Attendance', value: `${student.attendance}%`, icon: '📅' },
            { label: 'Risk Score', value: `${student.riskScore}%`, icon: '⚠️' },
            { label: 'Check-in Date', value: student.checkInDate, icon: '🗓️' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '12px 8px', background: '#F8FAFC', borderRadius: 10 }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{stat.icon}</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: "'Inter', sans-serif" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Risk gauges */}
        <div className="card" style={{ padding: '28px 24px' }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 24 }}>
            Risk Assessment
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <CircleGauge value={student.anxietyRisk} label="Anxiety Risk" color="#8B5CF6" />
            <CircleGauge value={student.dropoutRisk} label="Dropout Risk" color="#EF4444" />
            <CircleGauge value={student.riskScore} label="Overall" color={riskColor} />
          </div>
        </div>

        {/* Key factors */}
        <div className="card" style={{ padding: '28px 24px' }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>
            Key Contributing Factors
          </h3>
          {student.factors.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {student.factors.map((factor, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                  background: '#FEF2F2', borderRadius: 8, border: '1px solid #FECACA',
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#0F172A', fontFamily: "'Inter', sans-serif" }}>{factor}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600 }}>No significant risk factors detected</div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="card" style={{ padding: '28px 32px', marginBottom: 24 }}>
        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 24 }}>
          Support Timeline
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {student.timeline.map((event, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, paddingBottom: i < student.timeline.length - 1 ? 20 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: timelineColors[event.type] + '18',
                  border: `2px solid ${timelineColors[event.type]}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
                }}>{timelineIcons[event.type]}</div>
                {i < student.timeline.length - 1 && (
                  <div style={{ width: 2, flex: 1, background: '#F1F5F9', margin: '4px 0', minHeight: 16 }} />
                )}
              </div>
              <div style={{ paddingTop: 8 }}>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 2 }}>
                  {event.event}
                </div>
                <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: "'Inter', sans-serif" }}>{event.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="card" style={{ padding: '24px 32px' }}>
        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>
          Counselor Actions
        </h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {status === 'New' ? (
            <button
              className="btn-primary"
              onClick={handleMarkContacted}
              style={{ fontSize: 14, padding: '12px 24px', background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
            >
              ✅ Mark as Contacted
            </button>
          ) : (
            <div style={{
              padding: '12px 24px', borderRadius: 10, background: '#F0FDF4',
              border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>✅</span>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: '#16A34A' }}>
                Marked as Contacted
              </span>
            </div>
          )}
          <button className="btn-secondary" style={{ fontSize: 14, padding: '12px 24px' }}>
            💬 Send Support Message
          </button>
          <button className="btn-ghost" style={{ fontSize: 14, padding: '12px 24px' }}>
            📅 Schedule Follow-up
          </button>
          <button
            className="btn-ghost"
            style={{ fontSize: 14, padding: '12px 24px' }}
            onClick={() => onNavigate('ai-support')}
          >
            🤖 Open AI Support Chat
          </button>
        </div>
      </div>
    </div>
  )
}

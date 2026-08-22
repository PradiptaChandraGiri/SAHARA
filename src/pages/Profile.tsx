import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { profileHistory, checkInHistory } from '../data/mockData'
import type { Page } from '../App'
import type { CheckInData } from '../App'

interface ProfileProps {
  checkInData: CheckInData | null
  onNavigate: (page: Page) => void
}

export default function Profile({ checkInData, onNavigate }: ProfileProps) {
  const riskForHistory = checkInData?.riskLevel || 'medium'
  const latestHistory = [...checkInHistory]
  if (checkInData) {
    latestHistory[0] = {
      date: 'August 18, 2026',
      risk: checkInData.riskLevel === 'high' ? 'High' : checkInData.riskLevel === 'medium' ? 'Medium' : 'Low',
      score: checkInData.riskScore,
      status: 'latest',
    }
  }

  const wellbeingCards = [
    { label: 'Stress Level', value: checkInData ? `${checkInData.stressLevel}/10` : '7/10', icon: '😓', trend: '↑', color: '#EF4444', bg: '#FEF2F2' },
    { label: 'Sleep Quality', value: checkInData ? `${checkInData.sleepHours}h` : '5.5h', icon: '😴', trend: '↓', color: '#8B5CF6', bg: '#F5F3FF' },
    { label: 'Exam Pressure', value: checkInData ? `${checkInData.examPressure}/10` : '8/10', icon: '📚', trend: '↑', color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'Risk Score', value: checkInData ? `${checkInData.riskScore}%` : '74%', icon: '⚠️', trend: riskForHistory === 'high' ? '↑' : '→', color: '#4F7BF7', bg: '#EFF3FF' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '40px 60px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Profile hero */}
        <div className="card animate-fade-in" style={{ padding: '32px 36px', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{
              width: 88, height: 88, borderRadius: '50%',
              background: 'linear-gradient(135deg, #4F7BF7, #8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, fontWeight: 800, color: 'white', fontFamily: "'Outfit', sans-serif",
              boxShadow: '0 8px 24px rgba(79,123,247,0.3)',
            }}>RS</div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                Rohit Sharma
              </h1>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#64748B', fontFamily: "'Inter', sans-serif" }}>🎓 3rd Year · Computer Science</span>
                <span style={{ fontSize: 13, color: '#64748B', fontFamily: "'Inter', sans-serif" }}>🆔 STU-CS-2024-042</span>
                <span style={{ fontSize: 13, color: '#64748B', fontFamily: "'Inter', sans-serif" }}>📧 rohit.sharma@university.edu</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{
                  background: '#EFF3FF', border: '1px solid #BFDBFE', borderRadius: 6,
                  padding: '3px 10px', fontSize: 12, fontWeight: 600, color: '#4F7BF7',
                  fontFamily: "'Outfit', sans-serif",
                }}>Active Student</span>
                <span style={{
                  background: checkInData ? (checkInData.riskLevel === 'high' ? '#FEF2F2' : checkInData.riskLevel === 'medium' ? '#FFFBEB' : '#F0FDF4') : '#FFFBEB',
                  border: `1px solid ${checkInData ? (checkInData.riskLevel === 'high' ? '#FECACA' : checkInData.riskLevel === 'medium' ? '#FDE68A' : '#BBF7D0') : '#FDE68A'}`,
                  borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600,
                  color: checkInData ? (checkInData.riskLevel === 'high' ? '#DC2626' : checkInData.riskLevel === 'medium' ? '#D97706' : '#16A34A') : '#D97706',
                  fontFamily: "'Outfit', sans-serif",
                }}>
                  {checkInData ? `${checkInData.riskLevel.toUpperCase()} Risk` : 'MEDIUM Risk'}
                </span>
              </div>
            </div>
            <button className="btn-secondary" style={{ whiteSpace: 'nowrap' }} onClick={() => onNavigate('checkin')}>
              New Check-in
            </button>
          </div>
        </div>

        {/* Wellbeing snapshot */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          {wellbeingCards.map((card, i) => (
            <div key={i} className="card card-hover animate-fade-in" style={{ padding: '20px 20px', background: card.bg, animationDelay: `${i * 0.07}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ fontSize: 24 }}>{card.icon}</span>
                <span style={{
                  fontSize: 16, fontWeight: 800, color: card.color,
                  fontFamily: "'Outfit', sans-serif",
                }}>{card.trend}</span>
              </div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: '#0F172A', marginBottom: 2 }}>
                {card.value}
              </div>
              <div style={{ fontSize: 13, color: '#64748B', fontFamily: "'Inter', sans-serif" }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Chart + history */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
          <div className="card" style={{ padding: '24px 24px' }}>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 20 }}>
              Wellbeing Trend (Last 5 Weeks)
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={profileHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="stress" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} name="Stress" />
                <Line type="monotone" dataKey="pressure" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} name="Exam Pressure" />
                <Line type="monotone" dataKey="risk" stroke="#4F7BF7" strokeWidth={2.5} dot={{ r: 4 }} name="Risk Score" />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 16, marginTop: 12, justifyContent: 'center' }}>
              {[{ label: 'Stress', color: '#EF4444' }, { label: 'Exam Pressure', color: '#F59E0B' }, { label: 'Risk Score', color: '#4F7BF7' }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 12, height: 3, background: l.color, borderRadius: 99 }} />
                  <span style={{ fontSize: 12, color: '#64748B', fontFamily: "'Inter', sans-serif" }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Check-in history */}
          <div className="card" style={{ padding: '24px 24px' }}>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 20 }}>
              Previous Check-ins
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {latestHistory.map((entry, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px',
                  background: i === 0 ? '#F8FAFC' : 'transparent',
                  borderRadius: 10, border: i === 0 ? '1px solid #E2E8F0' : 'none',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: entry.risk === 'High' ? '#FEF2F2' : entry.risk === 'Medium' ? '#FFFBEB' : '#F0FDF4',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800,
                    color: entry.risk === 'High' ? '#EF4444' : entry.risk === 'Medium' ? '#F59E0B' : '#22C55E',
                  }}>{entry.score}%</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: '#0F172A' }}>
                      {entry.date}
                      {i === 0 && <span style={{ marginLeft: 8, fontSize: 11, color: '#4F7BF7', fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>LATEST</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: "'Inter', sans-serif" }}>
                      {entry.risk} Risk
                    </div>
                  </div>
                  <span className={`tag-${entry.risk.toLowerCase()}`}>{entry.risk}</span>
                </div>
              ))}
            </div>
            <button className="btn-primary" style={{ width: '100%', marginTop: 16, fontSize: 14 }} onClick={() => onNavigate('checkin')}>
              + Start New Check-in
            </button>
          </div>
        </div>

        {/* Academic info */}
        <div className="card" style={{ padding: '28px 32px' }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 20 }}>
            Academic Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { label: 'Department', value: 'Computer Science' },
              { label: 'Roll Number', value: 'CS21042' },
              { label: 'Academic Year', value: '3rd Year (2026)' },
              { label: 'Enrolled', value: 'July 2023' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '16px', background: '#F8FAFC', borderRadius: 10 }}>
                <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: "'Inter', sans-serif", textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

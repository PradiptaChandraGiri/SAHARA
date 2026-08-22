import { useState } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { mockStudents, riskChartData, weeklyCheckIns } from '../data/mockData'
import type { Page } from '../App'

interface CounselorDashboardProps {
  onNavigate: (page: Page) => void
  onSelectStudent: (id: string) => void
  studentStatuses: Record<string, string>
}

type Filter = 'all' | 'high' | 'medium' | 'low' | 'new' | 'contacted'

export default function CounselorDashboard({ onNavigate, onSelectStudent, studentStatuses }: CounselorDashboardProps) {
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  const getStatus = (id: string) => studentStatuses[id] || 'New'

  const filtered = mockStudents.filter(s => {
    const statusMatch =
      filter === 'all' ? true
      : filter === 'high' ? s.riskLevel === 'high'
      : filter === 'medium' ? s.riskLevel === 'medium'
      : filter === 'low' ? s.riskLevel === 'low'
      : filter === 'new' ? getStatus(s.id) === 'New'
      : filter === 'contacted' ? getStatus(s.id) === 'Contacted'
      : true
    const searchMatch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.dept.toLowerCase().includes(search.toLowerCase())
    return statusMatch && searchMatch
  })

  const highCount = mockStudents.filter(s => s.riskLevel === 'high').length
  const medCount = mockStudents.filter(s => s.riskLevel === 'medium').length
  const newCount = mockStudents.filter(s => getStatus(s.id) === 'New').length

  const kpis = [
    { label: 'Total Students', value: mockStudents.length, icon: '👥', color: '#4F7BF7', bg: '#EFF3FF', delta: '+3 today' },
    { label: 'High Risk', value: highCount, icon: '🔴', color: '#EF4444', bg: '#FEF2F2', delta: 'Needs attention' },
    { label: 'Medium Risk', value: medCount, icon: '🟡', color: '#F59E0B', bg: '#FFFBEB', delta: 'Monitor closely' },
    { label: 'Needs Follow-up', value: newCount, icon: '📋', color: '#8B5CF6', bg: '#F5F3FF', delta: `${newCount} uncontacted` },
  ]

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All Students' },
    { id: 'high', label: '🔴 High Risk' },
    { id: 'medium', label: '🟡 Medium Risk' },
    { id: 'low', label: '🟢 Low Risk' },
    { id: 'new', label: '🆕 New' },
    { id: 'contacted', label: '✅ Contacted' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '36px 48px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
            Counselor Dashboard
          </h1>
          <p style={{ fontSize: 14, color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Showing {filtered.length} students
          </p>
        </div>
        <div style={{
          background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10,
          padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} className="animate-pulse-ring" />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#DC2626', fontFamily: "'Outfit', sans-serif" }}>
            {highCount} High-Risk Alerts
          </span>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 28 }}>
        {kpis.map((kpi, i) => (
          <div key={i} className="card card-hover animate-fade-in" style={{ padding: '20px 24px', animationDelay: `${i * 0.05}s` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>{kpi.icon}</div>
              <span style={{ fontSize: 11, color: kpi.color, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>{kpi.delta}</span>
            </div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 36, fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{kpi.value}</div>
            <div style={{ fontSize: 14, color: '#64748B', fontFamily: "'Inter', sans-serif", marginTop: 4 }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        <div className="card" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 20 }}>
            Risk Distribution
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={riskChartData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {riskChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {riskChartData.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#64748B', fontFamily: "'Inter', sans-serif" }}>{d.name}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginLeft: 'auto', fontFamily: "'Outfit', sans-serif" }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 20 }}>
            Weekly Check-ins
          </h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={weeklyCheckIns} barSize={24}>
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94A3B8', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 12 }}
                cursor={{ fill: '#F1F5F9' }}
              />
              <Bar dataKey="count" fill="#4F7BF7" radius={[6, 6, 0, 0]} name="Check-ins" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #F1F5F9',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 700, color: '#0F172A' }}>
            Student Risk Register
          </h3>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              className="input-field"
              placeholder="🔍  Search students..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: 220, padding: '8px 14px' }}
            />
          </div>
        </div>

        {/* Filters */}
        <div style={{ padding: '12px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: 8, overflowX: 'auto' }}>
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: '6px 14px', borderRadius: 99, border: 'none', cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600,
                background: filter === f.id ? '#0F172A' : '#F1F5F9',
                color: filter === f.id ? 'white' : '#64748B',
                transition: 'all 0.2s ease', whiteSpace: 'nowrap',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {['Student', 'Risk Level', 'Score', 'Key Factor', 'Check-in', 'Status', 'Actions'].map(col => (
                <th key={col} style={{
                  padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700,
                  color: '#94A3B8', fontFamily: "'Inter', sans-serif", letterSpacing: '0.06em',
                  borderBottom: '1px solid #F1F5F9', textTransform: 'uppercase',
                }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((student, i) => {
              const status = getStatus(student.id)
              return (
                <tr
                  key={student.id}
                  style={{
                    borderBottom: '1px solid #F8FAFC',
                    transition: 'background 0.15s ease',
                    cursor: 'pointer',
                    animationDelay: `${i * 0.04}s`,
                  }}
                  className="animate-fade-in"
                  onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: student.riskLevel === 'high' ? '#FEF2F2' : student.riskLevel === 'medium' ? '#FFFBEB' : '#F0FDF4',
                        border: `2px solid ${student.riskLevel === 'high' ? '#FECACA' : student.riskLevel === 'medium' ? '#FDE68A' : '#BBF7D0'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700,
                        color: student.riskLevel === 'high' ? '#DC2626' : student.riskLevel === 'medium' ? '#D97706' : '#16A34A',
                        flexShrink: 0,
                      }}>{student.avatar}</div>
                      <div>
                        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{student.name}</div>
                        <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: "'Inter', sans-serif" }}>{student.id} · {student.year}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span className={`tag-${student.riskLevel}`}>
                      {student.riskLevel.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 60, height: 6, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 99,
                          width: `${student.riskScore}%`,
                          background: student.riskLevel === 'high' ? '#EF4444' : student.riskLevel === 'medium' ? '#F59E0B' : '#22C55E',
                        }} />
                      </div>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{student.riskScore}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
                    {student.keyFactor}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 12, color: '#94A3B8', fontFamily: "'Inter', sans-serif" }}>
                    {student.checkInDate}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span className={`tag-${status.toLowerCase()}`}>{status}</span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <button
                      className="btn-secondary"
                      style={{ padding: '6px 14px', fontSize: 13 }}
                      onClick={() => { onSelectStudent(student.id); onNavigate('student-profile') }}
                    >
                      View →
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: '#94A3B8' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 600 }}>No students found</div>
            <div style={{ fontSize: 14, fontFamily: "'Inter', sans-serif", marginTop: 4 }}>Try adjusting your filter or search term</div>
          </div>
        )}
      </div>
    </div>
  )
}

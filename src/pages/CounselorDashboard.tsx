import React, { useState, useEffect } from 'react'
import type { Page } from '../App'
import { useAuth } from '../context/AuthContext'
import {
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  ArrowUpDown,
  Filter as FilterIcon,
  Calendar,
  PhoneCall
} from 'lucide-react'

interface CounselorDashboardProps {
  onNavigate: (page: Page) => void
  onSelectStudent: (id: string) => void
  studentStatuses: Record<string, string>
}

type UrgencyFilter = 'all' | 'high' | 'medium' | 'low' | 'new' | 'contacted'

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')

export default function CounselorDashboard({
  onNavigate,
  onSelectStudent,
  studentStatuses,
}: CounselorDashboardProps) {
  const { user } = useAuth()
  const [assessments, setAssessments] = useState<any[]>([])
  const [adminStats, setAdminStats] = useState<any>(null)
  const [filter, setFilter] = useState<UrgencyFilter>('all')
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      // Fetch real counselor triage queue
      const res = await fetch(`${API_BASE}/api/counselor/queue`, {
        credentials: 'include',
      })
      if (res.ok) {
        const rows = await res.json()
        const mapped = Array.isArray(rows)
          ? rows.map((r: any) => ({
              id: r.user_id,
              student_id: r.user_id,
              student_name: r.display_name || 'Student',
              risk_tier: r.risk_level === 'high' ? 'High' : r.risk_level === 'moderate' ? 'Medium' : 'Low',
              combined_score: Number(r.overall_wellbeing) / 100,
              anxiety_score: (Number(r.overall_wellbeing) / 100) * 10,
              top_factors: r.contributing_factors || [],
              timestamp: r.created_at,
              status: studentStatuses[r.user_id] || 'New',
            }))
          : []
        setAssessments(mapped)
      }
    } catch (err) {
      console.warn('Counselor dashboard queue error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  // Urgency score helper: High=3, Medium=2, Low=1
  const getUrgencyWeight = (tier: string = 'Low') => {
    const t = tier.toLowerCase()
    if (t === 'high') return 3
    if (t === 'medium') return 2
    return 1
  }

  // Sort queue strictly by urgency (High -> Medium -> Low)
  const sortedAssessments = [...assessments].sort((a, b) => {
    const weightA = getUrgencyWeight(a.risk_tier)
    const weightB = getUrgencyWeight(b.risk_tier)
    if (weightA !== weightB) return weightB - weightA
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  })

  // Quick inline triage action
  const handleQuickStatus = async (assessmentId: string, newStatus: string) => {
    setActionLoadingId(assessmentId)
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`${API_BASE}/assessments/${assessmentId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setAssessments(prev =>
          prev.map(a => (a.assessment_id === assessmentId ? { ...a, status: newStatus } : a))
        )
      }
    } catch (err) {
      console.warn('Error updating status:', err)
    } finally {
      setActionLoadingId(null)
    }
  }

  // Filtered queue
  const filtered = sortedAssessments.filter(s => {
    const tier = (s.risk_tier || 'Low').toLowerCase()
    const currentStatus = studentStatuses[s.assessment_id] || s.status || 'New'

    const statusMatch =
      filter === 'all' ? true
      : filter === 'high' ? tier === 'high'
      : filter === 'medium' ? tier === 'medium'
      : filter === 'low' ? tier === 'low'
      : filter === 'new' ? currentStatus === 'New'
      : filter === 'contacted' ? currentStatus === 'Contacted'
      : true

    const q = search.toLowerCase()
    const studentId = (s.student_id || '').toLowerCase()
    const factors = (s.top_factors || []).join(' ').toLowerCase()
    const searchMatch = !search || studentId.includes(q) || factors.includes(q)

    return statusMatch && searchMatch
  })

  const totalCount = assessments.length
  const highCount = assessments.filter(s => s.risk_tier === 'High').length
  const medCount = assessments.filter(s => s.risk_tier === 'Medium').length
  const needingFollowUp = assessments.filter(s => (s.status || 'New') === 'New' && s.risk_tier === 'High').length
  const resolvedCount = assessments.filter(s => s.status === 'Resolved' || s.status === 'Contacted').length

  const getDaysAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return '1d ago'
    return `${days}d ago`
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--slate-50)', padding: '40px 48px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--amber-600)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Clinical Triage Queue
              </span>
            </div>
            <h1 className="display" style={{ fontSize: 32, fontWeight: 600, color: 'var(--ink-900)', margin: 0 }}>
              Counselor Triage Workspace
            </h1>
            <p style={{ fontSize: 14.5, color: 'var(--ink-500)', marginTop: 4 }}>
              Prioritized case list sorted by clinical urgency. Review and action flagged cases.
            </p>
          </div>

          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 'var(--radius-sm)',
              background: '#fff', border: '1px solid var(--border)',
              color: 'var(--ink-700)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {/* 1. CASELOAD OVERVIEW STRIP */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16,
          marginBottom: 28,
        }}>
          <div style={kpiCardStyle}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--coral-600)', textTransform: 'uppercase' }}>Needs Attention (High)</span>
            <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--coral-600)', margin: '6px 0 2px' }}>{highCount}</p>
            <p style={{ fontSize: 12, color: 'var(--ink-400)', margin: 0 }}>Immediate triage flags</p>
          </div>

          <div style={kpiCardStyle}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber-600)', textTransform: 'uppercase' }}>Moderate Watchlist</span>
            <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--amber-600)', margin: '6px 0 2px' }}>{medCount}</p>
            <p style={{ fontSize: 12, color: 'var(--ink-400)', margin: 0 }}>Proactive outreach cases</p>
          </div>

          <div style={kpiCardStyle}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--sage-600)', textTransform: 'uppercase' }}>Assisted / Resolved</span>
            <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--sage-600)', margin: '6px 0 2px' }}>{resolvedCount}</p>
            <p style={{ fontSize: 12, color: 'var(--ink-400)', margin: 0 }}>Contacted &amp; supported</p>
          </div>

          <div style={kpiCardStyle}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy-800)', textTransform: 'uppercase' }}>Total Active Intake</span>
            <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--navy-800)', margin: '6px 0 2px' }}>{totalCount}</p>
            <p style={{ fontSize: 12, color: 'var(--ink-400)', margin: 0 }}>Screened student cohort</p>
          </div>
        </div>

        {/* 2. TRIAGE QUEUE (MAIN SECTION) */}
        <div style={{
          background: '#fff', border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '24px 28px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {/* Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All Urgency' },
                { id: 'high', label: '🔴 High Urgency' },
                { id: 'medium', label: '🟡 Moderate' },
                { id: 'low', label: '🟢 Low' },
                { id: 'new', label: 'Unreviewed' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as any)}
                  style={{
                    padding: '6px 14px', borderRadius: 99,
                    border: '1px solid var(--border)', fontSize: 12.5, fontWeight: 600,
                    cursor: 'pointer',
                    background: filter === f.id ? 'var(--navy-950)' : 'var(--slate-50)',
                    color: filter === f.id ? '#fff' : 'var(--ink-700)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative' }}>
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by ID or risk factor..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  padding: '7px 12px 7px 32px', borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border)', fontSize: 13, width: 240,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Actionable Triage Table */}
          {filtered.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--ink-400)' }}>
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-700)', margin: 0 }}>Queue is clear for this filter</p>
              <p style={{ fontSize: 13, color: 'var(--ink-400)', margin: '4px 0 0' }}>All flagged cases have been triaged or no records match.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                <thead>
                  <tr style={{ background: 'var(--slate-100)', color: 'var(--ink-700)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px', borderRadius: '6px 0 0 6px' }}>Student ID (Anonymized)</th>
                    <th style={{ padding: '10px 14px' }}>Risk Tier</th>
                    <th style={{ padding: '10px 14px' }}>Last Intake</th>
                    <th style={{ padding: '10px 14px' }}>Why Flagged (Key Drivers)</th>
                    <th style={{ padding: '10px 14px' }}>Current Status</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right', borderRadius: '0 6px 6px 0' }}>Quick Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(row => {
                    const tier = row.risk_tier || 'Low'
                    const rowStatus = studentStatuses[row.assessment_id] || row.status || 'New'
                    const whyFlagged = (row.top_factors && row.top_factors.length > 0)
                      ? row.top_factors.slice(0, 2).join(' • ')
                      : 'Standard baseline indicators'

                    return (
                      <tr key={row.assessment_id} style={{ borderBottom: '1px solid var(--slate-100)', transition: 'background 0.15s ease' }}>
                        
                        {/* Student ID */}
                        <td style={{ padding: '14px 14px', fontWeight: 700, color: 'var(--ink-900)', fontFamily: 'var(--font-mono)' }}>
                          {row.student_id || 'STU-ANON'}
                        </td>

                        {/* Risk Tier Badge */}
                        <td style={{ padding: '14px 14px' }}>
                          <span style={{
                            display: 'inline-block', fontSize: 11.5, fontWeight: 700,
                            padding: '3px 10px', borderRadius: 99,
                            background: tier === 'High' ? 'var(--coral-100)' : tier === 'Medium' ? 'var(--amber-100)' : 'var(--sage-100)',
                            color: tier === 'High' ? 'var(--coral-600)' : tier === 'Medium' ? 'var(--amber-600)' : 'var(--sage-600)',
                            border: `1px solid ${tier === 'High' ? 'var(--coral-500)' : tier === 'Medium' ? 'var(--amber-500)' : 'var(--sage-500)'}`,
                          }}>
                            {tier} Risk
                          </span>
                        </td>

                        {/* Last Intake */}
                        <td style={{ padding: '14px 14px', color: 'var(--ink-500)', fontSize: 12.5 }}>
                          {getDaysAgo(row.timestamp)}
                        </td>

                        {/* Why Flagged */}
                        <td style={{ padding: '14px 14px', color: 'var(--ink-700)', maxWidth: 260 }}>
                          <span style={{ fontSize: 12.5 }}>{whyFlagged}</span>
                        </td>

                        {/* Current Status */}
                        <td style={{ padding: '14px 14px' }}>
                          <span style={{
                            fontSize: 12, fontWeight: 600,
                            color: rowStatus === 'Contacted' ? 'var(--sage-600)' : rowStatus === 'In progress' ? 'var(--amber-600)' : 'var(--ink-500)',
                          }}>
                            {rowStatus}
                          </span>
                        </td>

                        {/* Inline Actions */}
                        <td style={{ padding: '14px 14px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <button
                              onClick={() => handleQuickStatus(row.assessment_id, 'Contacted')}
                              disabled={actionLoadingId === row.assessment_id}
                              title="Mark as Contacted"
                              style={{
                                padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border)',
                                background: '#fff', color: 'var(--sage-600)', fontSize: 12, fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Contacted
                            </button>

                            <button
                              onClick={() => {
                                onSelectStudent(row.assessment_id)
                                onNavigate('student-profile')
                              }}
                              title="Open Full Case Record & Notes"
                              style={{
                                padding: '5px 10px', borderRadius: 6, border: 'none',
                                background: 'var(--navy-950)', color: '#fff', fontSize: 12, fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Review Case →
                            </button>
                          </div>
                        </td>

                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}

const kpiCardStyle: React.CSSProperties = {
  background: '#fff', borderRadius: 'var(--radius-md)',
  padding: '20px 22px', border: '1px solid var(--border)',
  boxShadow: 'var(--shadow-sm)',
}

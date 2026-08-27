import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import type { Page } from '../App'
import RiskBadge from '../components/RiskBadge'
import {
  User,
  Activity,
  Calendar,
  Shield,
  ArrowRight,
  Clock,
  Download,
  Trash2,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'

interface ProfileProps {
  onNavigate: (page: Page) => void
}

import { API_BASE } from '../config'

export default function Profile({ onNavigate }: ProfileProps) {
  const { user, token } = useAuth()
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState(false)

  const fetchHistory = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/results/history`, {
        credentials: 'include',
      })
      if (res.ok) {
        const rows = await res.json()
        const mapped = Array.isArray(rows)
          ? rows.map((r: any, idx: number) => ({
              id: r.id || idx,
              overall_wellbeing: Number(r.overall_wellbeing || 0),
              anxiety_signal: Number(r.anxiety_signal || 0),
              academic_strain: Number(r.academic_strain || 0),
              combined_score: Number(r.overall_wellbeing || 0) / 100,
              anxiety_score: (Number(r.anxiety_signal || 0) / 100) * 10,
              dropout_probability: Number(r.academic_strain || 0) / 100,
              risk_tier: r.risk_level || 'low',
              risk_level: r.risk_level || 'low',
              timestamp: r.created_at,
            }))
          : []
        setHistory(mapped)
      }
    } catch (err) {
      console.warn('Error fetching profile check-in history:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [user])

  const handleDownloadData = async () => {
    setExporting(true)
    try {
      const res = await fetch(`${API_BASE}/api/me/export`, {
        credentials: 'include',
      })
      let exportPayload: any
      if (res.ok) {
        exportPayload = await res.json()
      } else {
        exportPayload = {
          exported_at: new Date().toISOString(),
          user: user || { role: 'student' },
          assessments: history,
        }
      }

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `my_sahara_data.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error downloading data:', err)
    } finally {
      setExporting(false)
    }
  }

  const handleDeleteData = async () => {
    const confirmed = window.confirm(
      'This permanently deletes all your check-ins and results — are you sure?'
    )
    if (!confirmed) return

    setDeleting(true)
    try {
      await fetch(`${API_BASE}/api/me`, {
        method: 'DELETE',
        credentials: 'include',
      })

      setHistory([])
      setDeleteSuccess(true)
      await logout()
      onNavigate('home')
    } catch (err) {
      console.error('Error deleting data:', err)
    } finally {
      setDeleting(false)
    }
  }

  const latest = history[0]

  // Compute trend data for chart if 2+ records exist
  const sortedChronological = [...history].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
  const hasTrend = sortedChronological.length >= 2

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app, #F9F9F8)', padding: '40px 32px 80px' }}>
      <div style={{ maxWidth: 940, margin: '0 auto' }}>
        {/* 1. Header Profile Card */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: 16,
            padding: '28px 32px',
            marginBottom: 28,
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: '#01575E',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ST'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0E1A2B', margin: 0 }}>
                  {user?.name || 'Student Account'}
                </h1>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 99,
                    background: '#E0F2F1',
                    color: '#01575E',
                    textTransform: 'uppercase',
                  }}
                >
                  {user?.role || 'student'}
                </span>
              </div>
              <p style={{ fontSize: 13.5, color: '#64748B', margin: '2px 0 0' }}>
                {user?.email || 'Anonymous / Guest Session'} •{' '}
                <span style={{ color: '#16A34A', fontWeight: 600 }}>🔒 Cryptographic ID: STU-Protected</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('checkin')}
            className="btn-cta"
            style={{ padding: '10px 20px', fontSize: 13.5 }}
          >
            <span>Take New Check-in</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {deleteSuccess && (
          <div
            style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              color: '#166534',
              padding: '12px 18px',
              borderRadius: 12,
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13.5,
              fontWeight: 600,
            }}
          >
            <CheckCircle2 size={18} />
            <span>Your check-in history has been permanently and securely deleted.</span>
          </div>
        )}

        {/* 2. Longitudinal Trend View (If 2+ Check-ins Exist) */}
        {hasTrend && (
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: 16,
              padding: '24px 28px',
              marginBottom: 28,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0E1A2B', margin: 0 }}>
                  Longitudinal Wellbeing Progress
                </h3>
                <p style={{ fontSize: 13, color: '#64748B', margin: '2px 0 0' }}>
                  Risk score evolution across your last {sortedChronological.length} check-ins
                </p>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#01575E', background: '#E0F2F1', padding: '4px 10px', borderRadius: 6 }}>
                Trajectory Tracked
              </span>
            </div>

            {/* Simple Responsive SVG Trend Chart */}
            <div style={{ height: 160, width: '100%', position: 'relative', marginTop: 10 }}>
              <svg viewBox="0 0 500 120" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                {/* Horizontal reference lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="70" x2="500" y2="70" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />

                {/* Draw Trend Line */}
                {(() => {
                  const points = sortedChronological.map((item, idx) => {
                    const x = (idx / (sortedChronological.length - 1)) * 460 + 20
                    const score = item.combined_score !== null ? Math.round(item.combined_score * 100) : (item.anxiety_score * 10) || 50
                    const y = 110 - (score / 100) * 90
                    return { x, y, score, item }
                  })

                  const pathD = points.reduce(
                    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
                    ''
                  )

                  return (
                    <>
                      {/* Gradient Area below line */}
                      <path
                        d={`${pathD} L ${points[points.length - 1].x} 115 L ${points[0].x} 115 Z`}
                        fill="rgba(1, 87, 94, 0.08)"
                      />
                      {/* Trend Stroke */}
                      <path d={pathD} fill="none" stroke="#01575E" strokeWidth="3" strokeLinecap="round" />
                      {/* Data Dots */}
                      {points.map((p, i) => (
                        <g key={i}>
                          <circle cx={p.x} cy={p.y} r="5" fill="#FFFFFF" stroke="#01575E" strokeWidth="2.5" />
                          <text x={p.x} y={p.y - 10} fontSize="10" fontWeight="700" fill="#0E1A2B" textAnchor="middle">
                            {p.score}%
                          </text>
                        </g>
                      ))}
                    </>
                  )
                })()}
              </svg>
            </div>
          </div>
        )}

        {/* 3. Historical Check-in Logs Table */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: 16,
            padding: '24px 28px',
            marginBottom: 28,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Clock size={18} color="#01575E" />
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0E1A2B', margin: 0 }}>
              Past Check-in History
            </h3>
          </div>

          {isLoading ? (
            <p style={{ textAlign: 'center', color: '#64748B', padding: '30px 0', fontSize: 14 }}>
              Loading assessment records...
            </p>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Activity size={36} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: 15, fontWeight: 600, color: '#0E1A2B', margin: '0 0 4px' }}>
                No past check-ins recorded yet.
              </p>
              <p style={{ fontSize: 13.5, color: '#64748B', margin: '0 0 18px' }}>
                Take your first 3-minute check-in to unlock progress tracking.
              </p>
              <button
                onClick={() => onNavigate('checkin')}
                className="btn-teal"
                style={{ padding: '9px 18px', fontSize: 13.5 }}
              >
                Start First Check-in
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #E2E8F0', background: '#F8FAFC' }}>
                    <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>Date & Time</th>
                    <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>Wellbeing Status</th>
                    <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>Anxiety Scale</th>
                    <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>Retention Risk</th>
                    <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>Contributing Factors</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row, idx) => {
                    const tier = row.risk_tier || 'Low'
                    const factorsList = Array.isArray(row.top_factors)
                      ? row.top_factors
                      : typeof row.top_factors === 'string'
                      ? JSON.parse(row.top_factors || '[]')
                      : []

                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px 14px', color: '#0E1A2B', fontWeight: 500 }}>
                          {new Date(row.timestamp).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <RiskBadge tier={tier} size="sm" />
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 600, color: '#01575E' }}>
                          {row.anxiety_score !== null ? `${row.anxiety_score}/10` : '—'}
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 600, color: '#D99A34' }}>
                          {row.dropout_probability !== null ? `${Math.round(row.dropout_probability * 100)}%` : '—'}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 300 }}>
                            {factorsList.slice(0, 2).map((f: string, fIdx: number) => (
                              <span
                                key={fIdx}
                                style={{
                                  background: '#F1F5F9',
                                  color: '#334155',
                                  fontSize: 11.5,
                                  padding: '2px 8px',
                                  borderRadius: 4,
                                }}
                              >
                                {f}
                              </span>
                            ))}
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

        {/* 4. Student Data Privacy Controls (Download & Delete) */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: 16,
            padding: '24px 28px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Shield size={18} color="#01575E" />
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0E1A2B', margin: 0 }}>
              Your Data Rights & Privacy Controls
            </h3>
          </div>
          <p style={{ fontSize: 13.5, color: '#64748B', margin: '0 0 20px', lineHeight: 1.6 }}>
            Under SAHARA's student privacy charter, you have full sovereignty over your assessment history. You may download a portable JSON copy or permanently purge your check-in records at any time.
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <button
              onClick={handleDownloadData}
              disabled={exporting}
              className="btn-outline"
              style={{ padding: '10px 20px', fontSize: 13.5 }}
            >
              <Download size={15} />
              <span>{exporting ? 'Exporting...' : 'Download My Data (JSON)'}</span>
            </button>

            <button
              onClick={handleDeleteData}
              disabled={deleting || history.length === 0}
              style={{
                background: '#FFF7ED',
                border: '1.5px solid #FED7AA',
                color: '#C2410C',
                padding: '10px 20px',
                borderRadius: 8,
                fontSize: 13.5,
                fontWeight: 600,
                cursor: history.length === 0 || deleting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                opacity: history.length === 0 ? 0.5 : 1,
              }}
            >
              <Trash2 size={15} />
              <span>{deleting ? 'Purging...' : 'Delete My Assessment History'}</span>
            </button>
          </div>
        </div>

        {/* System & Developer Metadata */}
        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12.5, color: '#64748B' }}>
          SAHARA — Student Academic Health & Attrition Risk Assessment Platform · Lead Developer: <strong style={{ color: '#0E1A2B' }}>Pradipta Chandra Giri</strong>
        </div>
      </div>
    </div>
  )
}

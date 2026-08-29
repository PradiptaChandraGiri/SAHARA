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
  RefreshCw,
  Sliders,
  Bell,
  Check,
} from 'lucide-react'
import { API_BASE } from '../config'

interface ProfileProps {
  onNavigate: (page: Page) => void
}

interface RetentionInfo {
  retentionDays: number
  totalAssessments: number
  nextScheduledCleanupDate: string | null
  daysRemainingUntilCleanup: number
  expiringCount: number
  isExpiringSoon: boolean
  notificationAlert: string | null
  lastExtendedAt: string | null
}

export default function Profile({ onNavigate }: ProfileProps) {
  const { user, token, logout } = useAuth()
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState(false)

  // Data Retention State
  const [retention, setRetention] = useState<RetentionInfo>({
    retentionDays: 30,
    totalAssessments: 0,
    nextScheduledCleanupDate: null,
    daysRemainingUntilCleanup: 30,
    expiringCount: 0,
    isExpiringSoon: false,
    notificationAlert: null,
    lastExtendedAt: null,
  })
  const [isExtending, setIsExtending] = useState(false)
  const [extendSuccess, setExtendSuccess] = useState(false)
  const [updatingDays, setUpdatingDays] = useState(false)

  const fetchHistory = async () => {
    setIsLoading(true)
    try {
      const savedToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sahara_token') : null)
      const headers: Record<string, string> = { 'Accept': 'application/json' }
      if (savedToken) headers['Authorization'] = `Bearer ${savedToken}`

      const res = await fetch(`${API_BASE}/api/results/history`, {
        credentials: 'include',
        headers,
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
              risk_tier: r.risk_level || (Number(r.overall_wellbeing) > 65 ? 'high' : Number(r.overall_wellbeing) > 35 ? 'medium' : 'low'),
              risk_level: r.risk_level || (Number(r.overall_wellbeing) > 65 ? 'high' : Number(r.overall_wellbeing) > 35 ? 'medium' : 'low'),
              factors: Array.isArray(r.contributing_factors) ? r.contributing_factors : [],
              top_factors: Array.isArray(r.contributing_factors) ? r.contributing_factors : [],
              timestamp: r.created_at || new Date().toISOString(),
              expires_at: r.expires_at || null,
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

  const fetchRetentionStatus = async () => {
    try {
      const savedToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sahara_token') : null)
      const headers: Record<string, string> = { 'Accept': 'application/json' }
      if (savedToken) headers['Authorization'] = `Bearer ${savedToken}`

      const res = await fetch(`${API_BASE}/api/me/retention`, {
        credentials: 'include',
        headers,
      })
      if (res.ok) {
        const data = await res.json()
        setRetention(data)
      }
    } catch (err) {
      console.warn('Error fetching retention status:', err)
    }
  }

  useEffect(() => {
    fetchHistory()
    fetchRetentionStatus()
  }, [user])

  const handleExtendRetention = async () => {
    setIsExtending(true)
    try {
      const savedToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sahara_token') : null)
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (savedToken) headers['Authorization'] = `Bearer ${savedToken}`

      const res = await fetch(`${API_BASE}/api/me/retention/extend`, {
        method: 'POST',
        credentials: 'include',
        headers,
      })
      if (res.ok) {
        setExtendSuccess(true)
        await fetchRetentionStatus()
        await fetchHistory()
        setTimeout(() => setExtendSuccess(false), 4000)
      }
    } catch (err) {
      console.warn('Error extending retention:', err)
    } finally {
      setIsExtending(false)
    }
  }

  const handleUpdateRetentionDays = async (days: number) => {
    setUpdatingDays(true)
    try {
      const savedToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sahara_token') : null)
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (savedToken) headers['Authorization'] = `Bearer ${savedToken}`

      const res = await fetch(`${API_BASE}/api/me/retention/settings`, {
        method: 'PATCH',
        credentials: 'include',
        headers,
        body: JSON.stringify({ retentionDays: days }),
      })
      if (res.ok) {
        await fetchRetentionStatus()
        await fetchHistory()
      }
    } catch (err) {
      console.warn('Error updating retention timeline:', err)
    } finally {
      setUpdatingDays(false)
    }
  }

  const handleDownloadData = async () => {
    setExporting(true)
    try {
      const savedToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sahara_token') : null)
      const headers: Record<string, string> = { 'Accept': 'application/json' }
      if (savedToken) headers['Authorization'] = `Bearer ${savedToken}`

      const res = await fetch(`${API_BASE}/api/me/export`, {
        credentials: 'include',
        headers,
      })
      let exportPayload: any
      if (res.ok) {
        exportPayload = await res.json()
      } else {
        exportPayload = {
          exported_at: new Date().toISOString(),
          user: user || { role: 'student' },
          retention_policy: `${retention.retentionDays} days`,
          assessments: history,
        }
      }

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sahara-wellbeing-export-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.warn('Export error:', err)
    } finally {
      setExporting(false)
    }
  }

  const handleDeleteData = async () => {
    if (!window.confirm('Are you sure you want to permanently delete all your assessment records? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      const savedToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sahara_token') : null)
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (savedToken) headers['Authorization'] = `Bearer ${savedToken}`

      const res = await fetch(`${API_BASE}/api/me`, {
        method: 'DELETE',
        credentials: 'include',
        headers,
      })
      if (res.ok) {
        setHistory([])
        await fetchRetentionStatus()
        setDeleteSuccess(true)
        setTimeout(() => setDeleteSuccess(false), 5000)
      }
    } catch (err) {
      console.warn('Delete error:', err)
    } finally {
      setDeleting(false)
    }
  }

  const sortedChronological = [...history].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
  const hasTrend = sortedChronological.length >= 2

  const formatExpiryDisplay = (expiresAtStr?: string, createdStr?: string) => {
    if (!expiresAtStr && !createdStr) return 'Active'
    const targetDate = expiresAtStr ? new Date(expiresAtStr) : new Date(new Date(createdStr!).getTime() + retention.retentionDays * 86400000)
    const diffMs = targetDate.getTime() - Date.now()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays <= 0) return 'Expired'
    if (diffDays === 1) return 'Expires tomorrow'
    if (diffDays <= 7) return `Expires in ${diffDays} days`
    return `Retained until ${targetDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background)', padding: '40px 32px 80px', transition: 'background-color 0.25s ease' }}>
      <div style={{ maxWidth: 920, margin: '0 auto' }}>
        {/* Top Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Account &amp; Wellbeing Longitudinal Record
          </h1>
          <p style={{ fontSize: 14.5, color: 'var(--color-text-muted)', marginTop: 4, margin: '4px 0 0' }}>
            Manage your student profile, track timeline progress, and control your data retention lifecycle.
          </p>
        </div>

        {/* Expiry Warning Notification Banner (When approaching expiration) */}
        {retention.notificationAlert && (
          <div
            style={{
              background: 'var(--color-accent-subtle)',
              border: '1.5px solid var(--color-accent)',
              borderRadius: 14,
              padding: '16px 20px',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 280 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'var(--color-accent)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Bell size={18} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 2px', fontSize: 14.5, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Scheduled Data Retention Notice
                </h4>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {retention.notificationAlert}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleExtendRetention}
                disabled={isExtending}
                style={{
                  background: 'var(--color-primary)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <RefreshCw size={14} className={isExtending ? 'animate-spin' : ''} />
                <span>{isExtending ? 'Extending...' : `Extend +${retention.retentionDays} Days`}</span>
              </button>
              <button
                onClick={handleDownloadData}
                disabled={exporting}
                style={{
                  background: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  padding: '8px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Download size={14} />
                <span>Export JSON</span>
              </button>
            </div>
          </div>
        )}

        {/* Extend Success Banner */}
        {extendSuccess && (
          <div
            style={{
              background: 'var(--color-risk-low-bg)',
              border: '1px solid var(--color-risk-low-border)',
              color: 'var(--color-risk-low-text)',
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
            <span>Your assessment retention has been extended for another {retention.retentionDays} days from today.</span>
          </div>
        )}

        {/* 1. Profile Identity Card */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1.5px solid var(--color-border)',
            borderRadius: 16,
            padding: '24px 28px',
            marginBottom: 24,
            boxShadow: 'var(--shadow-sm)',
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
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'var(--color-primary-subtle)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontWeight: 800,
              }}
            >
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'PR'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                  {user?.name || 'Pradipta Chandra Giri'}
                </h2>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: 99,
                    background: 'var(--color-primary-subtle)',
                    color: 'var(--color-primary)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {user?.role || 'student'}
                </span>
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                {user?.email || 'giripradiptachandra@gmail.com'} •{' '}
                <span style={{ color: 'var(--color-risk-low)', fontWeight: 600 }}>🔒 Cryptographic ID: STU-Protected</span>
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
              background: 'var(--color-risk-low-bg)',
              border: '1px solid var(--color-risk-low-border)',
              color: 'var(--color-risk-low-text)',
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

        {/* 2. Data Retention Policy & Automated Cleanup Timeline Card */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1.5px solid var(--color-border)',
            borderRadius: 16,
            padding: '24px 28px',
            marginBottom: 28,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'var(--color-primary-subtle)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Clock size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                  Data Retention &amp; Automatic Expiration Timeline
                </h3>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                  Your records remain safe across logouts for your active retention window before privacy cleanup.
                </p>
              </div>
            </div>

            <button
              onClick={handleExtendRetention}
              disabled={isExtending || history.length === 0}
              className="btn-teal"
              style={{
                padding: '8px 16px',
                fontSize: 13,
                opacity: history.length === 0 ? 0.6 : 1,
                cursor: history.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <RefreshCw size={14} className={isExtending ? 'animate-spin' : ''} />
              <span>{isExtending ? 'Extending...' : 'Extend Retention Timeline'}</span>
            </button>
          </div>

          {/* Retention Stats Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              background: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: '16px 20px',
              marginBottom: 20,
            }}
          >
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)' }}>Active Retention Period</span>
              <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary)', margin: '4px 0 0' }}>
                {retention.retentionDays} Days
              </p>
            </div>
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)' }}>Active Records Preserved</span>
              <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-primary)', margin: '4px 0 0' }}>
                {history.length} {history.length === 1 ? 'Check-in' : 'Check-ins'}
              </p>
            </div>
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)' }}>Next Scheduled Cleanup</span>
              <p style={{ fontSize: 18, fontWeight: 800, color: retention.daysRemainingUntilCleanup <= 7 ? 'var(--color-accent)' : 'var(--color-text-primary)', margin: '4px 0 0' }}>
                {history.length > 0 && retention.nextScheduledCleanupDate
                  ? `${retention.daysRemainingUntilCleanup} days remaining`
                  : 'No pending cleanup'}
              </p>
            </div>
          </div>

          {/* Selectable Retention Options */}
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 10 }}>
              Adjust Your Preferred Data Retention Timeline:
            </span>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { days: 14, label: '14 Days (Minimal)' },
                { days: 30, label: '30 Days (Standard)' },
                { days: 60, label: '60 Days' },
                { days: 90, label: '90 Days (Academic Term)' },
                { days: 180, label: '180 Days (Semester)' },
                { days: 365, label: '1 Year (Annual)' },
              ].map((opt) => (
                <button
                  key={opt.days}
                  onClick={() => handleUpdateRetentionDays(opt.days)}
                  disabled={updatingDays}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: retention.retentionDays === opt.days ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: retention.retentionDays === opt.days ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                    color: retention.retentionDays === opt.days ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Longitudinal Trend View (If 2+ Check-ins Exist) */}
        {hasTrend && (
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1.5px solid var(--color-border)',
              borderRadius: 16,
              padding: '24px 28px',
              marginBottom: 28,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                  Longitudinal Wellbeing Progress
                </h3>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                  Risk score evolution across your last {sortedChronological.length} check-ins
                </p>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary)', background: 'var(--color-primary-subtle)', padding: '4px 10px', borderRadius: 6 }}>
                Trajectory Tracked
              </span>
            </div>

            {/* Responsive SVG Trend Chart */}
            <div style={{ height: 160, width: '100%', position: 'relative', marginTop: 10 }}>
              <svg viewBox="0 0 500 120" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                {/* Horizontal reference lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="var(--color-border-subtle)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="70" x2="500" y2="70" stroke="var(--color-border-subtle)" strokeWidth="1" strokeDasharray="4 4" />

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
                        fill="var(--color-primary-subtle)"
                      />
                      {/* Trend Stroke */}
                      <path d={pathD} fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />
                      {/* Data Dots */}
                      {points.map((p, i) => (
                        <g key={i}>
                          <circle cx={p.x} cy={p.y} r="5" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
                          <text x={p.x} y={p.y - 10} fontSize="10" fontWeight="700" fill="var(--color-text-primary)" textAnchor="middle">
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

        {/* 4. Historical Check-in Logs Table */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1.5px solid var(--color-border)',
            borderRadius: 16,
            padding: '24px 28px',
            marginBottom: 28,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} color="var(--color-primary)" />
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                Past Check-in History ({history.length})
              </h3>
            </div>

            {history.length > 0 && (
              <span style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>
                Protected by {retention.retentionDays}-day retention policy
              </span>
            )}
          </div>

          {isLoading ? (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '30px 0', fontSize: 14 }}>
              Loading assessment records...
            </p>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Activity size={36} color="var(--color-text-muted)" style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 4px' }}>
                No past check-ins recorded yet.
              </p>
              <p style={{ fontSize: 13.5, color: 'var(--color-text-muted)', margin: '0 0 18px' }}>
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
                  <tr style={{ borderBottom: '1.5px solid var(--color-border)', background: 'var(--color-surface-raised)' }}>
                    <th style={{ padding: '12px 14px', color: 'var(--color-text-secondary)', fontWeight: 700 }}>Date &amp; Time</th>
                    <th style={{ padding: '12px 14px', color: 'var(--color-text-secondary)', fontWeight: 700 }}>Wellbeing Status</th>
                    <th style={{ padding: '12px 14px', color: 'var(--color-text-secondary)', fontWeight: 700 }}>Anxiety Scale</th>
                    <th style={{ padding: '12px 14px', color: 'var(--color-text-secondary)', fontWeight: 700 }}>Retention Risk</th>
                    <th style={{ padding: '12px 14px', color: 'var(--color-text-secondary)', fontWeight: 700 }}>Contributing Factors</th>
                    <th style={{ padding: '12px 14px', color: 'var(--color-text-secondary)', fontWeight: 700 }}>Retention Status</th>
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

                    const expiryText = formatExpiryDisplay(row.expires_at, row.timestamp)

                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                        <td style={{ padding: '12px 14px', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                          {new Date(row.timestamp).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <RiskBadge tier={tier} size="sm" />
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--color-primary)' }}>
                          {row.anxiety_score !== null ? `${Math.round(row.anxiety_score * 10) / 10}/10` : '—'}
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--color-accent)' }}>
                          {row.dropout_probability !== null ? `${Math.round(row.dropout_probability * 100)}%` : '—'}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 260 }}>
                            {factorsList.slice(0, 2).map((f: string, fIdx: number) => (
                              <span
                                key={fIdx}
                                style={{
                                  background: 'var(--color-surface-raised)',
                                  color: 'var(--color-text-secondary)',
                                  border: '1px solid var(--color-border)',
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
                        <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--color-text-muted)' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              background: 'var(--color-surface-raised)',
                              padding: '3px 8px',
                              borderRadius: 6,
                              border: '1px solid var(--color-border)',
                              fontSize: 11.5,
                              fontWeight: 600,
                            }}
                          >
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-primary)' }} />
                            {expiryText}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 5. Student Data Privacy Controls (Download & Delete) */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1.5px solid var(--color-border)',
            borderRadius: 16,
            padding: '24px 28px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Shield size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
              Your Data Rights &amp; Privacy Controls
            </h3>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--color-text-secondary)', margin: '0 0 20px', lineHeight: 1.6 }}>
            Under SAHARA's student privacy charter, you have full sovereignty over your assessment history. You may download a portable JSON copy, adjust your automated retention timeline, or immediately delete your records at any time.
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
                background: 'var(--color-risk-high-bg)',
                border: '1.5px solid var(--color-risk-high-border)',
                color: 'var(--color-risk-high-text)',
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
        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12.5, color: 'var(--color-text-muted)' }}>
          SAHARA — Student Academic Health &amp; Attrition Risk Assessment Platform · Lead Developer: <strong style={{ color: 'var(--color-text-primary)' }}>Pradipta Chandra Giri</strong>
        </div>
      </div>
    </div>
  )
}

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
  BellOff,
  Check,
  Smartphone,
  Globe,
  Sun,
  Moon,
  Sparkles,
  Send,
  PauseCircle,
  PlayCircle,
} from 'lucide-react'
import { API_BASE } from '../config'
import { enableBrowserNotifications, checkNotificationSupport } from '../utils/notifications'

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

interface NotificationPreferences {
  channel_browser: boolean
  channel_whatsapp: boolean
  morning_enabled: boolean
  morning_time: string
  evening_enabled: boolean
  evening_time: string
  contextual_enabled: boolean
  timezone: string
  is_paused: boolean
  paused_until: string | null
  has_whatsapp: boolean
  whatsapp_number: string | null
  vapid_public_key?: string
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
  const [pruningStorage, setPruningStorage] = useState(false)
  const [pruneSuccessMsg, setPruneSuccessMsg] = useState<string | null>(null)
  const [timeWindowFilter, setTimeWindowFilter] = useState<number | 'all'>(14)

  // Notification Preferences State
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>({
    channel_browser: false,
    channel_whatsapp: false,
    morning_enabled: false,
    morning_time: '08:00',
    evening_enabled: false,
    evening_time: '21:00',
    contextual_enabled: false,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    is_paused: false,
    paused_until: null,
    has_whatsapp: false,
    whatsapp_number: null,
  })
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [prefsSavedMessage, setPrefsSavedMessage] = useState(false)
  const [customPhone, setCustomPhone] = useState('')
  const [testingNotification, setTestingNotification] = useState(false)
  const [testResultMsg, setTestResultMsg] = useState<string | null>(null)
  const [pausing, setPausing] = useState(false)

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

  const fetchNotificationPreferences = async () => {
    try {
      const savedToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sahara_token') : null)
      const headers: Record<string, string> = { 'Accept': 'application/json' }
      if (savedToken) headers['Authorization'] = `Bearer ${savedToken}`

      const res = await fetch(`${API_BASE}/api/notifications/preferences`, {
        credentials: 'include',
        headers,
      })
      if (res.ok) {
        const data = await res.json()
        const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
        setNotifPrefs({
          ...data,
          timezone: data.timezone && data.timezone !== 'UTC' ? data.timezone : userTz,
        })
        if (data.whatsapp_number) {
          setCustomPhone(data.whatsapp_number)
        }
      }
    } catch (err) {
      console.warn('Error fetching notification preferences:', err)
    }
  }

  useEffect(() => {
    fetchHistory()
    fetchRetentionStatus()
    fetchNotificationPreferences()
  }, [user])

  const handleToggleBrowserPush = async () => {
    if (!notifPrefs.channel_browser) {
      // User is turning it ON -> trigger the OS permission prompt ONLY upon user click
      const success = await enableBrowserNotifications(notifPrefs.vapid_public_key)
      if (success) {
        setNotifPrefs((prev) => ({ ...prev, channel_browser: true }))
      } else {
        alert('Browser notification permission was not granted or is blocked by your browser settings.')
      }
    } else {
      // User is turning it OFF
      setNotifPrefs((prev) => ({ ...prev, channel_browser: false }))
    }
  }

  const handleSavePreferences = async () => {
    setSavingPrefs(true)
    try {
      const savedToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sahara_token') : null)
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (savedToken) headers['Authorization'] = `Bearer ${savedToken}`

      const payload = {
        ...notifPrefs,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || notifPrefs.timezone || 'UTC',
        whatsapp_number: customPhone || notifPrefs.whatsapp_number,
      }

      const res = await fetch(`${API_BASE}/api/notifications/preferences`, {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setPrefsSavedMessage(true)
        await fetchNotificationPreferences()
        setTimeout(() => setPrefsSavedMessage(false), 4000)
      }
    } catch (err) {
      console.warn('Error saving notification preferences:', err)
    } finally {
      setSavingPrefs(false)
    }
  }

  const handlePauseReminders = async (days: number, resume: boolean = false) => {
    setPausing(true)
    try {
      const savedToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sahara_token') : null)
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (savedToken) headers['Authorization'] = `Bearer ${savedToken}`

      const res = await fetch(`${API_BASE}/api/notifications/pause`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({ days, resume }),
      })
      if (res.ok) {
        await fetchNotificationPreferences()
      }
    } catch (err) {
      console.warn('Error toggling pause state:', err)
    } finally {
      setPausing(false)
    }
  }

  const handleSendTestNotification = async (channel: 'browser' | 'whatsapp') => {
    setTestingNotification(true)
    setTestResultMsg(null)
    try {
      const savedToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sahara_token') : null)
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (savedToken) headers['Authorization'] = `Bearer ${savedToken}`

      const res = await fetch(`${API_BASE}/api/notifications/test-send`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({ channel, type: 'morning' }),
      })
      if (res.ok) {
        const data = await res.json()
        if (channel === 'browser') {
          setTestResultMsg('✓ Test browser push sent! Check your system notification banner.')
        } else {
          setTestResultMsg(
            data.result?.status === 'delivered_via_template' || data.result?.status === 'delivered_direct_sandbox'
              ? '✓ Test WhatsApp reminder sent to your linked number!'
              : 'ℹ️ WhatsApp reminder queued (Template awaiting Twilio approval or join sandbox required).'
          )
        }
        setTimeout(() => setTestResultMsg(null), 6000)
      }
    } catch (err) {
      console.warn('Test notification error:', err)
    } finally {
      setTestingNotification(false)
    }
  }

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
        setTimeWindowFilter(days)
        await fetchRetentionStatus()
        await fetchHistory()
      }
    } catch (err) {
      console.warn('Error updating retention timeline:', err)
    } finally {
      setUpdatingDays(false)
    }
  }

  const handlePruneStorage = async (options: { olderThanDays?: number; keepLatestCount?: number }) => {
    const confirmMsg = options.keepLatestCount
      ? `Are you sure you want to prune older test data and keep only your ${options.keepLatestCount} most recent check-ins?`
      : `Are you sure you want to permanently delete records older than ${options.olderThanDays || 30} days to optimize database storage?`

    if (!window.confirm(confirmMsg)) return

    setPruningStorage(true)
    try {
      const savedToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sahara_token') : null)
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (savedToken) headers['Authorization'] = `Bearer ${savedToken}`

      const res = await fetch(`${API_BASE}/api/me/retention/purge-old`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(options),
      })
      if (res.ok) {
        const data = await res.json()
        setPruneSuccessMsg(data.message || 'Storage optimized successfully.')
        await fetchHistory()
        await fetchRetentionStatus()
        setTimeout(() => setPruneSuccessMsg(null), 5000)
      }
    } catch (err) {
      console.warn('Prune storage error:', err)
    } finally {
      setPruningStorage(false)
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
          notification_preferences: notifPrefs,
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

  const visibleHistory = history.filter((item) => {
    if (timeWindowFilter === 'all') return true
    const cutoffMs = Date.now() - Number(timeWindowFilter) * 24 * 60 * 60 * 1000
    return new Date(item.timestamp).getTime() >= cutoffMs
  })

  const sortedChronological = [...visibleHistory].sort(
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

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || notifPrefs.timezone || 'UTC'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background)', padding: '40px 32px 80px', transition: 'background-color 0.25s ease' }}>
      <div style={{ maxWidth: 920, margin: '0 auto' }}>
        {/* Top Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Account, Wellbeing &amp; Reminders Center
          </h1>
          <p style={{ fontSize: 14.5, color: 'var(--color-text-muted)', marginTop: 4, margin: '4px 0 0' }}>
            Manage your student profile, gentle check-in reminders, and data retention lifecycle.
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

        {/* 2. Notification & Reminder Preference Center */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1.5px solid var(--color-border)',
            borderRadius: 16,
            padding: '28px 30px',
            marginBottom: 28,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
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
                <Bell size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                  Notification &amp; Wellbeing Reminders
                </h3>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                  Gentle, opt-in reminders capped at maximum 2 per day. Nothing sends unless you enable it.
                </p>
              </div>
            </div>

            {/* Timezone badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--color-surface-raised)',
                padding: '5px 12px',
                borderRadius: 8,
                border: '1px solid var(--color-border)',
                fontSize: 12,
                color: 'var(--color-text-secondary)',
                fontWeight: 600,
              }}
            >
              <Globe size={14} color="var(--color-primary)" />
              <span>Timezone: {userTimezone}</span>
            </div>
          </div>

          {/* Pause Status Indicator */}
          {notifPrefs.is_paused && (
            <div
              style={{
                background: 'var(--color-accent-subtle)',
                border: '1px solid var(--color-accent)',
                borderRadius: 10,
                padding: '12px 16px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PauseCircle size={16} color="var(--color-accent)" />
                <span style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 600 }}>
                  All reminders are currently paused until{' '}
                  {notifPrefs.paused_until ? new Date(notifPrefs.paused_until).toLocaleDateString() : 'resumed'}.
                </span>
              </div>
              <button
                onClick={() => handlePauseReminders(0, true)}
                disabled={pausing}
                style={{
                  background: 'var(--color-primary)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <PlayCircle size={14} />
                <span>Resume Now</span>
              </button>
            </div>
          )}

          {/* Channels Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
            {/* Browser Push Channel */}
            <div
              style={{
                background: 'var(--color-surface-raised)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 12,
                padding: '18px 20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Globe size={18} color="var(--color-primary)" />
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    Browser Notifications
                  </span>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={notifPrefs.channel_browser}
                    onChange={handleToggleBrowserPush}
                    style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                  />
                </label>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--color-text-muted)', margin: '0 0 12px', lineHeight: 1.5 }}>
                Gentle system notification banner on your computer or phone browser. Only requests browser permission upon clicking.
              </p>
              {notifPrefs.channel_browser && (
                <button
                  type="button"
                  onClick={() => handleSendTestNotification('browser')}
                  disabled={testingNotification}
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-primary)',
                    borderRadius: 6,
                    padding: '5px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Send size={12} />
                  <span>Send Test Browser Notification</span>
                </button>
              )}
            </div>

            {/* WhatsApp Reminder Channel */}
            <div
              style={{
                background: 'var(--color-surface-raised)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 12,
                padding: '18px 20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Smartphone size={18} color="var(--color-risk-low)" />
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    WhatsApp Reminders
                  </span>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={notifPrefs.channel_whatsapp}
                    onChange={(e) => setNotifPrefs((prev) => ({ ...prev, channel_whatsapp: e.target.checked }))}
                    style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--color-risk-low)' }}
                  />
                </label>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--color-text-muted)', margin: '0 0 10px', lineHeight: 1.5 }}>
                Receive discreet, factor-aware check-in invitations via the official SAHARA WhatsApp bot.
              </p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="text"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: 12.5,
                    outline: 'none',
                  }}
                />
                {notifPrefs.channel_whatsapp && (
                  <button
                    type="button"
                    onClick={() => handleSendTestNotification('whatsapp')}
                    disabled={testingNotification}
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-risk-low)',
                      borderRadius: 6,
                      padding: '5px 10px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      flexShrink: 0,
                    }}
                  >
                    <Send size={12} />
                    <span>Test</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Test Notification Feedback */}
          {testResultMsg && (
            <div
              style={{
                background: 'var(--color-primary-subtle)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-primary)',
                padding: '10px 14px',
                borderRadius: 8,
                marginBottom: 20,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {testResultMsg}
            </div>
          )}

          {/* Reminder Time Slots */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 24 }}>
            {/* Morning Slot */}
            <div
              style={{
                background: 'var(--color-surface-raised)',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                padding: '16px 18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sun size={17} color="var(--color-accent)" />
                  <span style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    Morning Check-in
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifPrefs.morning_enabled}
                  onChange={(e) => setNotifPrefs((prev) => ({ ...prev, morning_enabled: e.target.checked }))}
                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                />
              </div>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '0 0 10px', lineHeight: 1.4 }}>
                A peaceful 2-minute invitation to start your day with mindfulness.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 600 }}>Time:</label>
                <input
                  type="time"
                  value={notifPrefs.morning_time}
                  onChange={(e) => setNotifPrefs((prev) => ({ ...prev, morning_time: e.target.value }))}
                  disabled={!notifPrefs.morning_enabled}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: 13,
                    opacity: notifPrefs.morning_enabled ? 1 : 0.5,
                  }}
                />
              </div>
            </div>

            {/* Evening Wind-down Slot */}
            <div
              style={{
                background: 'var(--color-surface-raised)',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                padding: '16px 18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Moon size={17} color="var(--color-primary)" />
                  <span style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    Evening Wind-Down
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifPrefs.evening_enabled}
                  onChange={(e) => setNotifPrefs((prev) => ({ ...prev, evening_enabled: e.target.checked }))}
                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                />
              </div>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '0 0 10px', lineHeight: 1.4 }}>
                A gentle reminder to pause study and decompress before bed.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 600 }}>Time:</label>
                <input
                  type="time"
                  value={notifPrefs.evening_time}
                  onChange={(e) => setNotifPrefs((prev) => ({ ...prev, evening_time: e.target.value }))}
                  disabled={!notifPrefs.evening_enabled}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: 13,
                    opacity: notifPrefs.evening_enabled ? 1 : 0.5,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Contextual Nudge Toggle */}
          <div
            style={{
              background: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: '16px 20px',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
              <Sparkles size={18} color="var(--color-accent)" />
              <div>
                <h4 style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Occasional Contextual Suggestions
                </h4>
                <p style={{ margin: 0, fontSize: 12.5, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                  Occasionally suggest an evidence-based breathing or study strategy based on your latest check-in (never exceeds daily cap).
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifPrefs.contextual_enabled}
              onChange={(e) => setNotifPrefs((prev) => ({ ...prev, contextual_enabled: e.target.checked }))}
              style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--color-primary)' }}
            />
          </div>

          {/* Save & Pause Action Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 14,
              paddingTop: 16,
              borderTop: '1px solid var(--color-border)',
            }}
          >
            {/* Pause options */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12.5, color: 'var(--color-text-muted)', fontWeight: 600 }}>Pause Reminders:</span>
              <button
                type="button"
                onClick={() => handlePauseReminders(7)}
                disabled={pausing}
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  borderRadius: 6,
                  padding: '5px 10px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                1 Week
              </button>
              <button
                type="button"
                onClick={() => handlePauseReminders(14)}
                disabled={pausing}
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  borderRadius: 6,
                  padding: '5px 10px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                2 Weeks
              </button>
              {notifPrefs.is_paused && (
                <button
                  type="button"
                  onClick={() => handlePauseReminders(0, true)}
                  disabled={pausing}
                  style={{
                    background: 'var(--color-primary-subtle)',
                    border: '1px solid var(--color-primary)',
                    color: 'var(--color-primary)',
                    borderRadius: 6,
                    padding: '5px 10px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Resume Now
                </button>
              )}
            </div>

            {/* Save Preferences Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {prefsSavedMessage && (
                <span style={{ fontSize: 13, color: 'var(--color-risk-low)', fontWeight: 600 }}>
                  ✓ Preferences saved
                </span>
              )}
              <button
                type="button"
                onClick={handleSavePreferences}
                disabled={savingPrefs}
                className="btn-teal"
                style={{ padding: '8px 18px', fontSize: 13.5 }}
              >
                <Check size={15} />
                <span>{savingPrefs ? 'Saving...' : 'Save Reminder Preferences'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Data Retention Policy & Automated Cleanup Timeline Card */}
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

          {/* Storage Efficiency & Test Data Cleanup */}
          <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--color-border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
              <div>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text-primary)', display: 'block' }}>
                  Database Storage Management &amp; Data Pruning
                </span>
                <span style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>
                  Automatically deletes expired check-ins nightly. You can also manually prune older records or clear test data anytime to use storage efficiently.
                </span>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handlePruneStorage({ olderThanDays: 30 })}
                  disabled={pruningStorage || history.length === 0}
                  className="btn-outline-dark"
                  style={{ padding: '7px 14px', fontSize: 12.5, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Trash2 size={13} />
                  <span>Purge Records &gt;30 Days</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePruneStorage({ keepLatestCount: 3 })}
                  disabled={pruningStorage || history.length <= 3}
                  style={{
                    background: 'var(--color-risk-high-bg)',
                    color: 'var(--color-risk-high-text)',
                    border: '1px solid var(--color-risk-high-border)',
                    padding: '7px 14px',
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: history.length <= 3 ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    opacity: history.length <= 3 ? 0.6 : 1,
                  }}
                >
                  <Trash2 size={13} />
                  <span>Prune Test Data (Keep Last 3)</span>
                </button>
              </div>
            </div>

            {pruneSuccessMsg && (
              <div
                style={{
                  marginTop: 12,
                  padding: '9px 16px',
                  borderRadius: 8,
                  background: 'var(--color-risk-low-bg)',
                  border: '1px solid var(--color-risk-low-border)',
                  color: 'var(--color-risk-low-text)',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <CheckCircle2 size={16} />
                <span>{pruneSuccessMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* 4. Longitudinal Trend View (If 2+ Check-ins Exist) */}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                  Longitudinal Wellbeing Progress
                </h3>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                  Risk score evolution across your {sortedChronological.length} check-ins ({timeWindowFilter === 'all' ? 'All Active Time' : `Past ${timeWindowFilter} Days`})
                </p>
              </div>

              {/* Interactive Timeframe Filter Tabs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--color-surface-raised)', padding: '4px 6px', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                {[
                  { value: 7, label: '7 Days' },
                  { value: 14, label: '14 Days' },
                  { value: 30, label: '30 Days' },
                  { value: 'all', label: 'All Records' },
                ].map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTimeWindowFilter(t.value as any)}
                    style={{
                      background: timeWindowFilter === t.value ? 'var(--color-primary)' : 'transparent',
                      color: timeWindowFilter === t.value ? '#FFFFFF' : 'var(--color-text-secondary)',
                      border: 'none',
                      borderRadius: 6,
                      padding: '4px 10px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
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

        {/* 5. Historical Check-in Logs Table */}
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
                Past Check-in History ({visibleHistory.length}{timeWindowFilter !== 'all' ? ` of ${history.length} active` : ''})
              </h3>
            </div>

            {history.length > 0 && (
              <span style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>
                Showing records within {timeWindowFilter === 'all' ? 'entire' : `${timeWindowFilter}-day`} window
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
          ) : visibleHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', background: 'var(--color-surface-raised)', borderRadius: 12 }}>
              <Clock size={32} color="var(--color-text-muted)" style={{ margin: '0 auto 8px', opacity: 0.6 }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 4px' }}>
                No check-ins recorded in the selected past {timeWindowFilter} days.
              </p>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 12px' }}>
                You have {history.length} older check-ins preserved. Switch to a longer timeframe to view them.
              </p>
              <button
                type="button"
                onClick={() => setTimeWindowFilter('all')}
                className="btn-outline-dark"
                style={{ padding: '6px 14px', fontSize: 12.5 }}
              >
                Show All {history.length} Check-ins
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
                  {visibleHistory.map((row, idx) => {
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

        {/* 6. Student Data Privacy Controls (Download & Delete) */}
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

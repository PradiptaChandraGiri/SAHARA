import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import type { Page } from '../App'
import RiskBadge from '../components/RiskBadge'
import {
  ArrowLeft,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Clock,
  Send,
  MessageSquare,
  FileText,
  User,
  Shield,
  Save,
} from 'lucide-react'
import { API_BASE } from '../config'

interface StudentProfileProps {
  studentId: string
  onNavigate: (page: Page) => void
  studentStatuses: Record<string, string>
  onUpdateStatus: (id: string, status: string) => void
}

export default function StudentProfile({
  studentId,
  onNavigate,
  onUpdateStatus,
}: StudentProfileProps) {
  const { user, token } = useAuth()
  const [assessment, setAssessment] = useState<any>(null)
  const [caseNotesHistory, setCaseNotesHistory] = useState<any[]>([])
  const [status, setStatus] = useState<'New' | 'In progress' | 'Contacted'>('New')
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAssessment = async () => {
      if (!studentId) {
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      try {
        const savedToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sahara_token') : null)
        const headers: Record<string, string> = { 'Accept': 'application/json' }
        if (savedToken) headers['Authorization'] = `Bearer ${savedToken}`

        const res = await fetch(`${API_BASE}/api/counselor/students/${studentId}`, {
          credentials: 'include',
          headers,
        })
        if (res.ok) {
          const data = await res.json()
          const latest = data.history?.[0]
          if (latest) {
            setAssessment({
              student_name: latest.display_name || 'Student',
              student_id: studentId,
              assessment_id: latest.id || studentId,
              risk_tier: latest.risk_level === 'high' ? 'High' : latest.risk_level === 'moderate' ? 'Medium' : 'Low',
              combined_score: Number(latest.overall_wellbeing || 0) / 100,
              anxiety_score: (Number(latest.anxiety_signal || 0) / 100) * 10,
              dropout_probability: Number(latest.academic_strain || 0) / 100,
              top_factors: latest.contributing_factors || ['Study stress', 'Sleep deficit'],
              timestamp: latest.created_at || new Date().toISOString(),
              raw_input: latest.raw_input,
            })
          }
          setCaseNotesHistory(data.notes || [])
        }
      } catch (err) {
        console.warn('Error fetching student case:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssessment()
  }, [studentId])

  const handleSaveStatus = async (newStatus: 'New' | 'In progress' | 'Contacted') => {
    setIsSaving(true)
    setStatus(newStatus)
    onUpdateStatus(studentId, newStatus)
    try {
      const savedToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sahara_token') : null)
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (savedToken) headers['Authorization'] = `Bearer ${savedToken}`

      await fetch(`${API_BASE}/api/counselor/students/${studentId}/notes`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ status: newStatus.toLowerCase(), note: notes || `Status updated to ${newStatus}` }),
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.warn('Error saving case note:', err)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Loading student assessment case...</p>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-background)', padding: '40px 32px' }}>
        <button
          onClick={() => onNavigate('counselor')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-primary)',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 24,
            padding: 0,
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Counselor Dashboard</span>
        </button>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, padding: '36px', textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
          <AlertTriangle size={36} color="var(--color-accent)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 6px' }}>Case Record Not Found</h3>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', margin: 0 }}>Please select an active student case from the triage queue.</p>
        </div>
      </div>
    )
  }

  const tier = assessment.risk_tier || 'Low'
  const rawInput = typeof assessment.raw_input === 'string' ? JSON.parse(assessment.raw_input || '{}') : assessment.raw_input || {}
  const factors = Array.isArray(assessment.top_factors)
    ? assessment.top_factors
    : typeof assessment.top_factors === 'string'
    ? JSON.parse(assessment.top_factors || '[]')
    : []

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background)', padding: '36px 32px 80px', transition: 'background-color 0.25s ease' }}>
      <div style={{ maxWidth: 940, margin: '0 auto' }}>
        {/* Back navigation */}
        <button
          onClick={() => onNavigate('counselor')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-primary)',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 20,
            padding: 0,
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Counselor Triage Queue</span>
        </button>

        {/* Case Header Banner */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1.5px solid var(--color-border)',
            borderRadius: 16,
            padding: '24px 28px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0, fontFamily: 'monospace' }}>
                Case: {assessment.student_id || 'STU-ANON'}
              </h1>
              <RiskBadge tier={tier} size="md" />
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--color-text-muted)', margin: 0 }}>
              Assessment ID: <span style={{ fontFamily: 'monospace' }}>{assessment.assessment_id}</span> • Taken on{' '}
              {new Date(assessment.timestamp).toLocaleString()}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {(['New', 'In progress', 'Contacted'] as const).map((s) => (
              <button
                key={s}
                onClick={() => handleSaveStatus(s)}
                disabled={isSaving}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: status === s ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                  background: status === s ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: status === s ? '#FFFFFF' : 'var(--color-text-secondary)',
                  transition: 'all 0.15s ease',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {saveSuccess && (
          <div
            style={{
              background: 'var(--color-risk-low-bg)',
              border: '1px solid var(--color-risk-low-border)',
              color: 'var(--color-risk-low-text)',
              padding: '10px 16px',
              borderRadius: 8,
              marginBottom: 20,
              fontSize: 13.5,
              fontWeight: 600,
            }}
          >
            ✓ Case notes & status updated successfully.
          </div>
        )}

        {/* 3 Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: 14, padding: '18px 20px' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Anxiety Score</span>
            <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-primary)', margin: '4px 0 2px' }}>
              {assessment.anxiety_score !== null ? `${Math.round(assessment.anxiety_score * 10) / 10}/10` : '—'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>RF Regression Model</p>
          </div>

          <div style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: 14, padding: '18px 20px' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Academic Dropout Risk</span>
            <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-accent)', margin: '4px 0 2px' }}>
              {assessment.dropout_probability !== null ? `${Math.round(assessment.dropout_probability * 100)}%` : '—'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>RF Classifier Model</p>
          </div>

          <div style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: 14, padding: '18px 20px' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Combined Wellbeing Index</span>
            <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary)', margin: '4px 0 2px' }}>
              {assessment.combined_score !== null ? `${Math.round(assessment.combined_score * 100)}%` : '—'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>Fused Dual Signal</p>
          </div>
        </div>

        {/* Contributing Drivers & Raw Inputs */}
        <div style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: 16, padding: '24px 28px', marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 12px' }}>
            Flagged Contributing Factors
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {factors.map((f: string, idx: number) => (
              <span
                key={idx}
                style={{
                  background: 'var(--color-risk-high-bg)',
                  border: '1px solid var(--color-risk-high-border)',
                  color: 'var(--color-risk-high-text)',
                  padding: '4px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {f}
              </span>
            ))}
          </div>

          <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 10px' }}>
            Intake Context Attributes
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, fontSize: 13 }}>
            {Object.entries(rawInput).slice(0, 12).map(([k, v]) => (
              <div key={k} style={{ background: 'var(--color-surface-raised)', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                <span style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: 11.5 }}>{k.replace(/_/g, ' ')}</span>
                <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{String(v)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Counselor Clinical Notes */}
        <div style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: 16, padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <FileText size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
              Counselor Case Notes & Follow-up Log
            </h3>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Document outreach attempts, student check-in conversation summaries, or academic advisor referrals..."
            rows={4}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 8,
              border: '1.5px solid var(--color-border)',
              fontSize: 14,
              fontFamily: 'inherit',
              background: 'var(--color-surface-raised)',
              color: 'var(--color-text-primary)',
              marginBottom: 14,
              outline: 'none',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => handleSaveStatus(status)}
              disabled={isSaving}
              className="btn-teal"
              style={{ padding: '9px 20px', fontSize: 13.5 }}
            >
              <Save size={15} />
              <span>{isSaving ? 'Saving Notes...' : 'Save Case Notes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

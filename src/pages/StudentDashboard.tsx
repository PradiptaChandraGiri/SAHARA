import { useState, useEffect } from 'react'
import type { Page, CheckInData } from '../App'
import { useAuth } from '../context/AuthContext'
import {
  HeartHandshake,
  Bot,
  BarChart3,
  Calendar,
  ArrowRight,
  Shield,
  PhoneCall,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react'

interface StudentDashboardProps {
  onNavigate: (page: Page) => void
  lastCheckInData: CheckInData | null
}

const API_BASE = (import.meta.env.VITE_API_URL || 'https://sahara-951p.onrender.com').replace(/\/$/, '')

export default function StudentDashboard({ onNavigate, lastCheckInData }: StudentDashboardProps) {
  const { user, token } = useAuth()
  const [latestAssessment, setLatestAssessment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLatest = async () => {
      setIsLoading(true)
      try {
        const headers: Record<string, string> = {}
        if (token) headers['Authorization'] = `Bearer ${token}`

        const url = user?.id
          ? `${API_BASE}/assessments?student_id=${user.id}&limit=1`
          : `${API_BASE}/assessments?limit=1`

        const res = await fetch(url, { headers })
        if (res.ok) {
          const data = await res.json()
          if (data.assessments && data.assessments.length > 0) {
            setLatestAssessment(data.assessments[0])
          }
        }
      } catch (err) {
        console.warn('Could not fetch student assessment history:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLatest()
  }, [user, token])

  // Determine active check-in data (either from live backend query or in-memory check-in)
  const activeData = lastCheckInData || latestAssessment
  const hasCompletedCheckIn = !!activeData

  // Calm, supportive language mapping (never clinical or scary)
  const getPlainLanguageSummary = (tier: string = 'low') => {
    const t = tier.toLowerCase()
    if (t === 'high') {
      return {
        title: "We think it's worth talking to someone",
        subtitle: 'Your recent responses indicate heavy study pressure and disrupted rest. Support is here to help you decompress.',
        badge: 'Extra Support Recommended',
        color: 'var(--coral-600)',
        bg: 'var(--coral-100)',
        borderColor: 'var(--coral-500)',
        icon: '🌱',
      }
    }
    if (t === 'medium') {
      return {
        title: 'Some signals to pay attention to',
        subtitle: "You're managing a busy workload, but fatigue is starting to build up. Taking small breaks now makes a big difference.",
        badge: 'Gentle Focus Needed',
        color: 'var(--amber-600)',
        bg: 'var(--amber-100)',
        borderColor: 'var(--amber-500)',
        icon: '🌤️',
      }
    }
    return {
      title: "You're doing okay",
      subtitle: 'Your sleep and daily routines look balanced right now. Keep protecting your downtime.',
      badge: 'Steady Wellbeing',
      color: 'var(--sage-600)',
      bg: 'var(--sage-100)',
      borderColor: 'var(--sage-500)',
      icon: '✨',
    }
  }

  const riskTier = activeData?.riskLevel || activeData?.risk_tier || 'Low'
  const summary = getPlainLanguageSummary(riskTier)
  const checkInDate = activeData?.timestamp
    ? new Date(activeData.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recent'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--slate-50)', padding: '40px 48px' }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        
        {/* Welcome Greeting Header */}
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber-600)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Student Wellbeing Space
              </span>
            </div>
            <h1 className="display" style={{ fontSize: 32, fontWeight: 600, color: 'var(--ink-900)', margin: 0 }}>
              Welcome back, {user?.name ? user.name.split(' ')[0] : 'Student'}
            </h1>
            <p style={{ fontSize: 14.5, color: 'var(--ink-500)', marginTop: 4 }}>
              Here is where you stand today and how we can support your week.
            </p>
          </div>

          {/* Urgent / Crisis Access Button */}
          <a
            href="tel:14416"
            title="Immediate 24/7 Toll-Free Support (Tele-MANAS 14416)"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 99,
              background: 'var(--coral-100)', border: '1.5px solid var(--coral-500)',
              color: 'var(--coral-600)', fontWeight: 700, fontSize: 13,
              textDecoration: 'none', transition: 'all 0.2s ease',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <PhoneCall className="w-4 h-4" />
            <span>24/7 Helpline: 14416</span>
          </a>
        </div>

        {/* 1. STATUS SUMMARY CARD (First-time empty state vs. Active status) */}
        {!hasCompletedCheckIn ? (
          /* Empty State for Brand New Student */
          <div className="dawn-in" style={{
            background: '#fff', border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '36px 40px',
            marginBottom: 36, boxShadow: 'var(--shadow-sm)',
            display: 'flex', flexDirection: 'column', gap: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, background: 'var(--amber-100)',
                color: 'var(--amber-600)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, flexShrink: 0,
              }}>
                🌱
              </div>
              <div style={{ flex: 1 }}>
                <span style={{
                  display: 'inline-block', fontSize: 11.5, fontWeight: 700,
                  color: 'var(--amber-600)', background: 'var(--amber-100)',
                  borderRadius: 99, padding: '3px 10px', marginBottom: 8, textTransform: 'uppercase',
                }}>
                  First Step
                </span>
                <h2 className="display" style={{ fontSize: 22, fontWeight: 600, color: 'var(--ink-900)', margin: '0 0 6px' }}>
                  Take your first check-in
                </h2>
                <p style={{ fontSize: 14.5, color: 'var(--ink-500)', lineHeight: 1.6, maxWidth: 600, margin: 0 }}>
                  A quick, confidential 2-minute check-in about your sleep, exam pressure, and daily load. It helps SAHARA understand how you're feeling and tailor real support for you.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--slate-100)', paddingTop: 20, flexWrap: 'wrap', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: 'var(--ink-400)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Clock className="w-4 h-4 text-slate-400" /> ~2 minutes
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Shield className="w-4 h-4 text-emerald-600" /> 100% Private &amp; Anonymized
                </span>
              </div>

              <button
                onClick={() => onNavigate('checkin')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '12px 24px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--navy-950)', color: '#fff',
                  fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)', transition: 'background 0.15s ease',
                }}
              >
                <span>Start First Check-In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Active Supportive Status Card */
          <div className="dawn-in" style={{
            background: '#fff', border: `1.5px solid ${summary.borderColor}`,
            borderRadius: 'var(--radius-lg)', padding: '32px 36px',
            marginBottom: 36, boxShadow: 'var(--shadow-md)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, flex: 1, minWidth: 280 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 14, background: summary.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, flexShrink: 0,
                }}>
                  {summary.icon}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{
                      fontSize: 11.5, fontWeight: 700, color: summary.color,
                      background: summary.bg, borderRadius: 99, padding: '3px 10px',
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>
                      {summary.badge}
                    </span>
                    <span style={{ fontSize: 12.5, color: 'var(--ink-400)' }}>
                      Last checked in: {checkInDate}
                    </span>
                  </div>

                  <h2 className="display" style={{ fontSize: 22, fontWeight: 600, color: 'var(--ink-900)', margin: '0 0 6px' }}>
                    {summary.title}
                  </h2>
                  <p style={{ fontSize: 14.5, color: 'var(--ink-700)', lineHeight: 1.6, margin: 0, maxWidth: 540 }}>
                    {summary.subtitle}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('checkin')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '10px 18px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--slate-100)', border: '1px solid var(--border)',
                  color: 'var(--navy-900)', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', alignSelf: 'center',
                }}
              >
                <span>Check in again</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 2. THREE CLEAR NEXT-STEP TILES */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="display" style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink-900)', margin: 0 }}>
              What would you like to do next?
            </h3>
            <span style={{ fontSize: 13, color: 'var(--ink-400)' }}>Confidential resources</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
            
            {/* Tile 1: AI Chat */}
            <div
              onClick={() => onNavigate('ai-support')}
              style={actionTileStyle}
            >
              <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--sage-100)', color: 'var(--sage-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Bot className="w-5 h-5" />
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-900)', margin: '0 0 6px' }}>
                Talk to SAHARA AI
              </h4>
              <p style={{ fontSize: 13.5, color: 'var(--ink-500)', lineHeight: 1.5, margin: '0 0 16px', flex: 1 }}>
                Get 24/7 empathetic guidance on study anxiety, sleep routines, or exam stress.
              </p>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy-700)', display: 'flex', alignItems: 'center', gap: 4 }}>
                Open AI Companion →
              </span>
            </div>

            {/* Tile 2: My Results detail */}
            <div
              onClick={() => onNavigate('results')}
              style={actionTileStyle}
            >
              <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--navy-100)', color: 'var(--navy-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-900)', margin: '0 0 6px' }}>
                See what's affecting your results
              </h4>
              <p style={{ fontSize: 13.5, color: 'var(--ink-500)', lineHeight: 1.5, margin: '0 0 16px', flex: 1 }}>
                View your detailed breakdown of contributing factors, academic risk, and habits.
              </p>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy-700)', display: 'flex', alignItems: 'center', gap: 4 }}>
                View Full Analysis →
              </span>
            </div>

            {/* Tile 3: Counselor Request */}
            <div
              onClick={() => onNavigate('whatsapp')}
              style={actionTileStyle}
            >
              <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--amber-100)', color: 'var(--amber-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-900)', margin: '0 0 6px' }}>
                WhatsApp Wellbeing Bot
              </h4>
              <p style={{ fontSize: 13.5, color: 'var(--ink-500)', lineHeight: 1.5, margin: '0 0 16px', flex: 1 }}>
                Connect on WhatsApp for instant 17-question intake, study video links, and counselor routing.
              </p>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--amber-600)', display: 'flex', alignItems: 'center', gap: 4 }}>
                Launch WhatsApp Bot →
              </span>
            </div>

          </div>
        </div>

        {/* Persistent Reassurance Banner */}
        <div style={{
          background: 'var(--slate-100)', borderRadius: 'var(--radius-md)',
          padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12,
          border: '1px solid var(--border)',
        }}>
          <Shield className="w-5 h-5 text-indigo-600 shrink-0" />
          <p style={{ fontSize: 13, color: 'var(--ink-700)', margin: 0, lineHeight: 1.5 }}>
            <strong>Your Privacy Guarantee:</strong> Your check-in evaluations are never published or shared with other students. Only authorized university counselors can review anonymized flags to offer timely support.
          </p>
        </div>

      </div>
    </div>
  )
}

const actionTileStyle: React.CSSProperties = {
  background: '#fff', borderRadius: 'var(--radius-md)',
  padding: '24px 22px', border: '1px solid var(--border)',
  boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
  display: 'flex', flexDirection: 'column',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
}

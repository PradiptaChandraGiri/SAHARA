import { useState, useEffect } from 'react'
import type { Page, CheckInData } from '../App'
import { useAuth } from '../context/AuthContext'
import RiskBadge from '../components/RiskBadge'
import { getResourcesForFactors, VettedResource } from '../data/resources'
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
  ExternalLink,
  MessageSquare,
  Compass,
  Lightbulb,
} from 'lucide-react'

interface StudentDashboardProps {
  onNavigate: (page: Page) => void
  lastCheckInData: CheckInData | null
}

import { API_BASE } from '../config'

export default function StudentDashboard({ onNavigate, lastCheckInData }: StudentDashboardProps) {
  const { user } = useAuth()
  const [latestAssessment, setLatestAssessment] = useState<any>(null)
  const [dbSuggestion, setDbSuggestion] = useState<VettedResource | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLatest = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`${API_BASE}/api/results/latest`, {
          credentials: 'include',
        })
        if (res.ok) {
          const row = await res.json()
          setLatestAssessment({
            id: row.id,
            riskLevel: row.risk_level,
            overall_wellbeing: Number(row.overall_wellbeing),
            anxiety_signal: Number(row.anxiety_signal),
            academic_strain: Number(row.academic_strain),
            timestamp: row.created_at,
            factors: row.contributing_factors?.map((f: string) => f.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())) || [],
          })

          // Fetch real curated resources for the week
          const resRes = await fetch(`${API_BASE}/api/results/${row.id}/resources`, { credentials: 'include' })
          if (resRes.ok) {
            const resources = await resRes.json()
            if (Array.isArray(resources) && resources.length > 0) {
              setDbSuggestion({
                id: resources[0].id,
                title: resources[0].title,
                description: resources[0].description,
                type: (resources[0].resource_type || 'video') as any,
                link: resources[0].url,
                tag: resources[0].factor_key?.replace(/_/g, ' ') || 'Focus',
                readTime: resources[0].resource_type === 'video' ? '5 min watch' : '4 min read',
              })
            }
          }
        } else if (res.status === 404) {
          setLatestAssessment(null)
        }
      } catch (err) {
        console.warn('Could not fetch student assessment history:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLatest()
  }, [user])

  const activeData = lastCheckInData || latestAssessment
  const hasCompletedCheckIn = !!activeData

  // Calm, supportive language mapping (never clinical or scary)
  const getPlainLanguageSummary = (tier: string = 'low') => {
    const t = tier.toLowerCase()
    if (t === 'high') {
      return {
        title: "We think it's worth talking to someone",
        subtitle:
          'Your recent responses indicate heavy study pressure and disrupted rest. Support is here to help you decompress.',
        color: '#EA580C',
        bg: '#FFF7ED',
        borderColor: '#FED7AA',
        icon: '🌱',
      }
    }
    if (t === 'medium') {
      return {
        title: 'Some signals to pay attention to',
        subtitle:
          "You're managing a busy workload, but fatigue is starting to build up. Taking small breaks now makes a big difference.",
        color: '#D97706',
        bg: '#FFFBEB',
        borderColor: '#FDE68A',
        icon: '🌤️',
      }
    }
    return {
      title: "You're doing okay",
      subtitle: 'Your sleep and daily routines look balanced right now. Keep protecting your downtime.',
      color: '#16A34A',
      bg: '#F0FDF4',
      borderColor: '#BBF7D0',
      icon: '✨',
    }
  }

  const riskTier = activeData?.riskLevel || activeData?.risk_tier || 'Low'
  const summary = getPlainLanguageSummary(riskTier)
  const checkInDate = activeData?.timestamp
    ? new Date(activeData.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recent'

  // Contributing factors
  const factors = activeData?.factors ||
    (Array.isArray(activeData?.top_factors)
      ? activeData.top_factors
      : typeof activeData?.top_factors === 'string'
      ? JSON.parse(activeData.top_factors || '[]')
      : ['High exam pressure', 'Low sleep hours'])

  const weeklySuggestions: VettedResource[] = getResourcesForFactors(factors, 1)
  const weeklySuggestion = dbSuggestion || weeklySuggestions[0]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app, #F9F9F8)', padding: '40px 36px 80px' }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        {/* Welcome Header */}
        <div
          style={{
            marginBottom: 28,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: '#01575E',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Student Wellbeing Space
              </span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0E1A2B', margin: 0 }}>
              Welcome back, {user?.name ? user.name.split(' ')[0] : 'Student'}
            </h1>
            <p style={{ fontSize: 14, color: '#64748B', marginTop: 4, margin: '4px 0 0' }}>
              Here is your current wellbeing balance and tailored strategies for the week.
            </p>
          </div>

          {/* Quick Helpline Badge */}
          <a
            href="tel:14416"
            title="Immediate 24/7 Toll-Free Support (Tele-MANAS 14416)"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 16px',
              borderRadius: 99,
              background: '#FFF7ED',
              border: '1.5px solid #FED7AA',
              color: '#C2410C',
              fontWeight: 700,
              fontSize: 13,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <PhoneCall size={14} />
            <span>24/7 Helpline: 14416</span>
          </a>
        </div>

        {/* 1. STATUS SUMMARY CARD (First-time empty state vs Active status) */}
        {!hasCompletedCheckIn ? (
          /* Empty State for Brand New Student */
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: 16,
              padding: '36px 36px',
              marginBottom: 24,
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: '#E0F2F1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                }}
              >
                ✨
              </div>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0E1A2B', margin: 0 }}>
                  Take your first 3-minute check-in
                </h2>
                <p style={{ fontSize: 13.5, color: '#64748B', margin: '2px 0 0' }}>
                  A short, private snapshot to understand your study stress, sleep, and routines.
                </p>
              </div>
            </div>

            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0, maxWidth: 640 }}>
              SAHARA looks at everyday indicators like exam pressure and rest rhythms to catch academic burnout before it impacts your semester. Your responses are strictly confidential.
            </p>

            <div>
              <button
                onClick={() => onNavigate('checkin')}
                className="btn-cta"
                style={{ padding: '12px 26px', fontSize: 14.5 }}
              >
                <span>Start Your Check-in</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          /* Returning Student Status Card */
          <div
            style={{
              background: '#FFFFFF',
              border: `1.5px solid ${summary.borderColor}`,
              borderRadius: 16,
              padding: '28px 32px',
              marginBottom: 20,
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>{summary.icon}</span>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0E1A2B', margin: 0 }}>
                  {summary.title}
                </h2>
              </div>
              <RiskBadge tier={riskTier} size="md" />
            </div>

            <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.6, margin: '0 0 20px', maxWidth: 680 }}>
              {summary.subtitle}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderTop: '1px solid #F1F5F9', paddingTop: 16 }}>
              <span style={{ fontSize: 13, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={14} />
                <span>Last evaluated: {checkInDate}</span>
              </span>

              <button
                onClick={() => onNavigate('checkin')}
                className="btn-outline"
                style={{ padding: '8px 18px', fontSize: 13 }}
              >
                <span>Check in again</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* 2. THIS WEEK'S SUGGESTION (Part 4 Card) */}
        {hasCompletedCheckIn && weeklySuggestion && (
          <div
            style={{
              background: 'linear-gradient(135deg, #F0FDFA 0%, #FFFFFF 100%)',
              border: '1.5px solid #CCFBF1',
              borderRadius: 14,
              padding: '18px 24px',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20,
              flexWrap: 'wrap',
            }}
          >
            {/* TODO: replace with real API call to /api/recommendations/weekly */}
            <div style={{ maxWidth: 580 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Lightbulb size={16} color="#0F766E" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0F766E', textTransform: 'uppercase' }}>
                  This Week's Focus Strategy
                </span>
                <span style={{ fontSize: 11.5, color: '#64748B' }}>• Matched to your check-in</span>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0E1A2B', margin: '0 0 2px' }}>
                {weeklySuggestion.title}
              </h3>
              <p style={{ fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.45 }}>
                {weeklySuggestion.description}
              </p>
            </div>

            <a
              href={weeklySuggestion.link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-teal"
              style={{ padding: '9px 18px', fontSize: 13, textDecoration: 'none' }}
            >
              <span>Try Technique</span>
              <ExternalLink size={13} />
            </a>
          </div>
        )}

        {/* 3. THREE NEXT-STEP TILES */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0E1A2B', margin: '0 0 14px' }}>
            What would you like to do next?
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {/* Tile 1: AI Chat */}
            <div
              onClick={() => onNavigate('ai-support')}
              className="card-hover"
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                borderRadius: 14,
                padding: '22px 22px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: '#E0F2F1',
                    color: '#01575E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 14,
                  }}
                >
                  <Bot size={20} />
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0E1A2B', margin: '0 0 6px' }}>
                  Talk to SAHARA AI
                </h4>
                <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                  24/7 conversational support for exam worries, sleep hygiene, and quick breathing resets.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#01575E', fontWeight: 600, fontSize: 13, marginTop: 16 }}>
                <span>Start chat</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Tile 2: My Results */}
            <div
              onClick={() => onNavigate('results')}
              className="card-hover"
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                borderRadius: 14,
                padding: '22px 22px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: '#FEF3C7',
                    color: '#D99A34',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 14,
                  }}
                >
                  <BarChart3 size={20} />
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0E1A2B', margin: '0 0 6px' }}>
                  See What's Affecting Your Results
                </h4>
                <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                  Review your plain-language wellbeing breakdown and explore recommended study strategies.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#D99A34', fontWeight: 600, fontSize: 13, marginTop: 16 }}>
                <span>View breakdown</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Tile 3: WhatsApp Bot */}
            <div
              onClick={() => onNavigate('whatsapp')}
              className="card-hover"
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                borderRadius: 14,
                padding: '22px 22px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: '#F0FDF4',
                    color: '#16A34A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 14,
                  }}
                >
                  <MessageSquare size={20} />
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0E1A2B', margin: '0 0 6px' }}>
                  WhatsApp Wellbeing Bot
                </h4>
                <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                  Check in directly from your phone anytime by sending a quick text on WhatsApp.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#16A34A', fontWeight: 600, fontSize: 13, marginTop: 16 }}>
                <span>Open WhatsApp bot</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

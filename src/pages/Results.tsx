import React, { useState } from 'react'
import type { Page, CheckInData } from '../App'
import RiskBadge from '../components/RiskBadge'
import {
  getResourcesForFactors,
  VettedResource,
  FOLLOWUP_REPLY_MAP,
  ConversationalFollowupReply,
} from '../data/resources'
import {
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Compass,
  HeartHandshake,
  Video,
  BookOpen,
  Wrench,
  Headphones,
  Send,
  MessageCircle,
  CheckCircle2,
  Info,
} from 'lucide-react'

interface ResultsProps {
  data: CheckInData | null
  onNavigate: (page: Page) => void
}

function CircleGauge({
  value,
  label,
  color,
  plainMeaning,
}: {
  value: number
  label: string
  color: string
  plainMeaning: string
}) {
  const r = 52
  const circ = 2 * Math.PI * r
  const offset = circ - (Math.min(Math.max(value, 0), 100) / 100) * circ

  return (
    <div
      style={{
        textAlign: 'center',
        flex: 1,
        minWidth: 220,
        maxWidth: 260,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ position: 'relative', width: 130, height: 130, margin: '0 auto 12px' }}>
        <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="65" cy="65" r={r} fill="none" stroke="#F1F5F9" strokeWidth="10" />
          <circle
            cx="65"
            cy="65"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <span style={{ fontSize: 26, fontWeight: 700, color: '#0E1A2B' }}>{value}%</span>
        </div>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#0E1A2B', marginBottom: 4 }}>{label}</div>
      <p
        style={{
          fontSize: 12.5,
          color: '#64748B',
          lineHeight: 1.45,
          margin: 0,
          textAlign: 'center',
          maxWidth: 220,
        }}
      >
        {plainMeaning}
      </p>
    </div>
  )
}

function getResourceIcon(type: VettedResource['type']) {
  switch (type) {
    case 'video':
      return <Video size={16} color="#01575E" />
    case 'audio':
      return <Headphones size={16} color="#D99A34" />
    case 'tool':
      return <Wrench size={16} color="#0E1A2B" />
    default:
      return <BookOpen size={16} color="#01575E" />
  }
}

const defaultData: CheckInData = {
  riskScore: 68,
  riskLevel: 'high',
  anxietyRisk: 72,
  dropoutRisk: 64,
  factors: ['High exam pressure', 'Low sleep hours', 'High stress level'],
  isAiPredicted: true,
} as unknown as CheckInData

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')

export default function Results({ data, onNavigate }: ResultsProps) {
  const [serverData, setServerData] = useState<any>(null)
  const [dbResources, setDbResources] = useState<VettedResource[]>([])

  useEffect(() => {
    // If no direct data passed from immediate check-in, load latest from GET /api/results/latest
    if (!data) {
      fetch(`${API_BASE}/api/results/latest`, { credentials: 'include' })
        .then((res) => (res.ok ? res.json() : null))
        .then((row) => {
          if (row) {
            setServerData({
              id: row.id,
              riskScore: Number(row.overall_wellbeing),
              anxietyRisk: Number(row.anxiety_signal),
              dropoutRisk: Number(row.academic_strain),
              riskLevel: row.risk_level,
              factors: row.contributing_factors?.map((f: string) => f.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())) || [],
              timestamp: row.created_at,
            })
          }
        })
        .catch((err) => console.warn('Could not fetch latest result:', err))
    }
  }, [data])

  const d = data || serverData || defaultData
  const risk = (d.riskLevel || 'high').toLowerCase() as 'low' | 'medium' | 'high'

  const riskColor = risk === 'high' ? '#EA580C' : risk === 'medium' ? '#D97706' : '#16A34A'
  const riskBg = risk === 'high' ? '#FFF7ED' : risk === 'medium' ? '#FFFBEB' : '#F0FDF4'
  const riskBorder = risk === 'high' ? '#FED7AA' : risk === 'medium' ? '#FDE68A' : '#BBF7D0'

  const overallScore = d.riskScore ?? 68
  const anxietyScore = d.anxietyRisk ?? Math.min(overallScore + 4, 95)
  const dropoutScore = d.dropoutRisk ?? Math.max(overallScore - 6, 8)
  const factors = d.factors && d.factors.length > 0 ? d.factors : ['High exam pressure', 'Low sleep hours']

  const resultId = (d as any).id

  useEffect(() => {
    if (resultId) {
      fetch(`${API_BASE}/api/results/${resultId}/resources`, { credentials: 'include' })
        .then((res) => (res.ok ? res.json() : []))
        .then((items: any[]) => {
          if (Array.isArray(items) && items.length > 0) {
            const mapped: VettedResource[] = items.map((it: any) => ({
              id: it.id,
              title: it.title,
              description: it.description,
              type: (it.resource_type || 'article') as any,
              link: it.url,
              tag: it.factor_key?.replace(/_/g, ' ') || 'Focus',
              readTime: it.resource_type === 'video' ? '5 min watch' : '4 min read',
            }))
            setDbResources(mapped)
          }
        })
        .catch(() => {})
    }
  }, [resultId])

  const actionableResources: VettedResource[] =
    dbResources.length > 0 ? dbResources : getResourcesForFactors(factors, 3)

  // Conversational follow-up state (Part 3)
  const primaryConcern = factors[0] || 'academic strain'
  const [followupInput, setFollowupInput] = useState('')
  const [activeReply, setActiveReply] = useState<ConversationalFollowupReply | null>(null)
  const [isSubmittingFollowup, setIsSubmittingFollowup] = useState(false)
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)

  const quickReplyOptions = [
    'Too much coursework',
    'Struggling with a specific subject',
    'Not sleeping enough before exams',
    'Feeling isolated or unsupported',
  ]

  const handleFollowupSelect = (chipText: string) => {
    setIsSubmittingFollowup(true)
    setFollowupInput(chipText)

    setTimeout(() => {
      const match = FOLLOWUP_REPLY_MAP[chipText] || FOLLOWUP_REPLY_MAP.default
      setActiveReply(match)
      setIsSubmittingFollowup(false)
    }, 250)
  }

  const handleCustomFollowupSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!followupInput.trim()) return
    setIsSubmittingFollowup(true)

    setTimeout(() => {
      const lower = followupInput.toLowerCase()
      let match = FOLLOWUP_REPLY_MAP.default

      if (lower.includes('course') || lower.includes('assign') || lower.includes('workload')) {
        match = FOLLOWUP_REPLY_MAP['Too much coursework']
      } else if (lower.includes('subject') || lower.includes('math') || lower.includes('grade')) {
        match = FOLLOWUP_REPLY_MAP['Struggling with a specific subject']
      } else if (lower.includes('sleep') || lower.includes('tired') || lower.includes('night')) {
        match = FOLLOWUP_REPLY_MAP['Not sleeping enough before exams']
      } else if (lower.includes('alone') || lower.includes('friend') || lower.includes('support')) {
        match = FOLLOWUP_REPLY_MAP['Feeling isolated or unsupported']
      }

      setActiveReply(match)
      setIsSubmittingFollowup(false)
    }, 300)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app, #F9F9F8)', padding: '40px 32px 80px' }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        {/* Top Header */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h1 style={{ fontSize: 30, fontWeight: 700, color: '#0E1A2B', margin: 0 }}>
                Your Wellbeing Snapshot
              </h1>
              <RiskBadge tier={risk} score={overallScore} size="md" />
            </div>
            <p style={{ fontSize: 14.5, color: '#64748B', margin: 0 }}>
              Summary of your recent check-in on{' '}
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <button
            onClick={() => onNavigate('checkin')}
            className="btn-outline"
            style={{ padding: '9px 18px', fontSize: 13.5 }}
          >
            <RotateCcw size={15} />
            <span>Retake Check-in</span>
          </button>
        </div>

        {/* 1. Overall Assessment Summary Banner */}
        <div
          style={{
            background: riskBg,
            border: `1.5px solid ${riskBorder}`,
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
          <div style={{ maxWidth: 560 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: riskColor,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Overall Assessment Summary
            </span>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0E1A2B', margin: '4px 0 6px' }}>
              {risk === 'high'
                ? "Support is recommended — you're carrying elevated pressure."
                : risk === 'medium'
                ? 'Mild strain detected — small adjustments will help.'
                : 'Balanced state — your daily routines look healthy.'}
            </h2>
            <p style={{ fontSize: 14, color: '#475569', margin: 0, lineHeight: 1.55 }}>
              {risk === 'high'
                ? 'Your responses reflect high exam stress and compromised rest. Connecting with a counselor or trying guided de-escalation can help you regain balance.'
                : risk === 'medium'
                ? 'Your workload is manageable, but fatigue indicators are beginning to build up. Prioritize screen-free breaks and steady sleep.'
                : 'Your study rhythm, stress, and sleep are well-regulated. Continue protecting your recovery downtime.'}
            </p>
          </div>

          <button
            onClick={() => onNavigate('ai-support')}
            className="btn-cta"
            style={{ padding: '11px 20px', fontSize: 13.5 }}
          >
            <Sparkles size={16} />
            <span>Chat with SAHARA AI</span>
          </button>
        </div>

        {/* 2. Three Circular Metrics (Part 1 Relabeled with Human Meanings) */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: 16,
            padding: '28px 24px',
            marginBottom: 24,
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 24,
            }}
          >
            <CircleGauge
              value={overallScore}
              label="Overall Wellbeing"
              plainMeaning="Your combined balance across psychological rest and coursework progress."
              color={riskColor}
            />
            <CircleGauge
              value={anxietyScore}
              label="Anxiety Signal"
              plainMeaning="How much day-to-day worry, stress, and nervous energy you are carrying."
              color="#01575E"
            />
            <CircleGauge
              value={dropoutScore}
              label="Academic Strain"
              plainMeaning="How much your coursework and exam pressure seem to be affecting you right now."
              color="#D99A34"
            />
          </div>

          {/* Small Expandable for Technical / About this assessment (Part 1) */}
          <div style={{ borderTop: '1px solid #F1F5F9', marginTop: 24, paddingTop: 14, textAlign: 'center' }}>
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                fontSize: 12.5,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Info size={14} />
              <span>About how this assessment is computed</span>
              <ChevronDown
                size={14}
                style={{
                  transform: showTechnicalDetails ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease',
                }}
              />
            </button>

            {showTechnicalDetails && (
              <div
                style={{
                  background: '#F8FAFC',
                  borderRadius: 10,
                  padding: '12px 18px',
                  marginTop: 10,
                  fontSize: 12,
                  color: '#475569',
                  lineHeight: 1.5,
                  textAlign: 'left',
                  border: '1px solid #E2E8F0',
                }}
              >
                Evaluated via dual Random Forest model inference (regression for psychological anxiety index + classification for academic retention risk), fused into a weighted early-warning indicator. Anonymized per student privacy standards.
              </div>
            )}
          </div>
        </div>

        {/* 3. Primary Contributing Factors */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: 16,
            padding: '24px 28px',
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Compass size={18} color="#01575E" />
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0E1A2B', margin: 0 }}>
              Key Contributing Factors Identified
            </h3>
          </div>
          <p style={{ fontSize: 13.5, color: '#64748B', margin: '0 0 16px' }}>
            These areas showed the strongest impact on your current results:
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {factors.map((factor, idx) => (
              <span
                key={idx}
                style={{
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#1E293B',
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontSize: 13.5,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: riskColor }} />
                <span>{factor}</span>
              </span>
            ))}
          </div>
        </div>

        {/* 4. Suggested for You (Part 2: Resource Cards Matched to Contributing Factors) */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: 16,
            padding: '24px 28px',
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <HeartHandshake size={20} color="#01575E" />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0E1A2B', margin: 0 }}>
              Suggested for You
            </h3>
          </div>
          <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 20px' }}>
            Practical, bite-sized strategies tailored to your identified factors:
          </p>

          {/* TODO: replace with real API call to /api/resources?factor=X */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 14 }}>
            {actionableResources.map((res) => (
              <div
                key={res.id}
                style={{
                  border: '1.5px solid #E2E8F0',
                  borderRadius: 12,
                  padding: '18px 20px',
                  background: '#F9F9F8',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 12,
                  transition: 'all 0.2s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {getResourceIcon(res.type)}
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: '#E0F2F1',
                          color: '#01575E',
                          textTransform: 'uppercase',
                        }}
                      >
                        {res.tag}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>{res.readTime}</span>
                  </div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0E1A2B', margin: '0 0 6px', lineHeight: 1.35 }}>
                    {res.title}
                  </h4>
                  <p style={{ fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.5 }}>
                    {res.description}
                  </p>
                </div>

                <a
                  href={res.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    background: '#01575E',
                    color: '#FFFFFF',
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: 'none',
                    marginTop: 4,
                  }}
                >
                  <span>Open Resource</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Conversational Follow-Up: "Why is this happening?" (Part 3) */}
        <div
          style={{
            background: 'linear-gradient(135deg, #F0FDFA 0%, #FFFFFF 100%)',
            border: '1.5px solid #CCFBF1',
            borderRadius: 16,
            padding: '24px 28px',
            marginBottom: 28,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <MessageCircle size={20} color="#0F766E" />
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#115E59', margin: 0 }}>
              We noticed your {primaryConcern.toLowerCase()} is elevated. Want to tell us what's going on?
            </h3>
          </div>
          <p style={{ fontSize: 13.5, color: '#0F766E', margin: '0 0 16px', lineHeight: 1.5 }}>
            Pick a reason below or type a few words to get an immediate, focused next step:
          </p>

          {/* Quick-Reply Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {quickReplyOptions.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleFollowupSelect(chip)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 99,
                  border: followupInput === chip ? '1.5px solid #0F766E' : '1px solid #CBD5E1',
                  background: followupInput === chip ? '#CCFBF1' : '#FFFFFF',
                  color: followupInput === chip ? '#115E59' : '#334155',
                  fontSize: 13,
                  fontWeight: followupInput === chip ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Text Input */}
          <form onSubmit={handleCustomFollowupSubmit} style={{ display: 'flex', gap: 10, marginBottom: activeReply ? 16 : 0 }}>
            <input
              type="text"
              value={followupInput}
              onChange={(e) => setFollowupInput(e.target.value)}
              placeholder="Or share a sentence about what feels most demanding..."
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 8,
                border: '1.5px solid #CBD5E1',
                fontSize: 13.5,
                background: '#FFFFFF',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={!followupInput.trim() || isSubmittingFollowup}
              className="btn-teal"
              style={{
                padding: '10px 18px',
                fontSize: 13.5,
                opacity: !followupInput.trim() || isSubmittingFollowup ? 0.6 : 1,
              }}
            >
              <span>Share</span>
              <Send size={14} />
            </button>
          </form>

          {/* Follow-up AI Acknowledgment & Refined Suggestion (Part 3) */}
          {/* TODO: replace this canned response logic with a real call to the AI backend once available */}
          {activeReply && (
            <div
              style={{
                marginTop: 16,
                background: '#FFFFFF',
                borderRadius: 12,
                padding: '16px 20px',
                border: '1.5px solid #99F6E4',
                animation: 'fadeIn 0.25s ease-out',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <CheckCircle2 size={16} color="#0F766E" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0F766E', textTransform: 'uppercase' }}>
                  Personalized Acknowledgment
                </span>
              </div>
              <p style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.55, margin: '0 0 12px' }}>
                {activeReply.acknowledgment}
              </p>

              <div
                style={{
                  background: '#F0FDFA',
                  border: '1px solid #CCFBF1',
                  borderRadius: 10,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: '#0F766E', marginBottom: 2 }}>
                    Focused Action Step
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0E1A2B' }}>
                    {activeReply.suggestion.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>
                    {activeReply.suggestion.description}
                  </div>
                </div>
                <a
                  href={activeReply.suggestion.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    background: '#01575E',
                    color: '#FFFFFF',
                    padding: '7px 12px',
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: 600,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span>Open Tool</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <button
            onClick={() => onNavigate('student-dashboard')}
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #CBD5E1',
              color: '#475569',
              padding: '10px 22px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ← Return to Dashboard
          </button>

          <button
            onClick={() => onNavigate('profile')}
            className="btn-teal"
            style={{ padding: '10px 22px', fontSize: 14 }}
          >
            <span>View Wellbeing Trend Over Time</span>
          </button>
        </div>
      </div>
    </div>
  )
}

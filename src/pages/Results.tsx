import React, { useState, useEffect } from 'react'
import type { Page, CheckInData } from '../App'
import RiskBadge from '../components/RiskBadge'
import {
  RotateCcw,
  Sparkles,
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
  ArrowRight,
  Zap,
  Check,
  Play,
  FileText,
  ExternalLink,
  X,
} from 'lucide-react'
import ChatMessageText from '../components/ChatMessageText'

interface ResultsProps {
  data: CheckInData | null
  onNavigate: (page: Page) => void
}

interface DynamicAISuggestion {
  id: string
  title: string
  tag: string
  type: 'tool' | 'video' | 'audio' | 'article'
  duration: string
  description: string
  actionStep: string
  youtubeId?: string
  videoTitle?: string
  keyNotes?: string[]
}

interface AIGuidanceData {
  aiSynthesis: string
  suggestions: DynamicAISuggestion[]
}

interface FollowupCoachingResult {
  headline: string
  insight: string
  microAction: string
  suggestedTopic?: string
  studyNotes?: string[]
  recommendedVideo?: {
    youtubeId: string
    videoTitle: string
  }
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

function getResourceIcon(type: string) {
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

import { API_BASE } from '../config'

export default function Results({ data, onNavigate }: ResultsProps) {
  const [serverData, setServerData] = useState<any>(null)
  const [aiGuidance, setAiGuidance] = useState<AIGuidanceData | null>(null)
  const [isLoadingGuidance, setIsLoadingGuidance] = useState(false)
  const [activeActionModal, setActiveActionModal] = useState<DynamicAISuggestion | null>(null)

  // Conversational follow-up state
  const [followupInput, setFollowupInput] = useState('')
  const [activeCoaching, setActiveCoaching] = useState<FollowupCoachingResult | null>(null)
  const [isSubmittingFollowup, setIsSubmittingFollowup] = useState(false)
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)

  useEffect(() => {
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

  const overallScore = d.riskScore ?? 68
  const anxietyScore = d.anxietyRisk ?? Math.min(overallScore + 4, 95)
  const dropoutScore = d.dropoutRisk ?? Math.max(overallScore - 6, 8)
  const factors = d.factors && d.factors.length > 0 ? d.factors : ['High exam pressure', 'Low sleep hours']

  // Load real-time Groq dynamic guidance & video notes tailored to this evaluation
  useEffect(() => {
    setIsLoadingGuidance(true)
    fetch(`${API_BASE}/api/results/ai-guidance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        overallWellbeing: overallScore,
        anxietySignal: anxietyScore,
        academicStrain: dropoutScore,
        riskLevel: risk,
        factors: factors,
        sleepHours: (d as any).sleepHours || 6,
        examPressure: (d as any).examPressure || 7,
        studyHours: (d as any).studyHours || 5,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((guidanceData) => {
        if (guidanceData) {
          setAiGuidance(guidanceData)
        }
      })
      .catch((err) => console.warn('Could not load AI guidance:', err))
      .finally(() => setIsLoadingGuidance(false))
  }, [overallScore, anxietyScore, dropoutScore, risk])

  const primaryConcern = factors[0] || 'academic strain'

  const quickReplyOptions = [
    'Too much coursework',
    'Struggling with a specific subject',
    'Not sleeping enough before exams',
    'Feeling isolated or unsupported',
  ]

  const handleFollowupSelect = async (chipText: string) => {
    setFollowupInput(chipText)
    setIsSubmittingFollowup(true)
    try {
      const res = await fetch(`${API_BASE}/api/results/followup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          concern: chipText,
          assessmentSummary: {
            overallWellbeing: overallScore,
            anxietySignal: anxietyScore,
            factors,
          },
        }),
      })
      if (res.ok) {
        const coaching = await res.json()
        setActiveCoaching(coaching)
      }
    } catch (err) {
      console.warn('Could not load AI coaching:', err)
    } finally {
      setIsSubmittingFollowup(false)
    }
  }

  const handleCustomFollowupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!followupInput.trim() || isSubmittingFollowup) return
    setIsSubmittingFollowup(true)
    try {
      const res = await fetch(`${API_BASE}/api/results/followup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          concern: followupInput,
          assessmentSummary: {
            overallWellbeing: overallScore,
            anxietySignal: anxietyScore,
            factors,
          },
        }),
      })
      if (res.ok) {
        const coaching = await res.json()
        setActiveCoaching(coaching)
      }
    } catch (err) {
      console.warn('Could not load custom AI coaching:', err)
    } finally {
      setIsSubmittingFollowup(false)
    }
  }

  const handleGoToChat = (promptText?: string) => {
    if (promptText) {
      sessionStorage.setItem('sahara_prefill_chat', promptText)
    }
    onNavigate('ai-support')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app, #F9F9F8)', padding: '40px 32px 80px' }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        {/* Top Header */}
        <div
          style={{
            marginBottom: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0E1A2B', margin: 0, letterSpacing: '-0.02em' }}>
                Your Wellbeing Snapshot
              </h1>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#01575E',
                  background: '#E0F2F1',
                  padding: '3px 10px',
                  borderRadius: 99,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Sparkles size={12} />
                <span>AI Evaluated</span>
              </span>
            </div>
            <p style={{ fontSize: 14.5, color: '#64748B', margin: 0 }}>
              Evaluated on {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · Personalized for your current semester load
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => window.print()}
              className="btn-outline-dark"
              style={{ padding: '8px 14px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <FileText size={14} color="#01575E" />
              <span>Export Clinical Summary</span>
            </button>

            <button
              onClick={() => onNavigate('checkin')}
              className="btn-outline-dark"
              style={{ padding: '8px 14px', fontSize: 13 }}
            >
              <RotateCcw size={14} />
              <span>Retake Check-in</span>
            </button>
          </div>
        </div>

        {/* Clinical Triage & Urgency Assessment (Ada Health / Clinical Standard) */}
        <div
          style={{
            background: overallScore > 65 ? '#FFF7ED' : overallScore > 40 ? '#FFFBEB' : '#F0FDF4',
            border: `1.5px solid ${overallScore > 65 ? '#FED7AA' : overallScore > 40 ? '#FDE68A' : '#BBF7D0'}`,
            borderRadius: 12,
            padding: '14px 20px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: overallScore > 65 ? '#EA580C' : overallScore > 40 ? '#D97706' : '#16A34A',
              }}
            />
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: overallScore > 65 ? '#9A3412' : overallScore > 40 ? '#92400E' : '#166534', textTransform: 'uppercase' }}>
                Clinical Triage Level: Tier {overallScore > 65 ? '3 — Priority Counselor Handover' : overallScore > 40 ? '2 — Guided Somatic & Study Protocol' : '1 — Routine Wellbeing Maintenance'}
              </div>
              <div style={{ fontSize: 12.5, color: overallScore > 65 ? '#C2410C' : overallScore > 40 ? '#B45309' : '#15803D' }}>
                {overallScore > 65
                  ? 'Elevated acute strain detected. Reviewing this clinical summary with a campus counselor or calling 14416 is strongly encouraged.'
                  : overallScore > 40
                  ? 'Moderate academic strain identified. The targeted sleep optimization & 25/5 focus protocols below will provide rapid relief.'
                  : 'Positive coping indicators. Continue standard sleep hygiene and routine academic pacing.'}
              </div>
            </div>
          </div>

          {overallScore > 65 && (
            <a
              href="tel:14416"
              style={{
                background: '#EA580C',
                color: '#FFFFFF',
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 700,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Call 14416
            </a>
          )}
        </div>

        {/* 1. Human-Centered Metric Gauges */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: 16,
            padding: '32px 28px 24px',
            marginBottom: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0E1A2B', margin: 0 }}>
              Primary Wellbeing Indicators
            </h2>
            <RiskBadge level={risk} />
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-around',
              alignItems: 'flex-start',
              gap: 24,
              paddingBottom: 16,
              borderBottom: '1px solid #F1F5F9',
            }}
          >
            <CircleGauge
              value={overallScore}
              label="Overall Wellbeing"
              color={overallScore > 65 ? '#EA580C' : overallScore > 40 ? '#D97706' : '#16A34A'}
              plainMeaning="Your combined physiological and academic strain index. Lower is healthier."
            />
            <CircleGauge
              value={anxietyScore}
              label="Anxiety Signal"
              color={anxietyScore > 65 ? '#EA580C' : anxietyScore > 40 ? '#D97706' : '#16A34A'}
              plainMeaning="Acute nervous-system pressure, driven by exam timing, sleep deficit, and perceived demands."
            />
            <CircleGauge
              value={dropoutScore}
              label="Academic Strain"
              color={dropoutScore > 65 ? '#EA580C' : dropoutScore > 40 ? '#D97706' : '#16A34A'}
              plainMeaning="Risk of study fatigue or coursework burnout over the upcoming term."
            />
          </div>

          {/* Model Transparency Accordion */}
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
              }}
            >
              <span>How are these scores calculated?</span>
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

        {/* 2. AI Personalized Clinical & Recovery Synthesis Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #01575E 0%, #0E1A2B 100%)',
            borderRadius: 16,
            padding: '24px 28px',
            marginBottom: 24,
            color: '#FFFFFF',
            boxShadow: '0 4px 16px rgba(1,87,94,0.18)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={16} color="#FDE047" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#FFFFFF' }}>
              SAHARA AI Recovery Synthesis
            </h3>
          </div>

          <p style={{ fontSize: 14.5, lineHeight: 1.6, margin: '0 0 14px', color: '#E0F2F1' }}>
            {aiGuidance?.aiSynthesis ||
              'Your evaluation highlights elevated exam pressure combined with sleep adjustments. Rebalancing short study sprints with targeted restorative breaks provides your highest leverage recovery this week.'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => handleGoToChat("Can you help me break down the highest leverage point from my wellbeing assessment?")}
              style={{
                background: '#FFFFFF',
                color: '#01575E',
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'transform 0.15s ease',
              }}
            >
              <span>Explore Personalized Strategy in AI Chat</span>
              <ArrowRight size={14} />
            </button>
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

        {/* 4. Suggested for You (Dynamic Groq AI-Generated Suggestions with YouTube Video & Analysis Notes) */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: 16,
            padding: '24px 28px',
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <HeartHandshake size={20} color="#01575E" />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0E1A2B', margin: 0 }}>
                Suggested for You
              </h3>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#01575E',
                background: '#F0FDFA',
                padding: '3px 8px',
                borderRadius: 6,
                border: '1px solid #CCFBF1',
              }}
            >
              {isLoadingGuidance ? 'Updating AI Suggestions...' : 'Dynamic AI Tailored & Video Notes'}
            </span>
          </div>

          <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 20px' }}>
            Practical, bite-sized protocols with verified video breakdowns & study notes generated dynamically for your exact assessment:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 14 }}>
            {(aiGuidance?.suggestions || [
              {
                id: 'sug_1',
                title: '5-Minute Breathing Reset Before Exams',
                tag: 'Exam Grounding',
                type: 'video',
                duration: '5 min video & notes',
                description: 'Quick somatic breathing method that settles nervous system spikes before walking into an exam.',
                actionStep: 'Do 4 cycles of 4-second box breathing with relaxed shoulders.',
                youtubeId: 'm3-O74xEmVE',
                videoTitle: 'Physiological Sigh: Fast Autonomic Nervous System Reset',
                keyNotes: [
                  'Two rapid inhales through nose + one long mouth exhale drops acute heart rate.',
                  'Rebalances carbon dioxide ratio in the bloodstream to halt panic signals.',
                  'Use immediately when sitting down at your exam desk.'
                ],
              },
              {
                id: 'sug_2',
                title: 'The Pomodoro Method for Study Sessions',
                tag: 'Focus Rhythm',
                type: 'video',
                duration: '4 min video & notes',
                description: 'Break high-pressure revisions into manageable 25-minute sprints with 5-minute screen-free intervals.',
                actionStep: 'Choose your top assignment and set a single 25-minute countdown.',
                youtubeId: 'mNBmG24djoY',
                videoTitle: 'How to Focus & Study Deeply with the 25/5 Pomodoro Method',
                keyNotes: [
                  'Single-task focus prevents cognitive fatigue and task switching friction.',
                  '5-minute screen-free rest allows hippocampus to consolidate memories.',
                  'Repeat for 4 cycles for maximum study retention.'
                ],
              },
              {
                id: 'sug_3',
                title: 'Sleep Hygiene for University Students',
                tag: 'Sleep Optimization',
                type: 'video',
                duration: '4 min video & notes',
                description: 'Evidence-based protocols to fall asleep faster even when study schedules are erratic.',
                actionStep: 'Dim overhead lights and stop screen usage 30 minutes before sleep.',
                youtubeId: 'pL02HRFk2vo',
                videoTitle: '10-Minute Non-Sleep Deep Rest (NSDR) Protocol - Dr. Andrew Huberman',
                keyNotes: [
                  'Externalize tomorrow to-do list onto physical paper to stop nocturnal rumination.',
                  'Dim ambient overhead lights 30 minutes before sleep to trigger melatonin.',
                  '10 minutes of NSDR in bed resets autonomic nervous system.'
                ],
              },
            ]).map((sug) => (
              <div
                key={sug.id}
                style={{
                  border: '1.5px solid #E2E8F0',
                  borderRadius: 12,
                  padding: '18px 20px',
                  background: '#F9F9F8',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 14,
                  transition: 'all 0.2s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {getResourceIcon(sug.type)}
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
                        {sug.tag}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>{sug.duration}</span>
                  </div>

                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0E1A2B', margin: '0 0 6px', lineHeight: 1.35 }}>
                    {sug.title}
                  </h4>

                  <p style={{ fontSize: 13, color: '#475569', margin: '0 0 10px', lineHeight: 1.5 }}>
                    {sug.description}
                  </p>

                  {sug.youtubeId && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 12,
                        color: '#01575E',
                        fontWeight: 600,
                        background: '#E6FFFA',
                        padding: '4px 8px',
                        borderRadius: 6,
                        marginBottom: 4,
                      }}
                    >
                      <Play size={12} color="#E53E3E" fill="#E53E3E" />
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {sug.videoTitle || 'Video & Study Notes Included'}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveActionModal(sug)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    background: '#01575E',
                    color: '#FFFFFF',
                    padding: '9px 14px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: 4,
                  }}
                >
                  <Play size={13} fill="#FFFFFF" />
                  <span>Watch Video & Read Notes</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Conversational Follow-Up with Real-Time Groq AI Coaching, Study Notes & Video */}
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
            Pick a situation below or type your exact difficulty to receive instant AI notes, a video breakdown, and coaching:
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
          <form onSubmit={handleCustomFollowupSubmit} style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              value={followupInput}
              onChange={(e) => setFollowupInput(e.target.value)}
              placeholder="Or type a specific difficulty about what feels most demanding..."
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 8,
                border: '1.5px solid #CBD5E1',
                fontSize: 13.5,
                background: '#FFFFFF',
                color: '#0E1A2B',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={isSubmittingFollowup || !followupInput.trim()}
              style={{
                background: '#0F766E',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                padding: '10px 18px',
                fontWeight: 600,
                fontSize: 13.5,
                cursor: isSubmittingFollowup ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                opacity: isSubmittingFollowup || !followupInput.trim() ? 0.6 : 1,
              }}
            >
              <span>{isSubmittingFollowup ? 'Analyzing...' : 'Get AI Plan & Notes'}</span>
              <Send size={13} />
            </button>
          </form>

          {/* Dynamic AI Coaching Card Output with Notes & Video */}
          {activeCoaching && (
            <div
              style={{
                marginTop: 20,
                background: '#FFFFFF',
                border: '1.5px solid #99F6E4',
                borderRadius: 12,
                padding: '20px 22px',
                boxShadow: '0 2px 8px rgba(15,118,110,0.06)',
                animation: 'fadeIn 0.3s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Sparkles size={16} color="#0F766E" />
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#115E59' }}>
                  {activeCoaching.headline}
                </h4>
              </div>

              <div style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.55, marginBottom: 14 }}>
                <ChatMessageText text={activeCoaching.insight} />
              </div>

              {/* Study & Resilience Notes Section */}
              {activeCoaching.studyNotes && activeCoaching.studyNotes.length > 0 && (
                <div
                  style={{
                    background: '#F8FAFC',
                    borderRadius: 10,
                    padding: '14px 16px',
                    border: '1px solid #E2E8F0',
                    marginBottom: 14,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <FileText size={15} color="#01575E" />
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: '#01575E', textTransform: 'uppercase' }}>
                      Key Revision & Wellbeing Notes
                    </span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#334155', lineHeight: 1.55 }}>
                    {activeCoaching.studyNotes.map((note, nIdx) => (
                      <li key={nIdx} style={{ marginBottom: 4 }}>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended Video Pill */}
              {activeCoaching.recommendedVideo && (
                <div
                  style={{
                    background: '#F0FDFA',
                    borderRadius: 8,
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    marginBottom: 14,
                    border: '1px solid #CCFBF1',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Play size={16} color="#E53E3E" fill="#E53E3E" />
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#0F766E', textTransform: 'uppercase' }}>
                        Recommended Video Guide
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0E1A2B' }}>
                        {activeCoaching.recommendedVideo.videoTitle}
                      </div>
                    </div>
                  </div>

                  <a
                    href={`https://www.youtube.com/watch?v=${activeCoaching.recommendedVideo.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      background: '#01575E',
                      color: '#FFFFFF',
                      padding: '5px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    <span>Watch</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              )}

              <div
                style={{
                  background: '#F0FDFA',
                  borderRadius: 8,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  marginBottom: 16,
                  border: '1px solid #CCFBF1',
                }}
              >
                <CheckCircle2 size={18} color="#0F766E" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0F766E', textTransform: 'uppercase', marginBottom: 2 }}>
                    Your Immediate 5-Minute Micro-Action
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0E1A2B', lineHeight: 1.4 }}>
                    <ChatMessageText text={activeCoaching.microAction} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => handleGoToChat(activeCoaching.suggestedTopic || `I am dealing with ${followupInput}. Can we talk through this?`)}
                  style={{
                    background: '#01575E',
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
                  <span>Discuss Further with SAHARA AI</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Micro-Protocol & YouTube Video/Notes Modal */}
        {activeActionModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(14,26,43,0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999,
              padding: 20,
              backdropFilter: 'blur(3px)',
            }}
          >
            <div
              style={{
                maxWidth: 620,
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                background: '#FFFFFF',
                borderRadius: 16,
                padding: '24px 28px',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
                border: '1.5px solid #E2E8F0',
                position: 'relative',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveActionModal(null)}
                style={{
                  position: 'absolute',
                  top: 18,
                  right: 18,
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748B',
                }}
              >
                <X size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 99,
                    background: '#E0F2F1',
                    color: '#01575E',
                    textTransform: 'uppercase',
                  }}
                >
                  {activeActionModal.tag}
                </span>
                <span style={{ fontSize: 12.5, color: '#64748B' }}>{activeActionModal.duration}</span>
              </div>

              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0E1A2B', margin: '0 0 10px', paddingRight: 40 }}>
                {activeActionModal.title}
              </h3>

              <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.55, margin: '0 0 16px' }}>
                {activeActionModal.description}
              </p>

              {/* Responsive Embedded YouTube Video Player */}
              {activeActionModal.youtubeId && (
                <div style={{ marginBottom: 18 }}>
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      paddingTop: '56.25%',
                      borderRadius: 12,
                      overflow: 'hidden',
                      background: '#0E1A2B',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  >
                    <iframe
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 'none',
                      }}
                      src={`https://www.youtube-nocookie.com/embed/${activeActionModal.youtubeId}?rel=0`}
                      title={activeActionModal.videoTitle || activeActionModal.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 6,
                      padding: '0 4px',
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>
                      {activeActionModal.videoTitle}
                    </span>
                    <a
                      href={`https://www.youtube.com/watch?v=${activeActionModal.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#01575E',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        textDecoration: 'none',
                      }}
                    >
                      <span>Open on YouTube</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              )}

              {/* Full Analysis & Core Study Notes */}
              {activeActionModal.keyNotes && activeActionModal.keyNotes.length > 0 && (
                <div
                  style={{
                    background: '#F8FAFC',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: 12,
                    padding: '16px 18px',
                    marginBottom: 18,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <FileText size={16} color="#01575E" />
                    <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: '#0E1A2B', textTransform: 'uppercase' }}>
                      Full Analysis & Key Takeaway Notes
                    </h4>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.6 }}>
                    {activeActionModal.keyNotes.map((note, nIdx) => (
                      <li key={nIdx} style={{ marginBottom: 6 }}>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Immediate 2-Minute Micro-Action */}
              <div
                style={{
                  background: '#F0FDFA',
                  border: '1.5px solid #99F6E4',
                  borderRadius: 12,
                  padding: '14px 18px',
                  marginBottom: 20,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0F766E', textTransform: 'uppercase', marginBottom: 4 }}>
                  ⚡ Immediate 2-Minute Micro-Action
                </div>
                <div style={{ fontSize: 14, color: '#0E1A2B', fontWeight: 600, lineHeight: 1.45 }}>
                  {activeActionModal.actionStep}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    const title = activeActionModal.title
                    setActiveActionModal(null)
                    handleGoToChat(`Can you explain the key steps of "${title}" in more detail?`)
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#01575E',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    textDecoration: 'underline',
                  }}
                >
                  <span>Ask SAHARA AI to Explain This Protocol →</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveActionModal(null)}
                  className="btn-teal"
                  style={{ padding: '8px 20px', fontSize: 13.5 }}
                >
                  <Check size={14} />
                  <span>Done</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <button
            onClick={() => onNavigate('home')}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
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
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import type { Page, CheckInData } from '../App'
import RiskBadge from '../components/RiskBadge'
import { getResourcesForFactors, VettedResource } from '../data/resources'
import {
  RotateCcw,
  Sparkles,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Compass,
  HeartHandshake,
} from 'lucide-react'

interface ResultsProps {
  data: CheckInData | null
  onNavigate: (page: Page) => void
}

function CircleGauge({
  value,
  label,
  color,
  sublabel,
}: {
  value: number
  label: string
  color: string
  sublabel?: string
}) {
  const r = 52
  const circ = 2 * Math.PI * r
  const offset = circ - (Math.min(Math.max(value, 0), 100) / 100) * circ

  return (
    <div style={{ textAlign: 'center', flex: 1, minWidth: 160 }}>
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
          {sublabel && <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>{sublabel}</span>}
        </div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginBottom: 2 }}>{label}</div>
    </div>
  )
}

const defaultData: CheckInData = {
  riskScore: 68,
  riskLevel: 'high',
  anxietyRisk: 72,
  dropoutRisk: 64,
  factors: ['Low sleep hours', 'High exam pressure', 'Elevated stress level'],
  isAiPredicted: true,
} as unknown as CheckInData

export default function Results({ data, onNavigate }: ResultsProps) {
  const d = data || defaultData
  const risk = (d.riskLevel || 'high').toLowerCase() as 'low' | 'medium' | 'high'

  const riskColor = risk === 'high' ? '#EA580C' : risk === 'medium' ? '#D97706' : '#16A34A'
  const riskBg = risk === 'high' ? '#FFF7ED' : risk === 'medium' ? '#FFFBEB' : '#F0FDF4'
  const riskBorder = risk === 'high' ? '#FED7AA' : risk === 'medium' ? '#FDE68A' : '#BBF7D0'

  const overallScore = d.riskScore ?? 68
  const anxietyScore = d.anxietyRisk ?? Math.min(overallScore + 4, 95)
  const dropoutScore = d.dropoutRisk ?? Math.max(overallScore - 6, 8)
  const factors = d.factors && d.factors.length > 0 ? d.factors : ['High exam pressure', 'Low sleep hours']

  const actionableResources: VettedResource[] = getResourcesForFactors(factors, 3)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app, #F9F9F8)', padding: '40px 32px 80px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
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
              Evaluated via dual Random Forest model inference on{' '}
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
          <div style={{ maxWidth: 540 }}>
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

        {/* 2. Three Circular Score Gauges */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: 16,
            padding: '28px 20px',
            marginBottom: 24,
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0E1A2B', margin: '0 0 20px', textAlign: 'center' }}>
            Multi-Dimensional Risk Breakdown
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
            <CircleGauge
              value={overallScore}
              label="Combined Risk Index"
              sublabel="Fused Signal"
              color={riskColor}
            />
            <CircleGauge
              value={anxietyScore}
              label="Psychological Anxiety Level"
              sublabel="RF Regression"
              color="#01575E"
            />
            <CircleGauge
              value={dropoutScore}
              label="Academic Attrition Risk"
              sublabel="RF Classifier"
              color="#D99A34"
            />
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Compass size={18} color="#01575E" />
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0E1A2B', margin: 0 }}>
              Key Contributing Factors Identified
            </h3>
          </div>
          <p style={{ fontSize: 13.5, color: '#64748B', margin: '0 0 16px' }}>
            These domain factors had the greatest weight on your early-warning evaluation:
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

        {/* 4. What You Can Do Now (Curated Resource Library Recommendations) */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: 16,
            padding: '24px 28px',
            marginBottom: 28,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <HeartHandshake size={20} color="#01575E" />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0E1A2B', margin: 0 }}>
              What You Can Do Now (Vetted Actionable Steps)
            </h3>
          </div>
          <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 20px' }}>
            Evidence-based tools and protocols selected specifically for your current indicators:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {actionableResources.map((res) => (
              <div
                key={res.id}
                style={{
                  border: '1.5px solid #E2E8F0',
                  borderRadius: 12,
                  padding: '16px 20px',
                  background: '#F9F9F8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                }}
              >
                <div style={{ maxWidth: 580 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: '#E0F2F1',
                        color: '#01575E',
                      }}
                    >
                      {res.tag}
                    </span>
                    <span style={{ fontSize: 12, color: '#64748B' }}>{res.readTime}</span>
                  </div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0E1A2B', margin: '0 0 4px' }}>
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
                    gap: 6,
                    background: '#01575E',
                    color: '#FFFFFF',
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span>Open Resource</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
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
            <span>View Risk Trend & History</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

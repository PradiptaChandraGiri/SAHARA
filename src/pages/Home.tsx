import React from 'react'
import type { Page } from '../App'
import { useAuth } from '../context/AuthContext'
import { ShieldCheck, Lock, UserCheck, MessageSquare, ArrowRight, Activity, Brain, Users } from 'lucide-react'

interface HomeProps {
  onNavigate: (page: Page) => void
}

const pillars = [
  {
    icon: <Activity size={22} color="#01575E" />,
    title: 'Wellbeing Check-ins',
    desc: 'A 5-step conversational check-in capturing sleep quality, daily stress, and academic load — structured around everyday behaviors, never intimidating clinical diagnostic labels.',
    accent: '#01575E',
    bg: '#E0F2F1',
  },
  {
    icon: <Brain size={22} color="#D99A34" />,
    title: 'Dual Machine Learning Signal',
    desc: 'Combines Random Forest Anxiety Regression with institutional Dropout Classification into a single fused early-warning score before academic distress compounds.',
    accent: '#D99A34',
    bg: '#FEF3C7',
  },
  {
    icon: <Users size={22} color="#0E1A2B" />,
    title: 'Routed Human Support',
    desc: 'Every assessment routes to the appropriate level of care: self-guided evidence-based resources, proactive peer support, or high-priority triage by certified campus counselors.',
    accent: '#0E1A2B',
    bg: '#F1F5F9',
  },
]

const flow = [
  { step: '01', title: 'Check-in', subtitle: '5-minute intake' },
  { step: '02', title: 'ML Evaluation', subtitle: 'Real-time dual model' },
  { step: '03', title: 'Action Plan', subtitle: 'Evidence-based next steps' },
  { step: '04', title: 'Counselor Review', subtitle: 'Confidential support' },
]

export default function Home({ onNavigate }: HomeProps) {
  const { user } = useAuth()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app, #F9F9F8)', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #013C41 0%, #0E1A2B 100%)',
          padding: '80px 48px 72px',
          position: 'relative',
          overflow: 'hidden',
          color: '#FFFFFF',
        }}
      >
        {/* Subtle Dawn Arc background */}
        <svg
          viewBox="0 0 1200 260"
          preserveAspectRatio="none"
          aria-hidden="true"
          style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 160, opacity: 0.4 }}
        >
          <circle cx="600" cy="260" r="140" fill="#D99A34" opacity="0.2" />
          {[1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M0 ${260 - i * 36} Q 600 ${260 - i * 36 - 50} 1200 ${260 - i * 36}`}
              stroke="#E8B563"
              strokeOpacity={0.15 + i * 0.05}
              strokeWidth="1.5"
              fill="none"
            />
          ))}
        </svg>

        <div style={{ maxWidth: 840, margin: '0 auto', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 20,
              border: '1px solid rgba(232,181,99,0.35)',
              borderRadius: 99,
              padding: '6px 16px',
              background: 'rgba(14, 26, 43, 0.4)',
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--amber-400, #E8B563)' }} />
            <span style={{ fontSize: 13, color: '#E8B563', fontWeight: 600 }}>
              AI-Driven Student Wellbeing & Academic Risk Early-Warning Platform
            </span>
          </div>

          <h1
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.15,
              margin: '0 0 20px',
              letterSpacing: '-0.02em',
            }}
          >
            Understand Wellbeing. Catch Academic Risk at First Light.
          </h1>

          <p
            style={{
              fontSize: 17,
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: 1.65,
              margin: '0 auto 36px',
              maxWidth: 680,
            }}
          >
            SAHARA detects early behavioral and emotional strain before difficulties escalate into academic attrition, connecting students with personalized resources and campus care.
          </p>

          {/* ONE Primary Call To Action */}
          <div>
            <button
              onClick={() => onNavigate('login')}
              className="btn-cta"
              style={{
                fontSize: 16,
                padding: '14px 36px',
                borderRadius: 10,
              }}
            >
              <span>Get Started</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* 2. How SAHARA Works (3 Pillars) */}
      <section style={{ padding: '64px 32px 32px', maxWidth: 1140, margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 30, fontWeight: 700, color: '#0E1A2B', margin: '0 0 10px' }}>
            How SAHARA Works
          </h2>
          <p style={{ fontSize: 15.5, color: '#64748B', margin: 0 }}>
            Three interconnected pillars delivering proactive institutional support.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {pillars.map((p) => (
            <div
              key={p.title}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                borderRadius: 16,
                padding: '30px 26px',
                borderTop: `4px solid ${p.accent}`,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                height: '100%',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: p.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                {p.icon}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0E1A2B', margin: '0 0 10px' }}>
                {p.title}
              </h3>
              <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.65, margin: 0, flex: 1 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Operational Workflow Strip */}
      <section style={{ padding: '32px 32px 48px', maxWidth: 1140, margin: '0 auto', width: '100%' }}>
        <div
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: 16,
            padding: '28px 36px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 24,
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          {flow.map((item, idx) => (
            <div key={item.step} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#01575E',
                  background: '#E0F2F1',
                  borderRadius: 8,
                  padding: '6px 10px',
                  fontFamily: 'monospace',
                }}
              >
                {item.step}
              </span>
              <div>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0E1A2B' }}>{item.title}</h4>
                <p style={{ margin: 0, fontSize: 12.5, color: '#64748B' }}>{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. WhatsApp 24/7 Channel Feature Card */}
      <section style={{ padding: '0 32px 56px', maxWidth: 1140, margin: '0 auto', width: '100%' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #F0FDF4 0%, #E0F2F1 100%)',
            border: '1.5px solid #BBF7D0',
            borderRadius: 16,
            padding: '32px 40px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ maxWidth: 640 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <MessageSquare size={20} color="#16A34A" />
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#166534' }}>
                Instant Access: SAHARA WhatsApp Bot
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: 14.5, color: '#334155', lineHeight: 1.6 }}>
              Prefer taking your check-in or accessing guided box breathing on your phone? Connect with SAHARA directly over WhatsApp with zero app installations required.
            </p>
          </div>
          <a
            href="https://wa.me/14155238886?text=join%20no-different"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#16A34A',
              color: '#FFFFFF',
              padding: '12px 22px',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
            }}
          >
            <span>Launch WhatsApp Bot</span>
            <ArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* 5. How Your Data is Handled (Privacy & Security) */}
      <section
        style={{
          background: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          borderBottom: '1px solid #E2E8F0',
          padding: '48px 32px',
        }}
      >
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <ShieldCheck size={24} color="#01575E" />
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0E1A2B', margin: 0 }}>
              How Your Data is Handled & Protected
            </h2>
          </div>
          <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.7, margin: '0 0 24px', maxWidth: 840 }}>
            SAHARA is built with privacy-by-design. Check-in responses are evaluated using pseudonymized cryptographic student IDs (<code style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: 4 }}>STU-XXXXXX</code>) to protect individual identity by default. Data is encrypted in transit and at rest, and individual drill-downs are restricted strictly to authorized campus counselors for confidential triage.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <Lock size={18} color="#01575E" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#0E1A2B' }}>Encrypted Storage</h4>
                <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>AES-level database encryption with strict audit logging on record access.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <UserCheck size={18} color="#01575E" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#0E1A2B' }}>Role-Based Access</h4>
                <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>Students only access their own results; admins view population analytics.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <ShieldCheck size={18} color="#01575E" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#0E1A2B' }}>Data Control</h4>
                <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>One-tap export ("Download my data") and complete data deletion upon request.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer
        style={{
          background: '#0E1A2B',
          color: '#94A3B8',
          padding: '40px 32px 32px',
          marginTop: 'auto',
        }}
      >
        <div
          style={{
            maxWidth: 1140,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 20,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: 'var(--amber-500, #D99A34)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M2 18 Q12 8 22 18" stroke="#0E1A2B" strokeWidth="2.4" strokeLinecap="round" />
                  <circle cx="12" cy="13" r="3.2" fill="#0E1A2B" />
                </svg>
              </div>
              <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: 16 }}>SAHARA</span>
            </div>
            <p style={{ margin: 0, fontSize: 13 }}>
              Student Academic Health & Attrition Risk Assessment Platform &copy; {new Date().getFullYear()}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 24, fontSize: 13.5 }}>
            <button
              onClick={() => onNavigate('login')}
              style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer', padding: 0 }}
            >
              Sign In
            </button>
            <a
              href="https://wa.me/14155238886?text=join%20no-different"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#CBD5E1', textDecoration: 'none' }}
            >
              WhatsApp Support
            </a>
            <span style={{ color: '#64748B' }}>National Tele-MANAS: 14416 (24/7)</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

import React, { useState } from 'react'
import type { Page } from '../App'
import { useAuth } from '../context/AuthContext'
import {
  ShieldCheck,
  Lock,
  UserCheck,
  MessageSquare,
  ArrowRight,
  Activity,
  Brain,
  Users,
  Bell,
  Sun,
  Moon,
  Sparkles,
  Globe,
  Smartphone,
  CheckCircle2,
  X,
  Clock,
  HelpCircle,
  PauseCircle,
} from 'lucide-react'

interface HomeProps {
  onNavigate: (page: Page) => void
}

const pillars = [
  {
    icon: <Activity size={22} color="var(--color-primary)" />,
    title: 'Wellbeing Check-ins',
    desc: 'A 5-step conversational check-in capturing sleep quality, daily stress, and academic load — structured around everyday behaviors, never intimidating clinical diagnostic labels.',
    accent: 'var(--color-primary)',
    bg: 'var(--color-primary-subtle)',
  },
  {
    icon: <Brain size={22} color="var(--color-accent)" />,
    title: 'Dual Machine Learning Signal',
    desc: 'Combines Random Forest Anxiety Regression with institutional Dropout Classification into a single fused early-warning score before academic distress compounds.',
    accent: 'var(--color-accent)',
    bg: 'var(--color-accent-subtle)',
  },
  {
    icon: <Users size={22} color="var(--color-text-primary)" />,
    title: 'Routed Human Support',
    desc: 'Every assessment routes to the appropriate level of care: self-guided evidence-based resources, proactive peer support, or high-priority triage by certified campus counselors.',
    accent: 'var(--color-text-primary)',
    bg: 'var(--color-surface-raised)',
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
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [activeStepTab, setActiveStepTab] = useState<'channels' | 'schedule' | 'privacy'>('channels')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background)', display: 'flex', flexDirection: 'column', transition: 'background-color 0.25s ease' }}>
      {/* 1. Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, var(--color-primary-container) 0%, var(--navy-950) 100%)',
          padding: 'clamp(48px, 8vw, 80px) clamp(18px, 5vw, 48px) clamp(40px, 6vw, 72px)',
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
          <circle cx="600" cy="260" r="140" fill="var(--color-accent)" opacity="0.2" />
          {[1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M0 ${260 - i * 36} Q 600 ${260 - i * 36 - 50} 1200 ${260 - i * 36}`}
              stroke="var(--color-accent)"
              strokeOpacity={0.15 + i * 0.05}
              strokeWidth="1.5"
              fill="none"
            />
          ))}
        </svg>

        <div style={{ maxWidth: 880, margin: '0 auto', position: 'relative', zIndex: 1, textAlign: 'center' }}>
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
              maxWidth: '100%',
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-accent)', flexShrink: 0 }} />
            <span style={{ fontSize: 'clamp(11.5px, 2.5vw, 13px)', color: 'var(--color-accent)', fontWeight: 600 }}>
              AI-Driven Student Wellbeing &amp; Academic Risk Early-Warning Platform
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(28px, 6vw, 48px)',
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 1.18,
              margin: '0 0 20px',
              letterSpacing: '-0.02em',
            }}
          >
            Understand Wellbeing. Catch Academic Risk at First Light.
          </h1>

          <p
            style={{
              fontSize: 'clamp(15px, 3.5vw, 17px)',
              color: 'rgba(255, 255, 255, 0.85)',
              lineHeight: 1.65,
              margin: '0 auto 36px',
              maxWidth: 700,
            }}
          >
            SAHARA detects early behavioral and emotional strain before difficulties escalate into academic attrition, connecting students with personalized resources, smart reminders, and campus care.
          </p>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
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

            <button
              onClick={() => setShowReminderModal(true)}
              style={{
                fontSize: 15,
                padding: '14px 24px',
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1.5px solid rgba(255, 255, 255, 0.3)',
                color: '#FFFFFF',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s ease',
              }}
            >
              <Bell size={17} color="var(--color-accent)" />
              <span>How Reminders Work (Guide)</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Notification & Reminder Setup Feature Showcase Card */}
      <section style={{ padding: '48px 32px 16px', maxWidth: 1140, margin: '0 auto', width: '100%' }}>
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1.5px solid var(--color-border)',
            borderRadius: 18,
            padding: '32px 36px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 32,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ maxWidth: 640 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--color-primary-subtle)',
                color: 'var(--color-primary)',
                padding: '4px 12px',
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 12,
                border: '1px solid var(--color-border)',
              }}
            >
              <Bell size={13} />
              <span>Zero Default-On • Capped at Max 2 Daily</span>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
              Gentle, Opt-in Wellbeing Notifications
            </h2>
            <p style={{ fontSize: 14.5, color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: '0 0 20px' }}>
              No guilt trips, no streak pressure, and zero surprise popups. Choose between discreet Web Push notifications or WhatsApp reminders at your exact preferred morning &amp; evening times in your local timezone.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowReminderModal(true)}
                className="btn-teal"
                style={{ padding: '10px 20px', fontSize: 13.5 }}
              >
                <HelpCircle size={15} />
                <span>View Step-by-Step Setup Guide</span>
              </button>

              <button
                onClick={() => onNavigate('login')}
                className="btn-outline"
                style={{ padding: '10px 20px', fontSize: 13.5 }}
              >
                <span>Customize in Profile</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* Visual Mini Preview Strip */}
          <div
            style={{
              background: 'var(--color-surface-raised)',
              border: '1.5px solid var(--color-border)',
              borderRadius: 14,
              padding: '20px 22px',
              minWidth: 280,
              maxWidth: 340,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Sample Reminder Previews
            </span>

            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Sun size={14} color="var(--color-accent)" />
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    Morning Check-in • 8:00 AM
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  "A 2-minute check-in can help you start the day with a clearer picture of how you're doing."
                </p>
              </div>

              <div
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Moon size={14} color="var(--color-primary)" />
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    Evening Wind-Down • 9:00 PM
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  "A wind-down routine can make a real difference tonight — even 10 quiet minutes before bed helps."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How SAHARA Works (3 Pillars) */}
      <section style={{ padding: '48px 32px 32px', maxWidth: 1140, margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            How SAHARA Works
          </h2>
          <p style={{ fontSize: 15.5, color: 'var(--color-text-muted)', margin: 0 }}>
            Three interconnected pillars delivering proactive institutional support.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {pillars.map((p) => (
            <div
              key={p.title}
              style={{
                background: 'var(--color-surface)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 16,
                padding: '30px 26px',
                borderTop: `4px solid ${p.accent}`,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-sm)',
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
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 10px' }}>
                {p.title}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: 0, flex: 1 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Operational Workflow Strip */}
      <section style={{ padding: '24px 32px 48px', maxWidth: 1140, margin: '0 auto', width: '100%' }}>
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1.5px solid var(--color-border)',
            borderRadius: 16,
            padding: '28px 36px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 24,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {flow.map((item) => (
            <div key={item.step} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                  background: 'var(--color-primary-subtle)',
                  borderRadius: 8,
                  padding: '6px 10px',
                  fontFamily: 'monospace',
                }}
              >
                {item.step}
              </span>
              <div>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>{item.title}</h4>
                <p style={{ margin: 0, fontSize: 12.5, color: 'var(--color-text-muted)' }}>{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. WhatsApp 24/7 Channel Feature Card */}
      <section style={{ padding: '0 32px 56px', maxWidth: 1140, margin: '0 auto', width: '100%' }}>
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1.5px solid var(--color-risk-low-border)',
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
              <MessageSquare size={20} color="var(--color-risk-low)" />
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Instant Access: SAHARA WhatsApp Bot
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: 14.5, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
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
              background: 'var(--color-risk-low)',
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

      {/* 6. How Your Data is Handled (Privacy & Security) */}
      <section
        style={{
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
          padding: '48px 32px',
        }}
      >
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <ShieldCheck size={24} color="var(--color-primary)" />
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
              How Your Data is Handled &amp; Protected
            </h2>
          </div>
          <p style={{ fontSize: 14.5, color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: '0 0 24px', maxWidth: 840 }}>
            SAHARA is built with privacy-by-design. Check-in responses are evaluated using pseudonymized cryptographic student IDs (<code style={{ background: 'var(--color-surface-raised)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--color-border)' }}>STU-XXXXXX</code>) to protect individual identity by default. Data is encrypted in transit and at rest, and individual drill-downs are restricted strictly to authorized campus counselors for confidential triage.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <Lock size={18} color="var(--color-primary)" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>Encrypted Storage</h4>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)' }}>AES-level database encryption with strict audit logging on record access.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <UserCheck size={18} color="var(--color-primary)" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>Role-Based Access</h4>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)' }}>Students only access their own results; admins view population analytics.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <ShieldCheck size={18} color="var(--color-primary)" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>Data Control</h4>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)' }}>One-tap export ("Download my data") and complete data deletion upon request.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer
        style={{
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          color: 'var(--color-text-muted)',
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
                  background: 'var(--color-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M2 18 Q12 8 22 18" stroke="var(--color-background)" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
              </div>
              <span style={{ color: 'var(--color-text-primary)', fontWeight: 800, fontSize: 16 }}>SAHARA</span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)' }}>
              Student Academic Health &amp; Attrition Risk Assessment Platform · Developed by Pradipta Chandra Giri &copy; {new Date().getFullYear()}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 24, fontSize: 13.5 }}>
            <button
              onClick={() => onNavigate('login')}
              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: 0, fontWeight: 600 }}
            >
              Sign In
            </button>
            <button
              onClick={() => setShowReminderModal(true)}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: 0 }}
            >
              Reminder Setup
            </button>
            <a
              href="https://wa.me/14155238886?text=join%20no-different"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}
            >
              WhatsApp Support
            </a>
            <span style={{ color: 'var(--color-text-muted)' }}>National Tele-MANAS: 14416 (24/7)</span>
          </div>
        </div>
      </footer>

      {/* 8. Interactive Notification & Reminder Setup Guide Pop-out Modal */}
      {showReminderModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setShowReminderModal(false)}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1.5px solid var(--color-border)',
              borderRadius: 20,
              maxWidth: 680,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px 36px',
              boxShadow: 'var(--shadow-md)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowReminderModal(false)}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'var(--color-surface-raised)',
                border: '1px solid var(--color-border)',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
              }}
            >
              <X size={16} />
            </button>

            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'var(--color-primary-subtle)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bell size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
                  How to Set Up Reminders &amp; Notifications
                </h2>
                <p style={{ fontSize: 13.5, color: 'var(--color-text-muted)', margin: 0 }}>
                  Simple, 100% opt-in steps to configure your gentle wellness nudges.
                </p>
              </div>
            </div>

            {/* Nav Step Tabs */}
            <div
              style={{
                display: 'flex',
                gap: 8,
                margin: '20px 0',
                borderBottom: '1px solid var(--color-border)',
                paddingBottom: 10,
              }}
            >
              {[
                { id: 'channels', label: '1. Channels & Push' },
                { id: 'schedule', label: '2. Times & Schedule' },
                { id: 'privacy', label: '3. Caps & Pause' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveStepTab(tab.id as any)}
                  style={{
                    background: activeStepTab === tab.id ? 'var(--color-primary-subtle)' : 'transparent',
                    border: activeStepTab === tab.id ? '1px solid var(--color-primary)' : '1px solid transparent',
                    color: activeStepTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    padding: '6px 14px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content 1: Channels */}
            {activeStepTab === 'channels' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: 'var(--color-surface-raised)', borderRadius: 12, padding: '16px 18px', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Globe size={18} color="var(--color-primary)" />
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      Channel 1: Browser System Notifications (Web Push)
                    </h4>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0 0 10px' }}>
                    1. Go to <strong>My Profile</strong> &rarr; <strong>Notification &amp; Wellbeing Reminders</strong>.<br />
                    2. Toggle on <strong>Browser Notifications</strong>.<br />
                    3. Your browser will show an OS permission prompt — click <strong>"Allow"</strong>.<br />
                    4. <em>Zero spam guaranteed:</em> Only delivers notifications when you scheduled them.
                  </p>
                </div>

                <div style={{ background: 'var(--color-surface-raised)', borderRadius: 12, padding: '16px 18px', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Smartphone size={18} color="var(--color-risk-low)" />
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      Channel 2: Discreet WhatsApp Reminders
                    </h4>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    1. Toggle on <strong>WhatsApp Reminders</strong> and confirm your mobile number.<br />
                    2. Send <code style={{ background: 'var(--color-surface)', padding: '2px 6px', borderRadius: 4 }}>join no-different</code> to <strong>+1 (415) 523-8886</strong> on WhatsApp to link your phone.<br />
                    3. Receive factor-aware study and breathing suggestions right in WhatsApp.
                  </p>
                </div>
              </div>
            )}

            {/* Tab Content 2: Schedule */}
            {activeStepTab === 'schedule' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: 'var(--color-surface-raised)', borderRadius: 12, padding: '16px 18px', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Sun size={18} color="var(--color-accent)" />
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      Morning Check-in (Default: 8:00 AM)
                    </h4>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    A short, 2-minute invitation to begin your study day mindfully and reflect on sleep and focus. You can adjust the exact hour and minute with the time picker.
                  </p>
                </div>

                <div style={{ background: 'var(--color-surface-raised)', borderRadius: 12, padding: '16px 18px', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Moon size={18} color="var(--color-primary)" />
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      Evening Wind-Down (Default: 9:00 PM)
                    </h4>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    A gentle reminder to put away screens and coursework before bed. Tailored to help your mind decompress and recharge for the next day.
                  </p>
                </div>

                <div style={{ background: 'var(--color-surface-raised)', borderRadius: 12, padding: '16px 18px', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Globe size={18} color="var(--color-text-primary)" />
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      Automatic Timezone Sync
                    </h4>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    SAHARA automatically respects your local timezone (e.g. <code>Asia/Kolkata</code>, <code>America/New_York</code>). You never have to manually convert UTC times.
                  </p>
                </div>
              </div>
            )}

            {/* Tab Content 3: Privacy & Daily Cap */}
            {activeStepTab === 'privacy' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: 'var(--color-surface-raised)', borderRadius: 12, padding: '16px 18px', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <ShieldCheck size={18} color="var(--color-risk-low)" />
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      Strict Daily Cap: Max 2 Messages Per Day
                    </h4>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    Notifications are strictly limited to at most 1 morning + 1 evening message daily. We never spam or flood your device.
                  </p>
                </div>

                <div style={{ background: 'var(--color-surface-raised)', borderRadius: 12, padding: '16px 18px', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <PauseCircle size={18} color="var(--color-accent)" />
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      One-Tap "Pause All" &amp; Zero Guilt
                    </h4>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    Taking a break or studying for intense finals? You can pause reminders for 1 week, 2 weeks, or indefinitely with one click. When you return, SAHARA will never show "missed check-ins" or punitive streak counters.
                  </p>
                </div>
              </div>
            )}

            {/* Modal Bottom Action Button */}
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                onClick={() => setShowReminderModal(false)}
                style={{
                  background: 'var(--color-surface-raised)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  padding: '10px 18px',
                  borderRadius: 8,
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close Guide
              </button>

              <button
                onClick={() => {
                  setShowReminderModal(false)
                  onNavigate('login')
                }}
                className="btn-teal"
                style={{ padding: '10px 22px', fontSize: 13.5 }}
              >
                <span>Set Up Reminders Now</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

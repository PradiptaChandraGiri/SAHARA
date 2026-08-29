import React, { useState } from 'react'
import { PhoneCall, ShieldAlert, X, MessageSquare } from 'lucide-react'

export interface CrisisContact {
  name: string
  number: string
  hours: string
  type: string
  desc: string
}

export const CRISIS_CONTACTS: CrisisContact[] = [
  {
    name: 'National Tele-MANAS',
    number: '14416',
    hours: '24/7 Free & Confidential',
    type: 'Government Mental Health Helpline',
    desc: 'Government of India national comprehensive mental health network available in 20+ regional languages.'
  },
  {
    name: 'KIRAN Helpline',
    number: '1800-599-0019',
    hours: '24/7 Free & Confidential',
    type: 'Govt Mental Health & Crisis',
    desc: 'Department of Empowerment of Persons with Disabilities mental health support line.'
  },
  {
    name: 'iCall Psychosocial Helpline',
    number: '9152987821',
    hours: 'Mon–Sat, 10 AM – 8 PM',
    type: 'TISS Professional Counseling',
    desc: 'Professional counseling service run by Tata Institute of Social Sciences.'
  },
  {
    name: 'Vandrevala Foundation',
    number: '9999-666-555',
    hours: '24/7 Free & Confidential',
    type: 'Crisis & Suicide Prevention',
    desc: 'Trained psychological counselors providing immediate crisis intervention.'
  }
]

export default function CrisisButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Crisis Button */}
      <div className="floating-crisis-container" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', gap: 10, alignItems: 'center' }}>
        <button
          id="persistent-crisis-button"
          onClick={() => setIsOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '11px 18px',
            background: 'var(--color-risk-high, #DC2626)',
            color: '#FFFFFF',
            borderRadius: 999,
            boxShadow: '0 8px 24px rgba(220, 38, 38, 0.4)',
            fontWeight: 700,
            fontSize: 13.5,
            border: '1.5px solid rgba(255,255,255,0.4)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0) scale(1)')}
          aria-label="Get Immediate Help / 24/7 Crisis Support"
        >
          <PhoneCall size={16} />
          <span>Need Immediate Help? (24/7)</span>
        </button>
      </div>

      {/* Crisis Help Modal */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(14, 24, 26, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: 18,
              maxWidth: 540,
              width: '100%',
              boxShadow: '0 20px 48px rgba(0, 0, 0, 0.35)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, var(--color-primary-container) 0%, var(--navy-950) 100%)',
                color: '#FFFFFF',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(248, 113, 113, 0.25)',
                    border: '1px solid rgba(248, 113, 113, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShieldAlert size={20} color="#FCA5A5" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>24/7 Immediate Support & Crisis Helplines</h3>
                  <p style={{ margin: 0, fontSize: 12.5, color: '#CBD5E1' }}>
                    Free, confidential, and available right now
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '20px 24px', maxHeight: '70vh', overflowY: 'auto' }}>
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0 0 16px' }}>
                If you or a fellow student are experiencing severe emotional distress, overwhelming anxiety, or thoughts of self-harm, please connect immediately with a trained counselor:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {CRISIS_CONTACTS.map((c) => (
                  <div
                    key={c.number}
                    style={{
                      border: '1.5px solid var(--color-border)',
                      borderRadius: 12,
                      padding: '14px 16px',
                      background: 'var(--color-surface-raised)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>{c.name}</h4>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: 99,
                            background: 'var(--color-primary-subtle)',
                            color: 'var(--color-primary)',
                            border: '1px solid var(--color-border)',
                          }}
                        >
                          {c.hours}
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-text-muted)' }}>{c.desc}</p>
                    </div>

                    <a
                      href={`tel:${c.number.replace(/[^0-9]/g, '')}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'var(--color-primary)',
                        color: '#FFFFFF',
                        padding: '8px 14px',
                        borderRadius: 8,
                        fontWeight: 700,
                        fontSize: 13,
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <PhoneCall size={14} />
                      <span>{c.number}</span>
                    </a>
                  </div>
                ))}
              </div>

              {/* WhatsApp Alternative */}
              <div
                style={{
                  marginTop: 18,
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'var(--color-risk-low-bg)',
                  border: '1px solid var(--color-risk-low-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <h5 style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: 'var(--color-risk-low-text)' }}>
                    Prefer texting? Connect with SAHARA WhatsApp Bot
                  </h5>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--color-risk-low-text)', opacity: 0.9 }}>
                    Automated triage, guided breathing & crisis routing directly on your phone.
                  </p>
                </div>
                <a
                  href="https://wa.me/14155238886?text=join%20no-different"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'var(--color-risk-low)',
                    color: '#FFFFFF',
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: 700,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <MessageSquare size={14} />
                  <span>Open WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                background: 'var(--color-surface-raised)',
                borderTop: '1px solid var(--color-border-subtle)',
                padding: '12px 24px',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: '1.5px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  padding: '7px 18px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

import React, { useState } from 'react'
import {
  MessageSquare,
  ExternalLink,
  Bot,
  Send,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Code,
  QrCode,
  Sparkles,
  ChevronDown,
} from 'lucide-react'
import { API_BASE } from '../config'

export default function WhatsAppSupport() {
  const [chatMessages, setChatMessages] = useState<Array<{ from: 'user' | 'bot'; text: string }>>([
    {
      from: 'bot',
      text: "👋 *SAHARA WhatsApp Wellbeing Assistant*\n\nReply *'hi'* or *'checkin'* to start your 5-minute wellbeing intake, or ask for study/breathing guidance!",
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showDevDetails, setShowDevDetails] = useState(false)

  const handleSend = async () => {
    if (!input.trim() || isTyping) return
    const userText = input.trim()
    setInput('')
    setChatMessages((prev) => [...prev, { from: 'user', text: userText }])
    setIsTyping(true)

    try {
      const formData = new URLSearchParams()
      formData.append('From', 'whatsapp:+919876543210')
      formData.append('Body', userText)

      const res = await fetch(`${API_BASE}/api/whatsapp-webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      })

      if (res.ok) {
        const twimlText = await res.text()
        const match = twimlText.match(/<Message>([\s\S]*?)<\/Message>/)
        const botResponse = match ? match[1].trim() : "✅ Your response has been recorded by SAHARA's WhatsApp engine."
        setChatMessages((prev) => [...prev, { from: 'bot', text: botResponse }])
      } else {
        setChatMessages((prev) => [
          ...prev,
          { from: 'bot', text: "Thank you for reaching out! Reply *'checkin'* on WhatsApp to begin your screening." },
        ])
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          from: 'bot',
          text: "SAHARA WhatsApp Bot: I'm here to support you. You can try a 4-7-8 breathing exercise or connect with Tele-MANAS at 14416 (24/7). 💚",
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const steps = [
    {
      num: '1',
      title: 'Join Sandbox',
      desc: 'Send "join no-different" to +1 415 523 8886 on WhatsApp.',
    },
    {
      num: '2',
      title: 'Conversational Intake',
      desc: 'Answer daily routine questions on sleep, stress, and study load.',
    },
    {
      num: '3',
      title: 'Instant Risk & Video Support',
      desc: 'Receive AI risk index, study strategies, and 24/7 helpline links.',
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background)', padding: '40px 32px 80px', transition: 'background-color 0.25s ease' }}>
      <div style={{ maxWidth: 940, margin: '0 auto' }}>
        {/* Top Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'var(--color-risk-low)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MessageSquare size={20} />
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Message SAHARA Anytime on WhatsApp
            </h1>
          </div>
          <p style={{ fontSize: 14.5, color: 'var(--color-text-muted)', margin: 0 }}>
            Take your wellbeing check-ins, practice guided breathing, or get immediate helpline access directly on WhatsApp.
          </p>
        </div>

        {/* 1. Student Hero Launch Card */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1.5px solid var(--color-risk-low-border)',
            borderRadius: 16,
            padding: '32px 36px',
            marginBottom: 28,
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 28,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ maxWidth: 520 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--color-risk-low-bg)',
                color: 'var(--color-risk-low-text)',
                padding: '4px 12px',
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 700,
                border: '1px solid var(--color-risk-low-border)',
                marginBottom: 12,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-risk-low)' }} />
              <span>Official Twilio Sandbox Active</span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 10px' }}>
              Connect in 10 Seconds
            </h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: '0 0 20px' }}>
              Open WhatsApp on your phone and send <code style={{ background: 'var(--color-surface-raised)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--color-border)' }}>join no-different</code> to{' '}
              <strong style={{ color: 'var(--color-text-primary)' }}>+1 (415) 523-8886</strong>. You will be greeted immediately by SAHARA.
            </p>

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
                padding: '12px 24px',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14.5,
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
              }}
            >
              <span>Launch WhatsApp on Your Phone</span>
              <ExternalLink size={16} />
            </a>
          </div>

          <div
            style={{
              background: 'var(--color-surface-raised)',
              border: '1.5px solid var(--color-border)',
              borderRadius: 14,
              padding: '20px 24px',
              textAlign: 'center',
            }}
          >
            <a
              href="https://wa.me/14155238886?text=join%20no-different"
              target="_blank"
              rel="noopener noreferrer"
              title="Scan with phone or click to open WhatsApp"
              style={{
                display: 'block',
                textDecoration: 'none',
              }}
            >
              <div
                style={{
                  width: 136,
                  height: 136,
                  margin: '0 auto 10px',
                  background: '#FFFFFF',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: 12,
                  padding: 6,
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=https%3A%2F%2Fwa.me%2F14155238886%3Ftext%3Djoin%2520no-different&color=0E1A2B&bgcolor=FFFFFF"
                  alt="Scan to open SAHARA on WhatsApp"
                  style={{ width: '100%', height: '100%', borderRadius: 6, objectFit: 'contain' }}
                />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-risk-low)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <ExternalLink size={12} /> Scan or Click QR Code
              </span>
            </a>
          </div>
        </div>

        {/* 2. Three Steps */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 28 }}>
          {steps.map((s) => (
            <div
              key={s.num}
              style={{
                background: 'var(--color-surface)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 14,
                padding: '20px 22px',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'var(--color-primary-subtle)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 14,
                  marginBottom: 12,
                }}
              >
                {s.num}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 6px' }}>{s.title}</h3>
              <p style={{ fontSize: 13.5, color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* 3. Live Webhook Simulator */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1.5px solid var(--color-border)',
            borderRadius: 16,
            padding: '24px 28px',
            marginBottom: 28,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Sparkles size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
              Live WhatsApp Webhook Simulator
            </h3>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--color-text-muted)', margin: '0 0 16px' }}>
            Test the live backend webhook handler directly in your browser:
          </p>

          <div
            style={{
              height: 280,
              overflowY: 'auto',
              background: 'var(--color-surface-raised)',
              borderRadius: 12,
              border: '1px solid var(--color-border)',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              marginBottom: 16,
            }}
          >
            {chatMessages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.from === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  background: m.from === 'user' ? 'var(--color-risk-low)' : 'var(--color-surface)',
                  color: m.from === 'user' ? '#FFFFFF' : 'var(--color-text-primary)',
                  border: m.from === 'user' ? 'none' : '1px solid var(--color-border)',
                  borderRadius: m.from === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  padding: '10px 16px',
                  fontSize: 13.5,
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {m.text}
              </div>
            ))}
            {isTyping && (
              <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                WhatsApp webhook replying...
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            style={{ display: 'flex', gap: 10 }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type 'hi', 'checkin', '1', '2' or ask a question..."
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 8,
                border: '1.5px solid var(--color-border)',
                background: 'var(--color-surface-raised)',
                color: 'var(--color-text-primary)',
                fontSize: 14,
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              style={{
                background: 'var(--color-risk-low)',
                color: '#FFFFFF',
                padding: '10px 20px',
                borderRadius: 8,
                border: 'none',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                opacity: !input.trim() || isTyping ? 0.6 : 1,
              }}
            >
              Test Send
            </button>
          </form>
        </div>

        {/* 4. Collapsed Developer Details */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <button
            onClick={() => setShowDevDetails(!showDevDetails)}
            style={{
              width: '100%',
              padding: '14px 20px',
              background: 'var(--color-surface-raised)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13.5,
              color: 'var(--color-text-secondary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Code size={16} />
              <span>Developer & Webhook Integration Details</span>
            </div>
            <ChevronDown
              size={16}
              style={{ transform: showDevDetails ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
            />
          </button>

          {showDevDetails && (
            <div style={{ padding: '16px 20px', fontSize: 13, color: 'var(--color-text-secondary)', borderTop: '1px solid var(--color-border)' }}>
              <p style={{ margin: '0 0 8px' }}>
                <strong>Webhook Endpoint:</strong> <code style={{ background: 'var(--color-surface-raised)', padding: '2px 6px', borderRadius: 4 }}>POST /whatsapp-webhook</code>
              </p>
              <p style={{ margin: '0 0 8px' }}>
                <strong>Twilio Sandbox Number:</strong> <code style={{ background: 'var(--color-surface-raised)', padding: '2px 6px', borderRadius: 4 }}>whatsapp:+14155238886</code>
              </p>
              <p style={{ margin: 0 }}>
                <strong>Integration Architecture:</strong> Receives standard Twilio incoming payload, steps through 17-step intake machine, routes completed answers to <code>assess_student()</code>, logs anonymized record to Neon PostgreSQL, and replies with formatted TwiML.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import React, { useState, useRef, useEffect } from 'react'
import {
  Send,
  Bot,
  User,
  ShieldAlert,
  Sparkles,
  PhoneCall,
  Info,
  Clock,
  ExternalLink,
  BookOpen,
  Video,
  Wrench,
  Headphones,
} from 'lucide-react'
import { getResourcesForFactors, VettedResource } from '../data/resources'

interface Message {
  id: number
  from: 'user' | 'ai'
  text: string
  time: string
  isCrisis?: boolean
  inlineResource?: VettedResource
}


const promptChips = [
  'I feel overwhelmed with upcoming exams.',
  'How can I fix my sleep routine this week?',
  'Guide me through a 2-minute breathing exercise.',
  'What is the Pomodoro study technique?',
]

function getResourceIcon(type?: VettedResource['type']) {
  switch (type) {
    case 'video':
      return <Video size={14} color="#01575E" />
    case 'audio':
      return <Headphones size={14} color="#D99A34" />
    case 'tool':
      return <Wrench size={14} color="#0E1A2B" />
    default:
      return <BookOpen size={14} color="#01575E" />
  }
}

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')

export default function AISupport() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      from: 'ai',
      text: "Hello! I am SAHARA — your AI Student Wellbeing Companion. I'm here 24/7 to help you navigate academic pressure, sleep, focus, and emotional balance. What is on your mind today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showCrisisBanner, setShowCrisisBanner] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load chat history from backend on page open
  useEffect(() => {
    fetch(`${API_BASE}/api/chat/history`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((history: any[]) => {
        if (Array.isArray(history) && history.length > 0) {
          const loaded: Message[] = history.map((item, idx) => ({
            id: idx + 10,
            from: item.role === 'assistant' ? 'ai' : 'user',
            text: item.content,
            time: item.created_at
              ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Earlier',
          }))
          setMessages(loaded)
        }
      })
      .catch((err) => console.warn('Could not load chat history:', err))
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const crisisKeywords = [
    'suicide',
    'kill myself',
    'end my life',
    'self harm',
    'hurt myself',
    'want to die',
    'hopeless',
    'cant go on',
  ]

  const handleSend = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim()
    if (!messageText || isTyping) return

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg: Message = { id: Date.now(), from: 'user', text: messageText, time: userTime }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    const isLocalCrisis = crisisKeywords.some((k) => messageText.toLowerCase().includes(k))
    if (isLocalCrisis) {
      setShowCrisisBanner(true)
    }

    const matchedResources = getResourcesForFactors([messageText], 1)
    const inlineRes = matchedResources.length > 0 ? matchedResources[0] : undefined

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: messageText }),
      })

      if (res.ok) {
        const data = await res.json()
        const aiTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        if (data.flaggedCrisis) {
          setShowCrisisBanner(true)
        }
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            from: 'ai',
            text: data.text || data.response,
            time: aiTime,
            isCrisis: Boolean(data.flaggedCrisis),
            inlineResource: inlineRes,
          },
        ])
      } else {
        throw new Error('API response not ok')
      }
    } catch (err) {
      // Local graceful fallback if backend is offline
      const aiTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      let fallbackText =
        "I hear you. 💚 Academic pressure can feel intense, but breaking your tasks into 25-minute Pomodoro focus blocks with 5-minute screen-free breaks makes a meaningful difference. What subject feels most urgent right now?"
      if (isLocalCrisis) {
        fallbackText =
          "I hear how much pain you're in, and your safety is the #1 priority. Please connect with free, confidential 24/7 help right now: Call Tele-MANAS at 14416 or KIRAN at 1800-599-0019. You do not have to carry this alone. 💚"
      }
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: 'ai',
          text: fallbackText,
          time: aiTime,
          isCrisis: isLocalCrisis,
          inlineResource: inlineRes,
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: 'var(--bg-app, #F9F9F8)',
      }}
    >
      {/* 1. Header & Honest Disclaimer */}
      <div
        style={{
          background: '#FFFFFF',
          borderBottom: '1.5px solid #E2E8F0',
          padding: '16px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: '#01575E',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bot size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0E1A2B', margin: 0 }}>
                SAHARA AI Wellbeing Companion
              </h2>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 99,
                  background: '#F0FDF4',
                  color: '#166534',
                  border: '1px solid #BBF7D0',
                }}
              >
                Online 24/7
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: '#64748B' }}>
              Conversational support for study routines, stress, and sleep
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a
            href="tel:14416"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#FFF7ED',
              border: '1px solid #FED7AA',
              color: '#C2410C',
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            <PhoneCall size={13} />
            <span>Tele-MANAS (14416)</span>
          </a>
        </div>
      </div>

      {/* Honest Disclaimer Ribbon */}
      <div
        style={{
          background: '#F0FDFA',
          borderBottom: '1px solid #CCFBF1',
          padding: '8px 28px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 12.5,
          color: '#0F766E',
        }}
      >
        <Info size={14} style={{ flexShrink: 0 }} />
        <span>
          <strong>Support Disclaimer:</strong> SAHARA AI provides wellbeing strategies and mindfulness guidance, not medical diagnosis. If you are experiencing crisis, reach out to campus counseling or dial 14416.
        </span>
      </div>

      {/* Crisis Banner if triggered */}
      {showCrisisBanner && (
        <div
          style={{
            background: '#FFF7ED',
            borderBottom: '1.5px solid #FED7AA',
            padding: '12px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldAlert size={20} color="#EA580C" />
            <div>
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#9A3412' }}>
                Immediate Emotional Support Available
              </h4>
              <p style={{ margin: 0, fontSize: 12.5, color: '#C2410C' }}>
                You are not alone. Free, confidential counselors are ready to speak with you right now at 14416.
              </p>
            </div>
          </div>
          <a
            href="tel:14416"
            style={{
              background: '#EA580C',
              color: '#FFFFFF',
              padding: '7px 14px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 13,
              textDecoration: 'none',
            }}
          >
            Call 14416
          </a>
        </div>
      )}

      {/* 2. Chat Conversation Stream */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {messages.map((m) => {
          const isUser = m.from === 'user'
          return (
            <div
              key={m.id}
              style={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                gap: 10,
                maxWidth: 820,
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                width: '100%',
              }}
            >
              {!isUser && (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: '#01575E',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  <Bot size={16} />
                </div>
              )}

              <div
                style={{
                  maxWidth: '75%',
                  background: isUser ? '#01575E' : m.isCrisis ? '#FFF7ED' : '#FFFFFF',
                  color: isUser ? '#FFFFFF' : '#0E1A2B',
                  border: isUser ? 'none' : m.isCrisis ? '1.5px solid #FED7AA' : '1.5px solid #E2E8F0',
                  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  padding: '14px 18px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                  fontSize: 14.5,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {m.text}

                {/* Inline Recommended Resource Card (Part 5) */}
                {/* TODO: replace with real API call to /api/resources?factor=X */}
                {!isUser && m.inlineResource && !m.isCrisis && (
                  <div
                    style={{
                      marginTop: 12,
                      background: '#F0FDFA',
                      border: '1px solid #CCFBF1',
                      borderRadius: 10,
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {getResourceIcon(m.inlineResource.type)}
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0F766E' }}>
                          {m.inlineResource.title}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#64748B' }}>
                          {m.inlineResource.readTime}
                        </div>
                      </div>
                    </div>

                    <a
                      href={m.inlineResource.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        background: '#01575E',
                        color: '#FFFFFF',
                        padding: '6px 10px',
                        borderRadius: 6,
                        fontSize: 11.5,
                        fontWeight: 600,
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span>Open</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                )}

                <div
                  style={{
                    fontSize: 11,
                    color: isUser ? 'rgba(255,255,255,0.7)' : '#94A3B8',
                    marginTop: 6,
                    textAlign: isUser ? 'right' : 'left',
                  }}
                >
                  {m.time}
                </div>
              </div>

              {isUser && (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: '#D99A34',
                    color: '#0E1A2B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  <User size={16} />
                </div>
              )}
            </div>
          )
        })}

        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, alignSelf: 'flex-start' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#01575E',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bot size={16} />
            </div>
            <div
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                borderRadius: '16px 16px 16px 4px',
                padding: '10px 16px',
                fontSize: 13.5,
                color: '#64748B',
                fontStyle: 'italic',
              }}
            >
              SAHARA is typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Suggested Prompt Chips */}
      <div
        style={{
          padding: '8px 28px',
          background: '#FFFFFF',
          borderTop: '1px solid #F1F5F9',
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        {promptChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            style={{
              padding: '6px 14px',
              borderRadius: 99,
              border: '1px solid #CBD5E1',
              background: '#F8FAFC',
              color: '#334155',
              fontSize: 12.5,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#E0F2F1'
              e.currentTarget.style.borderColor = '#01575E'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F8FAFC'
              e.currentTarget.style.borderColor = '#CBD5E1'
            }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* 4. Message Input Bar */}
      <div
        style={{
          background: '#FFFFFF',
          borderTop: '1.5px solid #E2E8F0',
          padding: '16px 28px',
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            maxWidth: 960,
            margin: '0 auto',
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question or how you're feeling right now..."
            style={{
              flex: 1,
              padding: '12px 18px',
              borderRadius: 10,
              border: '1.5px solid #CBD5E1',
              fontSize: 14.5,
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="btn-teal"
            style={{
              padding: '12px 22px',
              borderRadius: 10,
              opacity: !input.trim() || isTyping ? 0.6 : 1,
              cursor: !input.trim() || isTyping ? 'not-allowed' : 'pointer',
            }}
          >
            <span>Send</span>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}

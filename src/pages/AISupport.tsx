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
  Trash2,
} from 'lucide-react'
import { getResourcesForFactors, VettedResource } from '../data/resources'
import ChatMessageText from '../components/ChatMessageText'
import AnalyzingVisualization from '../components/AnalyzingVisualization'
import { Play } from 'lucide-react'

export interface SuggestedVideo {
  videoId: string
  title: string
  description?: string
  thumbnailUrl: string
  channelTitle: string
  url: string
  reason: string
}

interface Message {
  id: number
  from: 'user' | 'ai'
  text: string
  time: string
  isCrisis?: boolean
  inlineResource?: VettedResource
  suggestedVideo?: SuggestedVideo
}

const CHAT_STORAGE_KEY = 'sahara_ai_chat_history_v2'
const CHAT_STORAGE_TTL = 48 * 60 * 60 * 1000 // 48 Hours Retention

const getInitialMessages = (): Message[] => {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      const isWithin48h = data.timestamp && (Date.now() - data.timestamp < CHAT_STORAGE_TTL)
      if (isWithin48h && Array.isArray(data.messages) && data.messages.length > 0) {
        return data.messages
      }
    }
  } catch (e) {
    console.warn('Could not read cached chat messages:', e)
  }
  return [
    {
      id: 1,
      from: 'ai',
      text: "Hello! I am SAHARA — your AI Student Wellbeing Companion. I'm here 24/7 to help you navigate academic pressure, sleep, focus, and emotional balance. What is on your mind today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]
}

const promptChips = [
  'I feel overwhelmed with upcoming exams.',
  'How can I fix my sleep routine this week?',
  'Guide me through a 2-minute breathing exercise.',
  'What is the Pomodoro study technique?',
]

const CRISIS_KEYWORDS = [
  'kill myself',
  'suicide',
  'end my life',
  'self harm',
  'self-harm',
  'hurt myself',
  'want to die',
  'no reason to live',
  "can't go on",
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

import { API_BASE } from '../config'

export default function AISupport() {
  const [messages, setMessages] = useState<Message[]>(getInitialMessages)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showCrisisBanner, setShowCrisisBanner] = useState(false)
  const [evalContext, setEvalContext] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-sync messages to localStorage whenever messages update (48h retention)
  useEffect(() => {
    if (messages && messages.length > 0) {
      try {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({
          timestamp: Date.now(),
          messages: messages,
        }))
      } catch (e) {
        console.warn('Could not persist chat messages:', e)
      }
    }
  }, [messages])

  // Load chat history & evaluation context on page open
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

    // Fetch latest student evaluation context
    fetch(`${API_BASE}/api/results/latest`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((row) => {
        if (row) {
          setEvalContext({
            overallWellbeing: Number(row.overall_wellbeing),
            anxietySignal: Number(row.anxiety_signal),
            academicStrain: Number(row.academic_strain),
            riskLevel: row.risk_level,
            factors: row.contributing_factors || [],
          })
        }
      })
      .catch(() => {})

    // Check for prefill query from Results page
    const prefill = sessionStorage.getItem('sahara_prefill_chat')
    if (prefill) {
      sessionStorage.removeItem('sahara_prefill_chat')
      setTimeout(() => {
        handleSend(prefill)
      }, 400)
    }
  }, [])

  const handleClearChat = async () => {
    if (window.confirm('Start a new conversation? This will clear your current chat history.')) {
      const defaultWelcome: Message[] = [
        {
          id: Date.now(),
          from: 'ai',
          text: "Hello! I am SAHARA — your AI Student Wellbeing Companion. I'm here 24/7 to help you navigate academic pressure, sleep, focus, and emotional balance. What is on your mind today?",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]
      setMessages(defaultWelcome)
      localStorage.removeItem(CHAT_STORAGE_KEY)
      try {
        await fetch(`${API_BASE}/api/chat/history`, { method: 'DELETE', credentials: 'include' })
      } catch (e) {}
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const dynamicPromptChips = evalContext?.factors?.length
    ? [
        `How can I lower my ${evalContext.factors[0]?.replace(/_/g, ' ') || 'exam pressure'}?`,
        'Guide me through a 2-minute somatic reset.',
        'Help me structure a 25/5 study session for today.',
        'How can I fix my sleep routine before deadlines?',
      ]
    : [
        'I feel overwhelmed with upcoming exams.',
        'How can I fix my sleep routine this week?',
        'Guide me through a 2-minute breathing exercise.',
        'What is the Pomodoro study technique?',
      ]

  const handleSend = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim()
    if (!messageText || isTyping) return

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg: Message = { id: Date.now(), from: 'user', text: messageText, time: userTime }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    const isLocalCrisis = CRISIS_KEYWORDS.some((k) => messageText.toLowerCase().includes(k))
    if (isLocalCrisis) {
      setShowCrisisBanner(true)
    }

    const matchedResources = getResourcesForFactors([messageText], 1)
    const inlineRes = matchedResources.length > 0 ? matchedResources[0] : undefined

    const aiMsgId = Date.now() + 1
    const aiTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    // Progressive streaming bubble
    setMessages((prev) => [
      ...prev,
      {
        id: aiMsgId,
        from: 'ai',
        text: '',
        time: aiTime,
        isCrisis: isLocalCrisis,
        inlineResource: inlineRes,
      },
    ])

    try {
      const response = await fetch(`${API_BASE}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: messageText, clientContext: evalContext }),
      })

      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const data = await response.json()
        if (data.flaggedCrisis) {
          setShowCrisisBanner(true)
        }
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMsgId
              ? {
                  ...msg,
                  text: data.text || data.response || 'Please reach out to our emergency support.',
                  isCrisis: Boolean(data.flaggedCrisis),
                }
              : msg
          )
        )
        return
      }

      if (!response.body) throw new Error('Streaming not supported')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let accumulatedText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.chunk) {
              accumulatedText += data.chunk
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiMsgId ? { ...msg, text: accumulatedText } : msg
                )
              )
            }
            if (data.done) {
              if (data.suggestedVideo) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiMsgId ? { ...msg, suggestedVideo: data.suggestedVideo } : msg
                  )
                )
              }
            }
            if (data.error) {
              throw new Error(data.error)
            }
            if (data.flaggedCrisis) {
              setShowCrisisBanner(true)
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiMsgId
                    ? { ...msg, text: data.text, isCrisis: true }
                    : msg
                )
              )
            }
          } catch (jsonErr) {
            // ignore partial stream JSON parse errors
          }
        }
      }

      if (!accumulatedText.trim()) {
        try {
          const fallbackRes = await fetch(`${API_BASE}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ message: messageText, clientContext: evalContext }),
          })
          if (fallbackRes.ok) {
            const data = await fallbackRes.json()
            if (data.flaggedCrisis) setShowCrisisBanner(true)
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMsgId
                  ? {
                      ...msg,
                      text: data.text || data.response || 'I am here to support you.',
                      isCrisis: Boolean(data.flaggedCrisis),
                      suggestedVideo: data.suggestedVideo || undefined,
                    }
                  : msg
              )
            )
            return
          }
        } catch (e) {}
        throw new Error('No content received from AI stream')
      }
    } catch (err: any) {
      console.warn('Chat streaming error:', err)
      let fallbackText = isLocalCrisis
        ? "I hear how much pain you're in, and your safety is the #1 priority. Please connect with free, confidential 24/7 help right now: Call Tele-MANAS at 14416 or KIRAN at 1800-599-0019. You do not have to carry this alone. 💚"
        : "⚠️ Having trouble connecting to SAHARA AI right now (High traffic / Rate limit). Please wait a moment and try asking again, or try one of the guided wellbeing strategies below.";

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId && !msg.text
            ? { ...msg, text: fallbackText }
            : msg
        )
      )
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
        background: 'var(--color-background)',
        transition: 'background-color 0.25s ease',
      }}
    >
      {/* 1. Header & Honest Disclaimer */}
      <div
        style={{
          background: 'var(--color-surface)',
          borderBottom: '1.5px solid var(--color-border)',
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
              background: 'var(--color-primary)',
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
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                SAHARA AI Wellbeing Companion
              </h2>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 99,
                  background: 'var(--color-risk-low-bg)',
                  color: 'var(--color-risk-low)',
                  border: '1px solid var(--color-risk-low-border)',
                }}
              >
                Online 24/7
              </span>
              {evalContext && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 99,
                    background: 'var(--color-primary-subtle)',
                    color: 'var(--color-primary)',
                    border: '1px solid var(--color-border)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <Sparkles size={11} />
                  <span>Personalized Context Active</span>
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)' }}>
              Conversational support for study routines, stress, and sleep
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={handleClearChat}
            className="btn-outline"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 12px',
              fontSize: 12,
            }}
            title="Start a new conversation (clears history)"
          >
            <Trash2 size={13} />
            <span>New Chat</span>
          </button>

          <a
            href="tel:14416"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--color-risk-high-bg)',
              border: '1px solid var(--color-risk-high-border)',
              color: 'var(--color-risk-high-text)',
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
          background: 'var(--color-primary-subtle)',
          borderBottom: '1px solid var(--color-border-subtle)',
          padding: '8px 28px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 12.5,
          color: 'var(--color-primary)',
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
            background: 'var(--color-risk-high-bg)',
            borderBottom: '1.5px solid var(--color-risk-high-border)',
            padding: '12px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldAlert size={20} color="var(--color-risk-high)" />
            <div>
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--color-risk-high-text)' }}>
                Immediate Emotional Support Available
              </h4>
              <p style={{ margin: 0, fontSize: 12.5, color: 'var(--color-risk-high-text)', opacity: 0.9 }}>
                You are not alone. Free, confidential counselors are ready to speak with you right now at 14416.
              </p>
            </div>
          </div>
          <a
            href="tel:14416"
            style={{
              background: 'var(--color-risk-high)',
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
                    background: 'var(--color-primary)',
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
                  background: isUser ? 'var(--color-primary)' : m.isCrisis ? 'var(--color-risk-high-bg)' : 'var(--color-surface)',
                  color: isUser ? '#FFFFFF' : m.isCrisis ? 'var(--color-risk-high-text)' : 'var(--color-text-primary)',
                  border: isUser ? 'none' : m.isCrisis ? '1.5px solid var(--color-risk-high-border)' : '1.5px solid var(--color-border)',
                  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  padding: '14px 18px',
                  boxShadow: 'var(--shadow-sm)',
                  fontSize: 14.5,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {m.text ? (
                  <ChatMessageText text={m.text} />
                ) : (
                  <AnalyzingVisualization
                    size="sm"
                    statuses={[
                      'Synthesizing student context...',
                      'Weighing wellbeing factors...',
                      'Formulating calm guidance...',
                    ]}
                  />
                )}

                {/* Inline AI-Curated Real Video Card */}
                {!isUser && m.suggestedVideo && !m.isCrisis && (
                  <div
                    style={{
                      marginTop: 14,
                      background: 'var(--color-surface-raised)',
                      border: '1.5px solid var(--color-border)',
                      borderRadius: 12,
                      overflow: 'hidden',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <a
                      href={m.suggestedVideo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ position: 'relative', display: 'block', width: '100%', height: 130, overflow: 'hidden', background: '#000000' }}
                    >
                      <img
                        src={m.suggestedVideo.thumbnailUrl}
                        alt={m.suggestedVideo.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(0, 0, 0, 0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: 'rgba(1, 87, 94, 0.95)',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Play size={15} fill="#FFFFFF" style={{ marginLeft: 2 }} />
                        </div>
                      </div>
                    </a>

                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                          {m.suggestedVideo.channelTitle || 'YouTube Wellbeing'}
                        </span>
                        <span style={{ fontSize: 10.5, color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          <Video size={11} />
                          <span>Curated Video</span>
                        </span>
                      </div>

                      <h5 style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 6px', lineHeight: 1.35 }}>
                        {m.suggestedVideo.title}
                      </h5>

                      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '0 0 10px', lineHeight: 1.45 }}>
                        {m.suggestedVideo.reason || m.suggestedVideo.description}
                      </p>

                      <a
                        href={m.suggestedVideo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-teal"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          width: '100%',
                          padding: '7px 12px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 700,
                          textDecoration: 'none',
                        }}
                      >
                        <Play size={12} fill="#FFFFFF" />
                        <span>Watch on YouTube</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                )}

                <div
                  style={{
                    fontSize: 11,
                    color: isUser ? 'rgba(255,255,255,0.8)' : 'var(--color-text-muted)',
                    marginTop: 6,
                    textAlign: 'right',
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
                    background: 'var(--color-accent)',
                    color: '#FFFFFF',
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
                background: 'var(--color-primary)',
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
                background: 'var(--color-surface)',
                border: '1.5px solid var(--color-border)',
                borderRadius: '16px 16px 16px 4px',
                padding: '10px 16px',
                fontSize: 13.5,
                color: 'var(--color-text-muted)',
                fontStyle: 'italic',
              }}
            >
              SAHARA is typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Dynamic Suggested Prompt Chips */}
      <div
        style={{
          padding: '8px 28px',
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border-subtle)',
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        {dynamicPromptChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            style={{
              padding: '6px 14px',
              borderRadius: 99,
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface-raised)',
              color: 'var(--color-text-secondary)',
              fontSize: 12.5,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* 4. Message Input Bar */}
      <div
        style={{
          background: 'var(--color-surface)',
          borderTop: '1.5px solid var(--color-border)',
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
              border: '1.5px solid var(--color-border)',
              fontSize: 14.5,
              background: 'var(--color-surface-raised)',
              color: 'var(--color-text-primary)',
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

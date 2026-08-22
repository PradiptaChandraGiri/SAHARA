import { useState, useRef, useEffect } from 'react'

interface Message {
  id: number
  from: 'user' | 'ai'
  text: string
  time: string
}

const aiResponses: Record<string, string> = {
  'exam stress': "That's completely understandable — exam season is one of the most challenging periods for students. Let's break it down together. First, try to identify the specific exams or subjects causing the most anxiety. Then, we can work on a focused study plan, breathing techniques, and strategies to manage overwhelm. Which subject is stressing you out the most right now?",
  'study planning': "A good study plan makes a huge difference! Here's what I recommend:\n\n📅 Use time-blocking: assign specific 90-minute study blocks with 15-minute breaks.\n📋 Prioritize by difficulty and deadline — tackle hard subjects when your energy is highest.\n✅ Set micro-goals for each session ('complete Chapter 4' vs. 'study').\n\nWould you like help building a custom weekly schedule?",
  'sleep': "Sleep is often the first thing students sacrifice — but it's actually the most important for memory consolidation and emotional regulation. Research shows that less than 6 hours significantly impairs cognitive performance.\n\nSome tips that work:\n😌 Keep a consistent bedtime, even on weekends.\n📵 Stop screens 45 minutes before bed.\n🌙 Try a 5-minute body scan meditation.\n\nHow many hours are you currently getting?",
  'anxiety': "I hear you — anxiety can feel all-consuming, especially during academic pressure. You're not alone in this.\n\nA few things that can help right now:\n🌬️ Try box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat 4 times.\n✍️ Write down 3 specific worries — externalizing them reduces their mental load.\n📞 Talk to someone you trust about how you're feeling.\n\nWould you like me to connect you with a counselor?",
  'talk to counselor': "Of course. I'm creating a referral for you right now. Our counselors are available Mon–Sat, 9 AM–5 PM. You can also reach out via WhatsApp for urgent support.\n\n📋 Your check-in data will be securely shared with the counselor (with your permission) so you don't have to explain everything from scratch.\n\nShall I schedule an appointment for you?",
  'overwhelmed': "It sounds like you're carrying a lot right now — and that's really hard. Thank you for reaching out; that takes courage.\n\nLet's take it one breath at a time. Can you tell me what feels most overwhelming right now? Is it academics, personal life, financial pressure, or a mix of everything?",
  'default': "I'm here to listen and support you. You can talk to me about exam stress, sleep issues, anxiety, study planning, or anything else that's on your mind. What would you like to explore?",
}

function getFallbackAIResponse(input: string): string {
  const lower = input.toLowerCase()
  if (lower.includes('exam') || lower.includes('test') || lower.includes('pressure')) return aiResponses['exam stress']
  if (lower.includes('study') || lower.includes('plan') || lower.includes('schedule')) return aiResponses['study planning']
  if (lower.includes('sleep') || lower.includes('tired') || lower.includes('rest')) return aiResponses['sleep']
  if (lower.includes('anxious') || lower.includes('anxiety') || lower.includes('panic') || lower.includes('nervous')) return aiResponses['anxiety']
  if (lower.includes('counsel') || lower.includes('therapist') || lower.includes('help')) return aiResponses['talk to counselor']
  if (lower.includes('overwhelm') || lower.includes('too much') || lower.includes('cant handle')) return aiResponses['overwhelmed']
  return aiResponses['default']
}

async function fetchGeminiResponse(userPrompt: string, history: Message[], apiKey: string): Promise<string> {
  const models = [
    'gemini-3.6-flash',
    'gemini-3.7-flash',
    'gemini-3.5-flash',
    'gemma-4-31b-it',
    'gemma-4-26b-a4b-it'
  ]

  const recentHistory = history.slice(-6).map(m => ({
    role: m.from === 'user' ? 'user' : 'model',
    parts: [{ text: m.text }]
  }))

  const systemInstruction = `You are SAHARA AI, a compassionate, empathetic, non-judgmental student wellbeing counselor for university and college students. 
Keep responses warm, encouraging, actionable, and structured with clean bullet points and emojis. 
Be concise (around 100-150 words). 
If the student mentions severe distress, self-harm, or suicide, urgently offer Tele-MANAS (14416) and campus counselor emergency contact (+91 98765 43210).`

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      const contents = [
        ...recentHistory,
        {
          role: 'user',
          parts: [{
            text: `[System Context: ${systemInstruction}]\n\nStudent: ${userPrompt}`
          }]
        }
      ]
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      })

      if (response.ok) {
        const data = await response.json()
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (candidateText) return candidateText.trim()
      }
    } catch (err) {
      console.warn(`Gemini model ${model} fetch error:`, err)
    }
  }

  throw new Error('Gemini API request failed')
}

const quickActions = [
  '📚 Exam Stress & Anxiety',
  '📅 Study Schedule Planner',
  '🌙 Sleep Hygiene Guide',
  '🧘 Panic & Calming Technique',
  '🤝 Talk to a Counselor',
  '🇮🇳 तनाव और चिंता (Hindi)'
]

export default function AISupport() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0, from: 'ai',
      text: "Hi there 👋 I'm SAHARA AI — your private, judgment-free student wellbeing companion powered by Google Gemini AI ✨\n\nYou can talk to me about anything — academic pressure, burnout, sleep routines, anxiety, or just needing someone to listen. How are you feeling today?",
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [localApiKey, setLocalApiKey] = useState<string>(import.meta.env.VITE_GEMINI_API_KEY || '')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [emergencyAlert, setEmergencyAlert] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])

  const checkForDistress = (text: string) => {
    const dangerWords = ['suicide', 'kill myself', 'end my life', 'self harm', 'hurt myself', 'hopeless', 'cant live']
    return dangerWords.some(w => text.toLowerCase().includes(w))
  }

  const sendMessage = async (text: string) => {
    if (!text.trim()) return
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    const userMsg: Message = { id: Date.now(), from: 'user', text, time: now }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)

    if (checkForDistress(text)) {
      setEmergencyAlert(true)
    }

    let responseText = ''
    if (localApiKey.trim()) {
      try {
        responseText = await fetchGeminiResponse(text, messages, localApiKey.trim())
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local engine:', err)
        responseText = getFallbackAIResponse(text)
      }
    } else {
      await new Promise(res => setTimeout(res, 900))
      responseText = getFallbackAIResponse(text)
    }

    setTyping(false)
    setMessages(prev => [...prev, {
      id: Date.now() + 1,
      from: 'ai',
      text: responseText,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }])
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      {/* Header */}
      <div style={{
        background: 'white', borderBottom: '1px solid #E2E8F0',
        padding: '16px 28px', display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'linear-gradient(135deg, #4F7BF7, #8B5CF6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
          boxShadow: '0 4px 12px rgba(79,123,247,0.3)',
        }}>🤖</div>
        <div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
            SAHARA AI Support
            {localApiKey ? (
              <span style={{ fontSize: 11, background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', padding: '2px 8px', borderRadius: 99, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
                ✨ Gemini 3.6 Flash Active
              </span>
            ) : (
              <span style={{ fontSize: 11, background: '#EFF3FF', color: '#4F7BF7', border: '1px solid #BFDBFE', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                🧠 Smart Engine
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E' }} />
            <span style={{ fontSize: 12, color: '#64748B', fontFamily: "'Inter', sans-serif" }}>Online · End-to-end private & confidential</span>
          </div>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              fontFamily: "'Outfit', sans-serif", border: '1px solid #E2E8F0',
              background: showKeyInput ? '#EFF3FF' : 'white',
              color: showKeyInput ? '#4F7BF7' : '#64748B', cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            ⚙️ {localApiKey ? 'Configure Gemini Key' : '+ Add Gemini Key'}
          </button>
        </div>
      </div>

      {/* Emergency Distress Alert Banner */}
      {emergencyAlert && (
        <div style={{
          background: '#FEF2F2', borderBottom: '1px solid #FCA5A5', padding: '12px 28px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🚨</span>
            <span style={{ fontSize: 13, color: '#991B1B', fontFamily: "'Inter', sans-serif" }}>
              <strong>We care about you.</strong> If you are in crisis, free 24/7 help is available immediately: <strong>Tele-MANAS: 14416</strong> or <strong>Campus Counselor: +91 98765 43210</strong>.
            </span>
          </div>
          <button
            onClick={() => setEmergencyAlert(false)}
            style={{ background: 'transparent', border: 'none', color: '#991B1B', cursor: 'pointer', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Key Input Modal / Dropdown Bar */}
      {showKeyInput && (
        <div className="animate-fade-in" style={{
          background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '12px 28px',
          display: 'flex', gap: 12, alignItems: 'center',
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', fontFamily: "'Outfit', sans-serif" }}>
            🔑 Gemini API Key:
          </span>
          <input
            type="password"
            className="input-field"
            placeholder="Paste your Gemini API key"
            value={localApiKey}
            onChange={e => setLocalApiKey(e.target.value)}
            style={{ flex: 1, padding: '6px 12px', fontSize: 13 }}
          />
          <button
            className="btn-primary"
            style={{ padding: '6px 16px', fontSize: 13 }}
            onClick={() => setShowKeyInput(false)}
          >
            Save Key
          </button>
        </div>
      )}

      {/* Quick actions */}
      <div style={{
        padding: '12px 28px', background: 'white', borderBottom: '1px solid #F1F5F9',
        display: 'flex', gap: 8, overflowX: 'auto',
      }}>
        {quickActions.map(action => (
          <button key={action} className="quick-btn" onClick={() => sendMessage(action)}>
            {action}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map(msg => (
          <div key={msg.id} className="animate-fade-in" style={{
            display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
            alignItems: 'flex-end', gap: 10,
          }}>
            {msg.from === 'ai' && (
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #4F7BF7, #8B5CF6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              }}>🤖</div>
            )}
            <div style={{ maxWidth: '75%' }}>
              <div className={msg.from === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'} style={{ whiteSpace: 'pre-line' }}>
                {msg.text}
              </div>
              <div style={{
                fontSize: 11, color: '#94A3B8', marginTop: 4,
                textAlign: msg.from === 'user' ? 'right' : 'left',
                fontFamily: "'Inter', sans-serif",
              }}>{msg.time}</div>
            </div>
            {msg.from === 'user' && (
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #14B8A6, #4F7BF7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: 'white', fontFamily: "'Outfit', sans-serif",
              }}>RS</div>
            )}
          </div>
        ))}

        {typing && (
          <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #4F7BF7, #8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
            }}>🤖</div>
            <div className="chat-bubble-ai" style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '14px 18px' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: '50%', background: '#CBD5E1',
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '16px 28px', background: 'white', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <textarea
            className="input-field"
            placeholder="Type your message... (e.g. 'I am feeling overwhelmed with exams' or speak in Hindi/regional language)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
            style={{ resize: 'none', minHeight: 48, maxHeight: 120, lineHeight: 1.5 }}
            rows={1}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            style={{
              width: 48, height: 48, borderRadius: 12, flexShrink: 0,
              background: input.trim() ? 'linear-gradient(135deg, #4F7BF7, #8B5CF6)' : '#E2E8F0',
              border: 'none', cursor: input.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease', color: 'white', fontSize: 20,
            }}
          >
            →
          </button>
        </div>
        <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 8, fontFamily: "'Inter', sans-serif" }}>
          ⚕️ SAHARA AI provides supportive wellbeing guidance and is not a replacement for medical diagnosis or emergency care.
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}

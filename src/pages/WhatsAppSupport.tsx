import { useState, useRef, useEffect } from 'react'

interface Message {
  id: number
  from: 'user' | 'bot'
  text: string
  time: string
}

const waFlow17 = [
  { from: 'user', text: 'hi' },
  { from: 'bot', text: "🎉 *Welcome to SAHARA!*\n\nI'm here to understand how you're doing — your answers help us offer the right support.\n\nEverything you share is private & anonymous. No judgment, no grades — just care.\n\nReady to get started? Just reply with anything 👋" },
  { from: 'user', text: 'start' },
  { from: 'bot', text: "📝 *Step 1/17:* How old are you? (Just the number, e.g. 20)" },
  { from: 'user', text: '20' },
  { from: 'bot', text: "Got it! What's your gender?\n\n1️⃣ Female\n2️⃣ Male\n3️⃣ Non-binary\n4️⃣ Prefer not to say" },
  { from: 'user', text: '1' },
  { from: 'bot', text: "Which academic year are you in?\n\n1️⃣ 1st year\n2️⃣ 2nd year\n3️⃣ 3rd year\n4️⃣ 4th year" },
  { from: 'user', text: '3' },
  { from: 'bot', text: "📊 *Daily Lifestyle:*\n\nHow many hours of sleep do you usually get per night? (e.g. 4.5)" },
  { from: 'user', text: '4.5' },
  { from: 'bot', text: "How many hours per day do you study or attend classes? (e.g. 6)" },
  { from: 'user', text: '6' },
  { from: 'bot', text: "How many days per week do you do physical activity or exercise? (e.g. 1)" },
  { from: 'user', text: '1' },
  { from: 'bot', text: "How many hours per day on screens (phone, laptop)? (e.g. 9)" },
  { from: 'user', text: '9' },
  { from: 'bot', text: "How many hours per day on social media or browsing? (e.g. 5)" },
  { from: 'user', text: '5' },
  { from: 'bot', text: "💭 *Emotional Health:*\n\nOn a scale of 1-10, what's your stress level? (1=calm, 10=extremely stressed)" },
  { from: 'user', text: '8' },
  { from: 'bot', text: "On a scale of 1-10, how much pressure do you feel around exams and grades? (1=none, 10=extreme)" },
  { from: 'user', text: '9' },
  { from: 'bot', text: "On a scale of 1-10, how stressful is your financial situation? (1=no stress, 10=very stressful)" },
  { from: 'user', text: '7' },
  { from: 'bot', text: "On a scale of 1-10, how much pressure do you feel from family expectations?" },
  { from: 'user', text: '8' },
  { from: 'bot', text: "On a scale of 1-10, how supported do you feel by friends and family? (1=alone, 10=very supported)" },
  { from: 'user', text: '3' },
  { from: 'bot', text: "📈 What's your current academic performance score or GPA percentage? (e.g. 58)" },
  { from: 'user', text: '58' },
  { from: 'bot', text: "What was your entrance/admission grade? (Or 0 if unknown)" },
  { from: 'user', text: '105' },
  { from: 'bot', text: "How many course units did you pass in 1st semester? (e.g. 2)" },
  { from: 'user', text: '2' },
  { from: 'bot', text: "Last question! Is your tuition currently up to date?\n\n1️⃣ Yes\n2️⃣ No" },
  { from: 'user', text: '2' },
  {
    from: 'bot',
    text: "🎯 *SAHARA Wellbeing Assessment*\n━━━━━━━━━━━━━━━━━━━━\n📊 *Status:* 🔴 HIGH RISK (78% Risk Score)\n🧠 *Anxiety Index:* 7.8/10\n📉 *Dropout Risk:* 68%\n\n💬 *Personalized Insight:*\nElevated exam pressure, sleep deprivation (4.5h), and low social support detected.\n\n🔍 *Key Factors:*\n• High exam pressure\n• Low sleep (4.5h)\n• Low social support\n\n💡 *Action Steps:*\n• Use 45-min study sprints with zero-screen breaks.\n• Try NSDR deep rest 20 mins before bed.\n\n🎬 *Recommended YouTube Resources:*\n▶️ *Exam Panic Relief (4-7-8 Breathing)*\n🔗 https://youtu.be/1ZYbU82GVz4\n_Guided breathing for instant anxiety reset_\n\n▶️ *NSDR for Cognitive Recovery*\n🔗 https://youtu.be/pL02HRFk2vo\n_Restore mental stamina & improve focus_\n\n🚨 *Immediate 24/7 Support:*\n📞 *Tele-MANAS:* 14416 (Toll-Free)\n📞 *Campus Counselor:* +91 98765 43210\n\n_A counselor has been notified to support you._ 💚"
  }
]

const workflowSteps = [
  { icon: '📱', label: '1. WhatsApp Sandbox', desc: 'Student sends message or join code to WhatsApp number', color: '#25D366', bg: '#F0FDF4' },
  { icon: '⚡', label: '2. Twilio Webhook', desc: 'Twilio forwards HTTP POST payload to /whatsapp-webhook', color: '#4F7BF7', bg: '#EFF3FF' },
  { icon: '✨', label: '3. Gemini AI Engine', desc: 'Google Gemini 1.5 Flash provides empathetic dialogue & crisis triage', color: '#8B5CF6', bg: '#F5F3FF' },
  { icon: '📊', label: '4. SAHARA ML Risk Score', desc: 'Calculates Anxiety & Academic Dropout probability in real time', color: '#F59E0B', bg: '#FFFBEB' },
  { icon: '🚨', label: '5. Triage & Counselor Alert', desc: 'Sends instant WhatsApp advice + triggers live alert on Counselor Dashboard', color: '#14B8A6', bg: '#F0FDFA' },
]

async function callGeminiWhatsApp(userText: string, apiKey: string): Promise<string> {
  const models = [
    'gemini-3.6-flash',
    'gemini-3.7-flash',
    'gemini-3.5-flash',
    'gemma-4-31b-it'
  ]
  const systemInstruction = `You are SAHARA WhatsApp Bot, a warm, supportive, culturally sensitive student mental health companion for college and university students. 
Keep replies concise (under 120 words), format with bullet points and WhatsApp-style emojis, and speak empathetically.
Support English, Hindi, Hinglish, and other Indian languages if addressed in them.
If user expresses intense distress, include Tele-MANAS 14416 and Campus Counselor Helpline.`

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemInstruction}\n\nStudent WhatsApp message: ${userText}` }]
          }
        ]
      }
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        const data = await res.json()
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) return text.trim()
      }
    } catch (e) {
      console.warn('Gemini WhatsApp fetch error:', e)
    }
  }
  throw new Error('Gemini API call failed')
}

function getLocalWhatsAppFallback(text: string): string {
  const lower = text.toLowerCase()
  if (lower.includes('exam') || lower.includes('stress') || lower.includes('test')) {
    return "I completely understand exam anxiety. 📚\n\n• Break study into 45-min blocks\n• Try the 4-7-8 breathing exercise\n• Drink some water & take a 5-min walk\n\nReply *'checkin'* if you'd like to do a quick 17-question wellbeing assessment! 💚"
  }
  if (lower.includes('sleep') || lower.includes('tired') || lower.includes('insomnia')) {
    return "Sleep deprivation takes a huge toll on emotional energy. 🌙\n\n• Put screens away 30 min before bed\n• Avoid caffeine after 4 PM\n• Keep your room cool & dim\n\nHow many hours did you get last night?"
  }
  if (lower.includes('lonely') || lower.includes('sad') || lower.includes('alone') || lower.includes('homesick')) {
    return "Being in college can feel isolating, but you are never alone. 💚\n\n• Reach out to one friend or family member today\n• Visit the campus student lounge\n• Our counselors are always ready to chat at *+91 98765 43210*"
  }
  return "Thank you for reaching out to SAHARA on WhatsApp! 💬\n\nI'm your AI wellbeing companion. You can chat with me anytime, or reply with *'checkin'* to begin your 17-question student health screening."
}

export default function WhatsAppSupport() {
  const [activeTab, setActiveTab] = useState<'demo' | 'setup' | 'code'>('demo')
  const [simMode, setSimMode] = useState<'live' | 'guided'>('live')
  const [guidedCount, setGuidedCount] = useState(3)
  
  // Live Chat State
  const [liveMessages, setLiveMessages] = useState<Message[]>([
    {
      id: 1,
      from: 'bot',
      text: "🎉 *Welcome to SAHARA WhatsApp Bot!*\n\nPowered by *Google Gemini AI* ✨\n\nI'm here 24/7 to listen, support you with study stress, sleep, or mood, and connect you with campus resources.\n\nHow are you feeling today? You can type anything below 👋",
      time: '9:41 AM'
    }
  ])
  const [liveInput, setLiveInput] = useState('')
  const [botTyping, setBotTyping] = useState(false)
  const [apiKey, setApiKey] = useState<string>(import.meta.env.VITE_GEMINI_API_KEY || '')
  const [showKeyBar, setShowKeyBar] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [liveMessages, botTyping, guidedCount, simMode])

  const sendLiveMessage = async (textToSend: string) => {
    const clean = textToSend.trim()
    if (!clean) return

    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    const userMsg: Message = { id: Date.now(), from: 'user', text: clean, time: now }
    setLiveMessages(prev => [...prev, userMsg])
    setLiveInput('')
    setBotTyping(true)

    let reply = ''
    if (apiKey.trim()) {
      try {
        reply = await callGeminiWhatsApp(clean, apiKey.trim())
      } catch (err) {
        console.warn('Live WhatsApp Gemini error, fallback:', err)
        reply = getLocalWhatsAppFallback(clean)
      }
    } else {
      await new Promise(r => setTimeout(r, 900))
      reply = getLocalWhatsAppFallback(clean)
    }

    setBotTyping(false)
    setLiveMessages(prev => [
      ...prev,
      {
        id: Date.now() + 1,
        from: 'bot',
        text: reply,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      }
    ])
  }

  const quickPrompts = [
    '😰 Exam anxiety & panic',
    '🌙 Trouble sleeping lately',
    '🏠 Feeling lonely & homesick',
    '🇮🇳 बहुत तनाव में हूँ (Hindi)',
    '📋 Start 17-Q Check-in'
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '40px 60px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'linear-gradient(135deg, #25D366, #128C7E)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
              boxShadow: '0 6px 18px rgba(37,211,102,0.35)'
            }}>💬</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  WhatsApp Bot & Twilio Integration
                </h1>
                <span style={{
                  fontSize: 11, background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0',
                  padding: '3px 10px', borderRadius: 99, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
                  ✨ Gemini AI Enabled
                </span>
              </div>
              <p style={{ fontSize: 14, color: '#64748B', fontFamily: "'Inter', sans-serif", margin: '4px 0 0' }}>
                Zero-barrier empathetic mental health check-in & 17-question intake via WhatsApp + Gemini API.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a
              href="https://wa.me/14155238886?text=join%20no-different"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 18px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #25D366, #128C7E)',
                color: 'white',
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: 13,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 12px rgba(37,211,102,0.35)',
                transition: 'all 0.2s ease',
              }}
            >
              <span>📲 Open in WhatsApp</span>
            </a>

            <div style={{ display: 'flex', gap: 6, background: '#E2E8F0', padding: 4, borderRadius: 12 }}>
              <button
                onClick={() => setActiveTab('demo')}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 13,
                  background: activeTab === 'demo' ? 'white' : 'transparent',
                  color: activeTab === 'demo' ? '#0F172A' : '#64748B',
                  boxShadow: activeTab === 'demo' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >📱 Live Simulator</button>
              <button
                onClick={() => setActiveTab('setup')}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 13,
                  background: activeTab === 'setup' ? 'white' : 'transparent',
                  color: activeTab === 'setup' ? '#0F172A' : '#64748B',
                  boxShadow: activeTab === 'setup' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >🛠️ Deployment Guide</button>
              <button
                onClick={() => setActiveTab('code')}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 13,
                  background: activeTab === 'code' ? 'white' : 'transparent',
                  color: activeTab === 'code' ? '#0F172A' : '#64748B',
                  boxShadow: activeTab === 'code' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >💻 Backend Code</button>
            </div>
          </div>
        </div>

        {/* Gemini Key Config Banner */}
        <div style={{
          background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: '10px 20px',
          marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>🔑</span>
            <span style={{ fontSize: 13, color: '#334155', fontFamily: "'Inter', sans-serif" }}>
              <strong>Gemini API Status:</strong> {apiKey ? <span style={{ color: '#16A34A', fontWeight: 600 }}>Active (Key Loaded)</span> : <span style={{ color: '#F59E0B', fontWeight: 600 }}>Using Smart Engine Fallback</span>}
            </span>
          </div>
          <button
            onClick={() => setShowKeyBar(!showKeyBar)}
            style={{
              padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              fontFamily: "'Outfit', sans-serif", border: '1px solid #CBD5E1',
              background: showKeyBar ? '#EFF3FF' : '#F8FAFC',
              color: '#334155', cursor: 'pointer'
            }}
          >
            ⚙️ {showKeyBar ? 'Hide Key Config' : 'Configure Gemini Key'}
          </button>
        </div>

        {showKeyBar && (
          <div className="animate-fade-in card" style={{ padding: '14px 20px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', fontFamily: "'Outfit', sans-serif" }}>
              Gemini Key:
            </span>
            <input
              type="password"
              className="input-field"
              placeholder="Paste Google Gemini API Key"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              style={{ flex: 1, padding: '6px 12px', fontSize: 13 }}
            />
            <button
              className="btn-primary"
              style={{ padding: '6px 16px', fontSize: 13 }}
              onClick={() => setShowKeyBar(false)}
            >
              Save Key
            </button>
          </div>
        )}

        {/* DEMO TAB */}
        {activeTab === 'demo' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 420px', gap: 28 }} className="animate-fade-in">
            {/* Left Column: Interactive Mode Selection & Architecture */}
            <div>
              {/* Mode Switcher */}
              <div className="card" style={{ padding: 20, marginBottom: 20, background: 'linear-gradient(135deg, #F8FAFC, #EFF6FF)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#4F7BF7', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  Interactive Simulator Mode
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => setSimMode('live')}
                    style={{
                      flex: 1, padding: '12px 14px', borderRadius: 10,
                      border: simMode === 'live' ? '2px solid #25D366' : '1px solid #E2E8F0',
                      background: simMode === 'live' ? '#F0FDF4' : 'white',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 14, color: '#0F172A', fontFamily: "'Outfit', sans-serif" }}>
                      <span>💬 Live Gemini AI Chat</span>
                      {simMode === 'live' && <span style={{ fontSize: 10, background: '#25D366', color: 'white', padding: '1px 6px', borderRadius: 99 }}>LIVE</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', fontFamily: "'Inter', sans-serif", marginTop: 4 }}>
                      Type any message in the phone to test real-time Gemini AI counseling.
                    </div>
                  </button>

                  <button
                    onClick={() => setSimMode('guided')}
                    style={{
                      flex: 1, padding: '12px 14px', borderRadius: 10,
                      border: simMode === 'guided' ? '2px solid #4F7BF7' : '1px solid #E2E8F0',
                      background: simMode === 'guided' ? '#EFF3FF' : 'white',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 14, color: '#0F172A', fontFamily: "'Outfit', sans-serif" }}>
                      <span>📋 17-Question Intake Flow</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', fontFamily: "'Inter', sans-serif", marginTop: 4 }}>
                      Step-by-step clinical screening demo with automated risk triage.
                    </div>
                  </button>
                </div>
              </div>

              {/* Quick Prompts for Live Mode */}
              {simMode === 'live' && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 8, fontFamily: "'Outfit', sans-serif" }}>
                    ⚡ QUICK TEST PROMPTS (CLICK TO SEND TO GEMINI):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {quickPrompts.map((p, i) => (
                      <button
                        key={i}
                        className="quick-btn"
                        style={{ fontSize: 12, padding: '6px 12px' }}
                        onClick={() => sendLiveMessage(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Twilio & Gemini Features Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                {[
                  { icon: '✨', title: 'Gemini 1.5/2.0 Flash', desc: 'Real-time empathetic dialogue, multi-lingual support & sentiment analysis', color: '#F5F3FF' },
                  { icon: '⚡', title: 'Twilio WhatsApp API', desc: 'Plug-and-play sandbox webhook with zero software install required for students', color: '#EFF3FF' },
                  { icon: '🔒', title: 'Private & Anonymous', desc: 'Phone numbers salted & encrypted; confidential counseling triage', color: '#F0FDFA' },
                  { icon: '🚨', title: 'Auto Counselor Alert', desc: 'High-risk responses trigger automated alerts on the Counselor Dashboard', color: '#FFFBEB' },
                ].map((card, i) => (
                  <div key={i} className="card" style={{ padding: 16, background: card.color }}>
                    <div style={{ fontSize: 20, marginBottom: 6 }}>{card.icon}</div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>{card.title}</div>
                    <div style={{ fontSize: 12, color: '#64748B', fontFamily: "'Inter', sans-serif", lineHeight: 1.45 }}>{card.desc}</div>
                  </div>
                ))}
              </div>

              {/* Data Flow Diagram */}
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>
                  System Flow: WhatsApp ↔ Twilio ↔ Gemini AI ↔ Dashboard
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {workflowSteps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 8, background: step.bg,
                        border: `1.5px solid ${step.color}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
                      }}>{step.icon}</div>
                      <div>
                        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{step.label}</div>
                        <div style={{ fontSize: 11, color: '#64748B', fontFamily: "'Inter', sans-serif" }}>{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Realistic WhatsApp Phone Mockup */}
            <div>
              <div style={{
                background: '#0F172A', borderRadius: 44, padding: '14px 10px',
                boxShadow: '0 25px 65px rgba(0,0,0,0.4)',
                width: 380, margin: '0 auto',
                border: '4px solid #334155'
              }}>
                {/* Phone Speaker & Camera Notch */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <div style={{ width: 48, height: 4, background: '#334155', borderRadius: 99 }} />
                  <div style={{ width: 8, height: 8, background: '#1E293B', borderRadius: '50%' }} />
                </div>

                <div style={{ background: '#1E293B', borderRadius: 32, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 600 }}>
                  {/* Status Bar */}
                  <div style={{
                    padding: '8px 18px 4px', background: '#075E54',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>9:41</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontFamily: "'Inter', sans-serif" }}>📶 5G 🔋 98%</span>
                  </div>

                  {/* WhatsApp Chat Header */}
                  <div style={{
                    background: '#075E54', padding: '10px 14px 12px',
                    display: 'flex', alignItems: 'center', gap: 10,
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #25D366, #128C7E)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: 'white',
                      border: '2px solid white'
                    }}>S</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 6 }}>
                        SAHARA Bot
                        <span style={{ fontSize: 10, background: '#25D366', color: '#075E54', padding: '1px 5px', borderRadius: 4, fontWeight: 800 }}>AI</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontFamily: "'Inter', sans-serif" }}>
                        {botTyping ? 'typing...' : 'Twilio Sandbox · Online'}
                      </div>
                    </div>
                    <div style={{ color: 'white', fontSize: 16 }}>⋮</div>
                  </div>

                  {/* Chat Content Body */}
                  <div style={{
                    background: '#ECE5DD',
                    padding: '14px 10px',
                    flex: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}>
                    {/* Mode: LIVE GEMINI CHAT */}
                    {simMode === 'live' && (
                      <>
                        {liveMessages.map((msg) => (
                          <div key={msg.id} style={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start' }}>
                            <div style={{
                              maxWidth: '85%', padding: '8px 12px',
                              borderRadius: msg.from === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                              background: msg.from === 'user' ? '#DCF8C6' : 'white',
                              fontSize: 12, color: '#0F172A', fontFamily: "'Inter', sans-serif", lineHeight: 1.45,
                              boxShadow: '0 1px 2px rgba(0,0,0,0.1)', whiteSpace: 'pre-line',
                            }}>
                              {msg.text}
                              <div style={{ fontSize: 10, color: '#94A3B8', textAlign: 'right', marginTop: 4, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4 }}>
                                <span>{msg.time}</span>
                                {msg.from === 'user' && <span style={{ color: '#34B7F1' }}>✓✓</span>}
                              </div>
                            </div>
                          </div>
                        ))}

                        {botTyping && (
                          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                            <div style={{
                              padding: '8px 14px', borderRadius: '12px 12px 12px 2px',
                              background: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                              display: 'flex', gap: 4, alignItems: 'center'
                            }}>
                              <span style={{ fontSize: 11, color: '#64748B', fontFamily: "'Inter', sans-serif" }}>SAHARA is typing</span>
                              <div style={{ display: 'flex', gap: 3 }}>
                                {[0, 1, 2].map(i => (
                                  <div key={i} style={{
                                    width: 5, height: 5, borderRadius: '50%', background: '#25D366',
                                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
                                  }} />
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Mode: GUIDED 17-STEP DEMO */}
                    {simMode === 'guided' && (
                      <>
                        {waFlow17.slice(0, guidedCount).map((msg, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start' }}>
                            <div style={{
                              maxWidth: '85%', padding: '8px 12px',
                              borderRadius: msg.from === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                              background: msg.from === 'user' ? '#DCF8C6' : 'white',
                              fontSize: 12, color: '#0F172A', fontFamily: "'Inter', sans-serif", lineHeight: 1.45,
                              boxShadow: '0 1px 2px rgba(0,0,0,0.1)', whiteSpace: 'pre-line',
                            }}>
                              {msg.text}
                              <div style={{ fontSize: 10, color: '#94A3B8', textAlign: 'right', marginTop: 4, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4 }}>
                                <span>{9 + Math.floor(i / 4)}:{(i * 7 + 12) % 60 < 10 ? '0' : ''}{(i * 7 + 12) % 60} AM</span>
                                {msg.from === 'user' && <span style={{ color: '#34B7F1' }}>✓✓</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    <div ref={chatEndRef} />
                  </div>

                  {/* Input Bar */}
                  {simMode === 'live' ? (
                    <div style={{
                      background: '#F0F0F0', padding: '8px 10px',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <input
                        type="text"
                        placeholder="Type a WhatsApp message..."
                        value={liveInput}
                        onChange={e => setLiveInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') sendLiveMessage(liveInput) }}
                        style={{
                          flex: 1, background: 'white', borderRadius: 24, border: 'none',
                          padding: '8px 14px', fontSize: 12, color: '#0F172A',
                          fontFamily: "'Inter', sans-serif", outline: 'none'
                        }}
                      />
                      <button
                        onClick={() => sendLiveMessage(liveInput)}
                        disabled={!liveInput.trim() || botTyping}
                        style={{
                          width: 34, height: 34, borderRadius: '50%', border: 'none',
                          background: liveInput.trim() ? '#25D366' : '#94A3B8',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, color: 'white', flexShrink: 0, cursor: liveInput.trim() ? 'pointer' : 'default'
                        }}
                      >
                        ➤
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      background: '#F0F0F0', padding: '8px 10px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <button
                        className="btn-primary"
                        style={{ padding: '6px 12px', fontSize: 11, background: '#25D366' }}
                        onClick={() => setGuidedCount(v => Math.min(v + 4, waFlow17.length))}
                        disabled={guidedCount >= waFlow17.length}
                      >
                        ▶ Next Step ({guidedCount}/{waFlow17.length})
                      </button>
                      <button
                        className="btn-ghost"
                        style={{ padding: '6px 10px', fontSize: 11 }}
                        onClick={() => setGuidedCount(waFlow17.length)}
                      >
                        ⚡ End
                      </button>
                      <button
                        className="btn-secondary"
                        style={{ padding: '6px 10px', fontSize: 11 }}
                        onClick={() => setGuidedCount(3)}
                      >
                        ↺ Reset
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SETUP TAB */}
        {activeTab === 'setup' && (
          <div className="animate-fade-in card" style={{ padding: 32 }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
              🚀 Deploy Backend FREE on Render.com — No Tunnels Needed
            </h2>
            <p style={{ fontSize: 13, color: '#64748B', fontFamily: "'Inter', sans-serif", marginBottom: 24 }}>
              Render gives your backend a permanent public URL — Twilio calls it directly. No ngrok, no tunnels, works 24/7.
            </p>

            {/* Render Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
              {[
                { step: '1', title: 'Push code to GitHub', color: '#0F172A', bg: '#F8FAFC',
                  desc: 'Go to github.com → New repository → name it sahara-backend → push your project files (main.py, whatsapp_chatbot.py, requirements.txt, .env)' },
                { step: '2', title: 'Deploy on render.com', color: '#4F7BF7', bg: '#EFF3FF',
                  desc: 'Go to render.com → Sign up free → Click "New +" → "Web Service" → Connect GitHub → Select your sahara-backend repo' },
                { step: '3', title: 'Set build & start commands', color: '#8B5CF6', bg: '#F5F3FF',
                  desc: 'Build Command: pip install -r requirements.txt | Start Command: python -m uvicorn main:app --host 0.0.0.0 --port 8000' },
                { step: '4', title: 'Add environment variables', color: '#F59E0B', bg: '#FFFBEB',
                  desc: 'In Render dashboard → Environment tab → Add: GEMINI_API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886' },
                { step: '5', title: 'Copy your Render URL → Paste into Twilio', color: '#25D366', bg: '#F0FDF4',
                  desc: 'After deploy, copy URL like https://sahara-backend.onrender.com → Go to Twilio Console → Messaging → Sandbox settings → paste https://sahara-backend.onrender.com/whatsapp-webhook → Save' },
                { step: '6', title: 'Send "hi" from WhatsApp!', color: '#14B8A6', bg: '#F0FDFA',
                  desc: 'Open WhatsApp → Message your Twilio sandbox number (+14155238886) → Send: hi → SAHARA bot replies with Gemini AI response! Demo is LIVE!' },
              ].map((s) => (
                <div key={s.step} style={{ display: 'flex', gap: 14, padding: 16, background: s.bg, borderRadius: 12, border: `1px solid ${s.color}30` }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: s.color, color: 'white', fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.step}</div>
                  <div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: '#64748B', fontFamily: "'Inter', sans-serif", lineHeight: 1.55 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>
              🔑 Environment Variables to add in Render Dashboard
            </h3>
            <pre style={{
              background: '#0F172A', color: '#38BDF8', padding: 18, borderRadius: 12,
              fontSize: 13, fontFamily: 'monospace', overflowX: 'auto', marginBottom: 20
            }}>
{`GEMINI_API_KEY=your_gemini_api_key_here
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
SAHARA_BACKEND_URL=https://sahara-backend.onrender.com`}
            </pre>

            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20 }}>💡</span>
              <div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: '#15803D', marginBottom: 4 }}>Your Twilio sandbox is already configured!</div>
                <div style={{ fontSize: 12, color: '#166534', fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>
                  Phone <strong>+918763541464</strong> is connected to sandbox <strong>+14155238886</strong> with code <strong>join no-different</strong>. Once you deploy to Render and paste the webhook URL in Twilio, your bot is live instantly!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CODE TAB */}
        {activeTab === 'code' && (
          <div className="animate-fade-in card" style={{ padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700, color: '#0F172A' }}>
                🐍 Backend Scripts (Gemini 3.6 Flash + Twilio)
              </h2>
              <span style={{ fontSize: 12, color: '#16A34A', background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '4px 12px', borderRadius: 6, fontWeight: 600 }}>
                ✓ Ready in Project Root
              </span>
            </div>
            <p style={{ fontSize: 14, color: '#64748B', fontFamily: "'Inter', sans-serif", marginBottom: 16 }}>
              Two files are ready to deploy: <code>main.py</code> (FastAPI entry point) and <code>whatsapp_chatbot.py</code> (Twilio + Gemini logic).
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {[
                { file: 'main.py', desc: 'FastAPI app with /health, /assess and WhatsApp route registration', color: '#4F7BF7' },
                { file: 'whatsapp_chatbot.py', desc: 'Twilio webhook, 17-Q intake flow, Gemini 3.6 Flash AI counseling', color: '#25D366' },
                { file: 'requirements.txt', desc: 'fastapi, uvicorn, twilio, httpx, python-dotenv, pydantic', color: '#8B5CF6' },
                { file: '.env', desc: 'All credentials: Gemini API Key, Twilio SID, Auth Token, phone numbers', color: '#F59E0B' },
              ].map((f) => (
                <div key={f.file} style={{ padding: 14, background: '#F8FAFC', borderRadius: 10, border: `1.5px solid ${f.color}40` }}>
                  <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: f.color, marginBottom: 4 }}>{f.file}</div>
                  <div style={{ fontSize: 11, color: '#64748B', fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              ))}
            </div>

            <pre style={{
              background: '#0F172A', color: '#E2E8F0', padding: 20, borderRadius: 12,
              fontSize: 12, fontFamily: 'monospace', overflowX: 'auto', maxHeight: 380,
            }}>
{`# whatsapp_chatbot.py — Key Function
async def generate_gemini_response(user_text, context=None):
    models = ["gemini-3.6-flash", "gemini-3.7-flash", "gemini-3.5-flash"]
    for model in models:
        endpoint = (
            f"https://generativelanguage.googleapis.com/v1beta/"
            f"models/{model}:generateContent?key={GEMINI_API_KEY}"
        )
        resp = await client.post(endpoint, json=payload)
        if resp.status_code == 200:
            return resp.json()["candidates"][0]["content"]["parts"][0]["text"]

# main.py — Start Command for Render
# python -m uvicorn main:app --host 0.0.0.0 --port 8000`}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

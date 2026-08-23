import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ShieldAlert, Sparkles, PhoneCall, AlertCircle } from 'lucide-react';

interface Message {
  id: number;
  from: 'user' | 'ai';
  text: string;
  time: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'https://sahara-951p.onrender.com';

const fallbackResponses: Record<string, string> = {
  exam: "Exam preparation can be stressful, but breaking it down into 25-minute Pomodoro study blocks with 5-minute screen-free breaks makes a massive difference. Which specific subject feels most urgent right now?",
  sleep: "Sleep directly drives cognitive memory consolidation. Try establishing a 15-minute wind-down routine without phones or laptops before sleeping.",
  anxiety: "I hear you — anxiety during college is common, but manageable. Try this quick 4-7-8 breathing exercise: inhale quietly for 4 seconds, hold for 7 seconds, and exhale completely for 8 seconds.",
  default: "I am here to support you with exam stress, study planning, sleep routines, and emotional wellbeing. How can I help you right now?"
};

function getLocalFallback(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('exam') || lower.includes('grade') || lower.includes('test')) return fallbackResponses.exam;
  if (lower.includes('sleep') || lower.includes('tired') || lower.includes('insomnia')) return fallbackResponses.sleep;
  if (lower.includes('anxious') || lower.includes('panic') || lower.includes('stress')) return fallbackResponses.anxiety;
  return fallbackResponses.default;
}

const crisisKeywords = ['suicide', 'kill myself', 'end my life', 'self harm', 'hurt myself', 'die', 'hopeless'];

export default function AISupport() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      from: 'ai',
      text: "Hello! I am SAHARA — your AI Student Wellbeing Companion. I'm here 24/7 to help you navigate academic pressure, sleep, focus, and emotional balance. What is on your mind today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || isTyping) return;

    const isDistress = crisisKeywords.some(k => messageText.toLowerCase().includes(k));
    if (isDistress) {
      setShowCrisisAlert(true);
    }

    const userMsg: Message = {
      id: Date.now(),
      from: 'user',
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const historyPayload = messages.map(m => ({
        role: m.from === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await fetch(`${API_BASE}/ai-support/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          conversation_history: historyPayload
        })
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: Message = {
          id: Date.now() + 1,
          from: 'ai',
          text: data.response || getLocalFallback(messageText),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        const aiMsg: Message = {
          id: Date.now() + 1,
          from: 'ai',
          text: getLocalFallback(messageText),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (err) {
      const aiMsg: Message = {
        id: Date.now() + 1,
        from: 'ai',
        text: getLocalFallback(messageText),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickPrompts = [
    "I'm feeling overwhelmed with upcoming exams",
    "How can I fix my irregular sleep schedule?",
    "Tips for managing study anxiety and panic",
    "How to structure a daily study routine"
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 flex flex-col items-center">
      <div className="max-w-3xl w-full flex flex-col h-[calc(100vh-100px)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                SAHARA AI Wellbeing Companion
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                  Active
                </span>
              </h1>
              <p className="text-xs text-slate-400">Empathetic, confidential academic & mental health guidance</p>
            </div>
          </div>
        </div>

        {/* Emergency Banner */}
        {showCrisisAlert && (
          <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3 shrink-0">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-200">
              <p className="font-semibold text-rose-300">Immediate Support Available 24/7</p>
              <p className="mt-1">
                If you are in distress or need urgent human support, please contact the National Tele-MANAS helpline at{' '}
                <strong className="text-white">14416</strong> (Toll-Free, Govt. of India) or reach out to your campus counselor.
              </p>
            </div>
          </div>
        )}

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${m.from === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                  m.from === 'user'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-800 border border-slate-700 text-indigo-400'
                }`}
              >
                {m.from === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-xl rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  m.from === 'user'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800/90 border border-slate-700 text-slate-200 shadow-sm'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>
                <div
                  className={`text-[10px] mt-1.5 ${
                    m.from === 'user' ? 'text-indigo-200 text-right' : 'text-slate-500'
                  }`}
                >
                  {m.time}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-indigo-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-800/90 border border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length <= 2 && (
          <div className="flex flex-wrap gap-2 mb-3 shrink-0">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p)}
                className="px-3 py-1.5 bg-slate-800/70 hover:bg-slate-700 border border-slate-700/80 rounded-xl text-[11px] text-slate-300 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Chat Input */}
        <div className="relative shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Share how you're feeling or ask for study tips..."
            className="w-full bg-slate-800/90 border border-slate-700 rounded-2xl py-3 pl-4 pr-12 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-xl"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition-all"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

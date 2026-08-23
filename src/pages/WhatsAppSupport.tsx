import React, { useState } from 'react';
import {
  MessageCircle,
  ExternalLink,
  Bot,
  Send,
  CheckCircle,
  Phone,
  Shield,
  Layers,
  ArrowRight,
  Code
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://sahara-951p.onrender.com';

export default function WhatsAppSupport() {
  const [chatMessages, setChatMessages] = useState<Array<{ from: 'user' | 'bot'; text: string }>>([
    {
      from: 'bot',
      text: "👋 *SAHARA WhatsApp Wellbeing Assistant*\n\nSend *'join no-different'* on WhatsApp to connect directly to our live Twilio Sandbox, or chat below to test our Gemini counseling model!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userText = input.trim();
    setInput('');
    setChatMessages(prev => [...prev, { from: 'user', text: userText }]);
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE}/ai-support/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          conversation_history: chatMessages.map(m => ({
            role: m.from === 'user' ? 'user' : 'assistant',
            content: m.text
          }))
        })
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { from: 'bot', text: data.response }]);
      } else {
        setChatMessages(prev => [
          ...prev,
          { from: 'bot', text: "Thank you for reaching out! Reply *'checkin'* on WhatsApp to start your 17-question screening." }
        ]);
      }
    } catch {
      setChatMessages(prev => [
        ...prev,
        { from: 'bot', text: "I'm here to support you. You can try our 5-minute breathing exercise or connect with Tele-MANAS at 14416." }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const steps = [
    {
      step: '1',
      title: 'Join Sandbox',
      desc: 'Send "join no-different" to +1 415 523 8886 on WhatsApp to activate session.',
      icon: <Phone className="w-4 h-4 text-emerald-400" />
    },
    {
      step: '2',
      title: 'Interactive Intake',
      desc: 'Answer 17 quick questions with tap-to-select list pickers & buttons.',
      icon: <Layers className="w-4 h-4 text-indigo-400" />
    },
    {
      step: '3',
      title: 'Instant Triage & Video Links',
      desc: 'Receive AI risk index, YouTube study strategies, and 24/7 crisis numbers.',
      icon: <CheckCircle className="w-4 h-4 text-purple-400" />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-white">SAHARA WhatsApp Wellbeing Bot</h1>
          </div>
          <p className="text-xs text-slate-400">
            24/7 Twilio WhatsApp integration powered by dual Random Forest ML + Google Gemini AI
          </p>
        </div>

        <a
          href="https://wa.me/14155238886?text=join%20no-different"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all self-start"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Launch WhatsApp on Your Phone</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Live Integration Guide & Architecture */}
        <div className="space-y-6">
          {/* How to Connect Card */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              Live Deployment Configuration
            </h2>

            <div className="space-y-3 mb-6">
              {steps.map((s, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-slate-900/60 border border-slate-700/60 rounded-xl">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{s.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <p className="text-xs font-semibold text-emerald-300 mb-1">Twilio Sandbox Details:</p>
              <p className="text-xs text-slate-300 font-mono">WhatsApp Number: +1 415 523 8886</p>
              <p className="text-xs text-slate-300 font-mono">Join Code: join no-different</p>
              <p className="text-[11px] text-slate-400 mt-2">
                Webhook endpoint: <code className="text-emerald-400">POST /whatsapp-webhook</code>
              </p>
            </div>
          </div>

          {/* Curated YouTube Resources Preview */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Post-Assessment YouTube Search Guides
            </h2>
            <div className="space-y-2 text-xs">
              <a
                href="https://www.youtube.com/results?search_query=pomodoro+technique+study+method"
                target="_blank"
                rel="noreferrer"
                className="block p-2.5 bg-slate-900/60 hover:bg-slate-700/60 border border-slate-700/60 rounded-xl text-indigo-300 transition-colors"
              >
                ▶️ Pomodoro Study Method Search Guide
              </a>
              <a
                href="https://www.youtube.com/results?search_query=5+minute+breathing+exercise+for+stress"
                target="_blank"
                rel="noreferrer"
                className="block p-2.5 bg-slate-900/60 hover:bg-slate-700/60 border border-slate-700/60 rounded-xl text-indigo-300 transition-colors"
              >
                ▶️ 5-Minute Breathing & Anxiety Relief Search Guide
              </a>
              <a
                href="https://www.youtube.com/results?search_query=10+minute+evening+stretch+routine"
                target="_blank"
                rel="noreferrer"
                className="block p-2.5 bg-slate-900/60 hover:bg-slate-700/60 border border-slate-700/60 rounded-xl text-indigo-300 transition-colors"
              >
                ▶️ 10-Minute Evening Wind-Down Routine
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: In-Browser Live Assistant Tester */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-col h-[560px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700 shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">Live Webhook Simulator</span>
            </div>
            <span className="text-[10px] text-slate-400">Twilio Webhook Emulation</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-3">
            {chatMessages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs rounded-2xl p-3 text-xs leading-relaxed ${
                    m.from === 'user'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900/90 border border-slate-700 text-slate-200'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-3 text-xs text-slate-400">
                  Bot is typing...
                </div>
              </div>
            )}
          </div>

          <div className="relative shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type message or 'checkin'..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-3 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import type { Page } from '../App';
import {
  Shield,
  Activity,
  MessageCircle,
  Brain,
  ArrowRight,
  CheckCircle,
  Users,
  Lock,
  PhoneCall
} from 'lucide-react';

interface HomeProps {
  onNavigate: (page: Page) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const capabilities = [
    {
      icon: <Brain className="w-6 h-6 text-indigo-400" />,
      title: 'Dual-Lens Risk Inference',
      desc: 'Combines Random Forest Anxiety continuous regression with Academic Dropout Risk classification to identify distress early.',
    },
    {
      icon: <MessageCircle className="w-6 h-6 text-emerald-400" />,
      title: 'Zero-Barrier WhatsApp Intake',
      desc: '24/7 Twilio WhatsApp Sandbox integration featuring interactive list pickers and Google Gemini conversational triage.',
    },
    {
      icon: <Shield className="w-6 h-6 text-purple-400" />,
      title: 'Confidential Triage & Anonymization',
      desc: 'SHA-256 student ID hashing protects confidentiality while notifying campus counselors of priority cases.',
    },
  ];

  const workflow = [
    { title: '1. Multi-Channel Check-in', desc: 'Student checks in via Web Slider or WhatsApp Bot.' },
    { title: '2. Dual ML Inference', desc: 'Evaluates anxiety index (0-10) and dropout probability (0-100%).' },
    { title: '3. Automated Triage', desc: 'Delivers tier-specific study tips, breathing exercises, and video search guides.' },
    { title: '4. Counselor Escalation', desc: 'High-risk cases trigger priority alerts on the Institutional Dashboard.' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 px-6 py-20 lg:px-12 border-b border-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6">
            <Shield className="w-3.5 h-3.5" />
            <span>Institutional Early-Warning & Wellbeing Platform</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
            Proactive Student Wellbeing & Attrition Prevention Powered by AI
          </h1>

          <p className="text-base md:text-lg text-slate-300 max-w-3xl leading-relaxed mb-8">
            SAHARA combines multi-modal psychological lifestyle modeling with academic progression analytics to detect student distress early and deliver timely, compassionate intervention.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigate('checkin')}
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all"
            >
              <span>Take 2-Minute Wellbeing Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('whatsapp')}
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 font-semibold text-sm rounded-xl shadow-md flex items-center gap-2 transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Connect via WhatsApp</span>
            </button>

            <button
              onClick={() => onNavigate('counselor')}
              className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold text-sm rounded-xl transition-all"
            >
              <span>Counselor Dashboard</span>
            </button>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="px-6 py-16 lg:px-12 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white tracking-tight">Core System Architecture</h2>
          <p className="text-xs text-slate-400 mt-2">Engineered for accuracy, accessibility, and student privacy</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {capabilities.map((c, i) => (
            <div key={i} className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 flex items-center justify-center mb-4">
                  {c.icon}
                </div>
                <h3 className="text-base font-bold text-white mb-2">{c.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4-Step Institutional Workflow */}
      <section className="px-6 py-16 lg:px-12 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white tracking-tight">How SAHARA Protects Students</h2>
            <p className="text-xs text-slate-400 mt-2">End-to-end early warning and care continuum</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {workflow.map((w, idx) => (
              <div key={idx} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                <p className="text-xs font-bold text-indigo-400 mb-1">{w.title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 24/7 Helpline Footer Banner */}
      <section className="px-6 py-12 max-w-5xl mx-auto border-t border-slate-800">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <PhoneCall className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Emergency National Support Helplines</p>
              <p className="text-[11px] text-slate-400">
                National Tele-MANAS: <strong className="text-indigo-300">14416</strong> (24/7 Toll-Free) | iCall: <strong className="text-indigo-300">9152987821</strong>
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('checkin')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium shrink-0"
          >
            Start Check-in
          </button>
        </div>
      </section>
    </div>
  );
}

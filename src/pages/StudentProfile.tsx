import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Page } from '../App';
import {
  ArrowLeft,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Activity,
  TrendingDown,
  Clock,
  Send,
  MessageSquare,
  FileText,
  User
} from 'lucide-react';

interface StudentProfileProps {
  studentId: string;
  onNavigate: (page: Page) => void;
  studentStatuses: Record<string, string>;
  onUpdateStatus: (id: string, status: string) => void;
}

const API_BASE = import.meta.env.VITE_API_URL || 'https://sahara-951p.onrender.com';

export default function StudentProfile({ studentId, onNavigate, onUpdateStatus }: StudentProfileProps) {
  const { token } = useAuth();
  const [assessment, setAssessment] = useState<any>(null);
  const [status, setStatus] = useState<'New' | 'In progress' | 'Contacted'>('New');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssessment = async () => {
      if (!studentId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE}/assessments/${studentId}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setAssessment(data);
          setStatus(data.status || 'New');
          setNotes(data.notes || '');
        }
      } catch (err) {
        console.warn('Error fetching single assessment:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessment();
  }, [studentId, token]);

  const handleSaveStatus = async (newStatus: 'New' | 'In progress' | 'Contacted') => {
    setIsSaving(true);
    setStatus(newStatus);
    onUpdateStatus(studentId, newStatus);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`${API_BASE}/assessments/${studentId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus, notes }),
      });
    } catch (err) {
      console.warn('Error updating status:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <p className="text-slate-400">Loading student assessment profile...</p>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
        <button
          onClick={() => onNavigate('counselor')}
          className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-xs font-medium mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Counselor Dashboard
        </button>
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-8 text-center max-w-lg mx-auto">
          <User className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-1">No Case Selected</h2>
          <p className="text-slate-400 text-xs mb-4">
            Select an assessment record from the Counselor Dashboard to review full student indicators.
          </p>
          <button
            onClick={() => onNavigate('counselor')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium"
          >
            Go to Counselor Dashboard
          </button>
        </div>
      </div>
    );
  }

  const tier = assessment.risk_tier || 'Low';
  const tierColor =
    tier === 'High' ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
    : tier === 'Medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      {/* Back Button */}
      <button
        onClick={() => onNavigate('counselor')}
        className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-xs font-medium mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Counselor Dashboard
      </button>

      {/* Case Header */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 mb-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg font-mono">
            {assessment.student_id ? assessment.student_id.slice(-4) : 'ID'}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white font-mono">{assessment.student_id || 'STU-ANON'}</h1>
              <span className={`px-3 py-0.5 rounded-full text-xs font-semibold border ${tierColor}`}>
                {tier} Risk
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              Assessed: {new Date(assessment.timestamp).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Status Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleSaveStatus('New')}
            disabled={isSaving}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              status === 'New'
                ? 'bg-slate-700 text-white border border-slate-600'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            New
          </button>
          <button
            onClick={() => handleSaveStatus('In progress')}
            disabled={isSaving}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              status === 'In progress'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => handleSaveStatus('Contacted')}
            disabled={isSaving}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              status === 'Contacted'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 inline mr-1" /> Contacted
          </button>
          <button
            onClick={() => handleSaveStatus('Referred to clinical services')}
            disabled={isSaving}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              status === 'Referred to clinical services'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            Clinical Referral
          </button>
          <button
            onClick={() => handleSaveStatus('Resolved')}
            disabled={isSaving}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              status === 'Resolved'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Anxiety Index</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-bold text-white">
            {assessment.anxiety_score !== null ? `${assessment.anxiety_score}/10` : '—'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Random Forest Continuous Regression</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dropout Risk</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-3xl font-bold text-white">
            {assessment.dropout_probability !== null ? `${Math.round(assessment.dropout_probability * 100)}%` : '—'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Academic Attrition Classifier</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Composite Score</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-white">
            {assessment.combined_score !== null ? `${(assessment.combined_score * 100).toFixed(1)}%` : '—'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Harmonized 50/50 Dual-Lens Fusion</p>
        </div>
      </div>

      {/* Top Factors & Counselor Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Drivers */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
            AI Contributing Risk Factors (Explainability)
          </h2>
          <div className="space-y-3">
            {(assessment.top_factors || []).length === 0 ? (
              <p className="text-xs text-slate-400">No elevated risk factors detected.</p>
            ) : (
              (assessment.top_factors || []).map((factor: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-slate-900/60 border border-slate-700/60 rounded-xl text-xs text-slate-200"
                >
                  <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0"></div>
                  <span>{factor}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Counselor Notes */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Counselor Case Notes
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add confidential notes on student consultation, outreach, or academic accommodations..."
              rows={5}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => handleSaveStatus(status)}
              disabled={isSaving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-medium transition-all"
            >
              {isSaving ? 'Saving Notes...' : 'Save Case Notes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

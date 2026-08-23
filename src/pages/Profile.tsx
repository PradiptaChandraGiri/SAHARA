import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Page } from '../App';
import {
  User,
  Activity,
  Calendar,
  Shield,
  ArrowRight,
  TrendingDown,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

interface ProfileProps {
  onNavigate: (page: Page) => void;
}

const API_BASE = import.meta.env.VITE_API_URL || 'https://sahara-951p.onrender.com';

export default function Profile({ onNavigate }: ProfileProps) {
  const { user, token } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const url = user?.id
          ? `${API_BASE}/assessments?student_id=${user.id}`
          : `${API_BASE}/assessments?limit=10`;

        const res = await fetch(url, { headers });
        if (res.ok) {
          const data = await res.json();
          setHistory(data.assessments || []);
        }
      } catch (err) {
        console.warn('Error fetching profile check-in history:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user, token]);

  const latest = history[0];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      {/* Header Profile Info */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 mb-8 shadow-xl flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xl font-bold text-indigo-300 font-mono">
            {user ? user.name.slice(0, 2).toUpperCase() : 'ST'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{user?.name || 'Student Account'}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email || 'Anonymous Session'}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
              <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full text-[11px] font-semibold uppercase">
                {user?.role || 'Student'}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" /> Privacy Protected
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('checkin')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition-all shadow-lg flex items-center gap-1.5"
        >
          <span>Take New Assessment</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Latest Metrics Overview */}
      {latest && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Latest Wellbeing Tier</span>
            <p className="text-2xl font-bold text-white mt-1">{latest.risk_tier || 'Low'}</p>
            <p className="text-[11px] text-slate-400 mt-1">From check-in on {new Date(latest.timestamp).toLocaleDateString()}</p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Anxiety Index</span>
            <p className="text-2xl font-bold text-indigo-400 mt-1">{latest.anxiety_score !== null ? `${latest.anxiety_score}/10` : '—'}</p>
            <p className="text-[11px] text-slate-400 mt-1">Lifestyle & psychological scale</p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Academic Retention Score</span>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              {latest.dropout_probability !== null ? `${Math.round((1 - latest.dropout_probability) * 100)}%` : '—'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Progression confidence</p>
          </div>
        </div>
      )}

      {/* Historical Check-in Logs */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          Past Check-in History
        </h2>

        {isLoading ? (
          <p className="text-xs text-slate-400 py-6 text-center">Loading check-in records...</p>
        ) : history.length === 0 ? (
          <div className="text-center py-10">
            <Activity className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-300">No past check-ins recorded yet.</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Complete your first 2-minute assessment to unlock personalized wellbeing tracking.
            </p>
            <button
              onClick={() => onNavigate('checkin')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition-all"
            >
              Start First Check-in
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-700/60">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Wellbeing Tier</th>
                  <th className="py-3 px-4">Anxiety Index</th>
                  <th className="py-3 px-4">Dropout Risk</th>
                  <th className="py-3 px-4">Contributing Factors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40 text-slate-300">
                {history.map((row, i) => {
                  const tier = row.risk_tier || 'Low';
                  const tierBadge =
                    tier === 'High' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    : tier === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';

                  return (
                    <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono">
                        {new Date(row.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${tierBadge}`}>
                          {tier}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">{row.anxiety_score}/10</td>
                      <td className="py-3.5 px-4">{Math.round((row.dropout_probability || 0) * 100)}%</td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-sm">
                          {(row.top_factors || []).map((f: string, idx: number) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 text-[10px]">
                              {f}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

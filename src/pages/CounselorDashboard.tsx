import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import type { Page } from '../App';
import {
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface CounselorDashboardProps {
  onNavigate: (page: Page) => void;
  onSelectStudent: (id: string) => void;
  studentStatuses: Record<string, string>;
}

type Filter = 'all' | 'high' | 'medium' | 'low' | 'new' | 'contacted';

const API_BASE = import.meta.env.VITE_API_URL || 'https://sahara-951p.onrender.com';

const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

export default function CounselorDashboard({ onNavigate, onSelectStudent }: CounselorDashboardProps) {
  const { token } = useAuth();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // 1. Fetch real assessments
      const assessRes = await fetch(`${API_BASE}/assessments?limit=100`, { headers });
      if (assessRes.ok) {
        const assessData = await assessRes.json();
        setAssessments(assessData.assessments || []);
      }

      // 2. Fetch real aggregate stats
      const statsRes = await fetch(`${API_BASE}/admin/stats`, { headers });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setAdminStats(statsData);
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const filtered = assessments.filter(s => {
    const tier = (s.risk_tier || 'Low').toLowerCase();
    const status = s.status || 'New';

    const statusMatch =
      filter === 'all' ? true
      : filter === 'high' ? tier === 'high'
      : filter === 'medium' ? tier === 'medium'
      : filter === 'low' ? tier === 'low'
      : filter === 'new' ? status === 'New'
      : filter === 'contacted' ? status === 'Contacted'
      : true;

    const query = search.toLowerCase();
    const studentId = (s.student_id || '').toLowerCase();
    const factors = (s.top_factors || []).join(' ').toLowerCase();
    const searchMatch = !search || studentId.includes(query) || factors.includes(query);

    return statusMatch && searchMatch;
  });

  const totalCount = adminStats?.total_students || assessments.length;
  const highCount = adminStats?.by_tier?.High ?? assessments.filter(s => s.risk_tier === 'High').length;
  const medCount = adminStats?.by_tier?.Medium ?? assessments.filter(s => s.risk_tier === 'Medium').length;
  const newCount = assessments.filter(s => s.status === 'New').length;

  const pieData = [
    { name: 'Low', value: adminStats?.by_tier?.Low ?? assessments.filter(s => s.risk_tier === 'Low').length },
    { name: 'Medium', value: medCount },
    { name: 'High', value: highCount },
  ];

  const weeklyData = adminStats?.weekly_checkins || [
    { day: 'Mon', checkins: 4 },
    { day: 'Tue', checkins: 6 },
    { day: 'Wed', checkins: 8 },
    { day: 'Thu', checkins: 5 },
    { day: 'Fri', checkins: 9 },
    { day: 'Sat', checkins: 3 },
    { day: 'Sun', checkins: 7 },
  ];

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All Cases' },
    { id: 'high', label: 'High Risk' },
    { id: 'medium', label: 'Medium Risk' },
    { id: 'low', label: 'Low Risk' },
    { id: 'new', label: 'New / Unreviewed' },
    { id: 'contacted', label: 'Contacted' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Institutional Counselor Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time student wellbeing triage and academic attrition early warnings.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-medium text-slate-200 transition-all self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Assessments</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{totalCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Recorded via Web & WhatsApp</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">High Risk</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-400">{highCount}</p>
          <p className="text-[11px] text-rose-300/70 mt-1">Priority intervention required</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Medium Risk</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-400">{medCount}</p>
          <p className="text-[11px] text-amber-300/70 mt-1">Monitor & peer support</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unreviewed Cases</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-400">{newCount}</p>
          <p className="text-[11px] text-purple-300/70 mt-1">Pending counselor review</p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Risk Distribution Chart */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Institutional Risk Distribution
          </h2>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#F1F5F9', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-700/50">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Low</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Medium</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> High</span>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Weekly Intake Activity
          </h2>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#F1F5F9', fontSize: '12px' }}
                />
                <Bar dataKey="checkins" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 text-center pt-2 border-t border-slate-700/50">
            Intake submissions recorded across Web & WhatsApp
          </p>
        </div>
      </div>

      {/* Case Management Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-lg overflow-hidden">
        {/* Table Controls */}
        <div className="p-5 border-b border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-1.5">
            {filters.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  filter === f.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student ID or factors..."
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-1.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-700/60">
              <tr>
                <th className="py-3.5 px-4">Anonymized Student ID</th>
                <th className="py-3.5 px-4">Risk Level</th>
                <th className="py-3.5 px-4">Anxiety Index</th>
                <th className="py-3.5 px-4">Dropout Risk</th>
                <th className="py-3.5 px-4">Primary Factors</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No matching assessment records found.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => {
                  const tier = row.risk_tier || 'Low';
                  const tierBg =
                    tier === 'High' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    : tier === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';

                  const status = row.status || 'New';
                  const statusBg =
                    status === 'Contacted' ? 'bg-emerald-500/20 text-emerald-300'
                    : status === 'In progress' ? 'bg-indigo-500/20 text-indigo-300'
                    : 'bg-slate-700 text-slate-300';

                  return (
                    <tr key={row.assessment_id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-white">
                        {row.student_id || 'STU-ANON'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${tierBg}`}>
                          {tier}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium">
                        {row.anxiety_score !== null ? `${row.anxiety_score}/10` : '—'}
                      </td>
                      <td className="py-3.5 px-4 font-medium">
                        {row.dropout_probability !== null ? `${Math.round(row.dropout_probability * 100)}%` : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(row.top_factors || []).slice(0, 2).map((f: string, i: number) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 text-[10px]">
                              {f}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${statusBg}`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            onSelectStudent(row.assessment_id);
                            onNavigate('student-profile');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 hover:border-indigo-500 text-indigo-200 hover:text-white rounded-lg text-xs font-medium transition-all"
                        >
                          <span>Review Case</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

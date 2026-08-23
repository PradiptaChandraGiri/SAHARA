import React from 'react';
import type { ReactNode } from 'react';
import type { Page } from '../App';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  CheckSquare,
  Activity,
  Bot,
  MessageCircle,
  LayoutDashboard,
  UserCheck,
  User as UserIcon,
  LogOut,
  LogIn,
  Shield,
  FileText
} from 'lucide-react';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { user, isAuthenticated, logout } = useAuth();

  const isStaff = user?.role === 'counselor' || user?.role === 'admin';

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-wide text-base">SAHARA</h1>
            <p className="text-[11px] text-slate-400 font-medium">Wellbeing & Attrition AI</p>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-180px)]">
          {/* General & Student Hub */}
          <div>
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Student Platform
            </p>
            <nav className="space-y-1">
              <button
                onClick={() => onNavigate('home')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  currentPage === 'home'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => onNavigate('checkin')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  currentPage === 'checkin'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>Risk Assessment</span>
              </button>

              <button
                onClick={() => onNavigate('results')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  currentPage === 'results'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Assessment Results</span>
              </button>

              <button
                onClick={() => onNavigate('ai-support')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  currentPage === 'ai-support'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>AI Wellbeing Companion</span>
              </button>

              <button
                onClick={() => onNavigate('whatsapp')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  currentPage === 'whatsapp'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Bot (24/7)</span>
              </button>

              <button
                onClick={() => onNavigate('profile')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  currentPage === 'profile'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>My Check-in History</span>
              </button>
            </nav>
          </div>

          {/* Institutional / Counselor Hub */}
          <div>
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Staff & Counselor
            </p>
            <nav className="space-y-1">
              <button
                onClick={() => {
                  if (!isStaff && isAuthenticated) {
                    alert('Counselor privileges required to access this portal.');
                    return;
                  }
                  onNavigate('counselor');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  currentPage === 'counselor'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : isStaff
                    ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    : 'text-slate-400 hover:bg-slate-800/30'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Counselor Dashboard</span>
                {!isStaff && <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Staff</span>}
              </button>

              <button
                onClick={() => {
                  if (!isStaff && isAuthenticated) {
                    alert('Counselor privileges required to view student profiles.');
                    return;
                  }
                  onNavigate('student-profile');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  currentPage === 'student-profile'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : isStaff
                    ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    : 'text-slate-400 hover:bg-slate-800/30'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Case Detail View</span>
              </button>
            </nav>
          </div>

          {/* Optional Demonstration Resources */}
          <div>
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Resources (Preview)
            </p>
            <nav className="space-y-1">
              <button
                onClick={() => onNavigate('medication')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  currentPage === 'medication'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-300'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Prescription Hub</span>
                <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">Demo</span>
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* User Footer Profile & Auth Control */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/80">
        {isAuthenticated && user ? (
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center font-bold text-xs text-indigo-300 shrink-0">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                <span className="inline-block text-[10px] font-medium text-indigo-400 uppercase tracking-wide">
                  {user.role}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onNavigate('login' as Page)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition-all shadow-md"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to SAHARA</span>
          </button>
        )}
      </div>
    </aside>
  );
}

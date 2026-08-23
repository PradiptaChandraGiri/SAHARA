import React, { useState } from 'react';
import type { Page } from '../App';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, User as UserIcon, ArrowRight, CheckCircle } from 'lucide-react';

interface LoginProps {
  onNavigate: (page: Page) => void;
}

export default function Login({ onNavigate }: LoginProps) {
  const { login, register } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'counselor' | 'admin'>('student');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (isRegister) {
      if (!name.trim()) {
        setError('Please enter your full name');
        setIsSubmitting(false);
        return;
      }
      const res = await register(name, email, password, role);
      setIsSubmitting(false);
      if (res.success) {
        onNavigate(role === 'student' ? 'checkin' : 'counselor');
      } else {
        setError(res.error || 'Registration failed');
      }
    } else {
      const res = await login(email, password);
      setIsSubmitting(false);
      if (res.success) {
        onNavigate('home');
      } else {
        setError(res.error || 'Invalid credentials');
      }
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setError(null);
    setIsSubmitting(true);
    setEmail(demoEmail);
    setPassword(demoPass);
    const res = await login(demoEmail, demoPass);
    setIsSubmitting(false);
    if (res.success) {
      onNavigate('home');
    } else {
      setError(res.error || 'Quick login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800/90 border border-slate-700 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl mb-3">
            <Shield className="w-7 h-7 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">SAHARA Institutional Portal</h1>
          <p className="text-slate-400 text-sm mt-1">
            Student Mental Wellbeing & Academic Early-Warning System
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Patel"
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2.5 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@sahara.edu"
                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2.5 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2.5 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['student', 'counselor', 'admin'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium capitalize border transition-all ${
                      role === r
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                        : 'bg-slate-900/40 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 text-sm"
          >
            {isSubmitting ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-700/60">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span>Instant Demo Accounts:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickLogin('counselor@sahara.edu', 'counselor123')}
              className="px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300 flex items-center justify-center gap-1 transition-all"
            >
              <CheckCircle className="w-3 h-3 text-emerald-400" /> Counselor
            </button>
            <button
              onClick={() => handleQuickLogin('student@sahara.edu', 'student123')}
              className="px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300 flex items-center justify-center gap-1 transition-all"
            >
              <CheckCircle className="w-3 h-3 text-blue-400" /> Student
            </button>
            <button
              onClick={() => handleQuickLogin('admin@sahara.edu', 'admin123')}
              className="px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300 flex items-center justify-center gap-1 transition-all"
            >
              <CheckCircle className="w-3 h-3 text-purple-400" /> Admin
            </button>
          </div>
        </div>

        <div className="text-center mt-5 text-xs text-slate-400">
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button
                onClick={() => setIsRegister(false)}
                className="text-indigo-400 hover:underline font-medium"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Need a new account?{' '}
              <button
                onClick={() => setIsRegister(true)}
                className="text-indigo-400 hover:underline font-medium"
              >
                Register Here
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

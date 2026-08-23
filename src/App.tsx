import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import CheckIn from './pages/CheckIn';
import Results from './pages/Results';
import AISupport from './pages/AISupport';
import WhatsAppSupport from './pages/WhatsAppSupport';
import CounselorDashboard from './pages/CounselorDashboard';
import StudentProfile from './pages/StudentProfile';
import MedicationSupport from './pages/MedicationSupport';
import Profile from './pages/Profile';
import Login from './pages/Login';

export type Page =
  | 'home'
  | 'login'
  | 'checkin'
  | 'results'
  | 'ai-support'
  | 'whatsapp'
  | 'counselor'
  | 'student-profile'
  | 'medication'
  | 'profile';

export interface CheckInData {
  age: number;
  gender: string;
  year: string;
  department: string;
  gpa: string;
  studyHours: number;
  examPressure: number;
  attendance: number;
  stressLevel: number;
  sleepHours: number;
  physicalActivity: string;
  socialSupport: number;
  screenTime: number;
  financialStress: string;
  familyExpectations: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  anxietyRisk: number;
  dropoutRisk: number;
  isAiPredicted?: boolean;
  factors: string[];
}

function MainApp() {
  const [page, setPage] = useState<Page>('home');
  const [checkInData, setCheckInData] = useState<CheckInData | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentStatuses, setStudentStatuses] = useState<Record<string, string>>({});
  const { user, isAuthenticated } = useAuth();

  const navigate = (p: Page) => {
    // Role protection guard
    if ((p === 'counselor' || p === 'student-profile') && !isAuthenticated) {
      setPage('login');
      return;
    }
    if ((p === 'counselor' || p === 'student-profile') && user?.role === 'student') {
      alert('Access restricted: Counselor/Admin credentials required.');
      return;
    }
    setPage(p);
    window.scrollTo(0, 0);
  };

  const handleCheckInComplete = (data: CheckInData) => {
    const anxietyRisk = Math.min(Math.round(data.riskScore * 1.05), 95);
    const dropoutRisk = Math.max(Math.round(data.riskScore * 0.92), 5);
    setCheckInData({ ...data, anxietyRisk, dropoutRisk });
  };

  const handleUpdateStatus = (id: string, status: string) => {
    setStudentStatuses((prev) => ({ ...prev, [id]: status }));
  };

  if (page === 'login') {
    return <Login onNavigate={navigate} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      <Sidebar currentPage={page} onNavigate={navigate} />

      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-900">
        {page === 'home' && <Home onNavigate={navigate} />}
        {page === 'checkin' && <CheckIn onNavigate={navigate} onComplete={handleCheckInComplete} />}
        {page === 'results' && <Results data={checkInData} onNavigate={navigate} />}
        {page === 'ai-support' && <AISupport />}
        {page === 'whatsapp' && <WhatsAppSupport />}
        {page === 'counselor' && (
          <CounselorDashboard
            onNavigate={navigate}
            onSelectStudent={setSelectedStudentId}
            studentStatuses={studentStatuses}
          />
        )}
        {page === 'student-profile' && (
          <StudentProfile
            studentId={selectedStudentId || ''}
            onNavigate={navigate}
            studentStatuses={studentStatuses}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
        {page === 'medication' && <MedicationSupport onNavigate={navigate} />}
        {page === 'profile' && <Profile onNavigate={navigate} />}
      </main>

      {/* Floating WhatsApp Live Button */}
      <a
        href="https://wa.me/14155238886?text=join%20no-different"
        target="_blank"
        rel="noopener noreferrer"
        title="Open SAHARA WhatsApp Bot"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl shadow-emerald-600/40 font-semibold text-xs transition-all hover:scale-105 border border-emerald-400/30"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
        <span>WhatsApp Bot (24/7)</span>
      </a>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

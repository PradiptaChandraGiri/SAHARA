import { useState } from 'react'
import { useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import CheckIn from './pages/CheckIn'
import Results from './pages/Results'
import AISupport from './pages/AISupport'
import WhatsAppSupport from './pages/WhatsAppSupport'
import CounselorDashboard from './pages/CounselorDashboard'
import StudentProfile from './pages/StudentProfile'
import MedicationSupport from './pages/MedicationSupport'
import Profile from './pages/Profile'
import Login from './pages/Login'

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
  | 'profile'

export interface CheckInData {
  age: number
  gender: string
  year: string
  department: string
  gpa: string
  studyHours: number
  examPressure: number
  attendance: number
  stressLevel: number
  sleepHours: number
  physicalActivity: string
  socialSupport: number
  screenTime: number
  financialStress: string
  familyExpectations: string
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high'
  anxietyRisk: number
  dropoutRisk: number
  isAiPredicted?: boolean
  factors: string[]
}

export default function App() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState<Page>('home')
  const [checkInData, setCheckInData] = useState<CheckInData | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [studentStatuses, setStudentStatuses] = useState<Record<string, string>>({})

  const navigate = (p: Page) => {
    if ((p === 'counselor' || p === 'student-profile') && (!user || (user.role !== 'counselor' && user.role !== 'admin'))) {
      if (!user) {
        setPage('login')
        return
      }
      alert('Counselor or Admin privileges required to access this portal.')
      return
    }
    setPage(p)
    window.scrollTo(0, 0)
  }

  const handleCheckInComplete = (data: CheckInData) => {
    const anxietyRisk = Math.min(Math.round(data.riskScore * 1.05), 95)
    const dropoutRisk = Math.max(Math.round(data.riskScore * 0.92), 5)
    setCheckInData({ ...data, anxietyRisk, dropoutRisk })
  }

  const handleUpdateStatus = (id: string, status: string) => {
    setStudentStatuses(prev => ({ ...prev, [id]: status }))
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--slate-50)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, background: 'var(--navy-950)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M2 18 Q12 8 22 18" stroke="var(--amber-500)" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--ink-500)', fontWeight: 500 }}>Connecting to SAHARA…</p>
        </div>
      </div>
    )
  }

  if (page === 'login') {
    return <Login onSuccess={() => navigate('home')} />
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--slate-50)' }}>
      <Sidebar currentPage={page} onNavigate={navigate} />

      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
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
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 50,
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 18px', background: 'var(--navy-950)',
          color: '#fff', borderRadius: 99,
          boxShadow: 'var(--shadow-lg)', fontWeight: 600, fontSize: 13,
          border: '1.5px solid rgba(232,181,99,0.3)', textDecoration: 'none',
          transition: 'transform 0.2s ease',
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber-400)' }}></span>
        <span>WhatsApp Bot (24/7)</span>
      </a>
    </div>
  )
}

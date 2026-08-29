import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import MobileNav from './components/MobileNav'
import Home from './pages/Home'
import StudentDashboard from './pages/StudentDashboard'
import CheckIn from './pages/CheckIn'
import Results from './pages/Results'
import AISupport from './pages/AISupport'
import WhatsAppSupport from './pages/WhatsAppSupport'
import CounselorDashboard from './pages/CounselorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import StudentProfile from './pages/StudentProfile'
import Profile from './pages/Profile'
import Login from './pages/Login'
import CrisisButton from './components/CrisisButton'
import ErrorBoundary from './components/ErrorBoundary'

export type Page =
  | 'home'
  | 'login'
  | 'student-dashboard'
  | 'checkin'
  | 'results'
  | 'ai-support'
  | 'whatsapp'
  | 'counselor'
  | 'admin'
  | 'student-profile'
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
  timestamp?: string
}

export default function App() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState<Page>('student-dashboard')
  const [guestMode, setGuestMode] = useState<boolean>(false)
  const [checkInData, setCheckInData] = useState<CheckInData | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [studentStatuses, setStudentStatuses] = useState<Record<string, string>>({})

  // Auto-route on login by role
  const getRoleLandingPage = (userRole?: string): Page => {
    if (userRole === 'admin') return 'admin'
    if (userRole === 'counselor') return 'counselor'
    return 'student-dashboard'
  }

  // Redirect to role dashboard upon authentication or role change
  useEffect(() => {
    if (user && !loading) {
      // If current page is login, home, or unauthenticated default, route to role dashboard
      if (page === 'login' || page === 'home') {
        setPage(getRoleLandingPage(user.role))
      }
    }
  }, [user, loading])

  const navigate = (p: Page) => {
    // If logged-in user tries to navigate to marketing home, redirect to their role dashboard
    if (user && p === 'home') {
      setPage(getRoleLandingPage(user.role))
      window.scrollTo(0, 0)
      return
    }

    // Role protection guards
    if (p === 'admin' && (!user || user.role !== 'admin')) {
      alert('Access restricted: Institutional Administrator credentials required.')
      return
    }

    if ((p === 'counselor' || p === 'student-profile') && (!user || (user.role !== 'counselor' && user.role !== 'admin'))) {
      if (!user) {
        setPage('login')
        return
      }
      alert('Access restricted: Counselor credentials required.')
      return
    }

    setPage(p)
    window.scrollTo(0, 0)
  }

  const handleCheckInComplete = (data: CheckInData) => {
    const anxietyRisk = Math.min(Math.round(data.riskScore * 1.05), 95)
    const dropoutRisk = Math.max(Math.round(data.riskScore * 0.92), 5)
    const enriched = { ...data, anxietyRisk, dropoutRisk, timestamp: new Date().toISOString() }
    setCheckInData(enriched)
    setPage('results')
    window.scrollTo(0, 0)
  }

  const handleUpdateStatus = (id: string, status: string) => {
    setStudentStatuses(prev => ({ ...prev, [id]: status }))
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-background)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, background: 'var(--color-primary-container)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            boxShadow: 'var(--shadow-md)',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M2 18 Q12 8 22 18" stroke="var(--color-accent)" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', fontWeight: 500 }}>Connecting to SAHARA…</p>
        </div>
      </div>
    )
  }

  // Dropping page: If unauthenticated and accessing a private role page, drop onto Login page
  const publicPages: Page[] = ['home', 'checkin', 'results', 'whatsapp', 'ai-support', 'login']
  if (!user && !guestMode && !publicPages.includes(page)) {
    return (
      <Login
        onSuccess={() => {
          setPage(getRoleLandingPage(user?.role))
        }}
        onExploreGuest={() => {
          setGuestMode(true)
          setPage('home')
        }}
      />
    )
  }

  if (page === 'login') {
    return (
      <Login
        onSuccess={() => setPage(getRoleLandingPage(user?.role))}
        onExploreGuest={() => {
          setGuestMode(true)
          setPage('home')
        }}
      />
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', background: 'var(--color-background)', flexDirection: 'column' }}>
      <MobileNav currentPage={page} onNavigate={navigate} />

      <div style={{ display: 'flex', flex: 1, height: '100%', overflow: 'hidden', width: '100%' }}>
        <Sidebar currentPage={page} onNavigate={navigate} />

        <main className="mobile-main-container" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <ErrorBoundary fallbackTitle="Could not load page view">
            {/* Logged-out Visitor Home */}
            {page === 'home' && <Home onNavigate={navigate} />}

            {/* Student Dashboard */}
            {page === 'student-dashboard' && (
              <StudentDashboard onNavigate={navigate} lastCheckInData={checkInData} />
            )}

            {page === 'checkin' && <CheckIn onNavigate={navigate} onComplete={handleCheckInComplete} />}
            {page === 'results' && <Results data={checkInData} onNavigate={navigate} />}
            {page === 'ai-support' && <AISupport />}
            {page === 'whatsapp' && <WhatsAppSupport />}
            
            {/* Counselor Triage Workspace */}
            {page === 'counselor' && (
              <CounselorDashboard
                onNavigate={navigate}
                onSelectStudent={setSelectedStudentId}
                studentStatuses={studentStatuses}
              />
            )}

            {/* Admin Governance Dashboard */}
            {page === 'admin' && <AdminDashboard onNavigate={navigate} />}

            {page === 'student-profile' && (
              <StudentProfile
                studentId={selectedStudentId || ''}
                onNavigate={navigate}
                studentStatuses={studentStatuses}
                onUpdateStatus={handleUpdateStatus}
              />
            )}
            {page === 'profile' && <Profile onNavigate={navigate} />}
          </ErrorBoundary>
        </main>
      </div>

      {/* Persistent Crisis & 24/7 Helpline Support (One-tap on all views) */}
      <CrisisButton />
    </div>
  )
}

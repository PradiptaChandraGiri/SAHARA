import { useState } from 'react'
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

export type Page =
  | 'home'
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
  factors: string[]
}

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [checkInData, setCheckInData] = useState<CheckInData | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [studentStatuses, setStudentStatuses] = useState<Record<string, string>>({})

  const navigate = (p: Page) => { setPage(p); window.scrollTo(0, 0) }

  const handleCheckInComplete = (data: CheckInData) => {
    const anxietyRisk = Math.min(Math.round(data.riskScore * 1.05), 95)
    const dropoutRisk = Math.max(Math.round(data.riskScore * 0.92), 5)
    setCheckInData({ ...data, anxietyRisk, dropoutRisk })
  }

  const handleUpdateStatus = (id: string, status: string) => {
    setStudentStatuses(prev => ({ ...prev, [id]: status }))
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F8FAFC' }}>
      <Sidebar currentPage={page} onNavigate={navigate} />

      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{
          display: page === 'home' ? 'block' : 'none',
          animation: 'fadeIn 0.3s ease',
        }}>
          <Home onNavigate={navigate} />
        </div>

        <div style={{ display: page === 'checkin' ? 'block' : 'none' }}>
          <CheckIn onNavigate={navigate} onComplete={handleCheckInComplete} />
        </div>

        <div style={{ display: page === 'results' ? 'block' : 'none' }}>
          <Results data={checkInData} onNavigate={navigate} />
        </div>

        <div style={{ display: page === 'ai-support' ? 'block' : 'none', height: '100vh' }}>
          {page === 'ai-support' && <AISupport />}
        </div>

        <div style={{ display: page === 'whatsapp' ? 'block' : 'none' }}>
          <WhatsAppSupport />
        </div>

        <div style={{ display: page === 'counselor' ? 'block' : 'none' }}>
          <CounselorDashboard
            onNavigate={navigate}
            onSelectStudent={setSelectedStudentId}
            studentStatuses={studentStatuses}
          />
        </div>

        <div style={{ display: page === 'student-profile' ? 'block' : 'none' }}>
          {page === 'student-profile' && (
            <StudentProfile
              studentId={selectedStudentId}
              onNavigate={navigate}
              studentStatuses={studentStatuses}
              onUpdateStatus={handleUpdateStatus}
            />
          )}
        </div>

        <div style={{ display: page === 'medication' ? 'block' : 'none' }}>
          <MedicationSupport />
        </div>

        <div style={{ display: page === 'profile' ? 'block' : 'none' }}>
          <Profile checkInData={checkInData} onNavigate={navigate} />
        </div>
      </main>

      {/* Floating Direct WhatsApp Button */}
      <a
        href="https://wa.me/14155238886?text=join%20no-different"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(135deg, #25D366, #128C7E)',
          color: 'white',
          padding: '12px 18px',
          borderRadius: 99,
          boxShadow: '0 8px 24px rgba(37, 211, 102, 0.45)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          textDecoration: 'none',
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 700,
          fontSize: 14,
          zIndex: 9999,
          transition: 'all 0.2s ease',
          border: '2px solid white',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)'
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(37, 211, 102, 0.6)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)'
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 211, 102, 0.45)'
        }}
      >
        <span style={{ fontSize: 20 }}>💬</span>
        <span>Chat on WhatsApp</span>
      </a>
    </div>
  )
}

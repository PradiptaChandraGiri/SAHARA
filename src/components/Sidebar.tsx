import type { ReactNode } from 'react'
import type { Page } from '../App'

interface SidebarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
}

const navItems: { page: Page; label: string; icon: ReactNode }[] = [
  {
    page: 'home',
    label: 'Home',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    )
  },
  {
    page: 'checkin',
    label: 'Student Check-in',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    )
  },
  {
    page: 'results',
    label: 'My Results',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    )
  },
  {
    page: 'ai-support',
    label: 'AI Support',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    )
  },
  {
    page: 'whatsapp',
    label: 'WhatsApp Support',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.64 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    )
  },
  {
    page: 'counselor',
    label: 'Counselor Dashboard',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    )
  },
  {
    page: 'medication',
    label: 'Medication Support',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/>
      </svg>
    )
  },
  {
    page: 'profile',
    label: 'Profile',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    )
  },
]

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <aside style={{
      width: 240,
      minWidth: 240,
      background: 'white',
      borderRight: '1px solid #E2E8F0',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden'
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #F1F5F9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #4F7BF7, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(79,123,247,0.3)'
          }}>
            <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
            </svg>
          </div>
          <div>
            <div style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: 20,
              background: 'linear-gradient(135deg, #4F7BF7, #8B5CF6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1.1
            }}>SAHARA</div>
          </div>
        </div>
        <p style={{ fontSize: 11, color: '#94A3B8', fontFamily: "'Inter', sans-serif", paddingLeft: 46, marginTop: -2 }}>
          Early support. Better outcomes.
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', padding: '8px 14px 4px', fontFamily: "'Inter', sans-serif", textTransform: 'uppercase' }}>
          Student
        </div>
        {navItems.slice(0, 5).map(item => (
          <button
            key={item.page}
            className={`nav-item ${currentPage === item.page || (currentPage === 'student-profile' && item.page === 'counselor') ? 'active' : ''}`}
            onClick={() => onNavigate(item.page)}
          >
            <span style={{ flexShrink: 0 }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}

        <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', padding: '12px 14px 4px', fontFamily: "'Inter', sans-serif", textTransform: 'uppercase' }}>
          Admin
        </div>
        {navItems.slice(5).map(item => (
          <button
            key={item.page}
            className={`nav-item ${currentPage === item.page ? 'active' : ''}`}
            onClick={() => onNavigate(item.page)}
          >
            <span style={{ flexShrink: 0 }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid #F1F5F9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, #14B8A6, #4F7BF7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: 'white', fontFamily: "'Outfit', sans-serif"
          }}>RS</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', fontFamily: "'Outfit', sans-serif" }}>Rohit S.</div>
            <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: "'Inter', sans-serif" }}>CS — 3rd Year</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

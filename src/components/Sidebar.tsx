import type { ReactNode } from 'react'
import type { Page } from '../App'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'

interface SidebarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
}

const icon = (d: string) => (
  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d={d} />
  </svg>
)

const studentNav: { page: Page; label: string; icon: ReactNode }[] = [
  { page: 'student-dashboard', label: 'My Dashboard', icon: icon('M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z') },
  { page: 'checkin', label: 'Take Check-in', icon: icon('M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11') },
  { page: 'results', label: 'My Results', icon: icon('M22 12 18 12 15 21 9 3 6 12 2 12') },
  { page: 'ai-support', label: 'AI Support', icon: icon('M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z') },
  { page: 'whatsapp', label: 'WhatsApp Bot', icon: icon('M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.64 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z') },
  { page: 'profile', label: 'My Profile', icon: icon('M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z') },
]

const counselorNav: { page: Page; label: string; icon: ReactNode }[] = [
  { page: 'counselor', label: 'Triage Dashboard', icon: icon('M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z') },
  { page: 'ai-support', label: 'AI Clinical Copilot', icon: icon('M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z') },
  { page: 'whatsapp', label: 'WhatsApp Intake Log', icon: icon('M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.64 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z') },
  { page: 'profile', label: 'Counselor Profile', icon: icon('M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z') },
]

const adminNav: { page: Page; label: string; icon: ReactNode }[] = [
  { page: 'admin', label: 'Admin Analytics', icon: icon('M18 20V10M12 20V4M6 20v-6') },
  { page: 'counselor', label: 'Counselor Triage', icon: icon('M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z') },
  { page: 'ai-support', label: 'AI Monitoring', icon: icon('M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z') },
  { page: 'whatsapp', label: 'Bot Webhook Health', icon: icon('M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.64 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z') },
  { page: 'profile', label: 'Account Settings', icon: icon('M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z') },
]

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth()
  const role = user?.role || 'student'
  
  const initials = user?.name
    ? user.name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
    : 'SA'

  const currentNav = role === 'admin' ? adminNav : role === 'counselor' ? counselorNav : studentNav

  return (
    <aside
      className="desktop-sidebar"
      style={{
        width: 244,
        minWidth: 244,
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        transition: 'background-color 0.25s ease, border-color 0.25s ease',
      }}
    >
      {/* Logo & Header */}
      <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid var(--color-border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, background: 'var(--color-primary-container)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M2 18 Q12 8 22 18" stroke="var(--color-accent)" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', display: 'block', lineHeight: 1.2 }}>
                SAHARA
              </span>
              <span style={{ display: 'block', fontSize: 10.5, color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {role} View
              </span>
            </div>
          </div>
          <ThemeToggle variant="compact" />
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto' }}>
        <div style={sectionLabel}>
          {role === 'admin' ? 'Institutional Administration' : role === 'counselor' ? 'Clinical Triage' : 'Student Portal'}
        </div>
        {currentNav.map(item => (
          <NavButton
            key={item.page}
            item={item}
            active={
              currentPage === item.page ||
              (item.page === 'counselor' && currentPage === 'student-profile')
            }
            onNavigate={onNavigate}
          />
        ))}

        {/* If Admin or Counselor, also allow viewing student experience */}
        {(role === 'counselor' || role === 'admin') && (
          <>
            <div style={{ ...sectionLabel, marginTop: 18 }}>Student Experience</div>
            <NavButton
              item={{ page: 'student-dashboard', label: 'Student Dashboard', icon: icon('M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z') }}
              active={currentPage === 'student-dashboard'}
              onNavigate={onNavigate}
            />
            <NavButton
              item={{ page: 'checkin', label: 'Take Check-in', icon: icon('M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11') }}
              active={currentPage === 'checkin'}
              onNavigate={onNavigate}
            />
          </>
        )}
      </nav>

      {/* Footer / account */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid var(--color-border-subtle)', background: 'var(--color-surface-raised)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', background: 'var(--color-primary-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12.5, fontWeight: 700, color: 'var(--color-primary)',
          }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'Guest Explorer'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
              {user ? user.role : 'Unauthenticated'}
            </div>
          </div>
          {user ? (
            <button
              onClick={logout}
              title="Sign out"
              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 4 }}
            >
              {icon('M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9')}
            </button>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              title="Sign in"
              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: 4, fontWeight: 600, fontSize: 12 }}
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* Developer Attribution */}
      <div style={{ padding: '8px 14px', borderTop: '1px solid var(--color-border-subtle)', background: 'var(--color-surface)' }}>
        <div style={{ fontSize: 10.5, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
          Lead Developer:{' '}
          <strong style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>Pradipta Chandra Giri</strong>
        </div>
      </div>
    </aside>
  )
}

function NavButton({ item, active, onNavigate }: {
  item: { page: Page; label: string; icon: ReactNode }
  active: boolean
  onNavigate: (p: Page) => void
}) {
  return (
    <button
      onClick={() => onNavigate(item.page)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
        padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
        fontSize: 13.5, fontWeight: active ? 700 : 500, marginBottom: 2,
        background: active ? 'var(--color-primary-subtle)' : 'transparent',
        color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
        transition: 'all 0.15s ease',
      }}
    >
      {item.icon}
      <span>{item.label}</span>
    </button>
  )
}

const sectionLabel: React.CSSProperties = {
  fontSize: 10.5, fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.07em',
  textTransform: 'uppercase', padding: '6px 12px 6px',
}

import React, { useState } from 'react'
import type { Page } from '../App'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'
import {
  Menu,
  X,
  Home as HomeIcon,
  Activity,
  Award,
  MessageSquare,
  Smartphone,
  User,
  Shield,
  LogOut,
  LogIn,
  Layers,
  ChevronRight,
  HeartPulse,
} from 'lucide-react'

interface MobileNavProps {
  currentPage: Page
  onNavigate: (page: Page) => void
}

export default function MobileNav({ currentPage, onNavigate }: MobileNavProps) {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const role = user?.role || 'student'

  const handleNav = (p: Page) => {
    onNavigate(p)
    setIsOpen(false)
  }

  const getPageTitle = (p: Page) => {
    switch (p) {
      case 'home':
        return 'SAHARA'
      case 'student-dashboard':
        return 'Dashboard'
      case 'checkin':
        return 'Wellbeing Check-in'
      case 'results':
        return 'Assessment Results'
      case 'ai-support':
        return 'AI Support'
      case 'whatsapp':
        return 'WhatsApp Bot'
      case 'profile':
        return 'Profile & Reminders'
      case 'counselor':
        return 'Clinical Triage'
      case 'admin':
        return 'Admin Analytics'
      case 'student-profile':
        return 'Student Drilldown'
      case 'login':
        return 'Sign In'
      default:
        return 'SAHARA'
    }
  }

  return (
    <>
      {/* 1. Mobile Sticky Top Header (Visible on screens <= 768px) */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          position: 'sticky',
          top: 0,
          zIndex: 90,
          width: '100%',
        }}
        className="mobile-header-bar"
      >
        {/* Left: Logo & Current Page Title */}
        <div
          onClick={() => handleNav('student-dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'var(--color-primary-container)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M2 18 Q12 8 22 18" stroke="var(--color-accent)" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.1, display: 'block' }}>
              SAHARA
            </span>
            <span style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600 }}>
              {getPageTitle(currentPage)}
            </span>
          </div>
        </div>

        {/* Right: Theme Toggle & Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ThemeToggle variant="compact" />
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
            style={{
              background: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
            }}
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* 2. Sliding Navigation Drawer Overlay */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(3px)',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'flex-start',
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{
              width: '82%',
              maxWidth: 320,
              height: '100%',
              background: 'var(--color-surface)',
              borderRight: '1.5px solid var(--color-border)',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-lg)',
              animation: 'slideInLeft 0.25s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Top Branding */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: 'var(--color-primary-container)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M2 18 Q12 8 22 18" stroke="var(--color-accent)" strokeWidth="2.4" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
                    SAHARA
                  </h3>
                  <span style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                    {role} portal
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav Menu Items */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em', margin: '8px 0 4px' }}>
                Main Menu
              </span>

              {[
                { id: 'student-dashboard', label: 'My Dashboard', icon: <HomeIcon size={18} /> },
                { id: 'checkin', label: 'Take Check-in', icon: <Activity size={18} /> },
                { id: 'results', label: 'My Results', icon: <Award size={18} /> },
                { id: 'ai-support', label: 'AI Support Chat', icon: <MessageSquare size={18} /> },
                { id: 'whatsapp', label: 'WhatsApp Bot', icon: <Smartphone size={18} /> },
                { id: 'profile', label: 'Profile & Reminders', icon: <User size={18} /> },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id as Page)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: 'none',
                    background: currentPage === item.id ? 'var(--color-primary-subtle)' : 'transparent',
                    color: currentPage === item.id ? 'var(--color-primary)' : 'var(--color-text-primary)',
                    fontWeight: currentPage === item.id ? 700 : 500,
                    fontSize: 14.5,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {currentPage === item.id && <ChevronRight size={16} />}
                </button>
              ))}

              {/* Counselor / Admin Section if applicable */}
              {(role === 'counselor' || role === 'admin') && (
                <>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em', margin: '14px 0 4px' }}>
                    Staff Workspaces
                  </span>
                  <button
                    onClick={() => handleNav('counselor')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: 'none',
                      background: currentPage === 'counselor' ? 'var(--color-primary-subtle)' : 'transparent',
                      color: currentPage === 'counselor' ? 'var(--color-primary)' : 'var(--color-text-primary)',
                      fontWeight: currentPage === 'counselor' ? 700 : 500,
                      fontSize: 14.5,
                      cursor: 'pointer',
                    }}
                  >
                    <Layers size={18} />
                    <span>Counselor Triage</span>
                  </button>

                  {role === 'admin' && (
                    <button
                      onClick={() => handleNav('admin')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: 'none',
                        background: currentPage === 'admin' ? 'var(--color-primary-subtle)' : 'transparent',
                        color: currentPage === 'admin' ? 'var(--color-primary)' : 'var(--color-text-primary)',
                        fontWeight: currentPage === 'admin' ? 700 : 500,
                        fontSize: 14.5,
                        cursor: 'pointer',
                      }}
                    >
                      <Shield size={18} />
                      <span>Admin Analytics</span>
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Drawer Bottom User Info & Logout */}
            <div style={{ paddingTop: 16, borderTop: '1px solid var(--color-border-subtle)', marginTop: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'var(--color-primary-subtle)',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : 'PR'}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {user?.name || 'Pradipta Chandra Giri'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                      {user?.email || 'Student'}
                    </div>
                  </div>
                </div>

                {user ? (
                  <button
                    onClick={() => {
                      logout()
                      setIsOpen(false)
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-muted)',
                      cursor: 'pointer',
                      padding: 6,
                    }}
                    title="Sign Out"
                  >
                    <LogOut size={18} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleNav('login')}
                    style={{
                      background: 'var(--color-primary)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 6,
                      padding: '6px 12px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <LogIn size={14} />
                    <span>Sign In</span>
                  </button>
                )}
              </div>

              {/* 24/7 Tele-MANAS Emergency Shortcut */}
              <a
                href="tel:14416"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: 'var(--color-risk-high-bg)',
                  color: 'var(--color-risk-high-text)',
                  border: '1px solid var(--color-risk-high-border)',
                  padding: '10px',
                  borderRadius: 10,
                  fontSize: 12.5,
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <HeartPulse size={16} />
                <span>24/7 Crisis Hotline: Call 14416</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 3. Mobile Bottom Navigation Bar (1-Thumb Quick Access) */}
      <nav
        style={{
          display: 'flex',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          zIndex: 80,
          padding: '6px 12px',
          justifyContent: 'space-around',
          alignItems: 'center',
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
        }}
        className="mobile-bottom-nav"
      >
        {[
          { id: 'student-dashboard', label: 'Dashboard', icon: <HomeIcon size={20} /> },
          { id: 'checkin', label: 'Check-in', icon: <Activity size={20} /> },
          { id: 'ai-support', label: 'AI Support', icon: <MessageSquare size={20} /> },
          { id: 'profile', label: 'Profile', icon: <User size={20} /> },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => handleNav(btn.id as Page)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              background: 'none',
              border: 'none',
              color: currentPage === btn.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontSize: 11,
              fontWeight: currentPage === btn.id ? 700 : 500,
              padding: '6px 12px',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            {btn.icon}
            <span>{btn.label}</span>
          </button>
        ))}
      </nav>
    </>
  )
}

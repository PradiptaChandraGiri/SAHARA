import React from 'react'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'

interface ThemeToggleProps {
  compact?: boolean
  className?: string
}

export default function ThemeToggle({ compact = false, className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      className={`theme-toggle-btn ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: compact ? '6px 10px' : '8px 14px',
        borderRadius: 99,
        background: isDark ? '#17273F' : '#F1F5F9',
        border: `1.5px solid ${isDark ? '#2D4366' : '#CBD5E1'}`,
        color: isDark ? '#F1F5F9' : '#0E1A2B',
        cursor: 'pointer',
        fontSize: compact ? 12 : 13,
        fontWeight: 600,
        transition: 'all 0.2s ease',
        boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <div
        style={{
          width: compact ? 20 : 22,
          height: compact ? 20 : 22,
          borderRadius: '50%',
          background: isDark ? '#2DD4BF' : '#F59E0B',
          color: isDark ? '#0E1A2B' : '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.3s ease, background 0.3s ease',
          transform: isDark ? 'rotate(180deg)' : 'rotate(0deg)',
        }}
      >
        {isDark ? <Moon size={compact ? 12 : 13} /> : <Sun size={compact ? 12 : 13} />}
      </div>
      {!compact && (
        <span style={{ userSelect: 'none' }}>
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </button>
  )
}

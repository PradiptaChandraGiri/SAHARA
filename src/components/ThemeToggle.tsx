// src/components/ThemeToggle.tsx
import React from 'react'
import { Sun, Moon, Laptop } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import type { Theme } from '../utils/theme'

interface ThemeToggleProps {
  variant?: 'compact' | 'segmented' | 'icon-only'
  className?: string
}

export default function ThemeToggle({ variant = 'segmented', className = '' }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme()

  if (variant === 'icon-only') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Current: ${theme} (${resolvedTheme}). Click to toggle.`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 34,
          height: 34,
          borderRadius: 8,
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          color: 'var(--color-text-primary)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        className={className}
      >
        {resolvedTheme === 'dark' ? <Moon size={16} color="var(--color-accent)" /> : <Sun size={16} color="var(--color-primary)" />}
      </button>
    )
  }

  if (variant === 'compact') {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '3px 4px',
          borderRadius: 8,
          background: 'var(--color-surface-raised)',
          border: '1px solid var(--color-border)',
        }}
        className={className}
      >
        <button
          type="button"
          onClick={() => setTheme('light')}
          aria-label="Light theme"
          title="Light theme (Default for students)"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 26,
            height: 26,
            borderRadius: 6,
            border: 'none',
            cursor: 'pointer',
            background: theme === 'light' ? 'var(--color-surface)' : 'transparent',
            color: theme === 'light' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            boxShadow: theme === 'light' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Sun size={13} />
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          aria-label="Dark theme"
          title="Dark theme (Default for counselors & admins)"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 26,
            height: 26,
            borderRadius: 6,
            border: 'none',
            cursor: 'pointer',
            background: theme === 'dark' ? 'var(--color-surface)' : 'transparent',
            color: theme === 'dark' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            boxShadow: theme === 'dark' ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Moon size={13} />
        </button>

        <button
          type="button"
          onClick={() => setTheme('system')}
          aria-label="Match system theme"
          title="Match system OS theme"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 26,
            height: 26,
            borderRadius: 6,
            border: 'none',
            cursor: 'pointer',
            background: theme === 'system' ? 'var(--color-surface)' : 'transparent',
            color: theme === 'system' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            boxShadow: theme === 'system' ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Laptop size={13} />
        </button>
      </div>
    )
  }

  // Default 'segmented' control with text and icons
  const options: { id: Theme; label: string; icon: React.ReactNode }[] = [
    { id: 'light', label: 'Light', icon: <Sun size={14} /> },
    { id: 'dark', label: 'Dark', icon: <Moon size={14} /> },
    { id: 'system', label: 'System', icon: <Laptop size={14} /> },
  ]

  return (
    <div
      role="group"
      aria-label="Select color theme"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--color-surface-raised)',
        border: '1px solid var(--color-border)',
        borderRadius: 10,
        padding: 3,
        gap: 2,
      }}
      className={className}
    >
      {options.map((opt) => {
        const isActive = theme === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setTheme(opt.id)}
            aria-pressed={isActive}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              borderRadius: 7,
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: isActive ? 700 : 500,
              background: isActive ? 'var(--color-surface)' : 'transparent',
              color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{ color: isActive ? 'var(--color-primary)' : 'inherit', display: 'flex' }}>
              {opt.icon}
            </span>
            <span>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

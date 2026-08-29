// src/context/ThemeContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  type Theme,
  type ResolvedTheme,
  getInitialTheme,
  getSavedTheme,
  setSavedTheme,
  applyTheme,
  resolveTheme,
} from '../utils/theme'
import { useAuth } from './AuthContext'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const role = user?.role

  const [theme, setThemeState] = useState<Theme>(() => {
    return getInitialTheme(role)
  })

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    return resolveTheme(theme)
  })

  // When user logs in/out or role changes, if there is NO explicit localStorage preference,
  // adapt to the role-based default (Student -> light, Counselor/Admin -> dark)
  useEffect(() => {
    const saved = getSavedTheme()
    if (!saved) {
      const roleDefault = getInitialTheme(role)
      setThemeState(roleDefault)
    }
  }, [role])

  // Apply theme to DOM and keep resolvedTheme in sync
  useEffect(() => {
    const active = applyTheme(theme)
    setResolvedTheme(active)
  }, [theme])

  // Listen to OS-level theme changes when theme is 'system'
  useEffect(() => {
    if (typeof window === 'undefined' || theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const active = applyTheme('system')
      setResolvedTheme(active)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setSavedTheme(newTheme)
    setThemeState(newTheme)
  }

  const toggleTheme = () => {
    const next: Theme = resolvedTheme === 'dark' ? 'light' : 'dark'
    setTheme(next)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

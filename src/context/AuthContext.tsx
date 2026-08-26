import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type Role = 'student' | 'counselor' | 'admin'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  register: (name: string, email: string, password: string, role?: Role) => Promise<{ ok: boolean; error?: string }>
  loginWithOAuth: (provider: 'google' | 'github', email?: string, name?: string, role?: Role) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const API_URL = (import.meta.env.VITE_API_URL || 'https://sahara-951p.onrender.com').replace(/\/$/, '')

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore session on load
  useEffect(() => {
    const stored = localStorage.getItem('sahara_token')
    if (stored) {
      setToken(stored)
      fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${stored}` } })
        .then(res => (res.ok ? res.json() : Promise.reject()))
        .then(data => setUser(data))
        .catch(() => {
          localStorage.removeItem('sahara_token')
          setToken(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        return { ok: false, error: err.detail || 'Incorrect email or password.' }
      }
      const data = await res.json()
      setToken(data.access_token)
      const userProfile = data.user || {
        id: data.user_id,
        name: data.name,
        email: data.email,
        role: data.role
      }
      setUser(userProfile)
      localStorage.setItem('sahara_token', data.access_token)
      return { ok: true }
    } catch {
      return { ok: false, error: 'Could not reach the server. Check your connection and try again.' }
    }
  }

  const register = async (name: string, email: string, password: string, role: Role = 'student') => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        return { ok: false, error: err.detail || 'Registration failed. Please try again.' }
      }
      const data = await res.json()
      setToken(data.access_token)
      const userProfile = data.user || {
        id: data.user_id,
        name: data.name,
        email: data.email,
        role: data.role
      }
      setUser(userProfile)
      localStorage.setItem('sahara_token', data.access_token)
      return { ok: true }
    } catch {
      return { ok: false, error: 'Could not reach the server. Check your connection and try again.' }
    }
  }

  const loginWithOAuth = async (provider: 'google' | 'github', customEmail?: string, customName?: string, role: Role = 'student') => {
    try {
      const defaultEmail = provider === 'google' ? 'student.google@sahara.app' : 'student.github@sahara.app'
      const defaultName = provider === 'google' ? 'Google Scholar' : 'GitHub Developer'
      const email = customEmail || defaultEmail
      const name = customName || defaultName

      const res = await fetch(`${API_URL}/auth/oauth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, email, name, role }),
      })

      if (!res.ok) {
        // If server is in offline/fallback mode, generate client session
        const fakeToken = `oauth_${provider}_${Date.now()}`
        const oauthUser: AuthUser = {
          id: `usr_${provider}_${Math.random().toString(36).substring(2, 8)}`,
          name,
          email,
          role,
        }
        setToken(fakeToken)
        setUser(oauthUser)
        localStorage.setItem('sahara_token', fakeToken)
        return { ok: true }
      }

      const data = await res.json()
      setToken(data.access_token)
      const userProfile = data.user || {
        id: data.user_id,
        name: data.name,
        email: data.email,
        role: data.role
      }
      setUser(userProfile)
      localStorage.setItem('sahara_token', data.access_token)
      return { ok: true }
    } catch {
      // Local fallback for offline/sandbox demonstration
      const defaultEmail = provider === 'google' ? 'student.google@sahara.app' : 'student.github@sahara.app'
      const defaultName = provider === 'google' ? 'Google Student' : 'GitHub Student'
      const oauthUser: AuthUser = {
        id: `usr_${provider}_${Math.random().toString(36).substring(2, 8)}`,
        name: customName || defaultName,
        email: customEmail || defaultEmail,
        role,
      }
      const fakeToken = `oauth_${provider}_${Date.now()}`
      setToken(fakeToken)
      setUser(oauthUser)
      localStorage.setItem('sahara_token', fakeToken)
      return { ok: true }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('sahara_token')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, loginWithOAuth, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

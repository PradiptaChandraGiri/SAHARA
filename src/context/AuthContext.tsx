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

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('sahara_token')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

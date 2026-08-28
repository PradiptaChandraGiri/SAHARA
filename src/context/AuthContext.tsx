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
  loginWithOAuth: (provider: 'google' | 'github') => void
  devLogin: (role: Role) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

import { API_BASE } from '../config'

export const API_BASE_URL = API_BASE

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      })
      if (res.ok) {
        const data = await res.json()
        setUser({
          id: data.id,
          name: data.display_name || data.name || 'User',
          email: data.email,
          role: data.role || 'student',
        })
      } else {
        setUser(null)
      }
    } catch (err) {
      console.warn('Could not verify active session:', err)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Restore session on load via real GET /auth/me
  useEffect(() => {
    refreshUser()
  }, [])

  const loginWithOAuth = (provider: 'google' | 'github') => {
    window.location.href = `${API_BASE_URL}/auth/${provider}`
  }

  // Developer helper for switching/testing roles quickly
  const devLogin = async (role: Role) => {
    try {
      window.location.href = `${API_BASE_URL}/auth/google`
    } catch {
      setUser({
        id: `dev_${role}_${Date.now()}`,
        name: role === 'admin' ? 'System Administrator' : role === 'counselor' ? 'Campus Counselor' : 'Student',
        email: `${role}@sahara.app`,
        role,
      })
    }
  }

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (err) {
      console.warn('Logout request failed:', err)
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem('sahara_token')
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, loginWithOAuth, devLogin, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

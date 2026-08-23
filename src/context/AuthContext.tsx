import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'counselor' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, role: 'student' | 'counselor' | 'admin') => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_URL || 'https://sahara-951p.onrender.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sahara_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('sahara_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          localStorage.setItem('sahara_user', JSON.stringify(data));
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.warn('Auth check skipped (offline or network error):', err);
      } finally {
        setIsLoading(false);
      }
    };
    verifySession();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.detail || 'Invalid email or password' };
      }
      const loggedUser: User = {
        id: data.user_id,
        name: data.name,
        email: data.email,
        role: data.role
      };
      setUser(loggedUser);
      setToken(data.access_token);
      localStorage.setItem('sahara_token', data.access_token);
      localStorage.setItem('sahara_user', JSON.stringify(loggedUser));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Cannot reach authentication server. Please check connection.' };
    }
  };

  const register = async (name: string, email: string, password: string, role: 'student' | 'counselor' | 'admin') => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.detail || 'Registration failed' };
      }
      const loggedUser: User = {
        id: data.user_id,
        name: data.name,
        email: data.email,
        role: data.role
      };
      setUser(loggedUser);
      setToken(data.access_token);
      localStorage.setItem('sahara_token', data.access_token);
      localStorage.setItem('sahara_user', JSON.stringify(loggedUser));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Registration server error.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sahara_token');
    localStorage.removeItem('sahara_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

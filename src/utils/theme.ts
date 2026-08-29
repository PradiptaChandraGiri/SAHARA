// src/utils/theme.ts
export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'sahara-theme'

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function getSavedTheme(): Theme | null {
  if (typeof window === 'undefined') return null
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved
    }
  } catch (err) {
    console.warn('Error reading theme from localStorage:', err)
  }
  return null
}

export function setSavedTheme(theme: Theme): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch (err) {
    console.warn('Error writing theme to localStorage:', err)
  }
}

/**
 * Returns initial theme based on user role and saved preference.
 * - Explicit saved preference in localStorage takes precedence.
 * - If no saved preference: Counselors & Admins default to 'dark', Students & Visitors default to 'light'.
 */
export function getInitialTheme(userRole?: string): Theme {
  const saved = getSavedTheme()
  if (saved) return saved
  return userRole === 'counselor' || userRole === 'admin' ? 'dark' : 'light'
}

export function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === 'system') {
    return getSystemTheme()
  }
  return theme
}

export function applyTheme(theme: Theme): ResolvedTheme {
  const resolved = resolveTheme(theme)
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', resolved)
    // Also toggle the 'dark' CSS class for tailwind dark: variants if used
    if (resolved === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  return resolved
}

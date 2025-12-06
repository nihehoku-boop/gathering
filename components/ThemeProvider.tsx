'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

type ThemeMode = 'dark' | 'light'

interface ThemeContextType {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [theme, setThemeState] = useState<ThemeMode>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load theme from localStorage first (for immediate UI update)
    const savedTheme = localStorage.getItem('themeMode') as ThemeMode
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setThemeState(savedTheme)
      applyTheme(savedTheme)
    } else {
      // Load from user profile if available
      loadThemeFromProfile()
    }
  }, [session])

  const loadThemeFromProfile = async () => {
    try {
      const res = await fetch('/api/user/profile')
      if (res.ok) {
        const data = await res.json()
        const userTheme = data.themeMode || 'dark'
        setThemeState(userTheme as ThemeMode)
        applyTheme(userTheme as ThemeMode)
        // Sync to localStorage
        localStorage.setItem('themeMode', userTheme)
      }
    } catch (error) {
      console.error('Error loading theme from profile:', error)
      // Fallback to dark
      setThemeState('dark')
      applyTheme('dark')
    }
  }

  const applyTheme = (newTheme: ThemeMode) => {
    const root = document.documentElement
    if (newTheme === 'light') {
      root.classList.add('light')
      root.classList.remove('dark')
    } else {
      root.classList.add('dark')
      root.classList.remove('light')
    }
  }

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme)
    applyTheme(newTheme)
    localStorage.setItem('themeMode', newTheme)
    
    // Save to user profile if logged in
    if (session?.user?.id) {
      try {
        await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ themeMode: newTheme }),
        })
      } catch (error) {
        console.error('Error saving theme to profile:', error)
      }
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}


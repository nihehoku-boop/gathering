'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

const adjustBrightness = (color: string, percent: number) => {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max(0, Math.min(255, (num >> 16) + amt))
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt))
  const B = Math.max(0, Math.min(255, (num & 0x000FF) + amt))
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
}

const hexToHsl = (hex: string): string => {
  const r = parseInt(hex.substring(1, 3), 16) / 255
  const g = parseInt(hex.substring(3, 5), 16) / 255
  const b = parseInt(hex.substring(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

export default function AccentColorLoader() {
  const { data: session } = useSession()

  useEffect(() => {
    if (!session?.user?.id) return

    // Load accent color from user profile
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => {
        const accentColor = data.accentColor || '#34C759'
        
        // Apply accent color to CSS variables
        document.documentElement.style.setProperty('--accent-color', accentColor)
        document.documentElement.style.setProperty('--accent-color-hover', adjustBrightness(accentColor, -20))
        
        // Also update ring color to match accent color (for focus states)
        const accentHsl = hexToHsl(accentColor)
        document.documentElement.style.setProperty('--ring', accentHsl)
        
        // Also update localStorage for faster subsequent loads
        try {
          localStorage.setItem('accentColor', accentColor)
        } catch (e) {
          // Ignore localStorage errors
        }
      })
      .catch(err => {
        console.error('Error loading accent color:', err)
        // Fallback to localStorage if API fails
        try {
          const savedColor = localStorage.getItem('accentColor')
          if (savedColor) {
            document.documentElement.style.setProperty('--accent-color', savedColor)
            document.documentElement.style.setProperty('--accent-color-hover', adjustBrightness(savedColor, -20))
            const accentHsl = hexToHsl(savedColor)
            document.documentElement.style.setProperty('--ring', accentHsl)
          }
        } catch (e) {
          // Ignore localStorage errors
        }
      })
  }, [session])

  return null
}

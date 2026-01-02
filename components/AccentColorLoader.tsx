'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

const adjustBrightness = (color: string, percent: number) => {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max(0, Math.min(255, (num >> 16) + amt))
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt))
  const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt))
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
}

const applyAccentColor = (color: string) => {
  const accentColorHover = adjustBrightness(color, -20)
  document.documentElement.style.setProperty('--accent-color', color)
  document.documentElement.style.setProperty('--accent-color-hover', accentColorHover)
  // Also store in localStorage as cache
  localStorage.setItem('accentColor', color)
}

export default function AccentColorLoader() {
  const { data: session } = useSession()

  useEffect(() => {
    const loadAccentColor = async () => {
      // First, try to load from localStorage (instant, no flash)
      const cachedColor = localStorage.getItem('accentColor')
      if (cachedColor) {
        applyAccentColor(cachedColor)
      }

      // Then fetch from API to get the latest value
      if (session?.user?.id) {
        try {
          const res = await fetch('/api/user/profile', {
            cache: 'no-store', // Always fetch fresh data
          })
          if (res.ok) {
            const profile = await res.json()
            if (profile.accentColor) {
              // Only update if different from cache
              if (profile.accentColor !== cachedColor) {
                applyAccentColor(profile.accentColor)
              }
            }
          }
        } catch (error) {
          console.error('Error loading accent color:', error)
          // If API fails and we have cached color, keep using it
          // If no cache, fallback to session or default
          if (!cachedColor) {
            const fallbackColor = session?.user?.accentColor || '#34C759'
            applyAccentColor(fallbackColor)
          }
        }
      } else if (!cachedColor) {
        // Not logged in and no cache, use default
        applyAccentColor('#34C759')
      }
    }

    // Load immediately
    loadAccentColor()
  }, [session])

  return null // This component doesn't render anything
}


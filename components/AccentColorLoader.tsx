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

export default function AccentColorLoader() {
  const { data: session } = useSession()

  useEffect(() => {
    const loadAccentColor = async () => {
      let accentColor = '#FFD60A' // Default

      // Always fetch from API if user is logged in to get the latest value
      // (session might be cached and not reflect recent changes)
      if (session?.user?.id) {
        try {
          const res = await fetch('/api/user/profile')
          if (res.ok) {
            const profile = await res.json()
            if (profile.accentColor) {
              accentColor = profile.accentColor
            }
          }
        } catch (error) {
          console.error('Error loading accent color:', error)
          // Fallback to session if API fails
          if (session?.user?.accentColor) {
            accentColor = session.user.accentColor
          }
        }
      } else if (session?.user?.accentColor) {
        // If not logged in but have session data, use it
        accentColor = session.user.accentColor
      }

      // Apply the accent color
      const accentColorHover = adjustBrightness(accentColor, -20)
      document.documentElement.style.setProperty('--accent-color', accentColor)
      document.documentElement.style.setProperty('--accent-color-hover', accentColorHover)
    }

    // Load immediately if session is available, otherwise wait for it
    if (session !== undefined) {
      loadAccentColor()
    }
  }, [session])

  return null // This component doesn't render anything
}


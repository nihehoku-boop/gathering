'use client'

import { useState, useEffect } from 'react'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { getStoredConsent } from './CookieConsentBanner'

/**
 * Renders Vercel Analytics and Speed Insights only when the user has given
 * cookie consent ("Accept all"). Enables Sentry error monitoring after consent.
 * Complies with EU ePrivacy / cookie consent.
 */
export default function GatedAnalytics() {
  const [consent, setConsent] = useState<ReturnType<typeof getStoredConsent>>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setConsent(getStoredConsent())
    setMounted(true)
  }, [])

  useEffect(() => {
    const handler = () => setConsent(getStoredConsent())
    window.addEventListener('cookieConsentUpdated', handler)
    return () => window.removeEventListener('cookieConsentUpdated', handler)
  }, [])

  // Enable Sentry when user has consented (client was inited with enabled: false)
  useEffect(() => {
    if (consent !== 'all') return
    try {
      const Sentry = require('@sentry/nextjs')
      const client = Sentry.getClient()
      if (client?.getOptions) {
        client.getOptions().enabled = true
      }
    } catch {
      // Sentry not available or not configured
    }
  }, [consent])

  if (!mounted || consent !== 'all') return null

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  )
}

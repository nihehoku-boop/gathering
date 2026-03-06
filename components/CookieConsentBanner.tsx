'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export const CONSENT_KEY = 'colletro_cookie_consent'
export type ConsentValue = 'all' | 'essential' | null

export function getStoredConsent(): ConsentValue {
  if (typeof window === 'undefined') return null
  try {
    const v = localStorage.getItem(CONSENT_KEY)
    if (v === 'all' || v === 'essential') return v
    return null
  } catch {
    return null
  }
}

export default function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false)
  const [consent, setConsent] = useState<ConsentValue>(null)

  useEffect(() => {
    setConsent(getStoredConsent())
    setMounted(true)
  }, [])

  const save = (value: 'all' | 'essential') => {
    try {
      localStorage.setItem(CONSENT_KEY, value)
      setConsent(value)
      // Notify other components (e.g. gated analytics) to re-check
      window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: value }))
    } catch {
      setConsent(value)
    }
  }

  if (!mounted || consent !== null) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="max-w-4xl mx-auto rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-lg p-4 sm:p-5 text-[var(--text-primary)]">
        <p className="text-sm sm:text-base text-[var(--text-secondary)] mb-4">
          We use cookies and similar technologies for essential functionality, analytics, and to improve the service. By clicking &quot;Accept all&quot; you consent to analytics and error monitoring. You can choose &quot;Essential only&quot; to use only strictly necessary cookies.{' '}
          <Link href="/cookies" className="text-[var(--accent-color)] hover:underline">
            Cookie Policy
          </Link>
        </p>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => save('essential')}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => save('all')}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-color)] text-white hover:opacity-90 smooth-transition"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}

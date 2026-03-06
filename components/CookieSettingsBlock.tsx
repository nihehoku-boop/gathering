'use client'

import { useState, useEffect } from 'react'
import { getStoredConsent, CONSENT_KEY } from './CookieConsentBanner'

export default function CookieSettingsBlock() {
  const [consent, setConsent] = useState<ReturnType<typeof getStoredConsent>>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setConsent(getStoredConsent())
    setMounted(true)
  }, [])

  const save = (value: 'all' | 'essential') => {
    try {
      localStorage.setItem(CONSENT_KEY, value)
      setConsent(value)
      window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: value }))
    } catch {
      setConsent(value)
    }
  }

  if (!mounted) return null

  return (
    <section className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] p-4 sm:p-5">
      <h2 className="text-xl font-semibold text-[#fafafa] mb-2">Your cookie choice</h2>
      <p className="text-sm text-[#969696] mb-4">
        {consent === null
          ? 'You have not yet made a choice. Use the buttons below to accept or restrict cookies.'
          : consent === 'all'
            ? 'You have accepted all cookies (analytics and performance). You can change this below.'
            : 'You are using essential cookies only. You can change this below.'}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => save('essential')}
          className={`px-4 py-2 rounded-lg text-sm font-medium border smooth-transition ${
            consent === 'essential'
              ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10 text-[var(--accent-color)]'
              : 'border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
          }`}
        >
          Essential only
        </button>
        <button
          type="button"
          onClick={() => save('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium border smooth-transition ${
            consent === 'all'
              ? 'border-[var(--accent-color)] bg-[var(--accent-color)] text-white'
              : 'border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
          }`}
        >
          Accept all
        </button>
      </div>
    </section>
  )
}

'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Capture error to Sentry
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error)
    }
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-semibold text-[var(--text-primary)] mb-4 tracking-tight">Something went wrong!</h1>
        <p className="text-[var(--text-secondary)] mb-8 text-lg">
          {error.message || 'An unexpected error occurred'}
        </p>
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={reset}
            className="bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white smooth-transition"
          >
            Try again
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition"
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  )
}


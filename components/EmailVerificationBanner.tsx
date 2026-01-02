'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { AlertCircle, Mail, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function EmailVerificationBanner() {
  const { data: session, update } = useSession()
  const [isDismissed, setIsDismissed] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  // Check if email is verified
  const emailVerified = session?.user?.emailVerified
  const isEmailVerified = !!emailVerified

  // Check if banner was dismissed in localStorage
  useEffect(() => {
    if (session?.user?.id) {
      const dismissedKey = `email_verification_dismissed_${session.user.id}`
      const dismissed = localStorage.getItem(dismissedKey) === 'true'
      setIsDismissed(dismissed)
    }
  }, [session?.user?.id])

  // Don't show if email is verified or banner is dismissed
  if (isEmailVerified || isDismissed || !session?.user) {
    return null
  }

  const handleDismiss = () => {
    if (session?.user?.id) {
      const dismissedKey = `email_verification_dismissed_${session.user.id}`
      localStorage.setItem(dismissedKey, 'true')
      setIsDismissed(true)
    }
  }

  const handleResendVerification = async () => {
    if (!session?.user?.email) return

    setResending(true)
    setResendSuccess(false)

    try {
      const response = await fetch('/api/auth/verify-email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email }),
      })

      const data = await response.json()

      if (response.ok) {
        setResendSuccess(true)
        setTimeout(() => setResendSuccess(false), 5000)
      } else {
        console.error('Failed to send verification email:', data.error)
      }
    } catch (error) {
      console.error('Error sending verification email:', error)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/50 px-4 sm:px-6 py-3">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-500">
              Please verify your email address
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Check your inbox for a verification link to unlock all features.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            onClick={handleResendVerification}
            disabled={resending || resendSuccess}
            size="sm"
            variant="outline"
            className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10 text-xs sm:text-sm"
          >
            {resending ? (
              <>
                <Mail className="mr-1.5 h-3 w-3 animate-pulse" />
                Sending...
              </>
            ) : resendSuccess ? (
              <>
                <Mail className="mr-1.5 h-3 w-3" />
                Sent!
              </>
            ) : (
              <>
                <Mail className="mr-1.5 h-3 w-3" />
                Resend
              </>
            )}
          </Button>
          <Button
            onClick={handleDismiss}
            size="sm"
            variant="ghost"
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 h-8 w-8"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}


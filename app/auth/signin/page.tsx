'use client'

import { signIn } from 'next-auth/react'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Lock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [showVerificationMessage, setShowVerificationMessage] = useState(false)

  // Check if user was redirected from signup
  const fromSignup = searchParams.get('from') === 'signup'
  const verifyEmail = searchParams.get('verify') === 'true'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setShowVerificationMessage(false)
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.ok) {
        router.push('/')
        router.refresh()
      } else {
        setError('Invalid email or password')
      }
    } catch (error) {
      console.error('Sign in error:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address first')
      return
    }

    setResending(true)
    setResendSuccess(false)
    setError('')

    try {
      const response = await fetch('/api/auth/verify-email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setResendSuccess(true)
        setShowVerificationMessage(true)
        setTimeout(() => setResendSuccess(false), 5000)
      } else {
        setError(data.error || 'Failed to send verification email')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
      <Card className="w-full max-w-md bg-[var(--bg-secondary)] border-[var(--border-color)] shadow-2xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-semibold text-center text-[var(--text-primary)] tracking-tight">
            Welcome to Sammlerei
          </CardTitle>
          <CardDescription className="text-center text-[var(--text-secondary)]">
            Sign in to manage your collections
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(fromSignup || verifyEmail) && (
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/50 rounded-lg text-blue-500 text-sm">
              <p className="font-medium mb-1">Please verify your email</p>
              <p>We've sent a verification link to your email. Please check your inbox and click the link to activate your account.</p>
            </div>
          )}
          {showVerificationMessage && (
            <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/50 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-amber-500 mb-2">Email not verified</p>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    Your email address hasn't been verified yet. Please check your inbox for the verification link.
                  </p>
                  <Button
                    onClick={handleResendVerification}
                    disabled={resending || resendSuccess}
                    size="sm"
                    variant="outline"
                    className="w-full border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
                  >
                    {resending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : resendSuccess ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Email sent!
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Resend verification email
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
          {error && !showVerificationMessage && (
            <div className="mb-4 p-3 bg-[#FF3B30]/10 border border-[#FF3B30]/50 rounded-lg flex items-center gap-2 text-[#FF3B30] text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[var(--text-primary)]">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] smooth-transition"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[var(--text-primary)]">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] smooth-transition"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full accent-button text-white smooth-transition font-medium" 
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-6 space-y-3 text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              Don't have an account?{' '}
              <Link 
                href="/auth/signup" 
                className="text-[var(--accent-color)] hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              <Link 
                href="/auth/forgot-password" 
                className="text-[var(--accent-color)] hover:underline font-medium"
              >
                Forgot your password?
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
        <Card className="w-full max-w-md bg-[var(--bg-secondary)] border-[var(--border-color)] shadow-2xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl font-semibold text-center text-[var(--text-primary)] tracking-tight">
              Welcome to Sammlerei
            </CardTitle>
            <CardDescription className="text-center text-[var(--text-secondary)]">
              Loading...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}

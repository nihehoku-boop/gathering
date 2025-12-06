'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [token, setToken] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    const emailParam = searchParams.get('email')
    
    if (tokenParam && emailParam) {
      setToken(tokenParam)
      setEmail(emailParam)
    } else {
      setError('Invalid reset link. Please request a new password reset.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/auth/signin')
        }, 2000)
      } else {
        setError(data.error || 'Failed to reset password')
      }
    } catch (error) {
      console.error('Reset password error:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
        <Card className="w-full max-w-md bg-[var(--bg-secondary)] border-[var(--border-color)] shadow-2xl">
          <CardContent className="py-16 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-6" />
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
              Password Reset Successful
            </h3>
            <p className="text-[var(--text-secondary)] mb-6">
              Your password has been reset successfully. Redirecting to sign in...
            </p>
            <Link href="/auth/signin">
              <Button className="bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white smooth-transition">
                Go to Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
      <Card className="w-full max-w-md bg-[var(--bg-secondary)] border-[var(--border-color)] shadow-2xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-semibold text-center text-[var(--text-primary)] tracking-tight">
            Reset Password
          </CardTitle>
          <CardDescription className="text-center text-[var(--text-secondary)]">
            Enter your new password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-[#FF3B30]/10 border border-[#FF3B30]/50 rounded-lg flex items-center gap-2 text-[#FF3B30] text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[var(--text-primary)]">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-10 bg-[#2a2d35] border-[#353842] text-[var(--text-primary)] placeholder:text-[#666] focus:border-[var(--accent-color)] smooth-transition"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[var(--text-primary)]">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-10 bg-[#2a2d35] border-[#353842] text-[var(--text-primary)] placeholder:text-[#666] focus:border-[var(--accent-color)] smooth-transition"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full accent-button text-white smooth-transition font-medium" 
              disabled={loading || !token || !email}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              Remember your password?{' '}
              <Link 
                href="/auth/signin" 
                className="text-[var(--accent-color)] hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
        <Card className="w-full max-w-md bg-[var(--bg-secondary)] border-[var(--border-color)] shadow-2xl">
          <CardContent className="py-16 text-center">
            <p className="text-[var(--text-secondary)]">Loading...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}


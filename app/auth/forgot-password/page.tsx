'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
      } else {
        setError(data.error || 'Failed to send reset email')
      }
    } catch (error) {
      console.error('Forgot password error:', error)
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
              Check Your Email
            </h3>
            <p className="text-[var(--text-secondary)] mb-6">
              If an account with that email exists, we've sent a password reset link. Please check your email and follow the instructions.
            </p>
            <div className="space-y-3">
              <Link href="/auth/signin">
                <Button className="w-full bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white smooth-transition">
                  Back to Sign In
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  setSuccess(false)
                  setEmail('')
                }}
                className="w-full border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition"
              >
                Send Another Email
              </Button>
            </div>
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
            Forgot Password
          </CardTitle>
          <CardDescription className="text-center text-[var(--text-secondary)]">
            Enter your email address and we'll send you a link to reset your password
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
                  className="pl-10 bg-[#2a2d35] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[#666] focus:border-[var(--accent-color)] smooth-transition"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full accent-button text-white smooth-transition font-medium" 
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/auth/signin">
              <Button
                variant="ghost"
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] smooth-transition"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


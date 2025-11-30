'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name: name || undefined,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/auth/signin')
        }, 2000)
      } else {
        setError(data.error || 'Failed to create account')
      }
    } catch (error) {
      console.error('Sign up error:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1114] px-4">
      <Card className="w-full max-w-md bg-[#1a1d24] border-[#2a2d35] shadow-2xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-semibold text-center text-[#fafafa] tracking-tight">
            Create Account
          </CardTitle>
          <CardDescription className="text-center text-[#969696]">
            Sign up to start collecting
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-16 w-16 text-[var(--accent-color)] mb-4" />
              <h3 className="text-xl font-semibold text-[#fafafa] mb-2">
                Account Created!
              </h3>
              <p className="text-[#969696]">
                Redirecting to sign in...
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-[#FF3B30]/10 border border-[#FF3B30]/50 rounded-lg flex items-center gap-2 text-[#FF3B30] text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#fafafa]">Name (optional)</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#969696]" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 bg-[#2a2d35] border-[#353842] text-[#fafafa] placeholder:text-[#666] focus:border-[var(--accent-color)] smooth-transition"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#fafafa]">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#969696]" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 bg-[#2a2d35] border-[#353842] text-[#fafafa] placeholder:text-[#666] focus:border-[var(--accent-color)] smooth-transition"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#fafafa]">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#969696]" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="pl-10 bg-[#2a2d35] border-[#353842] text-[#fafafa] placeholder:text-[#666] focus:border-[var(--accent-color)] smooth-transition"
                    />
                  </div>
                  <p className="text-xs text-[#969696]">
                    Password must be at least 6 characters long
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[#fafafa]">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#969696]" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pl-10 bg-[#2a2d35] border-[#353842] text-[#fafafa] placeholder:text-[#666] focus:border-[var(--accent-color)] smooth-transition"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full accent-button text-white smooth-transition font-medium" 
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Sign Up'}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-sm text-[#969696]">
                  Already have an account?{' '}
                  <Link 
                    href="/auth/signin" 
                    className="text-[var(--accent-color)] hover:underline font-medium"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}




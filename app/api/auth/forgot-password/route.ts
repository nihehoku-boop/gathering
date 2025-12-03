import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { withRateLimit } from '@/lib/rate-limit-middleware'
import { rateLimitConfigs } from '@/lib/rate-limit'

async function forgotPasswordHandler(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Always return success to prevent email enumeration
    // In production, you would send an email here
    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex')
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Store reset token in database
      // Note: In a real implementation, you'd store this in a separate table
      // For now, we'll use a simple approach with the VerificationToken model
      await prisma.verificationToken.upsert({
        where: {
          identifier_token: {
            identifier: `password-reset:${user.id}`,
            token: resetToken,
          },
        },
        update: {
          token: resetToken,
          expires: resetTokenExpiry,
        },
        create: {
          identifier: `password-reset:${user.id}`,
          token: resetToken,
          expires: resetTokenExpiry,
        },
      })

      // In production, send email with reset link
      // For now, we'll return the token in development
      // In production, remove this and send email instead
      const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Password reset link (DEV ONLY):', resetLink)
      }

      // TODO: Send email with reset link
      // await sendPasswordResetEmail(user.email, resetLink)
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    })
  } catch (error) {
    console.error('Error in forgot password:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = withRateLimit(forgotPasswordHandler, rateLimitConfigs.passwordReset)


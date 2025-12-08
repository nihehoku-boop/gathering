import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { withRateLimit } from '@/lib/rate-limit-middleware'
import { rateLimitConfigs } from '@/lib/rate-limit'
import { sendVerificationEmail } from '@/lib/email'
import { logger } from '@/lib/logger'

async function sendVerificationEmailHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, emailVerified: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      )
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Store verification token in database
    await prisma.verificationToken.upsert({
      where: {
        identifier_token: {
          identifier: `email-verification:${user.id}`,
          token: verificationToken,
        },
      },
      update: {
        token: verificationToken,
        expires: tokenExpiry,
      },
      create: {
        identifier: `email-verification:${user.id}`,
        token: verificationToken,
        expires: tokenExpiry,
      },
    })

    // Generate verification link
    const verificationLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`
    
    // Send verification email
    const emailResult = await sendVerificationEmail(
      user.email,
      verificationLink,
      user.name || undefined
    )

    if (!emailResult.success) {
      logger.error('Failed to send verification email:', emailResult.error)
      // In development, log the link as fallback
      if (process.env.NODE_ENV === 'development') {
        console.log('Verification link (DEV fallback):', verificationLink)
      }
      // Still return success to user (don't reveal email service issues)
    }

    return NextResponse.json({
      message: 'Verification email sent successfully',
    })
  } catch (error) {
    logger.error('Error sending verification email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = withRateLimit(sendVerificationEmailHandler, rateLimitConfigs.auth)


import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { withRateLimit } from '@/lib/rate-limit-middleware'
import { rateLimitConfigs } from '@/lib/rate-limit'
import { sendWelcomeEmail, sendVerificationEmail } from '@/lib/email'
import { logger } from '@/lib/logger'

async function registerHandler(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
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

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Store verification token in database
    await prisma.verificationToken.create({
      data: {
        identifier: `email-verification:${user.id}`,
        token: verificationToken,
        expires: tokenExpiry,
      },
    })

    // Generate verification link
    const verificationLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`

    // Send verification email (non-blocking)
    sendVerificationEmail(user.email, verificationLink, user.name || undefined).catch((error) => {
      logger.error('Failed to send verification email:', error)
      // In development, log the link as fallback
      if (process.env.NODE_ENV === 'development') {
        console.log('Verification link (DEV fallback):', verificationLink)
      }
    })

    // Send welcome email (non-blocking, after verification email)
    sendWelcomeEmail(user.email, user.name || undefined).catch((error) => {
      logger.error('Failed to send welcome email:', error)
      // Don't fail registration if email fails
    })

    return NextResponse.json(
      { 
        message: 'User created successfully. Please check your email to verify your account.',
        user 
      },
      { status: 201 }
    )
  } catch (error) {
    logger.error('Error registering user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = withRateLimit(registerHandler, rateLimitConfigs.registration)




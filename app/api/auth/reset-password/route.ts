import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { withRateLimit } from '@/lib/rate-limit-middleware'
import { rateLimitConfigs } from '@/lib/rate-limit'

async function resetPasswordHandler(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, email, password } = body

    if (!token || !email || !password) {
      return NextResponse.json(
        { error: 'Token, email, and password are required' },
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

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid reset token or email' },
        { status: 400 }
      )
    }

    // Verify token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: `password-reset:${user.id}`,
          token,
        },
      },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: `password-reset:${user.id}`,
            token,
          },
        },
      })
      return NextResponse.json(
        { error: 'Reset token has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    // Delete used token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: `password-reset:${user.id}`,
          token,
        },
      },
    })

    return NextResponse.json({
      message: 'Password has been reset successfully',
    })
  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = withRateLimit(resetPasswordHandler, rateLimitConfigs.auth)


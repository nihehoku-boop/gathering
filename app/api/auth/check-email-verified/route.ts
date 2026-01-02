import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withRateLimit } from '@/lib/rate-limit-middleware'
import { rateLimitConfigs } from '@/lib/rate-limit'

async function checkEmailVerifiedHandler(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { emailVerified: true },
    })

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({ verified: false })
    }

    return NextResponse.json({
      verified: !!user.emailVerified,
    })
  } catch (error) {
    console.error('Error checking email verification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = withRateLimit(checkEmailVerifiedHandler, rateLimitConfigs.auth)


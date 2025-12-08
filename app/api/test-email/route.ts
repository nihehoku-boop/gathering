import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { sendVerificationEmail } from '@/lib/email'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { isUserAdmin } = await import('@/lib/user-cache')
    const isAdmin = await isUserAdmin(session.user.id)
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin only' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, testType = 'verification' } = body

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

    // Check environment variables
    const hasApiKey = !!process.env.RESEND_API_KEY
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Gathering <onboarding@resend.dev>'
    const nextAuthUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    // Generate test verification link
    const testToken = 'test-token-' + Date.now()
    const verificationLink = `${nextAuthUrl}/auth/verify-email?token=${testToken}&email=${encodeURIComponent(email)}`

    // Send test email
    const result = await sendVerificationEmail(
      email,
      verificationLink,
      session.user.name || undefined
    )

    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? 'Test email sent successfully' 
        : 'Failed to send test email',
      error: result.error,
      debug: {
        hasApiKey,
        apiKeyLength: process.env.RESEND_API_KEY?.length || 0,
        apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 3) || 'N/A',
        fromEmail,
        nextAuthUrl,
        testType,
      },
    })
  } catch (error) {
    logger.error('Error in test email endpoint:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return configuration status (no sensitive data)
  const hasApiKey = !!process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Gathering <onboarding@resend.dev>'
  const nextAuthUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  return NextResponse.json({
    configured: hasApiKey,
    fromEmail,
    nextAuthUrl,
    apiKeyLength: process.env.RESEND_API_KEY?.length || 0,
    apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 3) || 'N/A',
  })
}


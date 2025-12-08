import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { withRateLimit } from '@/lib/rate-limit-middleware'
import { rateLimitConfigs } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

async function deleteAccountHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { confirmEmail, password } = body

    if (!confirmEmail || !password) {
      return NextResponse.json(
        { error: 'Email confirmation and password are required' },
        { status: 400 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, password: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify email matches
    if (user.email.toLowerCase() !== confirmEmail.toLowerCase()) {
      return NextResponse.json(
        { error: 'Email does not match' },
        { status: 400 }
      )
    }

    // Verify password
    if (!user.password) {
      return NextResponse.json(
        { error: 'Password verification not available for this account' },
        { status: 400 }
      )
    }

    const bcrypt = await import('bcryptjs')
    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Delete all verification tokens for this user
    // These use patterns like "email-verification:userId" or "password-reset:userId"
    await prisma.verificationToken.deleteMany({
      where: {
        OR: [
          { identifier: `email-verification:${user.id}` },
          { identifier: `password-reset:${user.id}` },
        ],
      },
    })

    // Delete user (cascades will handle related data)
    // Prisma will automatically delete:
    // - Accounts (onDelete: Cascade)
    // - Sessions (onDelete: Cascade)
    // - Collections -> Items (onDelete: Cascade)
    // - Folders (onDelete: Cascade)
    // - CommunityCollections -> CommunityItems (onDelete: Cascade)
    // - CommunityCollectionVotes (onDelete: Cascade)
    // - Wishlists -> WishlistItems (onDelete: Cascade)
    await prisma.user.delete({
      where: { id: user.id },
    })

    logger.info(`User account deleted: ${user.email} (${user.id})`)

    return NextResponse.json({
      message: 'Account deleted successfully',
    })
  } catch (error) {
    logger.error('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = withRateLimit(deleteAccountHandler, rateLimitConfigs.write)


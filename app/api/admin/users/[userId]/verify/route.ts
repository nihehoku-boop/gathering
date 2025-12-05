import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> | { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    })

    if (!adminUser?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Resolve params
    const resolvedParams = await Promise.resolve(params)
    const userId = resolvedParams.userId

    const body = await request.json()
    const { isVerified } = body

    if (typeof isVerified !== 'boolean') {
      return NextResponse.json(
        { error: 'isVerified must be a boolean' },
        { status: 400 }
      )
    }

    // Update user verification status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isVerified },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user verification status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


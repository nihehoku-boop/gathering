import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isPrivate: true,
        badge: true,
        accentColor: true,
        _count: {
          select: {
            collections: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get total items count
    const itemsCount = await prisma.item.count({
      where: {
        collection: {
          userId: session.user.id,
        },
      },
    })

    return NextResponse.json({
      ...user,
      collectionsCount: user._count.collections,
      itemsCount,
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, isPrivate, badge, accentColor } = body

    const updateData: any = {}
    if (name !== undefined) {
      updateData.name = name || null
    }
    if (isPrivate !== undefined) {
      updateData.isPrivate = Boolean(isPrivate)
    }
    if (badge !== undefined) {
      updateData.badge = badge || null
    }
    if (accentColor !== undefined) {
      updateData.accentColor = accentColor || '#FFD60A'
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isPrivate: true,
        badge: true,
        accentColor: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


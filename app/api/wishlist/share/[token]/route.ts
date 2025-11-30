import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get shared wishlist by token
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> | { token: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const { token } = resolvedParams

    const wishlist = await prisma.wishlist.findUnique({
      where: { shareToken: token },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            badge: true,
          },
        },
        items: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!wishlist) {
      return NextResponse.json(
        { error: 'Wishlist not found' },
        { status: 404 }
      )
    }

    if (!wishlist.isPublic) {
      return NextResponse.json(
        { error: 'Wishlist is not public' },
        { status: 403 }
      )
    }

    return NextResponse.json(wishlist)
  } catch (error) {
    console.error('Error fetching shared wishlist:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}




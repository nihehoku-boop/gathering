import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

// GET - Get user's wishlist
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const wishlist = await prisma.wishlist.findFirst({
      where: { userId: session.user.id },
      include: {
        items: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!wishlist) {
      // Create default wishlist if none exists
      const shareToken = randomBytes(16).toString('hex')
      const newWishlist = await prisma.wishlist.create({
        data: {
          userId: session.user.id,
          shareToken,
        },
        include: {
          items: true,
        },
      })
      return NextResponse.json(newWishlist)
    }

    return NextResponse.json(wishlist)
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create or update wishlist
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, isPublic } = body

    // Check if wishlist exists
    let wishlist = await prisma.wishlist.findFirst({
      where: { userId: session.user.id },
    })

    if (wishlist) {
      // Update existing wishlist
      const updateData: any = {
        name: name || wishlist.name,
        description: description !== undefined ? description : wishlist.description,
        isPublic: isPublic !== undefined ? isPublic : wishlist.isPublic,
      }
      
      // Generate shareToken if making public and token doesn't exist
      if (updateData.isPublic && !wishlist.shareToken) {
        updateData.shareToken = randomBytes(16).toString('hex')
      }
      
      wishlist = await prisma.wishlist.update({
        where: { id: wishlist.id },
        data: updateData,
        include: {
          items: {
            orderBy: { createdAt: 'desc' },
          },
        },
      })
    } else {
      // Create new wishlist
      const shareToken = randomBytes(16).toString('hex')
      wishlist = await prisma.wishlist.create({
        data: {
          userId: session.user.id,
          name: name || 'My Wishlist',
          description,
          isPublic: isPublic || false,
          shareToken,
        },
        include: {
          items: {
            orderBy: { createdAt: 'desc' },
          },
        },
      })
    }

    return NextResponse.json(wishlist)
  } catch (error) {
    console.error('Error creating/updating wishlist:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


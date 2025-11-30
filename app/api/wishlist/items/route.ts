import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'

// POST - Add items to wishlist
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { items } = body // Array of { itemId, collectionId, itemName, itemNumber, itemImage, collectionName, notes }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      )
    }

    // Get or create wishlist
    let wishlist = await prisma.wishlist.findFirst({
      where: { userId: session.user.id },
    })

    if (!wishlist) {
      const { randomBytes } = await import('crypto')
      const shareToken = randomBytes(16).toString('hex')
      wishlist = await prisma.wishlist.create({
        data: {
          userId: session.user.id,
          shareToken,
        },
      })
    }

    // Add items to wishlist
    const createdItems = await Promise.all(
      items.map((item: any) =>
        prisma.wishlistItem.create({
          data: {
            wishlistId: wishlist.id,
            itemId: item.itemId || null,
            collectionId: item.collectionId || null,
            itemName: item.itemName,
            itemNumber: item.itemNumber || null,
            itemImage: item.itemImage || null,
            collectionName: item.collectionName || null,
            notes: item.notes || null,
          },
        })
      )
    )

    return NextResponse.json({ success: true, items: createdItems })
  } catch (error) {
    console.error('Error adding items to wishlist:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Remove items from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemIds = searchParams.get('ids')?.split(',') || []

    if (itemIds.length === 0) {
      return NextResponse.json(
        { error: 'Item IDs are required' },
        { status: 400 }
      )
    }

    // Verify wishlist ownership
    const wishlist = await prisma.wishlist.findFirst({
      where: { userId: session.user.id },
    })

    if (!wishlist) {
      return NextResponse.json(
        { error: 'Wishlist not found' },
        { status: 404 }
      )
    }

    // Delete items
    await prisma.wishlistItem.deleteMany({
      where: {
        id: { in: itemIds },
        wishlistId: wishlist.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting wishlist items:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}




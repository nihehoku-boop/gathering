import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const resolvedParams = await Promise.resolve(params)
    const collectionId = resolvedParams.id

    // Verify collection exists
    const collection = await prisma.recommendedCollection.findUnique({
      where: { id: collectionId },
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { updates } = body

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Updates array is required' },
        { status: 400 }
      )
    }

    // Verify all items belong to this collection
    const itemIds = updates.map((u: { itemId: string }) => u.itemId)
    const items = await prisma.recommendedItem.findMany({
      where: {
        id: { in: itemIds },
        recommendedCollectionId: collectionId,
      },
    })

    if (items.length !== itemIds.length) {
      return NextResponse.json(
        { error: 'Some items do not belong to this collection' },
        { status: 400 }
      )
    }

    // Update all items in a transaction
    const updatePromises = updates.map((update: { itemId: string; image: string }) =>
      prisma.recommendedItem.update({
        where: { id: update.itemId },
        data: { image: update.image },
      })
    )

    const updatedItems = await prisma.$transaction(updatePromises)

    return NextResponse.json({
      success: true,
      updated: updatedItems.length,
      items: updatedItems,
    })
  } catch (error) {
    console.error('Error updating bulk images:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


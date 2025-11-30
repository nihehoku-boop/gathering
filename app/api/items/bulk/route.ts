import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"'
import { prisma } from '@/lib/prisma'

// DELETE - Delete multiple items
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { itemIds } = body

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json(
        { error: 'Item IDs array is required' },
        { status: 400 }
      )
    }

    // Verify ownership of all items
    const items = await prisma.item.findMany({
      where: { id: { in: itemIds } },
      include: {
        collection: {
          select: { userId: true },
        },
      },
    })

    const unauthorizedItems = items.filter(
      (item) => item.collection.userId !== session.user.id
    )

    if (unauthorizedItems.length > 0) {
      return NextResponse.json(
        { error: 'Unauthorized to delete some items' },
        { status: 403 }
      )
    }

    // Delete items
    await prisma.item.deleteMany({
      where: {
        id: { in: itemIds },
      },
    })

    return NextResponse.json({ success: true, deletedCount: itemIds.length })
  } catch (error) {
    console.error('Error deleting items:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update multiple items (e.g., mark as owned)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { itemIds, updates } = body // updates: { isOwned: true }

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json(
        { error: 'Item IDs array is required' },
        { status: 400 }
      )
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'Updates object is required' },
        { status: 400 }
      )
    }

    // Verify ownership of all items
    const items = await prisma.item.findMany({
      where: { id: { in: itemIds } },
      include: {
        collection: {
          select: { userId: true },
        },
      },
    })

    const unauthorizedItems = items.filter(
      (item) => item.collection.userId !== session.user.id
    )

    if (unauthorizedItems.length > 0) {
      return NextResponse.json(
        { error: 'Unauthorized to update some items' },
        { status: 403 }
      )
    }

    // Update items
    const result = await prisma.item.updateMany({
      where: {
        id: { in: itemIds },
      },
      data: updates,
    })

    return NextResponse.json({ success: true, updatedCount: result.count })
  } catch (error) {
    console.error('Error updating items:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

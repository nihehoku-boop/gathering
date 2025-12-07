import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'
import { checkAllAchievements } from '@/lib/achievement-checker'
import { withRateLimit } from '@/lib/rate-limit-middleware'
import { rateLimitConfigs } from '@/lib/rate-limit'

// DELETE - Delete multiple items
async function deleteBulkItemsHandler(request: NextRequest) {
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
      (item: { collection: { userId: string } }) => item.collection.userId !== session.user.id
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
async function updateBulkItemsHandler(request: NextRequest) {
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
      (item: { collection: { userId: string } }) => item.collection.userId !== session.user.id
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

// POST - Create multiple items (bulk import)
async function createBulkItemsHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { collectionId, items } = body

    if (!collectionId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Collection ID and items array are required' },
        { status: 400 }
      )
    }

    // Verify collection belongs to user
    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: session.user.id,
      },
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    // Create all items in a transaction
    const createdItems = await prisma.$transaction(
      items.map((item: { 
        name: string
        number?: number | null
        customFields?: Record<string, any>
      }) =>
        prisma.item.create({
          data: {
            collectionId,
            name: item.name,
            number: item.number ? parseInt(String(item.number)) : null,
            customFields: item.customFields ? JSON.stringify(item.customFields) : '{}',
          },
        })
      )
    )

    // Check and unlock achievements
    const newlyUnlocked = await checkAllAchievements(session.user.id)

    return NextResponse.json({ 
      items: createdItems, 
      count: createdItems.length,
      newlyUnlockedAchievements: newlyUnlocked,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating bulk items:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const DELETE = withRateLimit(
  deleteBulkItemsHandler,
  rateLimitConfigs.write,
  async (request) => {
    const session = await getServerSession(authOptions)
    return session?.user?.id
  }
)

export const PATCH = withRateLimit(
  updateBulkItemsHandler,
  rateLimitConfigs.write,
  async (request) => {
    const session = await getServerSession(authOptions)
    return session?.user?.id
  }
)

export const POST = withRateLimit(
  createBulkItemsHandler,
  rateLimitConfigs.write,
  async (request) => {
    const session = await getServerSession(authOptions)
    return session?.user?.id
  }
)

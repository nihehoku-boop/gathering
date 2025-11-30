import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Resolve params
    const resolvedParams = await Promise.resolve(params)
    const collectionId = resolvedParams.id

    // Get the user's collection
    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: session.user.id,
      },
      include: {
        items: {
          select: {
            name: true,
            number: true,
            image: true,
          },
        },
      },
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    // If this collection doesn't come from a recommended collection, no updates available
    if (!collection.recommendedCollectionId) {
      return NextResponse.json({
        hasUpdate: false,
        isCustomized: false,
      })
    }

    // Get the recommended collection
    const recommendedCollection = await prisma.recommendedCollection.findUnique({
      where: { id: collection.recommendedCollectionId },
      include: {
        items: {
          select: {
            name: true,
            number: true,
            image: true,
          },
        },
      },
    })

    if (!recommendedCollection) {
      return NextResponse.json({
        hasUpdate: false,
        isCustomized: false,
      })
    }

    // Check if there's an update (recommended collection was updated after last sync)
    let hasUpdate = false
    if (!collection.lastSyncedAt) {
      // If never synced, check if recommended collection has been updated since collection was created
      hasUpdate = recommendedCollection.updatedAt > collection.createdAt
    } else {
      // If synced before, check if recommended collection was updated after last sync
      const lastSynced = new Date(collection.lastSyncedAt)
      const recommendedUpdated = new Date(recommendedCollection.updatedAt)
      hasUpdate = recommendedUpdated > lastSynced
    }
    
    console.log('Update check:', {
      collectionId: collection.id,
      lastSyncedAt: collection.lastSyncedAt,
      recommendedUpdatedAt: recommendedCollection.updatedAt,
      hasUpdate,
    })

    // Check for customizations
    const isCustomized = detectCustomizations(collection, recommendedCollection)

    return NextResponse.json({
      hasUpdate,
      isCustomized,
      recommendedCollection: {
        name: recommendedCollection.name,
        description: recommendedCollection.description,
        category: recommendedCollection.category,
        coverImage: recommendedCollection.coverImage,
        coverImageAspectRatio: (recommendedCollection as any).coverImageAspectRatio || null,
        tags: recommendedCollection.tags,
        updatedAt: recommendedCollection.updatedAt,
      },
      lastSyncedAt: collection.lastSyncedAt,
    })
  } catch (error) {
    console.error('Error checking for updates:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function detectCustomizations(
  userCollection: {
    name: string
    description: string | null
    category: string | null
    coverImage: string | null
    coverImageAspectRatio?: string | null
    tags: string
    items: Array<{ name: string; number: number | null; image: string | null }>
  },
  recommendedCollection: {
    name: string
    description: string | null
    category: string | null
    coverImage: string | null
    coverImageAspectRatio?: string | null
    tags: string
    items: Array<{ name: string; number: number | null; image: string | null }>
  }
): boolean {
  // Check if name, description, category, coverImage, aspectRatio, or tags were changed
  if (
    userCollection.name !== recommendedCollection.name ||
    userCollection.description !== recommendedCollection.description ||
    userCollection.category !== recommendedCollection.category ||
    userCollection.coverImage !== recommendedCollection.coverImage ||
    (userCollection.coverImageAspectRatio || null) !== (recommendedCollection.coverImageAspectRatio || null) ||
    userCollection.tags !== recommendedCollection.tags
  ) {
    return true
  }

  // Check if items were added, removed, renamed, or had images changed
  const userItemMap = new Map(
    userCollection.items.map(item => [`${item.number || ''}-${item.name}`, item])
  )
  const recommendedItemMap = new Map(
    recommendedCollection.items.map(item => [`${item.number || ''}-${item.name}`, item])
  )

  // Check for added or removed items
  if (userItemMap.size !== recommendedItemMap.size) {
    return true
  }

  // Check if any items were renamed or had images changed
  for (const [key, recommendedItem] of recommendedItemMap.entries()) {
    const userItem = userItemMap.get(key)
    if (!userItem || userItem.name !== recommendedItem.name) {
      return true
    }
    // Check if item image changed
    const userImage = userItem.image || null
    const recommendedImage = recommendedItem.image || null
    if (userImage !== recommendedImage) {
      return true
    }
  }

  return false
}


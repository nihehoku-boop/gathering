import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'
import { checkAllAchievements } from '@/lib/achievement-checker'
import { withRateLimit } from '@/lib/rate-limit-middleware'
import { rateLimitConfigs } from '@/lib/rate-limit'
import { validateRequestBody, createCollectionSchema } from '@/lib/validation-schemas'
import { logger } from '@/lib/logger'
import { serverCache, cacheKeys } from '@/lib/server-cache'

async function getCollectionsHandler() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try to fetch from cache first
    const cacheKey = cacheKeys.userCollections(session.user.id)
    const cachedData = serverCache.get(cacheKey)
    if (cachedData) {
      const response = NextResponse.json(cachedData)
      response.headers.set('Cache-Control', 'private, s-maxage=60, stale-while-revalidate=120')
      return response
    }

    const collections = await prisma.collection.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        template: true,
        customFieldDefinitions: true,
        folderId: true,
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
        coverImage: true,
        coverImageAspectRatio: true,
        coverImageFit: true,
        tags: true,
        recommendedCollectionId: true,
        sharedToCommunityId: true,
        lastSyncedAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { items: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate owned items count efficiently in a single query
    const collectionIds = collections.map((c: { id: string }) => c.id)
    const ownedCounts = await prisma.item.groupBy({
      by: ['collectionId'],
      where: {
        collectionId: { in: collectionIds },
        isOwned: true,
      },
      _count: {
        id: true,
      },
    })

    const ownedCountMap = new Map(ownedCounts.map((item: { collectionId: string; _count: { id: number } }) => [item.collectionId, item._count.id]))

    const collectionsWithStats = collections.map((collection: { id: string; name: string; description: string | null; category: string | null; template: string | null; customFieldDefinitions: string; folderId: string | null; folder: { id: string; name: string } | null; coverImage: string | null; coverImageAspectRatio: string | null; coverImageFit: string | null; tags: string; recommendedCollectionId: string | null; lastSyncedAt: Date | null; createdAt: Date; updatedAt: Date; _count: { items: number } }) => ({
      ...collection,
      items: [], // Remove items array, we don't need it
      ownedCount: ownedCountMap.get(collection.id) || 0,
    }))

    // Cache the result (60 seconds TTL)
    serverCache.set(cacheKey, collectionsWithStats, 60 * 1000)

    const response = NextResponse.json(collectionsWithStats)
    // Add caching headers
    response.headers.set('Cache-Control', 'private, s-maxage=60, stale-while-revalidate=120')
    return response
  } catch (error) {
    logger.error('Error fetching collections:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function createCollectionHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate request body
    const validation = await validateRequestBody(request, createCollectionSchema)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }
    const { name, description, category, folderId, template, customFieldDefinitions, coverImage, coverImageAspectRatio, coverImageFit, tags, items } = validation.data

    // Validate folderId if provided
    let validatedFolderId: string | null = null
    if (folderId && folderId.trim() !== '') {
      const folder = await prisma.folder.findFirst({
        where: {
          id: folderId,
          userId: session.user.id,
        },
      })

      if (!folder) {
        return NextResponse.json(
          { error: 'Folder not found or does not belong to you' },
          { status: 400 }
        )
      }

      validatedFolderId = folderId
    }

    // Handle tags - can be array or string
    let tagsString = '[]'
    if (tags) {
      if (Array.isArray(tags)) {
        tagsString = JSON.stringify(tags)
      } else if (typeof tags === 'string') {
        try {
          const parsed = JSON.parse(tags)
          tagsString = Array.isArray(parsed) ? tags : '[]'
        } catch {
          tagsString = '[]'
        }
      }
    }

    const collection = await prisma.collection.create({
      data: {
        name,
        description: description || null,
        category: category || null,
        folderId: validatedFolderId,
        template: template || 'custom',
        customFieldDefinitions: template === 'custom' && customFieldDefinitions
          ? (typeof customFieldDefinitions === 'string' ? customFieldDefinitions : JSON.stringify(customFieldDefinitions))
          : '[]',
        coverImage: coverImage || null,
        coverImageAspectRatio: coverImageAspectRatio || null,
        coverImageFit: coverImageFit || 'contain',
        tags: tagsString,
        userId: session.user.id,
        items: items && Array.isArray(items) ? {
          create: items.map((item: any) => ({
            name: item.name || 'Unnamed Item',
            number: item.number !== undefined && item.number !== null ? (typeof item.number === 'number' ? item.number : parseInt(String(item.number))) : null,
            isOwned: item.isOwned === true || item.isOwned === 'true',
            image: item.image || null,
            notes: item.notes || null,
            wear: item.wear || null,
            personalRating: item.personalRating !== undefined && item.personalRating !== null ? (typeof item.personalRating === 'number' ? item.personalRating : parseInt(String(item.personalRating))) : null,
            logDate: item.logDate ? (item.logDate instanceof Date ? item.logDate : new Date(item.logDate)) : null,
            alternativeImages: item.alternativeImages ? (Array.isArray(item.alternativeImages) ? JSON.stringify(item.alternativeImages) : item.alternativeImages) : '[]',
          })),
        } : undefined,
      },
      include: {
        items: true,
      },
    })

    // Invalidate collections cache - new collection added
    serverCache.delete(cacheKeys.userCollections(session.user.id))

    // Check and unlock achievements (only when creating collection - relevant for collection count achievements)
    const newlyUnlocked = await checkAllAchievements(session.user.id)

    return NextResponse.json({
      ...collection,
      newlyUnlockedAchievements: newlyUnlocked,
    }, { status: 201 })
  } catch (error) {
    logger.error('Error creating collection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = withRateLimit(
  getCollectionsHandler,
  rateLimitConfigs.read,
  async () => undefined
)

export const POST = withRateLimit(
  createCollectionHandler,
  rateLimitConfigs.write,
  async (request) => {
    const session = await getServerSession(authOptions)
    return session?.user?.id
  }
)


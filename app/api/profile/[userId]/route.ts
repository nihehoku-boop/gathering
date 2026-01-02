import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> | { userId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const user = await prisma.user.findUnique({
      where: { id: resolvedParams.userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isPrivate: true,
        isVerified: true,
        badge: true,
        bio: true,
        bannerImage: true,
        profileTheme: true,
        collections: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            coverImage: true,
            tags: true,
            // Removed items array - we'll count owned items efficiently
            _count: {
              select: {
                items: true,
              },
            },
          },
          take: 10, // Limit to 10 collections for performance
          orderBy: {
            updatedAt: 'desc',
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

    // If user is private, only return basic info
    if (user.isPrivate) {
      return NextResponse.json({
        id: user.id,
        name: user.name || user.email,
        isPrivate: true,
      })
    }

    // Optimize: Use groupBy to count owned items efficiently instead of loading all items
    const collectionIds = user.collections.map((c: { id: string }) => c.id)
    let ownedCountsMap = new Map<string, number>()
    
    if (collectionIds.length > 0) {
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
      
      ownedCountsMap = new Map(
        ownedCounts.map((item: { collectionId: string; _count: { id: number } }) => [
          item.collectionId,
          item._count.id
        ])
      )
    }

    // Calculate collection stats efficiently
    const collectionsWithStats = user.collections.map((collection: { id: string; name: string; description: string | null; category: string | null; coverImage: string | null; tags: string; _count: { items: number } }) => {
      const ownedItems = ownedCountsMap.get(collection.id) || 0
      const totalItems = collection._count.items
      const progress = totalItems > 0 ? Math.round((ownedItems / totalItems) * 100) : 0

      return {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        category: collection.category,
        coverImage: collection.coverImage,
        tags: collection.tags,
        ownedItems,
        totalItems,
        progress,
      }
    })

    // Sort by owned items and get top 3
    const topCollections = collectionsWithStats
      .sort((a: { ownedItems: number }, b: { ownedItems: number }) => b.ownedItems - a.ownedItems)
      .slice(0, 3)

    // Calculate total stats
    const totalItems = collectionsWithStats.reduce((sum: number, c: { totalItems: number }) => sum + c.totalItems, 0)
    const totalOwnedItems = collectionsWithStats.reduce((sum: number, c: { ownedItems: number }) => sum + c.ownedItems, 0)

    const response = NextResponse.json({
      id: user.id,
      name: user.name || user.email,
      email: user.email,
      image: user.image,
      isVerified: user.isVerified,
      badge: user.badge,
      bio: user.bio,
      bannerImage: user.bannerImage,
      profileTheme: user.profileTheme,
      topCollections,
      totalCollections: user.collections.length,
      totalItems,
      totalOwnedItems,
      // Note: Only showing top 10 collections for performance. Use pagination endpoint for more.
      collectionsShown: Math.min(user.collections.length, 10),
    })
    // Cache public profiles for 5 minutes (profiles don't change frequently)
    // Private profiles are not cached (returned early above)
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return response
  } catch (error) {
    logger.error('Error fetching public profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}




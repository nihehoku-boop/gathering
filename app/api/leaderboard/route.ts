import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Cache leaderboard data for 5 minutes
// This reduces database load significantly since leaderboard doesn't change frequently
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds
let cachedLeaderboard: any[] | null = null
let cacheTimestamp: number = 0

export async function GET() {
  try {
    // Check if we have valid cached data
    const now = Date.now()
    if (cachedLeaderboard && (now - cacheTimestamp) < CACHE_DURATION) {
      const response = NextResponse.json(cachedLeaderboard)
      // Add cache headers for client-side caching
      response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
      return response
    }

    // Optimized query: Get users and aggregate item counts efficiently
    const users = await prisma.user.findMany({
      where: {
        isPrivate: false, // Only show public users
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isVerified: true,
        badge: true,
        collections: {
          select: {
            id: true,
            _count: {
              select: {
                items: true,
              },
            },
          },
        },
      },
    })

    // Get owned item counts efficiently using Prisma's groupBy
    const collectionIds = users.flatMap((u: { collections: { id: string }[] }) => u.collections.map((c: { id: string }) => c.id))
    
    if (collectionIds.length === 0) {
      const response = NextResponse.json([])
      response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
      return response
    }

    // Use groupBy for efficient aggregation (much faster than loading all items)
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

    const ownedCountsMap = new Map(
      ownedCounts.map((item: { collectionId: string; _count: { id: number } }) => [
        item.collectionId,
        item._count.id
      ])
    )

    // Build leaderboard efficiently
    const leaderboard = users
      .map((user: { id: string; name: string | null; email: string; image: string | null; isVerified: boolean; badge: string | null; collections: { id: string; _count: { items: number } }[] }) => {
        let totalItems = 0
        let ownedItems = 0

        user.collections.forEach((collection: { id: string; _count: { items: number } }) => {
          totalItems += collection._count.items
          ownedItems += ownedCountsMap.get(collection.id) || 0
        })

        return {
          id: user.id,
          name: user.name || user.email,
          email: user.email,
          image: user.image,
          isVerified: user.isVerified,
          badge: user.badge,
          totalItems,
          ownedItems,
        }
      })
      .filter((user: { totalItems: number }) => user.totalItems > 0) // Only show users with items
      .sort((a: { ownedItems: number }, b: { ownedItems: number }) => b.ownedItems - a.ownedItems) // Sort by owned items descending

    // Update cache
    cachedLeaderboard = leaderboard
    cacheTimestamp = now

    const response = NextResponse.json(leaderboard)
    // Add cache headers
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return response
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


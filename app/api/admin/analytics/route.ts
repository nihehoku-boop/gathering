import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { withRateLimit } from '@/lib/rate-limit-middleware'
import { rateLimitConfigs } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { isUserAdmin } from '@/lib/user-cache'

/**
 * Admin Analytics Endpoint
 * 
 * Provides aggregated analytics data for admin dashboard.
 * All data is anonymized and privacy-friendly.
 */
async function getAnalyticsHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const isAdmin = await isUserAdmin(session.user.id)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const url = new URL(request.url)
    const period = url.searchParams.get('period') || '30d' // 7d, 30d, 90d, all

    // Calculate date range
    const now = new Date()
    let startDate: Date
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(0) // All time
    }

    // Get analytics data in parallel
    const [
      totalUsers,
      activeUsers,
      newUsers,
      totalCollections,
      totalItems,
      totalCommunityCollections,
      totalWishlists,
      collectionsByCategory,
      itemsByCollection,
      userGrowth,
      collectionGrowth,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Active users (logged in within period)
      prisma.session.count({
        where: {
          expires: {
            gte: startDate,
          },
        },
        distinct: ['userId'],
      }),

      // New users in period
      prisma.user.count({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
      }),

      // Total collections
      prisma.collection.count(),

      // Total items
      prisma.item.count(),

      // Total community collections
      prisma.communityCollection.count({
        where: {
          isHidden: false,
        },
      }),

      // Total wishlists
      prisma.wishlist.count(),

      // Collections by category
      prisma.collection.groupBy({
        by: ['category'],
        where: {
          category: {
            not: null,
          },
        },
        _count: {
          category: true,
        },
        orderBy: {
          _count: {
            category: 'desc',
          },
        },
        take: 10,
      }),

      // Average items per collection
      prisma.collection.findMany({
        select: {
          _count: {
            select: {
              items: true,
            },
          },
        },
      }),

      // User growth (last 30 days, daily)
      prisma.user.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: {
            gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        _count: {
          id: true,
        },
      }),

      // Collection growth (last 30 days, daily)
      prisma.collection.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: {
            gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        _count: {
          id: true,
        },
      }),
    ])

    // Calculate average items per collection
    const avgItemsPerCollection =
      itemsByCollection.length > 0
        ? itemsByCollection.reduce((sum: number, c: { _count: { items: number } }) => sum + c._count.items, 0) /
          itemsByCollection.length
        : 0

    // Format collections by category
    const topCategories = collectionsByCategory.map((cat: { category: string | null; _count: { category: number } }) => ({
      category: cat.category || 'Uncategorized',
      count: cat._count.category,
    }))

    // Format growth data
    const userGrowthData = userGrowth.map((day: { createdAt: Date; _count: { id: number } }) => ({
      date: day.createdAt.toISOString().split('T')[0],
      count: day._count.id,
    }))

    const collectionGrowthData = collectionGrowth.map((day: { createdAt: Date; _count: { id: number } }) => ({
      date: day.createdAt.toISOString().split('T')[0],
      count: day._count.id,
    }))

    return NextResponse.json({
      overview: {
        totalUsers,
        activeUsers,
        newUsers,
        totalCollections,
        totalItems,
        totalCommunityCollections,
        totalWishlists,
        avgItemsPerCollection: Math.round(avgItemsPerCollection * 10) / 10,
      },
      categories: topCategories,
      growth: {
        users: userGrowthData,
        collections: collectionGrowthData,
      },
      period,
    })
  } catch (error) {
    logger.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = withRateLimit(getAnalyticsHandler, rateLimitConfigs.read)


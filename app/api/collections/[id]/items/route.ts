import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'
import { serverCache, cacheKeys } from '@/lib/server-cache'

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

    // Get query parameters for pagination and sorting
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const skip = (page - 1) * limit
    const sortBy = url.searchParams.get('sortBy') || 'number-asc'

    // Check cache first
    const cacheKey = cacheKeys.collectionItems(collectionId, page, sortBy)
    const cached = serverCache.get<{ items: any[]; pagination: any; userId: string }>(cacheKey)
    if (cached && cached.userId === session.user.id) {
      const response = NextResponse.json({
        items: cached.items,
        pagination: cached.pagination,
      })
      response.headers.set('Cache-Control', 'private, s-maxage=30, stale-while-revalidate=60')
      return response
    }

    // Verify collection belongs to user AND get count in a single query
    // This reduces 2 queries to 1
    const [collection, totalCount] = await Promise.all([
      prisma.collection.findFirst({
        where: {
          id: collectionId,
          userId: session.user.id,
        },
        select: { id: true },
      }),
      prisma.item.count({
        where: { collectionId },
      }),
    ])

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    // Build orderBy based on sortBy parameter
    // Prisma handles nulls by placing them last for desc and first for asc
    const simplifiedOrderBy: any[] = []
    switch (sortBy) {
      case 'number-asc':
        simplifiedOrderBy.push({ number: 'asc' }, { name: 'asc' })
        break
      case 'number-desc':
        simplifiedOrderBy.push({ number: 'desc' }, { name: 'desc' })
        break
      case 'name-asc':
        simplifiedOrderBy.push({ name: 'asc' })
        break
      case 'name-desc':
        simplifiedOrderBy.push({ name: 'desc' })
        break
      case 'owned':
        simplifiedOrderBy.push({ isOwned: 'desc' }, { number: 'asc' }, { name: 'asc' })
        break
      case 'not-owned':
        simplifiedOrderBy.push({ isOwned: 'asc' }, { number: 'asc' }, { name: 'asc' })
        break
      case 'rating-high':
        simplifiedOrderBy.push({ personalRating: 'desc' }, { number: 'asc' }, { name: 'asc' })
        break
      case 'rating-low':
        simplifiedOrderBy.push({ personalRating: 'asc' }, { number: 'asc' }, { name: 'asc' })
        break
      case 'date-new':
        simplifiedOrderBy.push({ logDate: 'desc' }, { number: 'asc' }, { name: 'asc' })
        break
      case 'date-old':
        simplifiedOrderBy.push({ logDate: 'asc' }, { number: 'asc' }, { name: 'asc' })
        break
      default:
        simplifiedOrderBy.push({ number: 'asc' }, { name: 'asc' })
    }

    // Fetch paginated items with sorting
    const items = await prisma.item.findMany({
      where: { collectionId },
      orderBy: simplifiedOrderBy,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        number: true,
        isOwned: true,
        image: true,
        notes: true,
        wear: true,
        personalRating: true,
        logDate: true,
        alternativeImages: true,
        customFields: true,
      },
    })

    // Fetch wishlist items for this user that match the collection's items
    const itemIds = items.map((item: { id: string }) => item.id)
    const wishlistItems = itemIds.length > 0 ? await prisma.wishlistItem.findMany({
      where: {
        wishlist: {
          userId: session.user.id,
        },
        itemId: { in: itemIds },
      },
      select: {
        itemId: true,
      },
    }) : []

    const wishlistItemIds = new Set(wishlistItems.map((wi: { itemId: string | null }) => wi.itemId).filter(Boolean) as string[])

    // Add isInWishlist field to each item
    const itemsWithWishlist = items.map((item: { id: string }) => ({
      ...item,
      isInWishlist: wishlistItemIds.has(item.id),
    }))

    const pagination = {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: skip + items.length < totalCount,
    }

    // Cache the result (30 seconds TTL)
    serverCache.set(cacheKey, {
      items: itemsWithWishlist,
      pagination,
      userId: session.user.id,
    }, 30 * 1000)

    const response = NextResponse.json({
      items: itemsWithWishlist,
      pagination,
    })

    // Cache for 30 seconds
    response.headers.set('Cache-Control', 'private, s-maxage=30, stale-while-revalidate=60')
    return response
  } catch (error) {
    const { logger } = await import('@/lib/logger')
    logger.error('Error fetching items:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


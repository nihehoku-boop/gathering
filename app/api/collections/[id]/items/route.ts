import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
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

    // Get query parameters for pagination and sorting
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const skip = (page - 1) * limit
    const sortBy = url.searchParams.get('sortBy') || 'number-asc'

    // Verify collection belongs to user
    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: session.user.id,
      },
      select: { id: true },
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    // Get total count
    const totalCount = await prisma.item.count({
      where: { collectionId },
    })

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

    const response = NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + items.length < totalCount,
      },
    })

    // Cache for 30 seconds
    response.headers.set('Cache-Control', 'private, s-maxage=30, stale-while-revalidate=60')
    return response
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


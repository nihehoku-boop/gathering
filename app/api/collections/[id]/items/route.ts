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

    // Get query parameters for pagination
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

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

    // Fetch paginated items
    const items = await prisma.item.findMany({
      where: { collectionId },
      orderBy: [
        { number: 'asc' },
        { name: 'asc' },
      ],
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


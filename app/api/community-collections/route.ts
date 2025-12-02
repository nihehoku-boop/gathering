import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const url = new URL(request.url)
    const sortBy = url.searchParams.get('sortBy') || 'newest' // newest, popular, score
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Get total count first (before applying sorting/filtering)
    const totalCount = await prisma.communityCollection.count()

    // Build orderBy based on sortBy
    let orderBy: any = { createdAt: 'desc' } // Default to newest
    if (sortBy === 'popular' || sortBy === 'score') {
      // For popular/score, we'll need to sort after calculating votes
      // So we'll fetch all and sort in memory, but limit the fetch
      orderBy = { createdAt: 'desc' }
    } else if (sortBy === 'newest') {
      orderBy = { createdAt: 'desc' }
    } else if (sortBy === 'oldest') {
      orderBy = { createdAt: 'asc' }
    } else if (sortBy === 'alphabetical') {
      orderBy = { name: 'asc' }
    }

    // Get paginated community collections with their items and creator info
    // Note: For popular/score sorting, we need to fetch more and sort in memory
    const fetchLimit = (sortBy === 'popular' || sortBy === 'score') ? 1000 : limit
    const fetchSkip = (sortBy === 'popular' || sortBy === 'score') ? 0 : skip

    const collections = await prisma.communityCollection.findMany({
      orderBy,
      skip: fetchSkip,
      take: fetchLimit,
      include: {
        items: {
          orderBy: [
            { number: 'asc' },
            { name: 'asc' },
          ],
          select: {
            id: true,
            name: true,
            number: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            badge: true,
          },
        },
        votes: {
          select: {
            voteType: true,
            userId: true,
          },
        },
        _count: {
          select: {
            items: true,
            votes: true,
          },
        },
      },
    })

    // Calculate vote counts and scores for each collection (upvotes only)
    const collectionsWithVotes = collections.map(collection => {
      const upvotes = collection.votes.filter(v => v.voteType === 'upvote').length
      const score = upvotes
      const userVote = session?.user?.id 
        ? collection.votes.find(v => v.userId === session.user.id)?.voteType || null
        : null

      return {
        ...collection,
        upvotes,
        score,
        userVote,
        votes: undefined, // Remove votes array from response
      }
    })

    // Sort collections (especially for popular/score)
    let sortedCollections = collectionsWithVotes
    if (sortBy === 'popular' || sortBy === 'score') {
      sortedCollections = collectionsWithVotes.sort((a, b) => b.score - a.score)
      // Apply pagination after sorting
      sortedCollections = sortedCollections.slice(skip, skip + limit)
    } else if (sortBy === 'newest') {
      // Already sorted by createdAt desc
    } else if (sortBy === 'oldest') {
      // Already sorted by createdAt asc
    } else if (sortBy === 'alphabetical') {
      // Already sorted by name asc
    } else if (sortBy === 'mostItems') {
      sortedCollections = collectionsWithVotes.sort((a, b) => (b._count?.items || 0) - (a._count?.items || 0))
    } else if (sortBy === 'leastItems') {
      sortedCollections = collectionsWithVotes.sort((a, b) => (a._count?.items || 0) - (b._count?.items || 0))
    }

    return NextResponse.json({
      collections: sortedCollections,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + sortedCollections.length < totalCount,
      },
    })
  } catch (error) {
    console.error('Error fetching community collections:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, category, coverImage, coverImageFit, tags } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Collection name is required' },
        { status: 400 }
      )
    }

    const newCollection = await prisma.communityCollection.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        category: category?.trim() || null,
        coverImage: coverImage?.trim() || null,
        coverImageFit: coverImageFit || 'cover',
        tags: tags || '[]',
        userId: session.user.id,
      },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            badge: true,
          },
        },
      },
    })

    return NextResponse.json(newCollection, { status: 201 })
  } catch (error) {
    console.error('Error creating community collection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


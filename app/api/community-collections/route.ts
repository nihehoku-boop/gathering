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
    const searchQuery = url.searchParams.get('search') || ''
    const category = url.searchParams.get('category') || ''
    const tags = url.searchParams.get('tags') || '' // Comma-separated tags

    // Build where clause for filtering
    const where: any = {}
    
    // Search filter - search in name, description, category, and user name/email
    if (searchQuery.trim()) {
      where.OR = [
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } },
        { category: { contains: searchQuery, mode: 'insensitive' } },
        { user: { 
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { email: { contains: searchQuery, mode: 'insensitive' } }
          ]
        } }
      ]
    }

    // Category filter
    if (category) {
      where.category = { equals: category, mode: 'insensitive' }
    }

    // Tags filter - we'll filter after fetching since tags is stored as JSON string
    const tagArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []

    // Get total count with filters applied (excluding tags, which we'll filter after)
    const totalCount = await prisma.communityCollection.count({ where })

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
      where,
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
    let collectionsWithVotes = collections.map(collection => {
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

    // Filter by tags if specified (since tags are stored as JSON string)
    if (tagArray.length > 0) {
      collectionsWithVotes = collectionsWithVotes.filter(collection => {
        try {
          const collectionTags = typeof collection.tags === 'string' 
            ? JSON.parse(collection.tags) 
            : collection.tags || []
          return Array.isArray(collectionTags) && 
                 tagArray.some(tag => collectionTags.includes(tag))
        } catch {
          return false
        }
      })
    }

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

    // For tag filtering, we need to adjust the total count
    // Since we filter tags after fetching, we can't get an accurate total count
    // We'll use the filtered count as an approximation
    const finalTotal = tagArray.length > 0 ? collectionsWithVotes.length : totalCount
    const hasMore = tagArray.length > 0 
      ? sortedCollections.length === limit // If we got a full page, there might be more
      : skip + sortedCollections.length < totalCount

    return NextResponse.json({
      collections: sortedCollections,
      pagination: {
        page,
        limit,
        total: finalTotal,
        totalPages: Math.ceil(finalTotal / limit),
        hasMore,
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


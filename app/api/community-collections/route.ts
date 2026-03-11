import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const url = new URL(request.url)
    const sortBy = url.searchParams.get('sortBy') || 'popular' // newest, popular, score
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    const searchQuery = url.searchParams.get('search') || ''
    const category = url.searchParams.get('category') || ''
    const tags = url.searchParams.get('tags') || '' // Comma-separated tags

    // Build where clause for filtering
    const where: any = {
      isHidden: false, // Filter out hidden/moderated collections
    }
    
    // Search filter - search in name, description, category, tags, item names, and user name/email
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase()
      where.OR = [
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } },
        { category: { contains: searchQuery, mode: 'insensitive' } },
        { tags: { contains: searchQuery, mode: 'insensitive' } }, // Search in tags JSON string
        { items: { 
          some: {
            name: { contains: searchQuery, mode: 'insensitive' }
          }
        } },
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
    // Note: category is already in where clause, so totalCount includes category filter
    const totalCount = await prisma.communityCollection.count({ where })

    // Build orderBy: use DB for popular (upvotesCount), newest, oldest, alphabetical; in-memory only for mostItems/leastItems and tags filter
    let orderBy: any = { createdAt: 'desc' }
    if (sortBy === 'popular' || sortBy === 'score') {
      orderBy = [{ upvotesCount: 'desc' }, { createdAt: 'desc' }] // secondary sort when counts tied (e.g. before backfill)
    } else if (sortBy === 'mostItems' || sortBy === 'leastItems') {
      orderBy = { createdAt: 'desc' }
    } else if (sortBy === 'newest') {
      orderBy = { createdAt: 'desc' }
    } else if (sortBy === 'oldest') {
      orderBy = { createdAt: 'asc' }
    } else if (sortBy === 'alphabetical') {
      orderBy = { name: 'asc' }
    }

    // When popular/score but upvotesCount not backfilled, sort by vote count in memory (one-time until backfill runs)
    const popularNeedsFallback =
      (sortBy === 'popular' || sortBy === 'score') &&
      searchQuery === '' &&
      category === '' &&
      tagArray.length === 0
    let usePopularFallback = false
    if (popularNeedsFallback) {
      const anyWithCount = await prisma.communityCollection.findFirst({
        where: { ...where, upvotesCount: { gt: 0 } },
        select: { id: true },
      })
      usePopularFallback = !anyWithCount
    }

    const needsInMemorySort =
      sortBy === 'mostItems' || sortBy === 'leastItems' || usePopularFallback
    const needsInMemoryFilter = tagArray.length > 0
    const needsFetchAll = needsInMemorySort || needsInMemoryFilter
    const fetchSkip = needsFetchAll ? 0 : skip
    const fetchTake = needsFetchAll ? Math.min(totalCount + 100, 2000) : limit

    // List view: omit full items array (use _count.items) for smaller payload and faster LCP
    const collections = await prisma.communityCollection.findMany({
      where,
      orderBy,
      skip: fetchSkip,
      take: fetchTake,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            badge: true,
            isVerified: true,
          },
        },
        ...(session?.user?.id && {
          votes: { where: { userId: session.user.id }, select: { voteType: true } },
        }),
        _count: {
          select: {
            items: true,
            votes: true,
          },
        },
      },
    })

    type Row = typeof collections[0] & { votes?: { voteType: string }[] }
    let collectionsWithVotes = collections.map((collection: Row) => {
      // Use cached upvotesCount; fallback to _count.votes when backfill not run yet
      const upvotes =
        Number((collection as { upvotesCount?: number }).upvotesCount) ||
        (collection as { _count?: { votes?: number } })._count?.votes ||
        0
      const userVote = collection.votes?.[0]?.voteType ?? null
      return {
        ...collection,
        items: [], // List view: items loaded only when opening a collection
        upvotes,
        score: upvotes,
        userVote,
        votes: undefined,
      }
    })

    if (tagArray.length > 0) {
      collectionsWithVotes = collectionsWithVotes.filter((c: { tags: string }) => {
        try {
          const t = typeof c.tags === 'string' ? JSON.parse(c.tags) : c.tags || []
          return Array.isArray(t) && tagArray.some((tag: string) => t.includes(tag))
        } catch {
          return false
        }
      })
    }

    let sortedCollections = collectionsWithVotes
    if (sortBy === 'mostItems') {
      sortedCollections = collectionsWithVotes.sort((a: { _count?: { items: number } }, b: { _count?: { items: number } }) => (b._count?.items ?? 0) - (a._count?.items ?? 0))
    } else if (sortBy === 'leastItems') {
      sortedCollections = collectionsWithVotes.sort((a: { _count?: { items: number } }, b: { _count?: { items: number } }) => (a._count?.items ?? 0) - (b._count?.items ?? 0))
    } else if (usePopularFallback && (sortBy === 'popular' || sortBy === 'score')) {
      sortedCollections = collectionsWithVotes.sort((a: { upvotes?: number }, b: { upvotes?: number }) => (b.upvotes ?? 0) - (a.upvotes ?? 0))
    }

    if (needsFetchAll) {
      sortedCollections = sortedCollections.slice(skip, skip + limit)
    }

    const finalTotal = tagArray.length > 0 ? collectionsWithVotes.length : totalCount
    const hasMore = skip + sortedCollections.length < finalTotal

    const response = NextResponse.json({
      collections: sortedCollections,
      pagination: {
        page,
        limit,
        total: finalTotal,
        totalPages: Math.ceil(finalTotal / limit),
        hasMore,
      },
    })
    
    // Check if there's a cache-busting parameter (t=timestamp)
    // If so, don't cache the response to ensure fresh data
    const hasCacheBust = url.searchParams.has('t')
    
    if (hasCacheBust) {
      // No caching when cache-busting parameter is present
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
    } else {
      // Cache community collections for 2 minutes (moderate change frequency)
      // Stale-while-revalidate allows serving stale content while revalidating in background
      response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=240')
    }
    
    return response
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
    const { name, description, category, template, coverImage, coverImageFit, tags } = body

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
        template: template || null,
        coverImage: coverImage?.trim() || null,
        coverImageFit: coverImageFit || 'contain',
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
            isVerified: true,
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


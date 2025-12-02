import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const url = new URL(request.url)
    const sortBy = url.searchParams.get('sortBy') || 'newest' // newest, popular, score

    // Get all community collections with their items and creator info
    const collections = await prisma.communityCollection.findMany({
      include: {
        items: {
          orderBy: [
            { number: 'asc' },
            { name: 'asc' },
          ],
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

    // Sort collections
    let sortedCollections = collectionsWithVotes
    if (sortBy === 'popular' || sortBy === 'score') {
      sortedCollections = collectionsWithVotes.sort((a, b) => b.score - a.score)
    } else if (sortBy === 'newest') {
      sortedCollections = collectionsWithVotes.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    }

    return NextResponse.json(sortedCollections)
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


import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"'
import { prisma } from '@/lib/prisma'

/**
 * Vote on a community collection (upvote only)
 * POST /api/community-collections/[id]/vote
 * Body: { voteType: 'upvote' }
 */
export async function POST(
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

    const body = await request.json()
    const { voteType } = body

    // Only allow upvotes
    if (!voteType || voteType !== 'upvote') {
      return NextResponse.json(
        { error: 'Invalid vote type. Only "upvote" is supported' },
        { status: 400 }
      )
    }

    // Check if collection exists
    const collection = await prisma.communityCollection.findUnique({
      where: { id: collectionId },
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Community collection not found' },
        { status: 404 }
      )
    }

    // Check if user already voted
    const existingVote = await prisma.communityCollectionVote.findUnique({
      where: {
        communityCollectionId_userId: {
          communityCollectionId: collectionId,
          userId: session.user.id,
        },
      },
    })

    if (existingVote) {
      // User already upvoted - remove the vote (toggle off)
      await prisma.communityCollectionVote.delete({
        where: { id: existingVote.id },
      })
    } else {
      // Create new upvote
      await prisma.communityCollectionVote.create({
        data: {
          communityCollectionId: collectionId,
          userId: session.user.id,
          voteType: 'upvote',
        },
      })
    }

    // Get updated vote count (only upvotes)
    const upvotes = await prisma.communityCollectionVote.count({
      where: {
        communityCollectionId: collectionId,
        voteType: 'upvote',
      },
    })

    // Get user's current vote
    const userVote = await prisma.communityCollectionVote.findUnique({
      where: {
        communityCollectionId_userId: {
          communityCollectionId: collectionId,
          userId: session.user.id,
        },
      },
    })

    return NextResponse.json({
      upvotes,
      score: upvotes,
      userVote: userVote?.voteType || null,
    })
  } catch (error) {
    console.error('Error voting on community collection:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Get vote counts for a community collection
 * GET /api/community-collections/[id]/vote
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Resolve params
    const resolvedParams = await Promise.resolve(params)
    const collectionId = resolvedParams.id

    // Get vote count (only upvotes)
    const upvotes = await prisma.communityCollectionVote.count({
      where: {
        communityCollectionId: collectionId,
        voteType: 'upvote',
      },
    })

    // Get user's vote if logged in
    let userVote = null
    if (session?.user?.id) {
      const vote = await prisma.communityCollectionVote.findUnique({
        where: {
          communityCollectionId_userId: {
            communityCollectionId: collectionId,
            userId: session.user.id,
          },
        },
      })
      userVote = vote?.voteType || null
    }

    return NextResponse.json({
      upvotes,
      score: upvotes,
      userVote,
    })
  } catch (error) {
    console.error('Error fetching votes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


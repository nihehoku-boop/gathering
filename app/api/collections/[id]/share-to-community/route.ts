import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'
import { checkAllAchievements } from '@/lib/achievement-checker'

/**
 * Share a personal collection to the community
 * POST /api/collections/[id]/share-to-community
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

    // Resolve params (handle both sync and async)
    const resolvedParams = await Promise.resolve(params)
    const collectionId = resolvedParams.id

    // Get the user's collection
    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: session.user.id,
      },
      include: {
        items: {
          orderBy: [
            { number: 'asc' },
            { name: 'asc' },
          ],
        },
      },
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    // Check if collection already shared (optional - you might want to allow multiple shares)
    // For now, we'll allow sharing multiple times

    // Create community collection from personal collection
    const communityCollection = await prisma.communityCollection.create({
      data: {
        name: collection.name,
        description: collection.description,
        category: collection.category,
        coverImage: collection.coverImage,
        tags: collection.tags,
        userId: session.user.id,
        items: {
          create: collection.items.map(item => ({
            name: item.name,
            number: item.number,
            notes: item.notes,
            image: item.image,
          })),
        },
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

    // Check for achievements
    await checkAllAchievements(session.user.id)

    return NextResponse.json(communityCollection, { status: 201 })
  } catch (error) {
    console.error('Error sharing collection to community:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}




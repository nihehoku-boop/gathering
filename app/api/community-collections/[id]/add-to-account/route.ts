import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"'
import { prisma } from '@/lib/prisma'
import { checkAllAchievements } from '@/lib/achievement-checker'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the community collection
    const communityCollection = await prisma.communityCollection.findUnique({
      where: { id: params.id },
      include: {
        items: true,
      },
    })

    if (!communityCollection) {
      return NextResponse.json(
        { error: 'Community collection not found' },
        { status: 404 }
      )
    }

    // Create a new collection for the user based on the community collection
    const newCollection = await prisma.collection.create({
      data: {
        name: communityCollection.name,
        description: communityCollection.description,
        category: communityCollection.category,
        coverImage: communityCollection.coverImage,
        tags: communityCollection.tags || '[]',
        userId: session.user.id,
        communityCollectionId: communityCollection.id, // Track that this came from a community collection
        items: {
          create: communityCollection.items.map(item => ({
            name: item.name,
            number: item.number,
            notes: item.notes,
            image: item.image,
            isOwned: false,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    // Check and unlock achievements
    console.log(`[API] Checking achievements for user ${session.user.id} after adding community collection`)
    const newlyUnlocked = await checkAllAchievements(session.user.id)
    console.log(`[API] Newly unlocked achievements:`, newlyUnlocked)

    return NextResponse.json({
      ...newCollection,
      newlyUnlockedAchievements: newlyUnlocked,
    }, { status: 201 })
  } catch (error) {
    console.error('Error adding community collection to account:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


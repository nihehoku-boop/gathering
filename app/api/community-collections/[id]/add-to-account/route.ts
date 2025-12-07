import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'
import { checkAllAchievements } from '@/lib/achievement-checker'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Resolve params (Next.js 16+ uses async params)
    const resolvedParams = await Promise.resolve(params)

    // Get the community collection
    const communityCollection = await prisma.communityCollection.findUnique({
      where: { id: resolvedParams.id },
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
        template: communityCollection.template || null, // Preserve template from community collection
        coverImage: communityCollection.coverImage,
        coverImageFit: (communityCollection as any).coverImageFit || 'cover',
        tags: communityCollection.tags || '[]',
        userId: session.user.id,
        communityCollectionId: communityCollection.id, // Track that this came from a community collection
        items: {
          create: communityCollection.items.map((item: { name: string; number: number | null; notes: string | null; image: string | null; customFields: string }) => ({
            name: item.name,
            number: item.number,
            notes: item.notes,
            image: item.image,
            customFields: item.customFields || '{}', // Preserve customFields from community items
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


import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'

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

    // Get the recommended collection
    const recommendedCollection = await prisma.recommendedCollection.findUnique({
      where: { id: collectionId },
      include: {
        items: true,
      },
    })

    if (!recommendedCollection) {
      return NextResponse.json(
        { error: 'Recommended collection not found' },
        { status: 404 }
      )
    }

    // Create a new collection for the user based on the recommended collection
    const newCollection = await prisma.collection.create({
      data: {
        name: recommendedCollection.name,
        description: recommendedCollection.description,
        category: recommendedCollection.category,
        template: recommendedCollection.template || null, // Preserve template from recommended collection
        customFieldDefinitions: recommendedCollection.customFieldDefinitions || '[]', // Preserve custom field definitions
        coverImage: recommendedCollection.coverImage,
        coverImageFit: recommendedCollection.coverImageFit || 'contain',
        tags: recommendedCollection.tags || '[]',
        userId: session.user.id,
        recommendedCollectionId: recommendedCollection.id,
        lastSyncedAt: new Date(),
        items: {
          create: recommendedCollection.items.map((item: { name: string; number: number | null; notes: string | null; image: string | null; customFields: string }) => ({
            name: item.name,
            number: item.number,
            notes: item.notes,
            image: item.image,
            customFields: item.customFields || '{}', // Preserve customFields from recommended items
            isOwned: false,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json(newCollection, { status: 201 })
  } catch (error) {
    console.error('Error adding recommended collection to account:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


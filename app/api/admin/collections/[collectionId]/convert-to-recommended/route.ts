import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ collectionId: string }> | { collectionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    })

    if (!adminUser?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Resolve params
    const resolvedParams = await Promise.resolve(params)
    const collectionId = resolvedParams.collectionId

    // Get the collection with items
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
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

    // Check if a recommended collection with this name already exists
    const existingRecommended = await prisma.recommendedCollection.findFirst({
      where: { name: collection.name },
    })

    if (existingRecommended) {
      return NextResponse.json(
        { error: 'A recommended collection with this name already exists' },
        { status: 400 }
      )
    }

    // Create recommended collection from user collection
    const recommendedCollection = await prisma.recommendedCollection.create({
      data: {
        name: collection.name,
        description: collection.description,
        category: collection.category,
        template: collection.template,
        customFieldDefinitions: collection.customFieldDefinitions,
        coverImage: collection.coverImage,
        coverImageFit: collection.coverImageFit,
        tags: collection.tags,
        isPublic: true, // Make public by default so it appears in recommended collections list
        items: {
          create: collection.items.map((item: { name: string; number: number | null; notes: string | null; image: string | null; customFields: string }) => ({
            name: item.name,
            number: item.number,
            notes: item.notes,
            image: item.image,
            customFields: item.customFields,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json({
      ...recommendedCollection,
      message: 'Collection successfully converted to recommended collection',
    })
  } catch (error) {
    console.error('Error converting collection to recommended:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


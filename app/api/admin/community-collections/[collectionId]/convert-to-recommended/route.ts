import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'
import { serverCache, cacheKeys } from '@/lib/server-cache'

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

    // Get the community collection with items
    const communityCollection = await prisma.communityCollection.findUnique({
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

    if (!communityCollection) {
      return NextResponse.json(
        { error: 'Community collection not found' },
        { status: 404 }
      )
    }

    // Check if a recommended collection with this name already exists
    const existingRecommended = await prisma.recommendedCollection.findFirst({
      where: { name: communityCollection.name },
    })

    if (existingRecommended) {
      return NextResponse.json(
        { error: 'A recommended collection with this name already exists' },
        { status: 400 }
      )
    }

    // Create recommended collection from community collection
    const recommendedCollection = await prisma.recommendedCollection.create({
      data: {
        name: communityCollection.name,
        description: communityCollection.description,
        category: communityCollection.category,
        template: communityCollection.template,
        customFieldDefinitions: communityCollection.customFieldDefinitions || '[]',
        coverImage: communityCollection.coverImage,
        coverImageFit: (communityCollection as any).coverImageFit || 'contain',
        tags: communityCollection.tags || '[]',
        isPublic: true, // Make public by default so it appears in recommended collections list
        items: {
          create: communityCollection.items.map((item: { name: string; number: number | null; notes: string | null; image: string | null; customFields: string }) => ({
            name: item.name,
            number: item.number,
            notes: item.notes,
            image: item.image,
            customFields: item.customFields || '{}',
          })),
        },
      },
      include: {
        items: true,
      },
    })

    // Invalidate recommended collections cache
    // Note: recommended collections are cached, so we need to invalidate
    // Since we don't have a specific cache key for recommended collections list,
    // we'll rely on the event dispatch and cache-busting in the client

    return NextResponse.json({
      ...recommendedCollection,
      message: 'Community collection successfully converted to recommended collection',
    })
  } catch (error) {
    console.error('Error converting community collection to recommended:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


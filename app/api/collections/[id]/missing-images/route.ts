import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)
    const collectionId = resolvedParams.id

    // Verify collection belongs to user
    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        category: true,
        template: true,
      },
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    // Find all items without images
    const itemsWithoutImages = await prisma.item.findMany({
      where: {
        collectionId: collectionId,
        OR: [
          { image: null },
          { image: '' },
        ],
      },
      select: {
        id: true,
        name: true,
        number: true,
        image: true,
      },
      orderBy: [
        { number: 'asc' },
        { name: 'asc' },
      ],
    })

    return NextResponse.json({
      collection: {
        id: collection.id,
        name: collection.name,
        category: collection.category,
        template: collection.template,
      },
      missingImages: itemsWithoutImages.map(item => ({
        id: item.id,
        name: item.name,
        number: item.number,
      })),
      total: itemsWithoutImages.length,
    })
  } catch (error) {
    console.error('Error fetching missing images:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


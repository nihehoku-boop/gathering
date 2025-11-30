import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
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

    const resolvedParams = await Promise.resolve(params)
    const collection = await prisma.communityCollection.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Community collection not found' },
        { status: 404 }
      )
    }

    // Only the creator can add items
    if (collection.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only edit your own collections' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { items } = body

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      )
    }

    const createdItems = await prisma.communityItem.createMany({
      data: items.map((item: any) => ({
        communityCollectionId: resolvedParams.id,
        name: item.name,
        number: item.number || null,
        notes: item.notes || null,
        image: item.image || null,
      })),
    })

    return NextResponse.json({ 
      success: true, 
      count: createdItems.count 
    }, { status: 201 })
  } catch (error) {
    console.error('Error adding items to community collection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



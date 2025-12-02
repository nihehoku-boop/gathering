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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const resolvedParams = await Promise.resolve(params)
    const body = await request.json()
    const { items } = body

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      )
    }

    // Verify collection exists
    const collection = await prisma.recommendedCollection.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    // Create all items in a transaction
    const createdItems = await prisma.$transaction(
      items.map((item: { name: string; number?: number | null; notes?: string | null; image?: string | null; customFields?: Record<string, any> }) =>
        prisma.recommendedItem.create({
          data: {
            recommendedCollectionId: resolvedParams.id,
            name: item.name,
            number: item.number ? parseInt(String(item.number)) : null,
            notes: item.notes || null,
            image: item.image || null,
            customFields: item.customFields ? JSON.stringify(item.customFields) : '{}',
          },
        })
      )
    )

    return NextResponse.json({ items: createdItems, count: createdItems.length }, { status: 201 })
  } catch (error) {
    console.error('Error creating bulk items:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


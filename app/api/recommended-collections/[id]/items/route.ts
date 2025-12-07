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

    // Check if user is admin (using cached lookup)
    const { isUserAdmin } = await import('@/lib/user-cache')
    const isAdmin = await isUserAdmin(session.user.id)
    
    if (!isAdmin) {
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

    // Use createMany for bulk inserts (much more efficient than transaction with individual creates)
    // For 100 items: 100 operations → 1 operation
    const createdItems = await prisma.recommendedItem.createMany({
      data: items.map((item: { name: string; number?: number | null; notes?: string | null; image?: string | null; customFields?: Record<string, any> }) => ({
        recommendedCollectionId: resolvedParams.id,
        name: item.name,
        number: item.number ? parseInt(String(item.number)) : null,
        notes: item.notes || null,
        image: item.image || null,
        customFields: item.customFields ? JSON.stringify(item.customFields) : '{}',
      })),
      skipDuplicates: true, // Skip if item already exists
    })

    // Fetch the created items to return them (createMany doesn't return created records)
    // Only fetch if we need to return the items
    const returnedItems = await prisma.recommendedItem.findMany({
      where: {
        recommendedCollectionId: resolvedParams.id,
        name: { in: items.map((item: { name: string }) => item.name) },
      },
      orderBy: { createdAt: 'desc' },
      take: items.length,
    })

    return NextResponse.json({ items: returnedItems, count: createdItems.count }, { status: 201 })
  } catch (error) {
    console.error('Error creating bulk items:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


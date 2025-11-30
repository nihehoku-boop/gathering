import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"'
import { prisma } from '@/lib/prisma'
import { getDataSource } from '@/lib/data-fetchers'
import '@/lib/data-fetchers/init' // Initialize data sources

/**
 * Admin API endpoint for importing collections from external sources
 * 
 * POST /api/admin/import-collection
 * Body: {
 *   sourceId: string,        // Data source ID (e.g., 'comic-vine', 'manual')
 *   sourceDataId?: string,   // ID in the external source
 *   collectionName: string,  // Name for the collection
 *   description?: string,
 *   category?: string,
 *   tags?: string[],
 *   items?: Array<{name, number, image, notes}>, // For manual imports
 * }
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      sourceId,
      sourceDataId,
      collectionName,
      description,
      category,
      tags,
      items: manualItems,
    } = body
    
    console.log('[Import Collection] Request:', { sourceId, sourceDataId, collectionName })

    if (!sourceId || !collectionName) {
      return NextResponse.json(
        { error: 'sourceId and collectionName are required' },
        { status: 400 }
      )
    }

    // Get data source
    const dataSource = getDataSource(sourceId)
    if (!dataSource) {
      return NextResponse.json(
        { error: `Unknown data source: ${sourceId}` },
        { status: 400 }
      )
    }

    // Fetch items from data source
    let items: Array<{
      name: string
      number: number | null
      image: string | null
      notes?: string | null
    }> = []

    if (sourceId === 'manual' && manualItems) {
      // Manual import - use provided items
      items = manualItems
    } else if (sourceId === 'ai' && sourceDataId) {
      // AI source - sourceDataId is the URL
      // Pass metadata if available for context
      const metadata = body.metadata || {}
      items = await dataSource.fetchItems(sourceDataId, metadata)
    } else if (sourceDataId) {
      // Fetch from external source with specific ID
      items = await dataSource.fetchItems(sourceDataId)
    } else {
      return NextResponse.json(
        { error: 'sourceDataId or items required for non-manual sources' },
        { status: 400 }
      )
    }

    if (items.length === 0) {
      return NextResponse.json(
        { error: 'No items found to import' },
        { status: 400 }
      )
    }

    // Create recommended collection
    const collection = await prisma.recommendedCollection.create({
      data: {
        name: collectionName,
        description: description || null,
        category: category || null,
        tags: tags ? JSON.stringify(tags) : '[]',
        items: {
          create: items.map(item => ({
            name: item.name,
            number: item.number,
            image: item.image || null,
            notes: item.notes || null,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json({
      collection,
      itemsCount: items.length,
      message: `Successfully imported ${items.length} items`,
    }, { status: 201 })
  } catch (error) {
    console.error('Error importing collection:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}


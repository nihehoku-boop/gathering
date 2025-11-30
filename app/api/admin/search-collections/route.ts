import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'
import { getDataSource, listDataSources } from '@/lib/data-fetchers'
import '@/lib/data-fetchers/init' // Initialize data sources

/**
 * Admin API endpoint for searching collections in external data sources
 * 
 * GET /api/admin/search-collections?sourceId=comic-vine&query=spider-man
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const sourceId = searchParams.get('sourceId')
    const query = searchParams.get('query')

    if (!sourceId) {
      // Return list of available data sources
      return NextResponse.json({
        sources: listDataSources().map(id => ({
          id,
          name: getDataSource(id)?.name || id,
        })),
      })
    }

    if (!query) {
      return NextResponse.json(
        { error: 'query parameter is required' },
        { status: 400 }
      )
    }

    const dataSource = getDataSource(sourceId)
    if (!dataSource) {
      return NextResponse.json(
        { error: `Unknown data source: ${sourceId}` },
        { status: 400 }
      )
    }

    const results = await dataSource.search(query)

    return NextResponse.json({
      results,
      count: results.length,
    })
  } catch (error) {
    console.error('Error searching collections:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


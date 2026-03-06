import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/recommended-collections/categories
 * Returns distinct categories with collection counts (public only, for quick filter chips).
 */
export async function GET() {
  try {
    const rows = await prisma.recommendedCollection.groupBy({
      by: ['category'],
      where: { isPublic: true },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    })

    type Row = { category: string | null; _count: { id: number } }
    type RowWithCategory = { category: string; _count: { id: number } }
    const categories = (rows as Row[])
      .filter((r: Row): r is RowWithCategory => r.category != null && r.category !== '')
      .map((r: RowWithCategory) => ({ name: r.category, count: r._count.id }))

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('[API] Error fetching recommended collection categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get all collections with items
    const collections = await prisma.collection.findMany({
      where: { userId },
      include: {
        items: true,
        _count: {
          select: { items: true },
        },
      },
    })

    // Calculate statistics
    const totalCollections = collections.length
    const totalItems = collections.reduce((sum: number, col: { items: any[] }) => sum + col.items.length, 0)
    const ownedItems = collections.reduce(
      (sum: number, col: { items: { isOwned: boolean }[] }) => sum + col.items.filter((item) => item.isOwned).length,
      0
    )
    const completionPercentage = totalItems > 0 ? Math.round((ownedItems / totalItems) * 100) : 0

    // Collections by category
    const collectionsByCategory: Record<string, number> = {}
    collections.forEach((col: { category: string | null }) => {
      const category = col.category || 'Uncategorized'
      collectionsByCategory[category] = (collectionsByCategory[category] || 0) + 1
    })

    // Items by collection
    const itemsByCollection = collections.map((col: { id: string; name: string; items: { isOwned: boolean }[] }) => ({
      id: col.id,
      name: col.name,
      totalItems: col.items.length,
      ownedItems: col.items.filter((item) => item.isOwned).length,
      completionPercentage:
        col.items.length > 0
          ? Math.round((col.items.filter((item) => item.isOwned).length / col.items.length) * 100)
          : 0,
    }))

    // Most collected items (items that appear in multiple collections - not applicable here, but we can show items with highest numbers)
    const allItems = collections.flatMap((col: { items: any[] }) => col.items)
    const itemsWithNumbers = allItems.filter((item: { number: number | null }) => item.number !== null)
    const sortedByNumber = itemsWithNumbers.sort((a: { number: number | null }, b: { number: number | null }) => (b.number || 0) - (a.number || 0))
    const topItems = sortedByNumber.slice(0, 10).map((item: { name: string; number: number | null; isOwned: boolean }) => ({
      name: item.name,
      number: item.number,
      isOwned: item.isOwned,
    }))

    // Collections with most items
    const collectionsByItemCount = [...collections]
      .sort((a, b) => b.items.length - a.items.length)
      .slice(0, 10)
      .map((col: { id: string; name: string; items: { isOwned: boolean }[] }) => ({
        id: col.id,
        name: col.name,
        itemCount: col.items.length,
        ownedCount: col.items.filter((item) => item.isOwned).length,
      }))

    // Tags distribution
    const allTags: Record<string, number> = {}
    collections.forEach((col: { tags: string }) => {
      try {
        const tags = col.tags ? JSON.parse(col.tags) : []
        if (Array.isArray(tags)) {
          tags.forEach((tag: string) => {
            allTags[tag] = (allTags[tag] || 0) + 1
          })
        }
      } catch {
        // Ignore invalid tags
      }
    })

    // Items with ratings
    const ratedItems = allItems.filter((item: { personalRating: number | null }) => item.personalRating !== null)
    const averageRating =
      ratedItems.length > 0
        ? ratedItems.reduce((sum: number, item: { personalRating: number | null }) => sum + (item.personalRating || 0), 0) / ratedItems.length
        : 0

    // Items with wear conditions
    const itemsWithWear = allItems.filter((item: { wear: string | null }) => item.wear !== null)
    const wearDistribution: Record<string, number> = {}
    itemsWithWear.forEach((item: { wear: string | null }) => {
      const wear = item.wear || 'Unknown'
      wearDistribution[wear] = (wearDistribution[wear] || 0) + 1
    })

    return NextResponse.json({
      totalCollections,
      totalItems,
      ownedItems,
      completionPercentage,
      collectionsByCategory,
      itemsByCollection,
      topItems,
      collectionsByItemCount,
      tagsDistribution: allTags,
      averageRating: Math.round(averageRating * 10) / 10,
      ratedItemsCount: ratedItems.length,
      wearDistribution,
      itemsWithWearCount: itemsWithWear.length,
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}




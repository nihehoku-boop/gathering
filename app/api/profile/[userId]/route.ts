import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> | { userId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const user = await prisma.user.findUnique({
      where: { id: resolvedParams.userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isPrivate: true,
        isVerified: true,
        badge: true,
        bio: true,
        bannerImage: true,
        profileTheme: true,
        collections: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            coverImage: true,
            tags: true,
            items: {
              select: {
                isOwned: true,
              },
            },
            _count: {
              select: {
                items: true,
              },
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // If user is private, only return basic info
    if (user.isPrivate) {
      return NextResponse.json({
        id: user.id,
        name: user.name || user.email,
        isPrivate: true,
      })
    }

    // Calculate collection stats and get top 3
    const collectionsWithStats = user.collections.map((collection) => {
      const ownedItems = collection.items.filter((item) => item.isOwned).length
      const totalItems = collection._count.items
      const progress = totalItems > 0 ? Math.round((ownedItems / totalItems) * 100) : 0

      return {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        category: collection.category,
        coverImage: collection.coverImage,
        tags: collection.tags,
        ownedItems,
        totalItems,
        progress,
      }
    })

    // Sort by owned items and get top 3
    const topCollections = collectionsWithStats
      .sort((a, b) => b.ownedItems - a.ownedItems)
      .slice(0, 3)

    // Calculate total stats
    const totalItems = collectionsWithStats.reduce((sum, c) => sum + c.totalItems, 0)
    const totalOwnedItems = collectionsWithStats.reduce((sum, c) => sum + c.ownedItems, 0)

    return NextResponse.json({
      id: user.id,
      name: user.name || user.email,
      email: user.email,
      image: user.image,
      isVerified: user.isVerified,
      badge: user.badge,
      bio: user.bio,
      bannerImage: user.bannerImage,
      profileTheme: user.profileTheme,
      topCollections,
      totalCollections: user.collections.length,
      totalItems,
      totalOwnedItems,
    })
  } catch (error) {
    console.error('Error fetching public profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}




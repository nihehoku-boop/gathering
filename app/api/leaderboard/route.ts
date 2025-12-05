import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all users with their collections and items (excluding private users)
    const users = await prisma.user.findMany({
      where: {
        isPrivate: false, // Only show public users
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isVerified: true,
        badge: true,
        collections: {
          select: {
            items: {
              select: {
                isOwned: true,
              },
            },
          },
        },
      },
    })

    // Calculate total owned items for each user
    const leaderboard = users
      .map((user) => {
        const totalItems = user.collections.reduce(
          (sum, collection) => sum + collection.items.length,
          0
        )
        const ownedItems = user.collections.reduce(
          (sum, collection) =>
            sum + collection.items.filter((item) => item.isOwned).length,
          0
        )

        return {
          id: user.id,
          name: user.name || user.email,
          email: user.email,
          image: user.image,
          isVerified: user.isVerified,
          badge: user.badge,
          totalItems,
          ownedItems,
        }
      })
      .filter((user) => user.totalItems > 0) // Only show users with items
      .sort((a, b) => b.ownedItems - a.ownedItems) // Sort by owned items descending

    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


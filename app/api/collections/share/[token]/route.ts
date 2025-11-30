import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get shared collection by token
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> | { token: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const { token } = resolvedParams

    const collection = await prisma.collection.findUnique({
      where: { shareToken: token, isPublic: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            badge: true,
          },
        },
        items: {
          orderBy: [
            { number: 'asc' },
            { name: 'asc' },
          ],
        },
      },
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found or not public' },
        { status: 404 }
      )
    }

    return NextResponse.json(collection)
  } catch (error) {
    console.error('Error fetching shared collection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}




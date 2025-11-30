import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    let isAdmin = false
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isAdmin: true },
      })
      isAdmin = user?.isAdmin || false
    }

    // If admin, show all collections. Otherwise, only show public ones.
    // Note: If isPublic field doesn't exist yet, show all to everyone (backward compatibility)
    const recommendedCollections = await prisma.recommendedCollection.findMany({
      where: isAdmin ? undefined : { 
        OR: [
          { isPublic: true },
          { isPublic: null }, // Handle collections created before isPublic field existed
        ]
      },
      include: {
        items: {
          orderBy: [
            { number: 'asc' },
            { name: 'asc' },
          ],
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(recommendedCollections)
  } catch (error) {
    console.error('Error fetching recommended collections:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    const { name, description, category, coverImage, tags, items, isPublic } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Validate and process tags
    let tagsValue = '[]'
    if (tags !== undefined) {
      try {
        if (typeof tags === 'string') {
          const parsed = JSON.parse(tags)
          if (Array.isArray(parsed)) {
            tagsValue = tags
          }
        } else if (Array.isArray(tags)) {
          tagsValue = JSON.stringify(tags)
        }
      } catch (e) {
        console.error('Error parsing tags:', e)
      }
    }

    const collection = await prisma.recommendedCollection.create({
      data: {
        name,
        description: description || null,
        category: category || null,
        coverImage: coverImage || null,
        tags: tagsValue,
        isPublic: isPublic === true || isPublic === 'true',
        items: items ? {
          create: items.map((item: { name: string; number?: number | null; notes?: string | null; image?: string | null }) => ({
            name: item.name,
            number: item.number ? parseInt(String(item.number)) : null,
            notes: item.notes || null,
            image: item.image || null,
          })),
        } : undefined,
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json(collection, { status: 201 })
  } catch (error) {
    console.error('Error creating recommended collection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


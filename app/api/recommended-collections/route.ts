import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if this is an admin dashboard request (check referer or query param)
    const url = new URL(request.url)
    const isAdminDashboard = url.searchParams.get('admin') === 'true'
    
    // Check if user is admin
    let isAdmin = false
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isAdmin: true },
      })
      isAdmin = user?.isAdmin || false
    }

    // Only show all collections if explicitly requested from admin dashboard AND user is admin
    // Otherwise, always filter to show only public collections
    const recommendedCollections = await prisma.recommendedCollection.findMany({
      where: (isAdmin && isAdminDashboard) ? undefined : { isPublic: true },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        template: true,
        customFieldDefinitions: true,
        coverImage: true,
        coverImageFit: true,
        tags: true,
        isPublic: true, // Explicitly include isPublic
        createdAt: true,
        updatedAt: true,
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
    const { name, description, category, template, customFieldDefinitions, coverImage, coverImageFit, tags, items, isPublic } = body

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

    // Validate and process customFieldDefinitions
    let customFieldDefinitionsValue = '[]'
    if (customFieldDefinitions !== undefined) {
      try {
        if (typeof customFieldDefinitions === 'string') {
          const parsed = JSON.parse(customFieldDefinitions)
          if (Array.isArray(parsed)) {
            customFieldDefinitionsValue = customFieldDefinitions
          }
        } else if (Array.isArray(customFieldDefinitions)) {
          customFieldDefinitionsValue = JSON.stringify(customFieldDefinitions)
        }
      } catch (e) {
        console.error('Error parsing customFieldDefinitions:', e)
      }
    }

    const collection = await prisma.recommendedCollection.create({
      data: {
        name,
        description: description || null,
        category: category || null,
        template: template || 'custom',
        customFieldDefinitions: customFieldDefinitionsValue,
        coverImage: coverImage || null,
        coverImageFit: coverImageFit || 'cover',
        tags: tagsValue,
        isPublic: isPublic === true || isPublic === 'true',
        items: items ? {
          create: items.map((item: { name: string; number?: number | null; notes?: string | null; image?: string | null; customFields?: Record<string, any> }) => ({
            name: item.name,
            number: item.number ? parseInt(String(item.number)) : null,
            notes: item.notes || null,
            image: item.image || null,
            customFields: item.customFields ? JSON.stringify(item.customFields) : '{}',
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


import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'
import { safeParseJson, sanitizeObject } from '@/lib/sanitize'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const url = new URL(request.url)
    const isAdminDashboard = url.searchParams.get('admin') === 'true'
    
    // Check if user is admin (using cached lookup)
    let isAdmin = false
    if (session?.user?.id) {
      const { isUserAdmin } = await import('@/lib/user-cache')
      isAdmin = await isUserAdmin(session.user.id)
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

    const response = NextResponse.json(recommendedCollections)
    // Cache recommended collections for 10 minutes (they don't change frequently)
    // This significantly reduces database queries
    response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200')
    return response
  } catch (error) {
    logger.error('Error fetching recommended collections:', error)
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

    // Check if user is admin (using cached lookup)
    const { isUserAdmin } = await import('@/lib/user-cache')
    const isAdmin = await isUserAdmin(session.user.id)
    
    if (!isAdmin) {
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

    // Validate and process tags with prototype pollution protection
    let tagsValue = '[]'
    if (tags !== undefined) {
      try {
        if (typeof tags === 'string') {
          const parsed = safeParseJson<string[]>(tags)
          if (parsed && Array.isArray(parsed)) {
            // Validate all items are strings and sanitize
            const validTags = parsed.filter(tag => typeof tag === 'string' && tag.length <= 50)
            tagsValue = JSON.stringify(validTags)
          } else {
            tagsValue = '[]'
          }
        } else if (Array.isArray(tags)) {
          // Sanitize array to prevent prototype pollution
          const sanitized = sanitizeObject(tags)
          const validTags = sanitized.filter((tag: any) => typeof tag === 'string' && tag.length <= 50)
          tagsValue = JSON.stringify(validTags)
        }
      } catch (e) {
        logger.error('Error parsing tags:', e)
        tagsValue = '[]'
      }
    }

    // Validate and process customFieldDefinitions with prototype pollution protection
    let customFieldDefinitionsValue = '[]'
    if (customFieldDefinitions !== undefined) {
      try {
        if (typeof customFieldDefinitions === 'string') {
          const parsed = safeParseJson<any[]>(customFieldDefinitions)
          if (parsed && Array.isArray(parsed)) {
            // Sanitize to prevent prototype pollution
            const sanitized = sanitizeObject(parsed)
            customFieldDefinitionsValue = JSON.stringify(sanitized)
          } else {
            customFieldDefinitionsValue = '[]'
          }
        } else if (Array.isArray(customFieldDefinitions)) {
          // Sanitize array to prevent prototype pollution
          const sanitized = sanitizeObject(customFieldDefinitions)
          customFieldDefinitionsValue = JSON.stringify(sanitized)
        }
      } catch (e) {
        logger.error('Error parsing customFieldDefinitions:', e)
        customFieldDefinitionsValue = '[]'
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
        coverImageFit: coverImageFit || 'contain',
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
    logger.error('Error creating recommended collection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


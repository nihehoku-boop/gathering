import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'
import { withRateLimit } from '@/lib/rate-limit-middleware'
import { rateLimitConfigs } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { safeParseJson, sanitizeObject } from '@/lib/sanitize'
import { serverCache, cacheKeys } from '@/lib/server-cache'

async function getCollectionHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Resolve params
    const resolvedParams = await Promise.resolve(params)
    const collectionId = resolvedParams.id

    // Check cache first
    const collectionCacheKey = cacheKeys.collection(collectionId)
    const cached = serverCache.get<any>(collectionCacheKey)
    if (cached && cached.userId === session.user.id) {
      const response = NextResponse.json({
        ...cached.collection,
        ownedCount: cached.ownedCount,
      })
      response.headers.set('Cache-Control', 'private, s-maxage=30, stale-while-revalidate=60')
      return response
    }

    // Fetch collection and owned count in parallel (reduces 2 queries to 1 parallel execution)
    const [collection, ownedCount] = await Promise.all([
      prisma.collection.findFirst({
        where: {
          id: collectionId,
          userId: session.user.id,
        },
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          template: true,
          customFieldDefinitions: true,
          folderId: true,
          coverImage: true,
          coverImageAspectRatio: true,
          coverImageFit: true,
          tags: true,
          recommendedCollectionId: true,
          lastSyncedAt: true,
          shareToken: true,
          isPublic: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              items: true,
            },
          }
        },
      }),
      prisma.item.count({
        where: {
          collectionId,
          isOwned: true,
        },
      }),
    ])

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    // Cache the result (30 seconds TTL)
    serverCache.set(collectionCacheKey, {
      collection,
      ownedCount,
      userId: session.user.id,
    }, 30 * 1000)

    // Include share settings and owned count in the response to avoid a second API call
    const response = NextResponse.json({
      ...collection,
      ownedCount, // Total owned items count
      // Share settings are already included in the select above (shareToken, isPublic)
    })
    // Add caching headers for collection data
    response.headers.set('Cache-Control', 'private, s-maxage=30, stale-while-revalidate=60')
    return response
  } catch (error) {
    logger.error('Error fetching collection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function updateCollectionHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  // Resolve params early so it's available in catch block
  const resolvedParams = await Promise.resolve(params)
  const collectionId = resolvedParams.id
  
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: session.user.id,
      },
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { name, description, category, folderId, template, customFieldDefinitions, coverImage, coverImageAspectRatio, coverImageFit, tags } = body

    logger.debug('PATCH request body:', { name, description, category, coverImage, tags })

    // Build update data object - only include fields that are being updated
    const updateData: any = {}

    // Name is required and always sent
    if (name !== undefined && name !== null) {
      const trimmedName = String(name).trim()
      if (!trimmedName) {
        return NextResponse.json(
          { error: 'Name cannot be empty' },
          { status: 400 }
        )
      }
      updateData.name = trimmedName
    }

    if (description !== undefined) {
      updateData.description = description && String(description).trim() ? String(description).trim() : null
    }

    if (category !== undefined) {
      updateData.category = category && String(category).trim() ? String(category).trim() : null
    }

    if (folderId !== undefined) {
      // Validate folderId if provided
      let validatedFolderId: string | null = null
      if (folderId && String(folderId).trim() !== '') {
        const folder = await prisma.folder.findFirst({
          where: {
            id: String(folderId).trim(),
            userId: session.user.id,
          },
        })

        if (!folder) {
          return NextResponse.json(
            { error: 'Folder not found or does not belong to you' },
            { status: 400 }
          )
        }

        validatedFolderId = String(folderId).trim()
      }
      updateData.folderId = validatedFolderId
    }

    if (template !== undefined) {
      updateData.template = template && String(template).trim() ? String(template).trim() : 'custom'
    }

    if (customFieldDefinitions !== undefined) {
      // Ensure customFieldDefinitions is a valid JSON array with prototype pollution protection
      if (typeof customFieldDefinitions === 'string') {
        try {
          const parsed = safeParseJson<any[]>(customFieldDefinitions)
          if (parsed && Array.isArray(parsed)) {
            // Sanitize to prevent prototype pollution
            const sanitized = sanitizeObject(parsed)
            updateData.customFieldDefinitions = JSON.stringify(sanitized)
          } else {
            updateData.customFieldDefinitions = '[]'
          }
        } catch {
          updateData.customFieldDefinitions = '[]'
        }
      } else if (Array.isArray(customFieldDefinitions)) {
        // Sanitize array to prevent prototype pollution
        const sanitized = sanitizeObject(customFieldDefinitions)
        updateData.customFieldDefinitions = JSON.stringify(sanitized)
      } else {
        updateData.customFieldDefinitions = '[]'
      }
    }

    if (coverImage !== undefined) {
      updateData.coverImage = coverImage && String(coverImage).trim() ? String(coverImage).trim() : null
    }

    if (coverImageAspectRatio !== undefined) {
      updateData.coverImageAspectRatio = coverImageAspectRatio && String(coverImageAspectRatio).trim() ? String(coverImageAspectRatio).trim() : null
    }

    if (coverImageFit !== undefined) {
      updateData.coverImageFit = coverImageFit && (coverImageFit === 'cover' || coverImageFit === 'contain') ? coverImageFit : 'cover'
    }

    // Tags is always sent from the client, so always process it
    if (tags !== undefined) {
      // Ensure tags is a valid JSON string
      try {
        if (typeof tags === 'string') {
          // Validate it's valid JSON
          if (tags.trim() === '') {
            updateData.tags = '[]'
          } else {
            const parsed = JSON.parse(tags)
            if (Array.isArray(parsed)) {
              updateData.tags = tags
            } else {
              updateData.tags = '[]'
            }
          }
        } else if (Array.isArray(tags)) {
          updateData.tags = JSON.stringify(tags)
        } else {
          updateData.tags = '[]'
        }
      } catch (e) {
        logger.error('Error parsing tags:', e)
        updateData.tags = '[]'
      }
    }

    logger.debug('Update data before Prisma:', updateData)
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }
    
    const updatedCollection = await prisma.collection.update({
      where: { id: collectionId },
      data: updateData,
    })
    
    logger.debug('Successfully updated collection:', collectionId)
    return NextResponse.json(updatedCollection)

  } catch (error: any) {
    logger.error('Error updating collection:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      collectionId,
    })
    
    // Return a more detailed error response
    const errorResponse: any = {
      error: error?.message || 'Internal server error',
      code: error?.code || 'UNKNOWN_ERROR',
    }
    
    // Include Prisma-specific error details if available
    if (error?.meta) {
      errorResponse.meta = error.meta
    }
    
    return NextResponse.json(
      errorResponse,
      { status: 500 }
    )
  }
}

async function deleteCollectionHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Resolve params
    const resolvedParams = await Promise.resolve(params)
    const collectionId = resolvedParams.id

    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: session.user.id,
      },
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    await prisma.collection.delete({
      where: { id: collectionId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error deleting collection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = withRateLimit(
  getCollectionHandler,
  rateLimitConfigs.read,
  async (request) => {
    const session = await getServerSession(authOptions)
    return session?.user?.id
  }
)

export const PATCH = withRateLimit(
  updateCollectionHandler,
  rateLimitConfigs.write,
  async (request) => {
    const session = await getServerSession(authOptions)
    return session?.user?.id
  }
)

export const DELETE = withRateLimit(
  deleteCollectionHandler,
  rateLimitConfigs.write,
  async (request) => {
    const session = await getServerSession(authOptions)
    return session?.user?.id
  }
)


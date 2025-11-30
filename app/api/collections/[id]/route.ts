import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'

export async function GET(
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
        tags: true,
        recommendedCollectionId: true,
        lastSyncedAt: true,
        shareToken: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
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
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    const response = NextResponse.json(collection)
    // Add caching headers for collection data
    response.headers.set('Cache-Control', 'private, s-maxage=30, stale-while-revalidate=60')
    return response
  } catch (error) {
    console.error('Error fetching collection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    const body = await request.json()
    const { name, description, category, folderId, template, customFieldDefinitions, coverImage, coverImageAspectRatio, tags } = body

    console.log('PATCH request body:', JSON.stringify({ name, description, category, coverImage, tags }, null, 2))

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
      // Ensure customFieldDefinitions is a valid JSON array
      if (typeof customFieldDefinitions === 'string') {
        try {
          const parsed = JSON.parse(customFieldDefinitions)
          if (Array.isArray(parsed)) {
            updateData.customFieldDefinitions = customFieldDefinitions
          } else {
            updateData.customFieldDefinitions = '[]'
          }
        } catch {
          updateData.customFieldDefinitions = '[]'
        }
      } else if (Array.isArray(customFieldDefinitions)) {
        updateData.customFieldDefinitions = JSON.stringify(customFieldDefinitions)
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
        console.error('Error parsing tags:', e)
        updateData.tags = '[]'
      }
    }

    console.log('Update data before Prisma:', JSON.stringify(updateData, null, 2))
    console.log('Collection ID:', collectionId)
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }
    
    console.log('Calling Prisma update with:', JSON.stringify({ where: { id: collectionId }, data: updateData }, null, 2))
    
    const updatedCollection = await prisma.collection.update({
      where: { id: collectionId },
      data: updateData,
    })
    
    console.log('Successfully updated collection')
    return NextResponse.json(updatedCollection)

  } catch (error: any) {
    console.error('Error updating collection:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack,
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

export async function DELETE(
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
    console.error('Error deleting collection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


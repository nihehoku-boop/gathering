import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both sync and async params (Next.js 14 vs 15+)
    const resolvedParams = await Promise.resolve(params)
    const collectionId = resolvedParams.id
    
    console.log('[API] Fetching recommended collection:', collectionId)
    const collection = await prisma.recommendedCollection.findUnique({
      where: { id: collectionId },
      include: {
        items: {
          orderBy: [
            { number: 'asc' },
            { name: 'asc' },
          ],
        },
      },
    })

    if (!collection) {
      console.error('[API] Collection not found:', collectionId)
      return NextResponse.json(
        { error: 'Collection not found', id: collectionId },
        { status: 404 }
      )
    }

    const response = NextResponse.json(collection)
    // Cache recommended collection details for 10 minutes (they don't change frequently)
    response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200')
    return response
  } catch (error) {
    console.error('[API] Error fetching recommended collection:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Handle both sync and async params
    const resolvedParams = await Promise.resolve(params)
    const collectionId = resolvedParams.id

    const body = await request.json()
    const { name, description, category, template, customFieldDefinitions, coverImage, coverImageFit, tags, isPublic } = body

    const updateData: any = {}

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

    if (template !== undefined) {
      updateData.template = template && String(template).trim() ? String(template).trim() : 'custom'
    }

    if (customFieldDefinitions !== undefined) {
      // Ensure customFieldDefinitions is a valid JSON string
      try {
        if (typeof customFieldDefinitions === 'string') {
          if (customFieldDefinitions.trim() === '') {
            updateData.customFieldDefinitions = '[]'
          } else {
            const parsed = JSON.parse(customFieldDefinitions)
            if (Array.isArray(parsed)) {
              updateData.customFieldDefinitions = customFieldDefinitions
            } else {
              updateData.customFieldDefinitions = '[]'
            }
          }
        } else if (Array.isArray(customFieldDefinitions)) {
          updateData.customFieldDefinitions = JSON.stringify(customFieldDefinitions)
        } else {
          updateData.customFieldDefinitions = '[]'
        }
      } catch (e) {
        console.error('Error parsing customFieldDefinitions:', e)
        updateData.customFieldDefinitions = '[]'
      }
    }

    if (coverImage !== undefined) {
      updateData.coverImage = coverImage && String(coverImage).trim() ? String(coverImage).trim() : null
    }

    if (coverImageFit !== undefined) {
      updateData.coverImageFit = coverImageFit && (coverImageFit === 'cover' || coverImageFit === 'contain') ? coverImageFit : 'contain'
    }

    if (tags !== undefined) {
      // Ensure tags is a valid JSON string
      try {
        if (typeof tags === 'string') {
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

    if (isPublic !== undefined) {
      updateData.isPublic = isPublic === true || isPublic === 'true'
    }

    const collection = await prisma.recommendedCollection.update({
      where: { id: collectionId },
      data: updateData,
    })

    return NextResponse.json(collection)
  } catch (error) {
    console.error('Error updating recommended collection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Handle both sync and async params
    const resolvedParams = await Promise.resolve(params)
    const collectionId = resolvedParams.id

    await prisma.recommendedCollection.delete({
      where: { id: collectionId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting recommended collection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


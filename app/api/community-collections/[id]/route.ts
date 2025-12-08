import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const collection = await prisma.communityCollection.findUnique({
      where: { id: resolvedParams.id },
      include: {
        items: {
          orderBy: [
            { number: 'asc' },
            { name: 'asc' },
          ],
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Community collection not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(collection)
  } catch (error) {
    console.error('Error fetching community collection:', error)
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

    const resolvedParams = await Promise.resolve(params)
    const collection = await prisma.communityCollection.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Community collection not found' },
        { status: 404 }
      )
    }

    // Only the creator can edit
    if (collection.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only edit your own collections' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, category, template, coverImage, coverImageFit, tags } = body

    const updateData: any = {}

    if (name !== undefined) {
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
      updateData.description = description ? String(description).trim() : null
    }

    if (category !== undefined) {
      updateData.category = category ? String(category).trim() : null
    }

    if (template !== undefined) {
      updateData.template = template ? String(template).trim() : null
    }

    if (coverImage !== undefined) {
      updateData.coverImage = coverImage ? String(coverImage).trim() : null
    }

    if (coverImageFit !== undefined) {
      updateData.coverImageFit = coverImageFit && (coverImageFit === 'cover' || coverImageFit === 'contain') ? coverImageFit : 'contain'
    }

    if (tags !== undefined) {
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
        updateData.tags = '[]'
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    const updatedCollection = await prisma.communityCollection.update({
      where: { id: resolvedParams.id },
      data: updateData,
    })

    return NextResponse.json(updatedCollection)
  } catch (error) {
    console.error('Error updating community collection:', error)
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

    const resolvedParams = await Promise.resolve(params)
    const collection = await prisma.communityCollection.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Community collection not found' },
        { status: 404 }
      )
    }

    // Only the creator can delete
    if (collection.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only delete your own collections' },
        { status: 403 }
      )
    }

    await prisma.communityCollection.delete({
      where: { id: resolvedParams.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting community collection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}




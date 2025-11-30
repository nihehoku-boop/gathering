import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'
import { checkAllAchievements } from '@/lib/achievement-checker'

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
    const itemId = resolvedParams.id

    const body = await request.json()
    const { isOwned, name, notes, image, alternativeImages, wear, personalRating, logDate, customFields } = body

    const item = await prisma.item.findFirst({
      where: { id: itemId },
      include: {
        collection: {
          select: { userId: true },
        },
      },
    })

    if (!item || item.collection.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}

    if (isOwned !== undefined) {
      updateData.isOwned = isOwned
    }

    if (name !== undefined && name !== null) {
      const trimmedName = String(name).trim()
      if (trimmedName) {
        updateData.name = trimmedName
      } else {
        return NextResponse.json(
          { error: 'Item name cannot be empty' },
          { status: 400 }
        )
      }
    }

    if (notes !== undefined) {
      updateData.notes = notes ? String(notes).trim() : null
    }

    if (image !== undefined) {
      const trimmedImage = String(image).trim()
      updateData.image = trimmedImage || null
    }

    if (alternativeImages !== undefined) {
      // Ensure alternativeImages is a valid JSON array
      if (Array.isArray(alternativeImages)) {
        updateData.alternativeImages = JSON.stringify(alternativeImages.filter(img => img && img.trim()))
      } else if (typeof alternativeImages === 'string') {
        try {
          const parsed = JSON.parse(alternativeImages)
          if (Array.isArray(parsed)) {
            updateData.alternativeImages = JSON.stringify(parsed.filter(img => img && img.trim()))
          } else {
            updateData.alternativeImages = '[]'
          }
        } catch {
          updateData.alternativeImages = '[]'
        }
      } else {
        updateData.alternativeImages = '[]'
      }
    }

    if (wear !== undefined) {
      updateData.wear = wear ? String(wear).trim() : null
    }

    if (personalRating !== undefined) {
      const rating = personalRating ? parseInt(String(personalRating)) : null
      updateData.personalRating = rating && rating > 0 ? rating : null
    }

    if (logDate !== undefined) {
      updateData.logDate = logDate ? new Date(logDate) : null
    }

    if (customFields !== undefined) {
      // Ensure customFields is a valid JSON object
      if (typeof customFields === 'object' && customFields !== null) {
        updateData.customFields = JSON.stringify(customFields)
      } else if (typeof customFields === 'string') {
        try {
          const parsed = JSON.parse(customFields)
          if (typeof parsed === 'object' && parsed !== null) {
            updateData.customFields = customFields
          } else {
            updateData.customFields = '{}'
          }
        } catch {
          updateData.customFields = '{}'
        }
      } else {
        updateData.customFields = '{}'
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: updateData,
    })

    // Check and unlock achievements (especially if isOwned changed)
    const newlyUnlocked = await checkAllAchievements(session.user.id)

    return NextResponse.json({
      ...updatedItem,
      newlyUnlockedAchievements: newlyUnlocked,
    })
  } catch (error: any) {
    console.error('Error updating item:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
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
    const itemId = resolvedParams.id

    const item = await prisma.item.findFirst({
      where: { id: itemId },
      include: {
        collection: {
          select: { userId: true },
        },
      },
    })

    if (!item || item.collection.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    await prisma.item.delete({
      where: { id: itemId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'
import { checkAllAchievements } from '@/lib/achievement-checker'
import { withRateLimit } from '@/lib/rate-limit-middleware'
import { rateLimitConfigs } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { safeParseJson, sanitizeObject } from '@/lib/sanitize'

async function updateItemHandler(
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
      // Ensure customFields is a valid JSON object with prototype pollution protection
      if (typeof customFields === 'object' && customFields !== null && !Array.isArray(customFields)) {
        // Sanitize object to prevent prototype pollution
        const sanitized = sanitizeObject(customFields)
        updateData.customFields = JSON.stringify(sanitized)
      } else if (typeof customFields === 'string') {
        try {
          const parsed = safeParseJson<Record<string, any>>(customFields)
          if (parsed && typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
            // Sanitize to prevent prototype pollution
            const sanitized = sanitizeObject(parsed)
            updateData.customFields = JSON.stringify(sanitized)
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

    // Only check achievements if relevant fields changed (isOwned, notes, image, rating, logDate)
    // This avoids unnecessary database queries on every update
    const shouldCheckAchievements = 
      updateData.isOwned !== undefined ||
      updateData.notes !== undefined ||
      updateData.image !== undefined ||
      updateData.personalRating !== undefined ||
      updateData.logDate !== undefined

    const newlyUnlocked = shouldCheckAchievements 
      ? await checkAllAchievements(session.user.id)
      : []

    return NextResponse.json({
      ...updatedItem,
      newlyUnlockedAchievements: newlyUnlocked,
    })
  } catch (error: any) {
    logger.error('Error updating item:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

async function deleteItemHandler(
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
    logger.error('Error deleting item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const PATCH = withRateLimit(
  updateItemHandler,
  rateLimitConfigs.write,
  async (request) => {
    const session = await getServerSession(authOptions)
    return session?.user?.id
  }
)

export const DELETE = withRateLimit(
  deleteItemHandler,
  rateLimitConfigs.write,
  async (request) => {
    const session = await getServerSession(authOptions)
    return session?.user?.id
  }
)

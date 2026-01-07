import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'
import { checkAllAchievements } from '@/lib/achievement-checker'
import { withRateLimit } from '@/lib/rate-limit-middleware'
import { rateLimitConfigs } from '@/lib/rate-limit'
import { validateRequestBody, createItemSchema } from '@/lib/validation-schemas'
import { logger } from '@/lib/logger'

async function createItemHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate request body
    const validation = await validateRequestBody(request, createItemSchema)
    if (!validation.success) {
      logger.error('Item creation validation failed:', {
        error: validation.error,
        status: validation.status,
      })
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }
    const { 
      collectionId, 
      name, 
      number, 
      image, 
      notes, 
      alternativeImages, 
      wear, 
      personalRating, 
      logDate, 
      customFields 
    } = validation.data

    // Verify collection belongs to user
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

    const item = await prisma.item.create({
      data: {
        collectionId,
        name,
        number: number ?? null,
        image: image || null,
        notes: notes || null,
        alternativeImages: alternativeImages && alternativeImages.length > 0 
          ? JSON.stringify(alternativeImages) 
          : null,
        wear: wear || null,
        personalRating: personalRating ?? null,
        logDate: logDate || null,
        customFields: customFields ? JSON.stringify(customFields) : null,
      },
    })

    // Check and unlock achievements
    const newlyUnlocked = await checkAllAchievements(session.user.id)

    return NextResponse.json({
      ...item,
      newlyUnlockedAchievements: newlyUnlocked,
    }, { status: 201 })
  } catch (error) {
    logger.error('Error creating item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = withRateLimit(
  createItemHandler,
  rateLimitConfigs.write,
  async (request) => {
    const session = await getServerSession(authOptions)
    return session?.user?.id
  }
)


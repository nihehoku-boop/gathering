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
    let validation: any
    try {
      validation = await validateRequestBody(request, createItemSchema)
    } catch (validationError: any) {
      logger.error('Item creation validation threw error:', {
        error: validationError?.message,
        stack: validationError?.stack,
      })
      return NextResponse.json(
        { error: 'Validation error: ' + (validationError?.message || 'Unknown error'), details: process.env.NODE_ENV === 'development' ? validationError?.stack : undefined },
        { status: 400 }
      )
    }
    
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

    // Prepare item data
    const itemData: any = {
      collectionId,
      name,
      number: number ?? null,
      image: image || null,
      notes: notes || null,
      wear: wear || null,
      personalRating: personalRating ?? null,
      logDate: logDate || null,
    }

    // Handle alternativeImages - Prisma expects a string with default "[]"
    if (Array.isArray(alternativeImages) && alternativeImages.length > 0) {
      itemData.alternativeImages = JSON.stringify(alternativeImages)
    } else {
      // Use default empty array as string if no images provided
      itemData.alternativeImages = '[]'
    }

    // Handle customFields - Prisma expects a string with default "{}"
    if (customFields && typeof customFields === 'object' && Object.keys(customFields).length > 0) {
      try {
        itemData.customFields = JSON.stringify(customFields)
      } catch (jsonError) {
        logger.error('Failed to stringify customFields:', jsonError)
        itemData.customFields = '{}'
      }
    } else {
      // Use default empty object as string if no custom fields provided
      itemData.customFields = '{}'
    }

    let item
    try {
      item = await prisma.item.create({
        data: itemData,
      })
    } catch (prismaError: any) {
      logger.error('Prisma error creating item:', {
        error: prismaError?.message,
        code: prismaError?.code,
        meta: prismaError?.meta,
        itemData: {
          ...itemData,
          alternativeImages: itemData.alternativeImages?.substring(0, 100),
          customFields: itemData.customFields?.substring(0, 100),
        },
      })
      return NextResponse.json(
        { 
          error: 'Database error creating item',
          details: process.env.NODE_ENV === 'development' ? prismaError?.message : undefined,
          code: prismaError?.code,
        },
        { status: 500 }
      )
    }

    // Check and unlock achievements (don't fail if this errors)
    let newlyUnlocked: string[] = []
    try {
      newlyUnlocked = await checkAllAchievements(session.user.id)
    } catch (achievementError) {
      logger.error('Error checking achievements (non-fatal):', achievementError)
    }

    return NextResponse.json({
      ...item,
      newlyUnlockedAchievements: newlyUnlocked,
    }, { status: 201 })
  } catch (error) {
    logger.error('Unexpected error creating item:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('[Item Creation] Unexpected error:', {
      error: errorMessage,
      stack: errorStack,
      errorType: error?.constructor?.name,
      errorCode: (error as any)?.code,
    })
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      },
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


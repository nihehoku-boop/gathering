import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { withRateLimit } from '@/lib/rate-limit-middleware'
import { rateLimitConfigs } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const reportSchema = z.object({
  reason: z.enum(['spam', 'inappropriate', 'copyright', 'other']),
  description: z.string().max(1000).optional(),
})

async function reportCollectionHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const resolvedParams = await Promise.resolve(params)
    const collectionId = resolvedParams.id

    // Validate request body
    const body = await request.json()
    const validation = reportSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { reason, description } = validation.data

    // Check if collection exists
    const collection = await prisma.communityCollection.findUnique({
      where: { id: collectionId },
      select: { id: true, userId: true },
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    // Prevent users from reporting their own content
    if (collection.userId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot report your own content' },
        { status: 400 }
      )
    }

    // Check if user already reported this collection
    const existingReport = await prisma.contentReport.findUnique({
      where: {
        communityCollectionId_reporterId: {
          communityCollectionId: collectionId,
          reporterId: session.user.id,
        },
      },
    })

    if (existingReport) {
      return NextResponse.json(
        { error: 'You have already reported this collection' },
        { status: 409 }
      )
    }

    // Create report
    const report = await prisma.contentReport.create({
      data: {
        communityCollectionId: collectionId,
        reporterId: session.user.id,
        reason,
        description: description || null,
        status: 'pending',
      },
    })

    logger.info(`Content report created: ${report.id} for collection ${collectionId} by user ${session.user.id}`)

    return NextResponse.json({
      message: 'Report submitted successfully',
      report: {
        id: report.id,
        status: report.status,
      },
    }, { status: 201 })
  } catch (error) {
    logger.error('Error creating content report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = withRateLimit(reportCollectionHandler, rateLimitConfigs.write)


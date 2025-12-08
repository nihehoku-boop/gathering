import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { withRateLimit } from '@/lib/rate-limit-middleware'
import { rateLimitConfigs } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { isUserAdmin } from '@/lib/user-cache'
import { z } from 'zod'

const updateReportSchema = z.object({
  action: z.enum(['dismiss', 'hide', 'resolve']),
  adminNotes: z.string().max(1000).optional(),
})

async function updateReportHandler(
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

    // Check if user is admin
    const isAdmin = await isUserAdmin(session.user.id)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const resolvedParams = await Promise.resolve(params)
    const reportId = resolvedParams.id

    // Validate request body
    const body = await request.json()
    const validation = updateReportSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { action, adminNotes } = validation.data

    // Get the report
    const report = await prisma.contentReport.findUnique({
      where: { id: reportId },
      include: {
        communityCollection: {
          select: { id: true },
        },
      },
    })

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    // Update report status
    let newStatus = 'reviewed'
    if (action === 'dismiss') {
      newStatus = 'dismissed'
    } else if (action === 'resolve') {
      newStatus = 'resolved'
    }

    // Update report
    await prisma.contentReport.update({
      where: { id: reportId },
      data: {
        status: newStatus,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        adminNotes: adminNotes || null,
      },
    })

    // If action is 'hide', hide the collection
    if (action === 'hide') {
      await prisma.communityCollection.update({
        where: { id: report.communityCollection.id },
        data: {
          isHidden: true,
          moderationNotes: adminNotes || null,
        },
      })
    }

    logger.info(`Report ${reportId} updated by admin ${session.user.id}: ${action}`)

    return NextResponse.json({
      message: 'Report updated successfully',
    })
  } catch (error) {
    logger.error('Error updating report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const PATCH = withRateLimit(updateReportHandler, rateLimitConfigs.write)


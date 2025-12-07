import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'
import { prismaLogger } from '@/lib/prisma-logger'
import { logger } from '@/lib/logger'

/**
 * GET /api/admin/prisma-logs
 * Get Prisma operation logs (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get query parameters
    const url = new URL(request.url)
    const format = url.searchParams.get('format') || 'json' // 'json' or 'stats'
    const operation = url.searchParams.get('operation')
    const model = url.searchParams.get('model')
    const minDuration = url.searchParams.get('minDuration')
    const userId = url.searchParams.get('userId')
    const collectionId = url.searchParams.get('collectionId')
    const limit = parseInt(url.searchParams.get('limit') || '100')

    if (format === 'stats') {
      // Return statistics
      const stats = prismaLogger.getStatistics()
      // Include debug info in development
      const debugInfo = process.env.NODE_ENV === 'development' ? {
        enabled: prismaLogger.isEnabled(),
        totalLogs: prismaLogger.getLogs().length,
        env: {
          NODE_ENV: process.env.NODE_ENV,
          ENABLE_PRISMA_LOGGING: process.env.ENABLE_PRISMA_LOGGING,
        },
      } : undefined
      return NextResponse.json({ ...stats, _debug: debugInfo })
    }

    // Get filtered logs
    const filters: any = {}
    if (operation) filters.operation = operation
    if (model) filters.model = model
    if (minDuration) filters.minDuration = parseInt(minDuration)
    if (userId) filters.userId = userId
    if (collectionId) filters.collectionId = collectionId

    let logs = filters.operation || filters.model || filters.minDuration || filters.userId || filters.collectionId
      ? prismaLogger.getLogsFiltered(filters)
      : prismaLogger.getLogs()

    // Limit results
    logs = logs.slice(-limit) // Get last N logs

    return NextResponse.json({
      logs,
      count: logs.length,
      total: prismaLogger.getLogs().length,
    })
  } catch (error) {
    logger.error('Error fetching Prisma logs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/prisma-logs
 * Clear Prisma operation logs (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    prismaLogger.clearLogs()

    return NextResponse.json({ success: true, message: 'Logs cleared' })
  } catch (error) {
    logger.error('Error clearing Prisma logs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/prisma-logs/export
 * Export Prisma logs (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const type = body.type || 'logs' // 'logs' or 'stats'

    if (type === 'stats') {
      const stats = prismaLogger.exportStatistics()
      return NextResponse.json({ type: 'stats', data: JSON.parse(stats) })
    }

    const logs = prismaLogger.exportLogs()
    return NextResponse.json({ type: 'logs', data: JSON.parse(logs) })
  } catch (error) {
    logger.error('Error exporting Prisma logs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


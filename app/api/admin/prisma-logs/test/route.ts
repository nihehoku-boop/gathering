import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'
import { prismaLogger } from '@/lib/prisma-logger'
import { logger } from '@/lib/logger'

/**
 * GET /api/admin/prisma-logs/test
 * Test endpoint to verify Prisma logging is working (admin only)
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

    // Get initial log count
    const initialLogCount = prismaLogger.getLogs().length

    // Perform some test Prisma operations to trigger logging
    const testOperations = []
    
    // Test 1: Simple findMany
    testOperations.push({
      name: 'User count',
      operation: async () => {
        await prisma.user.count()
      },
    })

    // Test 2: findUnique
    testOperations.push({
      name: 'Find current user',
      operation: async () => {
        await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { id: true, email: true },
        })
      },
    })

    // Test 3: findFirst
    testOperations.push({
      name: 'Find first collection',
      operation: async () => {
        await prisma.collection.findFirst({
          where: { userId: session.user.id },
          select: { id: true },
        })
      },
    })

    // Execute test operations
    const results = []
    for (const test of testOperations) {
      try {
        const startTime = Date.now()
        await test.operation()
        const duration = Date.now() - startTime
        results.push({
          name: test.name,
          success: true,
          duration,
        })
      } catch (error) {
        results.push({
          name: test.name,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    // Get final log count
    const finalLogCount = prismaLogger.getLogs().length
    const newLogs = finalLogCount - initialLogCount

    // Get recent logs
    const recentLogs = prismaLogger.getLogs().slice(-newLogs)

    return NextResponse.json({
      success: true,
      loggerEnabled: prismaLogger.isEnabled(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        ENABLE_PRISMA_LOGGING: process.env.ENABLE_PRISMA_LOGGING,
      },
      testResults: results,
      logging: {
        initialLogCount,
        finalLogCount,
        newLogs,
        recentLogs: recentLogs.map(log => ({
          operation: log.operation,
          model: log.model,
          duration: log.duration,
          timestamp: log.timestamp,
        })),
      },
    })
  } catch (error) {
    logger.error('Error testing Prisma logs:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}


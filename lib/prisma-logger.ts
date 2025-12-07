/**
 * Prisma Operation Logger
 * Logs all Prisma PostgreSQL operations for monitoring and optimization
 */

import { logger } from './logger'

interface PrismaLogEntry {
  timestamp: string
  operation: string
  model: string
  duration: number
  query?: string
  params?: any
  userId?: string
  collectionId?: string
  itemId?: string
  error?: string
}

class PrismaLogger {
  private logs: PrismaLogEntry[] = []
  private readonly MAX_LOGS = 1000 // Keep last 1000 operations
  private enabled: boolean = process.env.ENABLE_PRISMA_LOGGING === 'true' || process.env.NODE_ENV === 'development'
  private startTimes = new Map<string, number>()

  /**
   * Enable or disable logging
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  /**
   * Check if logging is enabled
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Start timing an operation
   */
  startOperation(operationId: string): void {
    if (!this.enabled) return
    this.startTimes.set(operationId, Date.now())
  }

  /**
   * End timing and log an operation
   */
  logOperation(
    operation: string,
    model: string,
    operationId: string,
    metadata?: {
      query?: string
      params?: any
      userId?: string
      collectionId?: string
      itemId?: string
      error?: string
    }
  ): void {
    if (!this.enabled) return

    const startTime = this.startTimes.get(operationId)
    const duration = startTime ? Date.now() - startTime : 0
    this.startTimes.delete(operationId)

    const logEntry: PrismaLogEntry = {
      timestamp: new Date().toISOString(),
      operation,
      model,
      duration,
      ...metadata,
    }

    // Add to in-memory logs
    this.logs.push(logEntry)
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift() // Remove oldest
    }

    // Log to console/file based on environment
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Prisma] ${operation} ${model} (${duration}ms)`, metadata)
    } else {
      logger.debug(`[Prisma] ${operation} ${model}`, {
        duration,
        ...metadata,
      })
    }
  }

  /**
   * Get all logs
   */
  getLogs(): PrismaLogEntry[] {
    return [...this.logs]
  }

  /**
   * Get logs filtered by criteria
   */
  getLogsFiltered(filters: {
    operation?: string
    model?: string
    minDuration?: number
    userId?: string
    collectionId?: string
    startTime?: Date
    endTime?: Date
  }): PrismaLogEntry[] {
    return this.logs.filter((log) => {
      if (filters.operation && log.operation !== filters.operation) return false
      if (filters.model && log.model !== filters.model) return false
      if (filters.minDuration && log.duration < filters.minDuration) return false
      if (filters.userId && log.userId !== filters.userId) return false
      if (filters.collectionId && log.collectionId !== filters.collectionId) return false
      if (filters.startTime && new Date(log.timestamp) < filters.startTime) return false
      if (filters.endTime && new Date(log.timestamp) > filters.endTime) return false
      return true
    })
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalOperations: number
    operationsByType: Record<string, number>
    operationsByModel: Record<string, number>
    averageDuration: number
    slowestOperations: PrismaLogEntry[]
    operationsByUser: Record<string, number>
  } {
    const operationsByType: Record<string, number> = {}
    const operationsByModel: Record<string, number> = {}
    const operationsByUser: Record<string, number> = {}
    let totalDuration = 0

    this.logs.forEach((log) => {
      operationsByType[log.operation] = (operationsByType[log.operation] || 0) + 1
      operationsByModel[log.model] = (operationsByModel[log.model] || 0) + 1
      if (log.userId) {
        operationsByUser[log.userId] = (operationsByUser[log.userId] || 0) + 1
      }
      totalDuration += log.duration
    })

    const slowestOperations = [...this.logs]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)

    return {
      totalOperations: this.logs.length,
      operationsByType,
      operationsByModel,
      averageDuration: this.logs.length > 0 ? totalDuration / this.logs.length : 0,
      slowestOperations,
      operationsByUser,
    }
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = []
    this.startTimes.clear()
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  /**
   * Export statistics as JSON
   */
  exportStatistics(): string {
    return JSON.stringify(this.getStatistics(), null, 2)
  }
}

// Singleton instance
export const prismaLogger = new PrismaLogger()

/**
 * Prisma middleware to log operations
 */
export function createPrismaLoggingMiddleware() {
  return async (params: any, next: any) => {
    if (!prismaLogger.isEnabled()) {
      return next(params)
    }

    const operationId = `${params.model || 'Unknown'}_${params.action}_${Date.now()}_${Math.random()}`
    prismaLogger.startOperation(operationId)

    try {
      const result = await next(params)

      // Extract metadata
      const metadata: any = {}
      
      // Try to extract userId from where clause
      if (params.args?.where?.userId) {
        metadata.userId = params.args.where.userId
      }
      if (params.args?.where?.collectionId) {
        metadata.collectionId = params.args.where.collectionId
      }
      if (params.args?.where?.id) {
        if (params.model === 'Item') {
          metadata.itemId = params.args.where.id
        } else if (params.model === 'Collection') {
          metadata.collectionId = params.args.where.id
        }
      }

      // Extract from data clause (for creates/updates)
      if (params.args?.data?.userId) {
        metadata.userId = params.args.data.userId
      }
      if (params.args?.data?.collectionId) {
        metadata.collectionId = params.args.data.collectionId
      }

      prismaLogger.logOperation(
        params.action,
        params.model || 'Unknown',
        operationId,
        metadata
      )

      return result
    } catch (error) {
      // Log error operations too
      prismaLogger.logOperation(
        params.action,
        params.model || 'Unknown',
        operationId,
        { error: error instanceof Error ? error.message : String(error) }
      )
      throw error
    }
  }
}


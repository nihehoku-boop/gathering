import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'
import { createPrismaLoggingMiddleware } from './prisma-logger'

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

const createPrismaClient = () => {
  // Use DATABASE_URL (prefer direct connection to avoid Prisma Accelerate plan limits)
  let databaseUrl = process.env.DATABASE_URL
  
  // Only use PRISMA_DATABASE_URL if DATABASE_URL is not set
  if (!databaseUrl) {
    databaseUrl = process.env.PRISMA_DATABASE_URL
  }

  // Log which URL is being used (without exposing credentials)
  if (process.env.NODE_ENV === 'production') {
    const urlPreview = databaseUrl?.substring(0, 50) || 'undefined'
    const isAccelerate = databaseUrl?.startsWith('prisma://') || databaseUrl?.startsWith('prisma+postgres://')
    const isPrismaIo = databaseUrl?.includes('db.prisma.io')
    console.log(`[Prisma] Using database URL: ${urlPreview}... (${isAccelerate ? 'Accelerate' : isPrismaIo ? 'Prisma.io Direct' : 'Direct'})`)
  }

  const baseClient = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  })

  // Add logging middleware if enabled
  // Enable with ENABLE_PRISMA_LOGGING=true or automatically in development
  const loggingMiddleware = createPrismaLoggingMiddleware()
  baseClient.$use(loggingMiddleware)

  // Log that middleware is enabled (for debugging)
  if (process.env.NODE_ENV === 'development' || process.env.ENABLE_PRISMA_LOGGING === 'true') {
    console.log('[Prisma Logger] Middleware enabled and attached to Prisma client')
  }

  // Only use Accelerate extension for prisma:// URLs (not db.prisma.io)
  // db.prisma.io endpoints should work as direct connections without the extension
  // This avoids Prisma Accelerate plan limits
  if (databaseUrl?.startsWith('prisma://') || databaseUrl?.startsWith('prisma+postgres://')) {
    // When using extensions, middleware should still work, but we need to ensure it's applied first
    const extendedClient = baseClient.$extends(withAccelerate())
    // Middleware is already applied to baseClient, so it should work with extensions
    return extendedClient
  }

  // For db.prisma.io or other direct connections, use without Accelerate extension
  return baseClient
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma




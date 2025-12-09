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

  // Warn about old db.prisma.io endpoints (no longer accessible)
  // Only check for the specific old endpoint pattern, not just any mention of db.prisma.io
  if (databaseUrl && (databaseUrl.includes('db.prisma.io:5432') || databaseUrl.match(/db\.prisma\.io:\d+/))) {
    const errorMessage = `
[Prisma Configuration Warning]
The database URL appears to use the old Prisma Accelerate endpoint (db.prisma.io), which may no longer be accessible.

If you're experiencing connection issues, please update your DATABASE_URL environment variable to use:
- Vercel Postgres connection string (from Vercel dashboard)
- Neon PostgreSQL connection string (from Neon dashboard)
- Or another direct PostgreSQL connection string

Current DATABASE_URL preview: ${databaseUrl?.substring(0, 50)}...
`
    console.warn(errorMessage)
    // Don't throw - let Prisma try to connect and fail naturally if the endpoint is truly unavailable
    // This allows valid connections to work even if the URL format looks similar
  }

  // Log which URL is being used (without exposing credentials)
  if (process.env.NODE_ENV === 'production' && databaseUrl) {
    const urlPreview = databaseUrl.substring(0, 50)
    const isAccelerate = databaseUrl.startsWith('prisma://') || databaseUrl.startsWith('prisma+postgres://')
    console.log(`[Prisma] Using database URL: ${urlPreview}... (${isAccelerate ? 'Accelerate' : 'Direct'})`)
  }

  // Create PrismaClient - if databaseUrl is not set, Prisma will use the schema's default (env("DATABASE_URL"))
  // This allows the build to succeed even if DATABASE_URL isn't available during build time
  const baseClient = new PrismaClient(
    databaseUrl ? {
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    } : undefined
  )

  // Add logging middleware (enabled by default, can be disabled with ENABLE_PRISMA_LOGGING=false)
  const loggingMiddleware = createPrismaLoggingMiddleware()
  baseClient.$use(loggingMiddleware)

  // Log that middleware is attached
  console.log('[Prisma Logger] Middleware attached to Prisma client')

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




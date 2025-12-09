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

  // Reject old db.prisma.io endpoints (no longer accessible)
  if (databaseUrl?.includes('db.prisma.io')) {
    const errorMessage = `
[Prisma Configuration Error]
The database URL contains 'db.prisma.io', which is no longer accessible.

Please update your DATABASE_URL environment variable to use:
- Vercel Postgres connection string (from Vercel dashboard)
- Neon PostgreSQL connection string (from Neon dashboard)
- Or another direct PostgreSQL connection string

Current DATABASE_URL preview: ${databaseUrl?.substring(0, 50)}...

To fix:
1. Go to your Vercel/Neon dashboard
2. Copy the PostgreSQL connection string
3. Update the DATABASE_URL environment variable in Vercel
4. Redeploy your application
`
    console.error(errorMessage)
    throw new Error('Invalid database URL: db.prisma.io endpoint is no longer accessible. Please update DATABASE_URL to use a direct PostgreSQL connection.')
  }

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set. Please configure your database connection.')
  }

  // Log which URL is being used (without exposing credentials)
  if (process.env.NODE_ENV === 'production') {
    const urlPreview = databaseUrl?.substring(0, 50) || 'undefined'
    const isAccelerate = databaseUrl?.startsWith('prisma://') || databaseUrl?.startsWith('prisma+postgres://')
    console.log(`[Prisma] Using database URL: ${urlPreview}... (${isAccelerate ? 'Accelerate' : 'Direct'})`)
  }

  const baseClient = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  })

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




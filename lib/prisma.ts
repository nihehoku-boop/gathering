import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

const createPrismaClient = () => {
  // Prefer direct DATABASE_URL over PRISMA_DATABASE_URL to avoid plan limits
  // Only use PRISMA_DATABASE_URL if DATABASE_URL is not set or points to db.prisma.io
  let databaseUrl = process.env.DATABASE_URL
  
  // If DATABASE_URL points to db.prisma.io (broken Accelerate endpoint), try PRISMA_DATABASE_URL
  if (!databaseUrl || databaseUrl.includes('db.prisma.io')) {
    databaseUrl = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL
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

  // If using Prisma Accelerate URL (prisma://), use the extension
  // Note: Accelerate has plan limits, so prefer direct connection
  if (databaseUrl?.startsWith('prisma://') || databaseUrl?.startsWith('prisma+postgres://')) {
    return baseClient.$extends(withAccelerate())
  }

  return baseClient
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma




import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

const createPrismaClient = () => {
  // Use PRISMA_DATABASE_URL if available (Prisma Accelerate), otherwise use DATABASE_URL
  const databaseUrl = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL

  // Log which URL is being used (without exposing credentials)
  if (process.env.NODE_ENV === 'production') {
    const urlPreview = databaseUrl?.substring(0, 50) || 'undefined'
    console.log(`[Prisma] Using database URL: ${urlPreview}... (${databaseUrl?.startsWith('prisma://') || databaseUrl?.startsWith('prisma+postgres://') ? 'Accelerate' : 'Direct'})`)
  }

  const baseClient = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  })

  // If using Prisma Accelerate URL (prisma://), use the extension
  if (databaseUrl?.startsWith('prisma://') || databaseUrl?.startsWith('prisma+postgres://')) {
    return baseClient.$extends(withAccelerate())
  }

  return baseClient
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma




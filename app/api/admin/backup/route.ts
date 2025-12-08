import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { isUserAdmin } from '@/lib/user-cache'
import { logger } from '@/lib/logger'
import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const execAsync = promisify(exec)

/**
 * Manual backup endpoint for admins
 * Uses pg_dump which does NOT count as Prisma operations
 * 
 * Note: This requires pg_dump to be available in the environment
 * For Vercel deployments, consider using a serverless function with
 * a PostgreSQL client library instead
 */
async function createBackupHandler(request: NextRequest) {
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

    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      return NextResponse.json(
        { error: 'DATABASE_URL not configured' },
        { status: 500 }
      )
    }

    // Parse database URL
    const url = new URL(databaseUrl)
    const dbName = url.pathname.slice(1) // Remove leading /
    const dbHost = url.hostname
    const dbPort = url.port || '5432'
    const dbUser = url.username
    const dbPassword = url.password

    // Create backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFileName = `backup-${timestamp}.sql`
    
    // For Vercel/serverless, we'll return instructions instead of creating file
    // In production, you'd want to stream this to cloud storage (S3, etc.)
    const pgDumpCommand = `PGPASSWORD="${dbPassword}" pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -F c -b -v`

    logger.info('Backup requested by admin', { userId: session.user.id, timestamp })

    // Return backup instructions and command
    // In a real implementation, you'd execute this and upload to cloud storage
    return NextResponse.json({
      message: 'Backup command generated',
      instructions: 'For automated backups, use Vercel Cron Jobs with a cloud storage solution',
      command: pgDumpCommand.replace(dbPassword, '***'),
      timestamp,
      backupFileName,
      note: 'This endpoint provides the backup command. Actual backup execution should be done via Vercel Cron Jobs or external service.',
    })
  } catch (error) {
    logger.error('Error creating backup:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = createBackupHandler


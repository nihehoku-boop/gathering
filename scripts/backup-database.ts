/**
 * Database Backup Script
 * 
 * This script creates a backup of your Vercel Postgres database using pg_dump.
 * 
 * IMPORTANT: pg_dump operations do NOT count as Prisma operations.
 * They are direct PostgreSQL read operations.
 * 
 * Usage:
 *   npm run backup:db
 * 
 * Requirements:
 *   - PostgreSQL client tools installed (pg_dump)
 *   - DATABASE_URL environment variable set
 * 
 * For automated backups on Vercel:
 *   - Use Vercel Cron Jobs (vercel.json)
 *   - Store backups in cloud storage (S3, etc.)
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import * as dotenv from 'dotenv'
import { writeFile } from 'fs/promises'
import { join } from 'path'

dotenv.config()

const execAsync = promisify(exec)

interface BackupOptions {
  outputDir?: string
  compress?: boolean
  uploadToS3?: boolean
}

async function backupDatabase(options: BackupOptions = {}) {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  try {
    // Parse database URL
    const url = new URL(databaseUrl)
    const dbName = url.pathname.slice(1)
    const dbHost = url.hostname
    const dbPort = url.port || '5432'
    const dbUser = url.username
    const dbPassword = url.password

    // Create backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFileName = options.compress
      ? `backup-${timestamp}.dump`
      : `backup-${timestamp}.sql`
    
    const outputDir = options.outputDir || join(process.cwd(), 'backups')
    const outputPath = join(outputDir, backupFileName)

    console.log(`[Backup] Starting backup of database: ${dbName}`)
    console.log(`[Backup] Host: ${dbHost}:${dbPort}`)
    console.log(`[Backup] Output: ${outputPath}`)

    // Build pg_dump command
    // -F c = custom format (compressed)
    // -b = include blobs
    // -v = verbose
    // -f = output file
    const pgDumpCommand = options.compress
      ? `PGPASSWORD="${dbPassword}" pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -F c -b -v -f "${outputPath}"`
      : `PGPASSWORD="${dbPassword}" pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -F p -v -f "${outputPath}"`

    // Execute backup
    const { stdout, stderr } = await execAsync(pgDumpCommand)

    if (stderr && !stderr.includes('pg_dump: warning')) {
      console.error('[Backup] Warnings:', stderr)
    }

    console.log(`[Backup] ✓ Backup completed successfully`)
    console.log(`[Backup] File: ${outputPath}`)
    
    // Get file size
    const fs = await import('fs/promises')
    const stats = await fs.stat(outputPath)
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2)
    console.log(`[Backup] Size: ${fileSizeMB} MB`)

    return {
      success: true,
      filePath: outputPath,
      fileName: backupFileName,
      size: stats.size,
      timestamp,
    }
  } catch (error) {
    console.error('[Backup] ✗ Backup failed:', error)
    throw error
  }
}

// Run if executed directly
if (require.main === module) {
  backupDatabase({ compress: true })
    .then((result) => {
      console.log('\n[Backup] Summary:', result)
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n[Backup] Error:', error)
      process.exit(1)
    })
}

export { backupDatabase }


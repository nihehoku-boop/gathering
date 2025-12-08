/**
 * Database Restore Script
 * 
 * This script restores a Vercel Postgres database from a backup file.
 * 
 * IMPORTANT: pg_restore operations do NOT count as Prisma operations.
 * They are direct PostgreSQL write operations.
 * 
 * Usage:
 *   npm run restore:db <backup-file-path>
 * 
 * Requirements:
 *   - PostgreSQL client tools installed (pg_restore)
 *   - DATABASE_URL environment variable set
 *   - Backup file path
 * 
 * WARNING: This will overwrite existing data in the database!
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import * as dotenv from 'dotenv'
import { existsSync } from 'fs'

dotenv.config()

const execAsync = promisify(exec)

async function restoreDatabase(backupFilePath: string) {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  if (!existsSync(backupFilePath)) {
    throw new Error(`Backup file not found: ${backupFilePath}`)
  }

  try {
    // Parse database URL
    const url = new URL(databaseUrl)
    const dbName = url.pathname.slice(1)
    const dbHost = url.hostname
    const dbPort = url.port || '5432'
    const dbUser = url.username
    const dbPassword = url.password

    console.log(`[Restore] Starting restore to database: ${dbName}`)
    console.log(`[Restore] Host: ${dbHost}:${dbPort}`)
    console.log(`[Restore] Backup file: ${backupFilePath}`)
    console.log(`[Restore] WARNING: This will overwrite existing data!`)

    // Determine if backup is compressed (custom format) or SQL
    const isCompressed = backupFilePath.endsWith('.dump')

    // Build restore command
    const restoreCommand = isCompressed
      ? `PGPASSWORD="${dbPassword}" pg_restore -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -v --clean --if-exists "${backupFilePath}"`
      : `PGPASSWORD="${dbPassword}" psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -f "${backupFilePath}"`

    // Execute restore
    const { stdout, stderr } = await execAsync(restoreCommand)

    if (stderr && !stderr.includes('pg_restore: warning') && !stderr.includes('NOTICE')) {
      console.error('[Restore] Warnings:', stderr)
    }

    console.log(`[Restore] ✓ Restore completed successfully`)
    
    return {
      success: true,
      database: dbName,
    }
  } catch (error) {
    console.error('[Restore] ✗ Restore failed:', error)
    throw error
  }
}

// Run if executed directly
if (require.main === module) {
  const backupFilePath = process.argv[2]

  if (!backupFilePath) {
    console.error('Usage: npm run restore:db <backup-file-path>')
    process.exit(1)
  }

  restoreDatabase(backupFilePath)
    .then((result) => {
      console.log('\n[Restore] Summary:', result)
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n[Restore] Error:', error)
      process.exit(1)
    })
}

export { restoreDatabase }


/**
 * Script to push Prisma schema changes to the database
 * Loads DATABASE_URL from .env.local and runs prisma db push
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { execSync } from 'child_process'

// Load environment variables from .env.local manually
try {
  const envPath = resolve(process.cwd(), '.env.local')
  const envFile = readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach(line => {
    const trimmedLine = line.trim()
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '')
        process.env[key.trim()] = value.trim()
      }
    }
  })
  console.log('✅ Loaded environment variables from .env.local')
} catch (error) {
  console.error('⚠️  Warning: Could not load .env.local, using existing environment variables')
}

// Verify DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set')
  console.error('   Please set DATABASE_URL in .env.local or as an environment variable')
  process.exit(1)
}

console.log('📤 Pushing schema to database...')
try {
  execSync('npx prisma db push', {
    stdio: 'inherit',
    env: process.env,
  })
  console.log('✅ Schema pushed successfully!')
} catch (error) {
  console.error('❌ Error pushing schema:', error)
  process.exit(1)
}


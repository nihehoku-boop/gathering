import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * Script to set all existing recommended collections to public
 * 
 * Usage:
 * 1. Make sure you have .env.local with production DATABASE_URL
 * 2. Run: npm run set-recommended-public
 */

// Load environment variables from .env.local manually
try {
  const envPath = resolve(process.cwd(), '.env.local')
  const envFile = readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      let value = match[2].trim()
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      // Always override with .env.local values
      process.env[key] = value
    }
  })
  console.log('✅ Loaded environment variables from .env.local')
} catch (error) {
  console.error('⚠️  Warning: Could not load .env.local, using existing environment variables')
}

// Verify DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL is not set')
  console.error('Please set DATABASE_URL in .env.local to your production PostgreSQL connection string')
  process.exit(1)
}

// Verify DATABASE_URL is PostgreSQL
if (!process.env.DATABASE_URL.startsWith('postgres://') && !process.env.DATABASE_URL.startsWith('postgresql://')) {
  console.error('❌ Error: DATABASE_URL must start with postgres:// or postgresql://')
  console.error('Current DATABASE_URL starts with:', process.env.DATABASE_URL.substring(0, 20))
  process.exit(1)
}

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔍 Finding all recommended collections...')
    
    const collections = await prisma.recommendedCollection.findMany({
      select: {
        id: true,
        name: true,
      },
    })

    console.log(`Found ${collections.length} recommended collections`)

    if (collections.length === 0) {
      console.log('No collections to update')
      return
    }

    // Update all collections to be public
    const result = await prisma.recommendedCollection.updateMany({
      where: {
        // Update all, regardless of current isPublic value
      },
      data: {
        isPublic: true,
      },
    })

    console.log(`✅ Updated ${result.count} recommended collections to public`)
    console.log('\n📋 Updated collections:')
    collections.forEach(c => {
      console.log(`  - ${c.name} (${c.id})`)
    })
  } catch (error) {
    console.error('❌ Error updating collections:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


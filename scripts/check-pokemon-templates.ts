/**
 * Script to check which Pokemon collections don't have the trading-card template
 * 
 * Run with: npm run check:pokemon-templates
 */

import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'

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

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking Pokemon TCG collections template status...\n')

  try {
    // Find all Pokemon TCG collections
    const pokemonCollections = await prisma.communityCollection.findMany({
      where: {
        OR: [
          { tags: { contains: 'Pokemon' } },
          { category: 'Trading Cards' },
        ],
      },
      select: {
        id: true,
        name: true,
        template: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    console.log(`📦 Found ${pokemonCollections.length} Pokemon/Trading Card collections\n`)

    const missingTemplate = pokemonCollections.filter(c => c.template !== 'trading-card')
    const hasTemplate = pokemonCollections.filter(c => c.template === 'trading-card')

    console.log(`✅ Collections with trading-card template: ${hasTemplate.length}`)
    console.log(`❌ Collections missing trading-card template: ${missingTemplate.length}\n`)

    if (missingTemplate.length > 0) {
      console.log('📋 Collections that need template update:')
      missingTemplate.forEach((collection, index) => {
        console.log(`   ${index + 1}. "${collection.name}" (template: ${collection.template || 'null'})`)
      })
      console.log('\n💡 Run: npm run update:pokemon-template-fields to fix these')
    } else {
      console.log('🎉 All Pokemon collections have the trading-card template set!')
    }
  } catch (error) {
    console.error('❌ Error checking templates:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })


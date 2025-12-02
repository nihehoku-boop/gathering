/**
 * Seed script to create Pokemon TCG community collections for all physical TCG series
 * Uses @tcgdex/sdk to fetch series, sets, and cards
 * 
 * Run with: npm run seed:pokemon-tcg
 * Test with single series: npm run seed:pokemon-tcg -- --test
 * Test with specific series: npm run seed:pokemon-tcg -- --test --series=sv
 */

// Temporary workaround for expired SSL certificate on tcgdex.net
// Set this BEFORE importing the SDK
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

import { PrismaClient } from '@prisma/client'
import TCGdex from '@tcgdex/sdk'
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

// Initialize the SDK with English language
const sdk = new TCGdex('en')

// The SDK defaults to https://api.tcgdx.net/v2
// If there are connection issues, we can try alternative endpoints
console.log('📡 SDK Endpoint:', sdk.getEndpoint())

// Parse command line arguments
const args = process.argv.slice(2)
const isTestMode = args.includes('--test')
const seriesArg = args.find(arg => arg.startsWith('--series='))
const testSeriesId = seriesArg ? seriesArg.split('=')[1] : null

async function main() {
  console.log('🌱 Starting Pokemon TCG collection seeding...')
  console.log('📚 Using TCGdex SDK...')

  try {
    // Get or create an admin user for the collections
    let adminUser = await prisma.user.findFirst({
      where: { isAdmin: true },
    })

    if (!adminUser) {
      console.log('⚠️  No admin user found. Creating one...')
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@gathering.app',
          name: 'Gathering Admin',
          isAdmin: true,
        },
      })
      console.log('✅ Created admin user:', adminUser.email)
    } else {
      console.log('✅ Using existing admin user:', adminUser.email)
    }

    // Get all available series (equivalent to sdk.series.list() or sdk.serie.list())
    console.log('\n📚 Fetching all series...')
    const allSeries = await sdk.serie.list()
    console.log(`✅ Found ${allSeries.length} series`)

    // Filter for physical TCG series only (exclude digital-only like Pokemon TCG Live)
    let physicalSeries = allSeries.filter((series: any) => {
      const name = series.name?.toLowerCase() || ''
      // Exclude digital-only series
      return !name.includes('live') && !name.includes('digital') && !name.includes('online')
    })

    // Test mode: only process one series
    if (isTestMode) {
      if (testSeriesId) {
        // Test with specific series ID
        physicalSeries = physicalSeries.filter((s: any) => s.id === testSeriesId)
        if (physicalSeries.length === 0) {
          console.log(`❌ Series "${testSeriesId}" not found`)
          return
        }
        console.log(`🧪 TEST MODE: Processing only series "${testSeriesId}"`)
      } else {
        // Test with first series
        physicalSeries = physicalSeries.slice(0, 1)
        console.log(`🧪 TEST MODE: Processing only first series: "${physicalSeries[0]?.name}"`)
      }
    }

    console.log(`📦 Processing ${physicalSeries.length} physical TCG series...\n`)

    // Process each series
    for (const seriesResume of physicalSeries) {
      try {
        console.log(`🎯 Processing series: ${seriesResume.name} (${seriesResume.id})`)
        
        // Get detailed series info (equivalent to sdk.series.get('sv') or sdk.serie.get('sv'))
        const series = await sdk.serie.get(seriesResume.id)
        const sets = series.sets || []
        
        console.log(`   Found ${sets.length} sets in this series`)

        // Create a community collection for each set
        for (const setResume of sets) {
          try {
            // Check if collection already exists
            const existingCollection = await prisma.communityCollection.findFirst({
              where: {
                name: setResume.name,
              },
            })

            if (existingCollection) {
              console.log(`   ⏭️  Skipping "${setResume.name}" - already exists`)
              continue
            }

            console.log(`   📀 Creating collection: ${setResume.name}...`)
            
            // Get complete data for the set including all cards (equivalent to sdk.sets.get(setId) or sdk.set.get(setId))
            const setData = await sdk.set.get(setResume.id)
            const cards = setData.cards || []
            
            console.log(`   🎴 Found ${cards.length} cards`)

            if (cards.length === 0) {
              console.log(`   ⚠️  Skipping "${setResume.name}" - no cards found`)
              continue
            }

            // Create the community collection with all cards
            const collection = await prisma.communityCollection.create({
              data: {
                name: setResume.name,
                description: setData.description || `Complete set of ${setResume.name} from the ${series.name} series. Contains ${cards.length} cards.`,
                category: 'Trading Cards',
                coverImage: setData.logo || setData.symbol || null,
                tags: JSON.stringify(['Pokemon', 'Trading Cards', series.name, 'TCG']),
                userId: adminUser.id,
                items: {
                  create: cards.map((card: any, index: number) => ({
                    name: card.name || `Card ${index + 1}`,
                    number: card.number ? parseInt(card.number) || null : null,
                    notes: card.rarity ? `Rarity: ${card.rarity}` : null,
                    image: card.image || card.imageSmall || null,
                  })),
                },
              },
              include: {
                items: true,
              },
            })

            console.log(`   ✅ Created "${setResume.name}" with ${collection.items.length} cards`)
            
            // Small delay between sets to avoid overwhelming the API
            await new Promise(resolve => setTimeout(resolve, 300))
          } catch (error) {
            console.error(`   ❌ Error processing set "${setResume.name}":`, error)
            // Continue with next set
          }
        }
      } catch (error) {
        console.error(`❌ Error processing series "${seriesResume.name}":`, error)
        // Continue with next series
      }
    }

    console.log('\n🎉 Pokemon TCG seeding completed!')
  } catch (error) {
    console.error('❌ Error seeding data:', error)
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

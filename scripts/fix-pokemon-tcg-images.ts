/**
 * Migration script to fix Pokemon TCG card image URLs
 * Updates existing community items to use proper image URLs with quality and extension
 * 
 * Run with: npm run fix:pokemon-images
 */

// Temporary workaround for expired SSL certificate on tcgdex.net
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
const sdk = new TCGdex('en')

async function main() {
  console.log('🔧 Starting Pokemon TCG image URL fix...')
  
  try {
    // Find all community collections that are Pokemon TCG related
    const pokemonCollections = await prisma.communityCollection.findMany({
      where: {
        OR: [
          { tags: { contains: 'Pokemon' } },
          { tags: { contains: 'TCG' } },
          { category: 'Trading Cards' },
        ],
      },
      include: {
        items: true,
      },
    })

    console.log(`📦 Found ${pokemonCollections.length} Pokemon TCG collections`)
    
    let totalUpdated = 0
    let totalSkipped = 0
    let totalErrors = 0

    // Process each collection
    for (const collection of pokemonCollections) {
      console.log(`\n🎯 Processing collection: ${collection.name}`)
      console.log(`   Found ${collection.items.length} items`)
      
      // Get all series to find which one this collection belongs to
      const allSeries = await sdk.serie.list()
      
      // Try to find the set this collection corresponds to
      let targetSet: any = null
      for (const seriesResume of allSeries) {
        try {
          const series = await sdk.serie.get(seriesResume.id)
          const sets = series.sets || []
          const matchingSet = sets.find((s: any) => s.name === collection.name)
          if (matchingSet) {
            targetSet = matchingSet
            break
          }
        } catch (error) {
          // Continue searching
        }
      }

      if (!targetSet) {
        console.log(`   ⚠️  Could not find matching set for "${collection.name}", skipping...`)
        totalSkipped += collection.items.length
        continue
      }

      // Get the full set data
      let setData: any = null
      try {
        setData = await sdk.set.get(targetSet.id)
      } catch (error) {
        console.log(`   ❌ Error fetching set data: ${error}`)
        totalSkipped += collection.items.length
        continue
      }

      const cards = setData.cards || []
      console.log(`   🎴 Found ${cards.length} cards in set data`)

      // Create a map of card number/name to card object for quick lookup
      const cardMap = new Map<string, any>()
      cards.forEach((card: any) => {
        const key = card.number ? card.number.toString() : card.name
        cardMap.set(key, card)
      })

      // Update each item
      for (const item of collection.items) {
        try {
          // Find matching card
          const cardKey = item.number ? item.number.toString() : item.name
          const card = cardMap.get(cardKey)
          
          if (!card) {
            console.log(`   ⚠️  Could not find card for item "${item.name}" (number: ${item.number}), skipping...`)
            totalSkipped++
            continue
          }

          // Get the proper image URL
          const newImageUrl = card.getImageURL ? card.getImageURL('low', 'webp') : null
          
          if (!newImageUrl) {
            console.log(`   ⚠️  No image URL available for card "${card.name}", skipping...`)
            totalSkipped++
            continue
          }

          // Update the item if the URL is different
          if (item.image !== newImageUrl) {
            await prisma.communityItem.update({
              where: { id: item.id },
              data: { image: newImageUrl },
            })
            totalUpdated++
            console.log(`   ✅ Updated image for "${item.name}"`)
          } else {
            totalSkipped++
          }
        } catch (error) {
          console.error(`   ❌ Error updating item "${item.name}":`, error)
          totalErrors++
        }
      }

      // Small delay between collections
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log('\n🎉 Image URL fix completed!')
    console.log(`   ✅ Updated: ${totalUpdated} items`)
    console.log(`   ⏭️  Skipped: ${totalSkipped} items`)
    console.log(`   ❌ Errors: ${totalErrors} items`)
  } catch (error) {
    console.error('❌ Error fixing image URLs:', error)
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


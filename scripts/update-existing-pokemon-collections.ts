/**
 * Script to update existing Pokemon TCG collections with new template and variant handling
 * Only processes collections that already exist in the database
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

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set')
  process.exit(1)
}

const prisma = new PrismaClient()
const sdk = new TCGdex('en')

async function main() {
  console.log('🔄 Starting update of existing Pokemon TCG collections...\n')

  try {
    // Get all existing Pokemon TCG community collections
    const existingCollections = await prisma.communityCollection.findMany({
      where: {
        OR: [
          { tags: { contains: 'Pokemon' } },
          { tags: { contains: 'TCG' } },
          { category: 'Trading Cards' },
        ],
      },
      orderBy: { name: 'asc' },
    })

    console.log(`📦 Found ${existingCollections.length} existing Pokemon TCG collections\n`)

    if (existingCollections.length === 0) {
      console.log('⚠️  No existing collections found. Nothing to update.')
      return
    }

    // Get all series to find matching sets
    console.log('📚 Fetching all series from TCGdex...')
    const allSeries = await sdk.serie.list()
    const physicalSeries = allSeries.filter((series: any) => {
      const name = series.name?.toLowerCase() || ''
      return !name.includes('live') && !name.includes('digital') && !name.includes('online')
    })
    console.log(`✅ Found ${physicalSeries.length} physical TCG series\n`)

    let updatedCount = 0
    let skippedCount = 0
    let errorCount = 0

    // Process each existing collection
    for (const collection of existingCollections) {
      try {
        console.log(`\n🎯 Processing: "${collection.name}"`)
        console.log(`   📊 Current items: ${collection.items?.length || 0}`)

        // Find matching set in TCGdex
        let matchingSet: any = null
        let matchingSeries: any = null

        for (const seriesResume of physicalSeries) {
          try {
            const series = await sdk.serie.get(seriesResume.id)
            const sets = series.sets || []
            const foundSet = sets.find((s: any) => s.name === collection.name)
            if (foundSet) {
              matchingSet = foundSet
              matchingSeries = series
              break
            }
          } catch (error) {
            // Continue searching
          }
        }

        if (!matchingSet) {
          console.log(`   ⚠️  Could not find matching set in TCGdex, skipping...`)
          skippedCount++
          continue
        }

        console.log(`   ✅ Found matching set: "${matchingSet.name}"`)

        // Get full set data
        const setData = await sdk.set.get(matchingSet.id)
        const cards = setData.cards || []

        if (cards.length === 0) {
          console.log(`   ⚠️  No cards found in set, skipping...`)
          skippedCount++
          continue
        }

        console.log(`   🎴 Found ${cards.length} cards in set`)

        // Process cards with variants
        console.log(`   🔍 Processing card variants...`)
        const cardItems: any[] = []
        const cardGroups = new Map<string, any[]>()

        // Group cards by base name/number
        for (const cardResume of cards) {
          const baseName = cardResume.name
          const cardNumber = cardResume.localId || cardResume.number?.toString() || null
          const baseKey = `${baseName}_${cardNumber || 'unknown'}`
          
          if (!cardGroups.has(baseKey)) {
            cardGroups.set(baseKey, [])
          }
          cardGroups.get(baseKey)!.push(cardResume)
        }

        console.log(`   📊 Found ${cardGroups.size} unique cards (with ${cards.length} total entries including variants)`)

        // Process each card group
        let processedCount = 0
        for (const [baseKey, cardGroup] of cardGroups.entries()) {
          for (let i = 0; i < cardGroup.length; i++) {
            const cardResume = cardGroup[i]
            try {
              const fullCard = await cardResume.getCard()
              
              const baseName = fullCard.name
              const cardNumber = fullCard.localId || fullCard.number?.toString() || null
              
              // Get variant suffix
              const variants = fullCard.variants || {}
              const variantParts: string[] = []
              
              if (variants.holo) variantParts.push('Holo')
              if (variants.reverse) variantParts.push('Reverse Holo')
              if (variants.firstEdition) variantParts.push('First Edition')
              if (variants.normal && variantParts.length === 0) variantParts.push('Normal')
              
              const variantSuffix = variantParts.length > 0 
                ? ` - ${variantParts.join(', ')}`
                : (cardGroup.length > 1 ? ` - Variant ${i + 1}` : '')
              
              const itemName = `${baseName}${variantSuffix}`
              
              // Map rarity
              let rarity = fullCard.rarity || ''
              if (rarity) {
                const rarityLower = rarity.toLowerCase()
                if (rarityLower.includes('common')) rarity = 'Common'
                else if (rarityLower.includes('uncommon')) rarity = 'Uncommon'
                else if (rarityLower.includes('secret') && rarityLower.includes('rare')) rarity = 'Secret Rare'
                else if (rarityLower.includes('ultra') && rarityLower.includes('rare')) rarity = 'Ultra Rare'
                else if (rarityLower.includes('rare')) rarity = 'Rare'
                else if (rarityLower.includes('promo')) rarity = 'Promo'
              }
              
              // Build customFields
              const customFields: Record<string, any> = {
                set: matchingSet.name,
                cardNumber: cardNumber ? `${cardNumber}/${setData.cardCount?.total || setData.cardCount?.official || '?'}` : null,
                rarity: rarity || null,
                player: baseName,
              }
              
              Object.keys(customFields).forEach(key => {
                if (customFields[key] === null || customFields[key] === undefined) {
                  delete customFields[key]
                }
              })
              
              cardItems.push({
                name: itemName,
                number: cardNumber ? parseInt(cardNumber) : null,
                notes: null,
                image: fullCard.getImageURL ? fullCard.getImageURL('low', 'webp') : (fullCard.image || null),
                customFields: JSON.stringify(customFields),
              })
              
              processedCount++
              if (processedCount % 50 === 0) {
                console.log(`   ⏳ Processed ${processedCount}/${cards.length} cards...`)
              }
              
              if (processedCount % 10 === 0) {
                await new Promise(resolve => setTimeout(resolve, 100))
              }
            } catch (error) {
              console.error(`   ⚠️  Error fetching card "${cardResume.name}":`, error)
              const cardNumber = cardResume.localId || cardResume.number?.toString() || null
              const variantSuffix = cardGroup.length > 1 ? ` - Variant ${i + 1}` : ''
              cardItems.push({
                name: `${cardResume.name}${variantSuffix}`,
                number: cardNumber ? parseInt(cardNumber) : null,
                notes: null,
                image: cardResume.getImageURL ? cardResume.getImageURL('low', 'webp') : (cardResume.image || null),
                customFields: JSON.stringify({
                  set: matchingSet.name,
                  cardNumber: cardNumber ? `${cardNumber}/${setData.cardCount?.total || setData.cardCount?.official || '?'}` : null,
                  player: cardResume.name,
                }),
              })
              processedCount++
            }
          }
        }

        console.log(`   ✅ Processed ${cardItems.length} card items`)

        // Delete existing items
        await prisma.communityItem.deleteMany({
          where: { communityCollectionId: collection.id },
        })

        // Update cover image URL with quality and extension
        const logoUrl = setData.logo || setData.symbol || null
        const coverImage = (() => {
          if (!logoUrl) return null
          // If URL is from TCGdex assets, use symbol.webp format
          if (logoUrl.includes('assets.tcgdx') || logoUrl.includes('assets.tcgdex')) {
            // Remove any existing extension and trailing slash
            let cleanUrl = logoUrl.replace(/\.(jpg|jpeg|png|webp)$/i, '').replace(/\/$/, '')
            // Remove /logo or /symbol if present, then add /symbol.webp
            cleanUrl = cleanUrl.replace(/\/(logo|symbol)$/i, '')
            return cleanUrl + '/symbol.webp'
          }
          return logoUrl
        })()

        // Update collection with new template and items
        await prisma.communityCollection.update({
          where: { id: collection.id },
          data: {
            template: 'trading-card',
            coverImage: coverImage,
            items: {
              create: cardItems,
            },
          },
        })

        console.log(`   ✅ Updated "${collection.name}" with ${cardItems.length} cards (trading-card template)`)
        updatedCount++

        // Small delay between collections
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        console.error(`   ❌ Error updating "${collection.name}":`, error)
        errorCount++
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('🎉 Update completed!')
    console.log(`   ✅ Updated: ${updatedCount} collections`)
    console.log(`   ⏭️  Skipped: ${skippedCount} collections`)
    console.log(`   ❌ Errors: ${errorCount} collections`)
    console.log('='.repeat(60))
  } catch (error) {
    console.error('❌ Error:', error)
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


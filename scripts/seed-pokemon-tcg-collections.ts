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
const forceRecreate = args.includes('--force')
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
              if (forceRecreate) {
                console.log(`   🔄 Deleting existing collection "${setResume.name}" to recreate...`)
                // Delete all items first (cascade should handle this, but being explicit)
                await prisma.communityItem.deleteMany({
                  where: {
                    communityCollectionId: existingCollection.id,
                  },
                })
                // Delete the collection
                await prisma.communityCollection.delete({
                  where: {
                    id: existingCollection.id,
                  },
                })
                console.log(`   ✅ Deleted existing collection "${setResume.name}"`)
              } else {
                console.log(`   ⏭️  Skipping "${setResume.name}" - already exists (use --force to recreate)`)
                continue
              }
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

            // Process cards: fetch full card data to get variants, group by base name/number
            console.log(`   🔍 Processing card variants...`)
            const cardItems: any[] = []
            const cardGroups = new Map<string, any[]>() // Group cards by base name/number

            // First pass: group cards by base name/number
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

            // Second pass: fetch full card data and create items with variant names
            let processedCount = 0
            for (const [baseKey, cardGroup] of cardGroups.entries()) {
              for (let i = 0; i < cardGroup.length; i++) {
                const cardResume = cardGroup[i]
                try {
                  // Fetch full card data to get variants and other details
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
                  
                  // If multiple cards with same name/number, add index
                  const variantSuffix = variantParts.length > 0 
                    ? ` - ${variantParts.join(', ')}`
                    : (cardGroup.length > 1 ? ` - Variant ${i + 1}` : '')
                  
                  // Create item name with variant
                  const itemName = `${baseName}${variantSuffix}`
                  
                  // Map rarity to template options
                  let rarity = fullCard.rarity || ''
                  if (rarity) {
                    // Map SDK rarity to template options
                    const rarityLower = rarity.toLowerCase()
                    if (rarityLower.includes('common')) rarity = 'Common'
                    else if (rarityLower.includes('uncommon')) rarity = 'Uncommon'
                    else if (rarityLower.includes('secret') && rarityLower.includes('rare')) rarity = 'Secret Rare'
                    else if (rarityLower.includes('ultra') && rarityLower.includes('rare')) rarity = 'Ultra Rare'
                    else if (rarityLower.includes('rare')) rarity = 'Rare'
                    else if (rarityLower.includes('promo')) rarity = 'Promo'
                    // Keep original if no match
                  }
                  
                  // Build customFields for trading-card template
                  const customFields: Record<string, any> = {
                    set: setResume.name,
                    cardNumber: cardNumber ? `${cardNumber}/${setData.cardCount?.total || setData.cardCount?.official || '?'}` : null,
                    rarity: rarity || null,
                    player: baseName, // Card name as player/character
                  }
                  
                  // Remove null values
                  Object.keys(customFields).forEach(key => {
                    if (customFields[key] === null || customFields[key] === undefined) {
                      delete customFields[key]
                    }
                  })
                  
                  cardItems.push({
                    name: itemName,
                    number: cardNumber ? parseInt(cardNumber) : null,
                    notes: null, // Notes moved to customFields
                    image: fullCard.getImageURL ? fullCard.getImageURL('low', 'webp') : (fullCard.image || null),
                    customFields: JSON.stringify(customFields),
                  })
                  
                  processedCount++
                  if (processedCount % 50 === 0) {
                    console.log(`   ⏳ Processed ${processedCount}/${cards.length} cards...`)
                  }
                  
                  // Small delay to avoid rate limiting (reduced from 50ms to 20ms)
                  if (processedCount % 10 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 100))
                  }
                } catch (error) {
                  console.error(`   ⚠️  Error fetching full card data for "${cardResume.name}":`, error)
                  // Fallback: use cardResume data
                  const cardNumber = cardResume.localId || cardResume.number?.toString() || null
                  const variantSuffix = cardGroup.length > 1 ? ` - Variant ${i + 1}` : ''
                  cardItems.push({
                    name: `${cardResume.name}${variantSuffix}`,
                    number: cardNumber ? parseInt(cardNumber) : null,
                    notes: null,
                    image: cardResume.getImageURL ? cardResume.getImageURL('low', 'webp') : (cardResume.image || null),
                    customFields: JSON.stringify({
                      set: setResume.name,
                      cardNumber: cardNumber ? `${cardNumber}/${setData.cardCount?.total || setData.cardCount?.official || '?'}` : null,
                      player: cardResume.name,
                    }),
                  })
                  processedCount++
                }
              }
            }

            console.log(`   ✅ Processed ${cardItems.length} card items (with variants)`)

            // Create the community collection with trading-card template
            const collection = await prisma.communityCollection.create({
              data: {
                name: setResume.name,
                description: setData.description || `Complete set of ${setResume.name} from the ${series.name} series. Contains ${cardItems.length} cards.`,
                category: 'Trading Cards',
                template: 'trading-card', // Use trading-card template
                coverImage: (() => {
                  const logoUrl = setData.logo || setData.symbol || null
                  if (!logoUrl) return null
                  // If URL is from TCGdex assets, fix the format
                  if (logoUrl.includes('assets.tcgdx') || logoUrl.includes('assets.tcgdex')) {
                    // Remove any existing extension first
                    let cleanUrl = logoUrl.replace(/\.(jpg|jpeg|png|webp)$/i, '')
                    
                    // Remove /low or /high quality indicators (can be anywhere in path)
                    cleanUrl = cleanUrl.replace(/\/(low|high)\//g, '/').replace(/\/(low|high)$/i, '')
                    
                    // Extract base path and determine if it should be symbol or logo
                    const useLogo = cleanUrl.includes('/logo') || cleanUrl.endsWith('/logo')
                    
                    // Get the base path (everything before /logo or /symbol)
                    let basePath = cleanUrl.replace(/\/logo.*$/i, '').replace(/\/symbol.*$/i, '')
                    basePath = basePath.replace(/\/$/, '') // Remove trailing slash
                    
                    // Return with appropriate name
                    return basePath + (useLogo ? '/logo.webp' : '/symbol.webp')
                  }
                  return logoUrl
                })(),
                tags: JSON.stringify(['Pokemon', 'Trading Cards', series.name, 'TCG']),
                userId: adminUser.id,
                items: {
                  create: cardItems,
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

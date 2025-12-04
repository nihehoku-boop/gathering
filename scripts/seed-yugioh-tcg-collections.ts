/**
 * Seed script to create Yu-Gi-Oh! TCG community collections for all sets
 * Uses YGOPRODeck API to fetch sets and cards
 * 
 * Yu-Gi-Oh! has ~200+ official sets (core sets, booster packs, etc.)
 * This script processes all available sets from YGOPRODeck
 * 
 * Run with: npm run seed:yugioh-tcg
 * Test with single set: npm run seed:yugioh-tcg -- --test
 * Test with specific set: npm run seed:yugioh-tcg -- --test --set=BLVO
 * Force recreate existing: npm run seed:yugioh-tcg -- --force
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

// YGOPRODeck API base URL
const YGOPRODECK_API_BASE = 'https://db.ygoprodeck.com/api/v7'

// Rate limiting: Be respectful to the API
const DELAY_BETWEEN_REQUESTS = 150 // ms between requests
const DELAY_BETWEEN_SETS = 400 // ms between sets

// Parse command line arguments
const args = process.argv.slice(2)
const isTestMode = args.includes('--test')
const forceRecreate = args.includes('--force')
const setArg = args.find(arg => arg.startsWith('--set='))
const testSetCode = setArg ? setArg.split('=')[1] : null

interface YGOPRODeckSet {
  set_name: string
  set_code: string
  num_of_cards: number
  tcg_date?: string
  set_image?: string
}

interface YGOPRODeckCard {
  id: number
  name: string
  type: string
  desc: string
  race?: string
  archetype?: string
  card_sets?: Array<{
    set_name: string
    set_code: string
    set_rarity: string
    set_rarity_code: string
    set_price: string
  }>
  card_images: Array<{
    id: number
    image_url: string
    image_url_small: string
    image_url_cropped: string
  }>
  atk?: number
  def?: number
  level?: number
  attribute?: string
  scale?: number
  linkval?: number
  banlist_info?: {
    ban_tcg?: string
    ban_ocg?: string
    ban_goat?: string
  }
}

// Helper function to fetch from YGOPRODeck API with rate limiting
async function ygoprodeckFetch(url: string): Promise<any> {
  await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS))
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Gathering/1.0 (https://gathering-jade.vercel.app)',
    },
  })

  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    throw new Error(`YGOPRODeck API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Get all sets from YGOPRODeck
async function getAllSets(): Promise<YGOPRODeckSet[]> {
  console.log('📚 Fetching all Yu-Gi-Oh! sets from YGOPRODeck...')
  
  try {
    const data = await ygoprodeckFetch(`${YGOPRODECK_API_BASE}/cardsets.php`)
    
    if (!data || !Array.isArray(data)) {
      console.error('❌ Unexpected response format from YGOPRODeck API')
      return []
    }

    console.log(`✅ Found ${data.length} total sets`)
    return data
  } catch (error) {
    console.error('❌ Error fetching sets:', error)
    return []
  }
}

// Cache for all cards (fetched once)
let allCardsCache: YGOPRODeckCard[] | null = null

// Fetch all cards from YGOPRODeck (cached)
async function getAllCards(): Promise<YGOPRODeckCard[]> {
  if (allCardsCache) {
    return allCardsCache
  }

  console.log('📚 Fetching all Yu-Gi-Oh! cards from YGOPRODeck (this may take a moment)...')
  
  try {
    const data = await ygoprodeckFetch(`${YGOPRODECK_API_BASE}/cardinfo.php`)
    
    if (!data || !data.data || !Array.isArray(data.data)) {
      console.error('❌ Unexpected response format from YGOPRODeck API')
      return []
    }

    allCardsCache = data.data
    console.log(`✅ Cached ${allCardsCache.length} total cards`)
    return allCardsCache
  } catch (error) {
    console.error('❌ Error fetching all cards:', error)
    return []
  }
}

// Get cards for a specific set
async function getCardsForSet(setCode: string, allCards: YGOPRODeckCard[]): Promise<YGOPRODeckCard[]> {
  try {
    // Filter cards that belong to this set
    const cardsInSet = allCards.filter((card: YGOPRODeckCard) => {
      if (!card.card_sets || !Array.isArray(card.card_sets)) {
        return false
      }
      // Check if any card_set matches the set code
      return card.card_sets.some((cs: any) => {
        // Match set code (case insensitive, with or without prefix/suffix)
        const csCode = cs.set_code?.toUpperCase() || ''
        const targetCode = setCode.toUpperCase()
        // Match exact code or code with prefix/suffix (e.g., "BLVO" matches "BLVO-EN001")
        return csCode === targetCode || csCode.startsWith(targetCode + '-') || csCode.includes(targetCode)
      })
    })

    return cardsInSet
  } catch (error) {
    console.error(`   ⚠️  Error filtering cards for set ${setCode}:`, error)
    return []
  }
}

// Map YGOPRODeck rarity to template rarity
function mapRarity(yugiohRarity: string): string {
  if (!yugiohRarity) return 'Common'
  
  const rarityLower = yugiohRarity.toLowerCase()
  
  if (rarityLower.includes('common')) return 'Common'
  if (rarityLower.includes('rare')) return 'Rare'
  if (rarityLower.includes('ultra') || rarityLower.includes('ultimate')) return 'Ultra Rare'
  if (rarityLower.includes('secret')) return 'Secret Rare'
  if (rarityLower.includes('super')) return 'Uncommon'
  if (rarityLower.includes('promo')) return 'Promo'
  
  return 'Common' // Default fallback
}

async function main() {
  console.log('🌱 Starting Yu-Gi-Oh! TCG collection seeding...')
  console.log('📚 Using YGOPRODeck API...')

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

    // Get all sets
    const allSets = await getAllSets()
    
    if (allSets.length === 0) {
      console.error('❌ No sets found. Exiting.')
      return
    }

    // Filter sets: exclude sets with 0 cards or invalid data
    let setsToProcess = allSets.filter((set: YGOPRODeckSet) => {
      return set.set_name && set.set_code && set.num_of_cards > 0
    })

    console.log(`\n📦 Filtered to ${setsToProcess.length} valid sets`)

    // Fetch all cards once (will be cached)
    console.log('\n📚 Fetching all cards from YGOPRODeck...')
    const allCards = await getAllCards()
    
    if (allCards.length === 0) {
      console.error('❌ No cards found. Exiting.')
      return
    }

    // Test mode: only process one set
    if (isTestMode) {
      if (testSetCode) {
        setsToProcess = setsToProcess.filter((s: YGOPRODeckSet) => 
          s.set_code.toLowerCase() === testSetCode.toLowerCase()
        )
        if (setsToProcess.length === 0) {
          console.error(`❌ Set code "${testSetCode}" not found`)
          process.exit(1)
        }
        console.log(`🧪 Test mode: Processing only set "${setsToProcess[0].set_name}" (${setsToProcess[0].set_code})`)
      } else {
        // Test with first set
        setsToProcess = setsToProcess.slice(0, 1)
        console.log(`🧪 Test mode: Processing only first set "${setsToProcess[0].set_name}" (${setsToProcess[0].set_code})`)
      }
    }

    let processedSets = 0
    let skippedSets = 0
    let errorSets = 0
    const totalSets = setsToProcess.length
    const startTime = Date.now()

    console.log(`\n🚀 Starting import of ${totalSets} sets...`)
    console.log(`⏱️  Estimated time: 8-12 minutes\n`)

    // Process each set
    for (let i = 0; i < setsToProcess.length; i++) {
      const set = setsToProcess[i]
      const setNumber = i + 1

      try {
        // Check if collection already exists
        const existingCollection = await prisma.communityCollection.findFirst({
          where: {
            name: set.set_name,
            category: 'Trading Cards',
            tags: { contains: 'Yu-Gi-Oh' },
          },
        })

        if (existingCollection && !forceRecreate) {
          console.log(`\n[${setNumber}/${totalSets}] ⏭️  Skipping "${set.set_name}" (${set.set_code}) - already exists`)
          skippedSets++
          continue
        }

        if (existingCollection && forceRecreate) {
          console.log(`\n[${setNumber}/${totalSets}] 🔄 Recreating "${set.set_name}" (${set.set_code})...`)
          await prisma.communityCollection.delete({
            where: { id: existingCollection.id },
          })
        }

        console.log(`\n[${setNumber}/${totalSets}] 📦 Processing "${set.set_name}" (${set.set_code})...`)
        console.log(`   📅 Released: ${set.tcg_date || 'Unknown'}`)
        console.log(`   📊 Expected cards: ${set.num_of_cards}`)
        
        // Calculate progress percentage
        const progressPercent = Math.round((setNumber / totalSets) * 100)
        const elapsed = Math.round((Date.now() - startTime) / 1000)
        const avgTimePerSet = elapsed / setNumber
        const remainingSets = totalSets - setNumber
        const estimatedRemaining = Math.round((remainingSets * avgTimePerSet) / 60)
        console.log(`   📈 Progress: ${progressPercent}% | Elapsed: ${Math.round(elapsed / 60)}m ${elapsed % 60}s | Est. remaining: ~${estimatedRemaining}m`)

        // Filter cards for this set from cached cards
        console.log(`   🔍 Filtering cards for set "${set.set_code}"...`)
        const cards = await getCardsForSet(set.set_code, allCards)

        if (cards.length === 0) {
          console.log(`   ⚠️  No cards found for this set, skipping...`)
          skippedSets++
          continue
        }

        console.log(`   ✅ Fetched ${cards.length} cards`)

        // Process cards into items
        const cardItems: Array<{
          name: string
          number: number | null
          notes: string | null
          image: string | null
          customFields: string
        }> = []

        for (const card of cards) {
          try {
            // Find the card's set info (card might be in multiple sets)
            const cardSetInfo = card.card_sets?.find((cs: any) => 
              cs.set_code === set.set_code || cs.set_name === set.set_name
            )

            // Get card number (if available in set info)
            let cardNumber: number | null = null
            if (cardSetInfo?.set_rarity_code) {
              // Some sets have rarity codes that include numbers
              const match = cardSetInfo.set_rarity_code.match(/\d+/)
              if (match) {
                cardNumber = parseInt(match[0])
              }
            }
            // Fallback: use card ID as number if no set-specific number
            if (!cardNumber && card.id) {
              cardNumber = card.id
            }

            // Get card image (prefer normal size)
            let cardImage: string | null = null
            if (card.card_images && card.card_images.length > 0) {
              cardImage = card.card_images[0].image_url || card.card_images[0].image_url_cropped || null
            }

            // Get rarity from set info
            const rarity = cardSetInfo?.set_rarity ? mapRarity(cardSetInfo.set_rarity) : 'Common'

            // Build customFields for trading-card template
            const customFields: Record<string, any> = {
              set: set.set_name,
              cardNumber: cardNumber ? `${cardNumber}/${set.num_of_cards}` : null,
              rarity: rarity || null,
              player: card.name, // Card name as player/character
            }

            // Add additional info if available
            if (card.type) {
              customFields.type = card.type
            }

            // Remove null values
            Object.keys(customFields).forEach(key => {
              if (customFields[key] === null || customFields[key] === undefined) {
                delete customFields[key]
              }
            })

            cardItems.push({
              name: card.name,
              number: cardNumber,
              notes: card.type || null,
              image: cardImage,
              customFields: JSON.stringify(customFields),
            })
          } catch (error) {
            console.error(`   ⚠️  Error processing card "${card.name}":`, error)
            // Continue with next card
          }
        }

        console.log(`   ✅ Processed ${cardItems.length} card items`)

        // Get set image for cover image
        let coverImage: string | null = null
        if (set.set_image) {
          coverImage = set.set_image
        }

        // Create tags
        const tags = ['Yu-Gi-Oh', 'Trading Cards', 'YGO', 'TCG']
        if (set.set_code) {
          tags.push(set.set_code)
        }

        // Create the community collection with trading-card template
        const collection = await prisma.communityCollection.create({
          data: {
            name: set.set_name,
            description: `Complete set of ${set.set_name} (${set.set_code}). Released ${set.tcg_date || 'Unknown'}. Contains ${cardItems.length} cards.`,
            category: 'Trading Cards',
            template: 'trading-card',
            coverImage: coverImage,
            tags: JSON.stringify(tags),
            userId: adminUser.id,
            items: {
              create: cardItems,
            },
          },
          include: {
            items: true,
          },
        })

        console.log(`   ✅ Created "${set.set_name}" with ${collection.items.length} cards`)
        processedSets++
        
        // Log running totals every 10 sets
        if (processedSets % 10 === 0) {
          const elapsed = Math.round((Date.now() - startTime) / 1000)
          console.log(`\n   📊 Running totals: ${processedSets} processed, ${skippedSets} skipped, ${errorSets} errors | Time: ${Math.round(elapsed / 60)}m ${elapsed % 60}s\n`)
        }

        // Small delay between sets to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_SETS))
      } catch (error) {
        console.error(`\n[${setNumber}/${totalSets}] ❌ Error processing set "${set.set_name}":`, error)
        errorSets++
        // Continue with next set
      }
    }

    const totalTime = Math.round((Date.now() - startTime) / 1000)
    const minutes = Math.floor(totalTime / 60)
    const seconds = totalTime % 60

    console.log('\n🎉 Yu-Gi-Oh! TCG seeding completed!')
    console.log(`\n📊 Final Summary:`)
    console.log(`   ✅ Processed: ${processedSets} sets`)
    console.log(`   ⏭️  Skipped: ${skippedSets} sets`)
    console.log(`   ❌ Errors: ${errorSets} sets`)
    console.log(`   📦 Total sets available: ${totalSets}`)
    console.log(`   ⏱️  Total time: ${minutes}m ${seconds}s`)
    console.log(`   ⚡ Average: ${totalSets > 0 ? Math.round(totalTime / totalSets) : 0}s per set`)
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })


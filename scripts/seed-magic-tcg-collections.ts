/**
 * Seed script to create Magic: The Gathering community collections for all sets
 * Uses Scryfall API to fetch sets and cards
 * 
 * Run with: npm run seed:magic-tcg
 * Test with single set: npm run seed:magic-tcg -- --test
 * Test with specific set: npm run seed:magic-tcg -- --test --set=khc
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

// Scryfall API base URL
const SCRYFALL_API_BASE = 'https://api.scryfall.com'

// Rate limiting: Scryfall allows 50-100 requests per second, but we'll be conservative
const DELAY_BETWEEN_REQUESTS = 100 // ms between requests
const DELAY_BETWEEN_SETS = 300 // ms between sets

// Parse command line arguments
const args = process.argv.slice(2)
const isTestMode = args.includes('--test')
const forceRecreate = args.includes('--force')
const setArg = args.find(arg => arg.startsWith('--set='))
const testSetCode = setArg ? setArg.split('=')[1] : null

interface ScryfallSet {
  code: string
  name: string
  set_type: string
  released_at: string | null
  card_count: number
  digital: boolean
  foil_only: boolean
  nonfoil_only: boolean
  icon_svg_uri: string | null
  parent_set_code: string | null
  block_code: string | null
  block: string | null
}

interface ScryfallCard {
  id: string
  name: string
  collector_number: string
  set: string
  set_name: string
  rarity: string
  type_line: string
  mana_cost: string | null
  cmc: number
  colors: string[]
  image_uris?: {
    small?: string
    normal?: string
    large?: string
    png?: string
  }
  card_faces?: Array<{
    name: string
    image_uris?: {
      small?: string
      normal?: string
      large?: string
      png?: string
    }
  }>
  layout?: string
}

// Helper function to fetch from Scryfall API with rate limiting
async function scryfallFetch(url: string): Promise<any> {
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
    throw new Error(`Scryfall API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Get all sets from Scryfall
async function getAllSets(): Promise<ScryfallSet[]> {
  console.log('📚 Fetching all Magic sets from Scryfall...')
  
  const allSets: ScryfallSet[] = []
  let hasMore = true
  let url = `${SCRYFALL_API_BASE}/sets`

  while (hasMore) {
    const data = await scryfallFetch(url)
    
    if (!data || !data.data) {
      break
    }

    allSets.push(...data.data)
    
    hasMore = data.has_more || false
    url = data.next_page || null

    if (hasMore && url) {
      console.log(`   📦 Fetched ${allSets.length} sets so far...`)
    }
  }

  console.log(`✅ Found ${allSets.length} total sets`)
  return allSets
}

// Get cards for a specific set
async function getCardsForSet(setCode: string): Promise<ScryfallCard[]> {
  const allCards: ScryfallCard[] = []
  let hasMore = true
  let url = `${SCRYFALL_API_BASE}/cards/search?q=set:${setCode}&order=set&unique=prints`

  while (hasMore) {
    const data = await scryfallFetch(url)
    
    if (!data || !data.data) {
      break
    }

    allCards.push(...data.data)
    
    hasMore = data.has_more || false
    url = data.next_page || null

    if (hasMore && url) {
      console.log(`   ⏳ Fetched ${allCards.length} cards so far...`)
    }
  }

  return allCards
}

// Map Scryfall rarity to template rarity
function mapRarity(scryfallRarity: string): string {
  const rarityLower = scryfallRarity.toLowerCase()
  
  if (rarityLower === 'common') return 'Common'
  if (rarityLower === 'uncommon') return 'Uncommon'
  if (rarityLower === 'rare') return 'Rare'
  if (rarityLower === 'mythic') return 'Ultra Rare' // Mythic = Ultra Rare
  if (rarityLower.includes('special') || rarityLower.includes('bonus')) return 'Promo'
  
  return 'Common' // Default fallback
}

async function main() {
  console.log('🌱 Starting Magic: The Gathering collection seeding...')
  console.log('📚 Using Scryfall API...')

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
    
    // Filter sets: exclude digital-only, promo packs, and some special types
    // Include: core sets, expansions, commander sets, draft sets, etc.
    const validSetTypes = [
      'core',
      'expansion',
      'commander',
      'draft_innovation',
      'masters',
      'modern',
      'funny',
      'spellbook',
      'treasure_chest',
      'archenemy',
      'planechase',
      'vanguard',
      'box',
      'duel_deck',
      'from_the_vault',
      'premium_deck',
      'starter',
      'token',
      'memorabilia',
    ]

    let setsToProcess = allSets.filter((set: ScryfallSet) => {
      // Exclude digital-only sets
      if (set.digital) return false
      
      // Exclude foil-only or nonfoil-only sets (usually special products)
      if (set.foil_only || set.nonfoil_only) return false
      
      // Include valid set types
      return validSetTypes.includes(set.set_type)
    })

    console.log(`\n📦 Filtered to ${setsToProcess.length} valid sets (excluding digital-only, promo packs, etc.)`)

    // Test mode: only process one set
    if (isTestMode) {
      if (testSetCode) {
        setsToProcess = setsToProcess.filter((s: ScryfallSet) => 
          s.code.toLowerCase() === testSetCode.toLowerCase()
        )
        if (setsToProcess.length === 0) {
          console.error(`❌ Set code "${testSetCode}" not found`)
          process.exit(1)
        }
        console.log(`🧪 Test mode: Processing only set "${setsToProcess[0].name}" (${setsToProcess[0].code})`)
      } else {
        // Test with first set
        setsToProcess = setsToProcess.slice(0, 1)
        console.log(`🧪 Test mode: Processing only first set "${setsToProcess[0].name}" (${setsToProcess[0].code})`)
      }
    }

    let processedSets = 0
    let skippedSets = 0
    let errorSets = 0

    // Process each set
    for (const set of setsToProcess) {
      try {
        // Check if collection already exists
        const existingCollection = await prisma.communityCollection.findFirst({
          where: {
            name: set.name,
            category: 'Trading Cards',
            tags: { contains: 'Magic' },
          },
        })

        if (existingCollection && !forceRecreate) {
          console.log(`\n⏭️  Skipping "${set.name}" (${set.code}) - already exists`)
          skippedSets++
          continue
        }

        if (existingCollection && forceRecreate) {
          console.log(`\n🔄 Recreating "${set.name}" (${set.code})...`)
          await prisma.communityCollection.delete({
            where: { id: existingCollection.id },
          })
        }

        console.log(`\n📦 Processing "${set.name}" (${set.code})...`)
        console.log(`   📅 Released: ${set.released_at || 'Unknown'}`)
        console.log(`   📊 Expected cards: ${set.card_count}`)

        // Fetch all cards for this set
        console.log(`   🔍 Fetching cards from Scryfall...`)
        const cards = await getCardsForSet(set.code)

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
            // Get card number (collector_number)
            const cardNumber = card.collector_number ? parseInt(card.collector_number) : null

            // Get card image (prefer normal size, fallback to small or png)
            let cardImage: string | null = null
            if (card.image_uris) {
              cardImage = card.image_uris.normal || card.image_uris.large || card.image_uris.png || card.image_uris.small || null
            } else if (card.card_faces && card.card_faces.length > 0) {
              // For double-faced cards, use the first face
              const firstFace = card.card_faces[0]
              if (firstFace.image_uris) {
                cardImage = firstFace.image_uris.normal || firstFace.image_uris.large || firstFace.image_uris.png || firstFace.image_uris.small || null
              }
            }

            // Map rarity
            const rarity = mapRarity(card.rarity)

            // Build customFields for trading-card template
            const customFields: Record<string, any> = {
              set: set.name,
              cardNumber: cardNumber ? `${cardNumber}/${set.card_count}` : null,
              rarity: rarity || null,
              player: card.name, // Card name as player/character
            }

            // Add additional info if available
            if (card.type_line) {
              // Store type_line in notes for reference
              customFields.type = card.type_line
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
              notes: card.type_line || null,
              image: cardImage,
              customFields: JSON.stringify(customFields),
            })
          } catch (error) {
            console.error(`   ⚠️  Error processing card "${card.name}":`, error)
            // Continue with next card
          }
        }

        console.log(`   ✅ Processed ${cardItems.length} card items`)

        // Get set icon for cover image
        let coverImage: string | null = null
        if (set.icon_svg_uri) {
          // Scryfall provides SVG icons, but we might want PNG
          // For now, use SVG (browsers support it)
          coverImage = set.icon_svg_uri
        }

        // Create tags
        const tags = ['Magic', 'Trading Cards', 'MTG', 'TCG']
        if (set.block) {
          tags.push(set.block)
        }
        if (set.set_type) {
          tags.push(set.set_type.replace('_', ' '))
        }

        // Create the community collection with trading-card template
        const collection = await prisma.communityCollection.create({
          data: {
            name: set.name,
            description: `Complete set of ${set.name} (${set.code}). Released ${set.released_at || 'Unknown'}. Contains ${cardItems.length} cards.`,
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

        console.log(`   ✅ Created "${set.name}" with ${collection.items.length} cards`)
        processedSets++

        // Small delay between sets to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_SETS))
      } catch (error) {
        console.error(`   ❌ Error processing set "${set.name}":`, error)
        errorSets++
        // Continue with next set
      }
    }

    console.log('\n🎉 Magic: The Gathering seeding completed!')
    console.log(`\n📊 Summary:`)
    console.log(`   ✅ Processed: ${processedSets} sets`)
    console.log(`   ⏭️  Skipped: ${skippedSets} sets`)
    console.log(`   ❌ Errors: ${errorSets} sets`)
    console.log(`   📦 Total sets available: ${setsToProcess.length}`)
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


/**
 * Script to update existing Pokemon TCG collections to use the trading-card template
 * and ensure all items have proper customFields populated
 * 
 * Run with: npm run fix:pokemon-template
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
  console.log('🔧 Starting Pokemon TCG template fix...\n')

  try {
    // Find all Pokemon TCG collections
    // They should have tags containing "Pokemon" or category "Trading Cards"
    const pokemonCollections = await prisma.communityCollection.findMany({
      where: {
        OR: [
          { tags: { contains: 'Pokemon' } },
          { category: 'Trading Cards' },
        ],
      },
      include: {
        items: true,
      },
    })

    console.log(`📦 Found ${pokemonCollections.length} Pokemon/Trading Card collections\n`)

    let updatedCollections = 0
    let updatedItems = 0

    for (const collection of pokemonCollections) {
      console.log(`🎯 Processing: ${collection.name}`)
      
      let needsUpdate = false
      
      // Check if template needs to be set
      if (collection.template !== 'trading-card') {
        console.log(`   ⚠️  Template is "${collection.template || 'null'}", should be "trading-card"`)
        needsUpdate = true
      }

      // Update collection template if needed
      if (needsUpdate) {
        await prisma.communityCollection.update({
          where: { id: collection.id },
          data: {
            template: 'trading-card',
          },
        })
        console.log(`   ✅ Updated collection template to "trading-card"`)
        updatedCollections++
      }

      // Process items to ensure they have proper customFields
      for (const item of collection.items) {
        let itemNeedsUpdate = false
        let customFields: Record<string, any> = {}

        try {
          // Try to parse existing customFields
          if (item.customFields) {
            customFields = JSON.parse(item.customFields)
          }
        } catch (e) {
          // If parsing fails, start fresh
          customFields = {}
        }

        // Extract information from item name and number
        // Pokemon card names often have variant suffixes like " - Holo", " - Reverse Holo", etc.
        const itemName = item.name
        const cardNumber = item.number?.toString() || null

        // Try to extract set name from collection name or description
        const setName = collection.name

        // Always ensure all key fields are populated (update even if partially filled)
        itemNeedsUpdate = true

        // Set name (always update to ensure it matches collection)
        customFields.set = setName

        // Card number (format: number/total if available, otherwise just number)
        if (cardNumber) {
          // Try to extract total from collection description or use placeholder
          const totalMatch = collection.description?.match(/(\d+)\s*cards?/i)
          const total = totalMatch ? totalMatch[1] : '?'
          customFields.cardNumber = `${cardNumber}/${total}`
        } else {
          // If no card number, try to keep existing or set to null
          if (!customFields.cardNumber) {
            customFields.cardNumber = null
          }
        }

        // Player/Character (base name without variant suffix)
        // Remove variant suffixes like " - Holo", " - Reverse Holo", " - Variant 1", etc.
        const baseName = itemName
          .replace(/\s*-\s*Holo.*$/i, '')
          .replace(/\s*-\s*Reverse\s*Holo.*$/i, '')
          .replace(/\s*-\s*First\s*Edition.*$/i, '')
          .replace(/\s*-\s*Variant\s*\d+.*$/i, '')
          .replace(/\s*-\s*Normal.*$/i, '')
          .trim()
        customFields.player = baseName || itemName

        // Rarity - try to infer from name if not already set
        if (!customFields.rarity) {
          const nameLower = itemName.toLowerCase()
          if (nameLower.includes('secret') || nameLower.includes('ultra rare')) {
            customFields.rarity = 'Secret Rare'
          } else if (nameLower.includes('ultra')) {
            customFields.rarity = 'Ultra Rare'
          } else if (nameLower.includes('rare')) {
            customFields.rarity = 'Rare'
          } else if (nameLower.includes('uncommon')) {
            customFields.rarity = 'Uncommon'
          } else if (nameLower.includes('common')) {
            customFields.rarity = 'Common'
          } else if (nameLower.includes('promo')) {
            customFields.rarity = 'Promo'
          }
          // If still no rarity, leave it null
        }

        // Remove null values
        Object.keys(customFields).forEach(key => {
          if (customFields[key] === null || customFields[key] === undefined) {
            delete customFields[key]
          }
        })

        // Update item if needed
        if (itemNeedsUpdate) {
          await prisma.communityItem.update({
            where: { id: item.id },
            data: {
              customFields: JSON.stringify(customFields),
            },
          })
          updatedItems++
        }
      }

      console.log(`   ✅ Processed ${collection.items.length} items`)
    }

    console.log(`\n🎉 Template fix completed!`)
    console.log(`   📊 Updated ${updatedCollections} collections`)
    console.log(`   🎴 Updated ${updatedItems} items`)
  } catch (error) {
    console.error('❌ Error fixing templates:', error)
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


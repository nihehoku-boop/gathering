/**
 * Script to update all Pokemon TCG collections to use trading-card template
 * and populate all available template fields from existing item data
 * 
 * Run with: npm run update:pokemon-template-fields
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
  console.log('🔧 Starting Pokemon TCG template and fields update...\n')

  try {
    // Find all Pokemon TCG collections
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
    let totalFieldsFilled = 0

    for (const collection of pokemonCollections) {
      console.log(`🎯 Processing: ${collection.name}`)
      
      let collectionNeedsUpdate = false
      
      // Step 1: Update collection template if needed
      if (collection.template !== 'trading-card') {
        console.log(`   ⚠️  Template is "${collection.template || 'null'}", updating to "trading-card"`)
        await prisma.communityCollection.update({
          where: { id: collection.id },
          data: {
            template: 'trading-card',
          },
        })
        console.log(`   ✅ Updated collection template to "trading-card"`)
        collectionNeedsUpdate = true
        updatedCollections++
      }

      // Step 2: Process all items to populate template fields
      console.log(`   🎴 Processing ${collection.items.length} items...`)
      
      for (const item of collection.items) {
        let itemNeedsUpdate = false
        let customFields: Record<string, any> = {}
        let fieldsFilled = 0

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
        const itemName = item.name
        const cardNumber = item.number?.toString() || null
        const setName = collection.name

        // Always ensure all key fields are populated
        itemNeedsUpdate = true

        // 1. Set name (always update to ensure it matches collection)
        if (!customFields.set || customFields.set !== setName) {
          customFields.set = setName
          fieldsFilled++
        }

        // 2. Card number (format: number/total if available, otherwise just number)
        if (cardNumber) {
          // Try to extract total from collection description or use placeholder
          const totalMatch = collection.description?.match(/(\d+)\s*cards?/i)
          const total = totalMatch ? totalMatch[1] : '?'
          const formattedCardNumber = `${cardNumber}/${total}`
          
          if (!customFields.cardNumber || customFields.cardNumber !== formattedCardNumber) {
            customFields.cardNumber = formattedCardNumber
            fieldsFilled++
          }
        } else {
          // If no card number, try to keep existing or set to null
          if (!customFields.cardNumber) {
            customFields.cardNumber = null
          }
        }

        // 3. Player/Character (base name without variant suffix)
        // Remove variant suffixes like " - Holo", " - Reverse Holo", " - Variant 1", etc.
        const baseName = itemName
          .replace(/\s*-\s*Holo.*$/i, '')
          .replace(/\s*-\s*Reverse\s*Holo.*$/i, '')
          .replace(/\s*-\s*First\s*Edition.*$/i, '')
          .replace(/\s*-\s*Variant\s*\d+.*$/i, '')
          .replace(/\s*-\s*Normal.*$/i, '')
          .trim()
        const playerName = baseName || itemName
        
        if (!customFields.player || customFields.player !== playerName) {
          customFields.player = playerName
          fieldsFilled++
        }

        // 4. Rarity - try to infer from name if not already set
        if (!customFields.rarity) {
          const nameLower = itemName.toLowerCase()
          let inferredRarity: string | null = null
          
          if (nameLower.includes('secret') || nameLower.includes('ultra rare')) {
            inferredRarity = 'Secret Rare'
          } else if (nameLower.includes('ultra')) {
            inferredRarity = 'Ultra Rare'
          } else if (nameLower.includes('rare')) {
            inferredRarity = 'Rare'
          } else if (nameLower.includes('uncommon')) {
            inferredRarity = 'Uncommon'
          } else if (nameLower.includes('common')) {
            inferredRarity = 'Common'
          } else if (nameLower.includes('promo')) {
            inferredRarity = 'Promo'
          }
          
          if (inferredRarity) {
            customFields.rarity = inferredRarity
            fieldsFilled++
          }
        }

        // Remove null values (but keep empty strings for display)
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
          totalFieldsFilled += fieldsFilled
        }
      }

      console.log(`   ✅ Processed ${collection.items.length} items`)
    }

    console.log(`\n🎉 Update completed!`)
    console.log(`   📊 Updated ${updatedCollections} collections to trading-card template`)
    console.log(`   🎴 Updated ${updatedItems} items with template fields`)
    console.log(`   📝 Total fields filled: ${totalFieldsFilled}`)
    
    // Summary statistics
    const collectionsWithTemplate = await prisma.communityCollection.count({
      where: {
        template: 'trading-card',
        OR: [
          { tags: { contains: 'Pokemon' } },
          { category: 'Trading Cards' },
        ],
      },
    })
    
    console.log(`\n📈 Summary:`)
    console.log(`   ✅ ${collectionsWithTemplate}/${pokemonCollections.length} collections now use trading-card template`)
  } catch (error) {
    console.error('❌ Error updating templates and fields:', error)
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


/**
 * Migration script to normalize existing categories to predefined list
 * 
 * This script:
 * 1. Normalizes all existing categories in Collections, RecommendedCollections, and CommunityCollections
 * 2. Removes collection-type tags from existing collections
 * 3. Updates categories to match predefined list
 * 
 * Run with: tsx scripts/migrate-categories.ts
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import { PrismaClient } from '@prisma/client'
import { normalizeCategory, AVAILABLE_CATEGORIES } from '../lib/categories'
import { parseTags, stringifyTags, AVAILABLE_TAGS } from '../lib/tags'

// Load environment variables in order of precedence:
// 1. .env.production (if exists, for production runs)
// 2. .env.local (local overrides)
// 3. .env (default)
const envProduction = path.join(process.cwd(), '.env.production')
const envLocal = path.join(process.cwd(), '.env.local')
const envDefault = path.join(process.cwd(), '.env')

try {
  if (require('fs').existsSync(envProduction)) {
    dotenv.config({ path: envProduction })
  }
  if (require('fs').existsSync(envLocal)) {
    dotenv.config({ path: envLocal, override: false })
  }
  dotenv.config({ path: envDefault, override: false })
} catch (error) {
  console.warn('Warning: Could not load all environment files:', error)
  // Fallback to default .env
  dotenv.config()
}

const prisma = new PrismaClient()

// Collection types that should be removed from tags (now categories)
const COLLECTION_TYPE_TAGS = [
  'Comics', 'Books', 'Movies', 'Games', 'Music', 'Art',
  'Trading Cards', 'Sports Cards', 'Action Figures', 'Toys',
  'Vinyl Records', 'CDs', 'DVDs', 'Blu-ray', 'Video Games',
  'Board Games', 'Coins', 'Stamps', 'Posters', 'Art Prints',
  'Collectibles', 'TCG'
]

async function migrateCategories() {
  console.log('Starting category migration...\n')

  let collectionsUpdated = 0
  let recommendedUpdated = 0
  let communityUpdated = 0
  let tagsCleaned = 0

  try {
    // Migrate user Collections
    console.log('Migrating user Collections...')
    const collections = await prisma.collection.findMany({
      select: {
        id: true,
        category: true,
        tags: true,
      },
    })

    for (const collection of collections) {
      let needsUpdate = false
      const updates: { category?: string | null; tags?: string } = {}

      // Normalize category
      if (collection.category) {
        const normalized = normalizeCategory(collection.category)
        if (normalized && normalized !== collection.category) {
          updates.category = normalized
          needsUpdate = true
          console.log(`  Collection ${collection.id}: "${collection.category}" -> "${normalized}"`)
        } else if (!normalized) {
          // Category doesn't match any predefined, set to "Other"
          updates.category = 'Other'
          needsUpdate = true
          console.log(`  Collection ${collection.id}: "${collection.category}" -> "Other" (not in predefined list)`)
        }
      }

      // Clean tags - remove collection types
      const tags = parseTags(collection.tags)
      const cleanedTags = tags.filter(tag => !COLLECTION_TYPE_TAGS.includes(tag))
      
      if (cleanedTags.length !== tags.length) {
        updates.tags = stringifyTags(cleanedTags)
        needsUpdate = true
        tagsCleaned += tags.length - cleanedTags.length
        console.log(`  Collection ${collection.id}: Removed ${tags.length - cleanedTags.length} collection-type tag(s)`)
      }

      if (needsUpdate) {
        await prisma.collection.update({
          where: { id: collection.id },
          data: updates,
        })
        collectionsUpdated++
      }
    }

    // Migrate RecommendedCollections
    console.log('\nMigrating RecommendedCollections...')
    const recommended = await prisma.recommendedCollection.findMany({
      select: {
        id: true,
        category: true,
        tags: true,
      },
    })

    for (const rec of recommended) {
      let needsUpdate = false
      const updates: { category?: string | null; tags?: string } = {}

      // Normalize category
      if (rec.category) {
        const normalized = normalizeCategory(rec.category)
        if (normalized && normalized !== rec.category) {
          updates.category = normalized
          needsUpdate = true
          console.log(`  Recommended ${rec.id}: "${rec.category}" -> "${normalized}"`)
        } else if (!normalized) {
          updates.category = 'Other'
          needsUpdate = true
          console.log(`  Recommended ${rec.id}: "${rec.category}" -> "Other"`)
        }
      }

      // Clean tags
      const tags = parseTags(rec.tags)
      const cleanedTags = tags.filter(tag => !COLLECTION_TYPE_TAGS.includes(tag))
      
      if (cleanedTags.length !== tags.length) {
        updates.tags = stringifyTags(cleanedTags)
        needsUpdate = true
        tagsCleaned += tags.length - cleanedTags.length
        console.log(`  Recommended ${rec.id}: Removed ${tags.length - cleanedTags.length} collection-type tag(s)`)
      }

      if (needsUpdate) {
        await prisma.recommendedCollection.update({
          where: { id: rec.id },
          data: updates,
        })
        recommendedUpdated++
      }
    }

    // Migrate CommunityCollections
    console.log('\nMigrating CommunityCollections...')
    const community = await prisma.communityCollection.findMany({
      select: {
        id: true,
        category: true,
        tags: true,
      },
    })

    for (const comm of community) {
      let needsUpdate = false
      const updates: { category?: string | null; tags?: string } = {}

      // Normalize category
      if (comm.category) {
        const normalized = normalizeCategory(comm.category)
        if (normalized && normalized !== comm.category) {
          updates.category = normalized
          needsUpdate = true
          console.log(`  Community ${comm.id}: "${comm.category}" -> "${normalized}"`)
        } else if (!normalized) {
          updates.category = 'Other'
          needsUpdate = true
          console.log(`  Community ${comm.id}: "${comm.category}" -> "Other"`)
        }
      }

      // Clean tags
      const tags = parseTags(comm.tags)
      const cleanedTags = tags.filter(tag => !COLLECTION_TYPE_TAGS.includes(tag))
      
      if (cleanedTags.length !== tags.length) {
        updates.tags = stringifyTags(cleanedTags)
        needsUpdate = true
        tagsCleaned += tags.length - cleanedTags.length
        console.log(`  Community ${comm.id}: Removed ${tags.length - cleanedTags.length} collection-type tag(s)`)
      }

      if (needsUpdate) {
        await prisma.communityCollection.update({
          where: { id: comm.id },
          data: updates,
        })
        communityUpdated++
      }
    }

    console.log('\n✅ Migration complete!')
    console.log(`  - Collections updated: ${collectionsUpdated}`)
    console.log(`  - Recommended collections updated: ${recommendedUpdated}`)
    console.log(`  - Community collections updated: ${communityUpdated}`)
    console.log(`  - Total collection-type tags removed: ${tagsCleaned}`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
migrateCategories()
  .then(() => {
    console.log('\n✨ Migration completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  })


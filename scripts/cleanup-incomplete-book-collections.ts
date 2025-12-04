/**
 * Script to delete incomplete book community collections
 * Keeps only complete lists and the 1001 Books list (exception)
 * 
 * Run with: npm run cleanup:incomplete-books
 */

import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load environment variables
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
} catch (error) {
  // Ignore
}

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set')
  process.exit(1)
}

const prisma = new PrismaClient()

// List of incomplete collections to delete (representative selections)
// Exception: 1001 Books You Must Read Before You Die - KEEP
const collectionsToDelete = [
  // 21st Century collections (incomplete)
  'Top 100 Books of the 21st Century',
  'The New York Times Best Sellers (Fiction)',
  'Reese\'s Book Club Picks',
  'Goodreads Choice Awards Winners (Fiction)',
  
  // Nonfiction incomplete
  'The New York Times 50 Best Memoirs',
  'The Telegraph\'s 100 Best Nonfiction Books',
  'The Paris Review\'s 100 Best Nonfiction',
  
  // Mystery/Thriller incomplete
  'The Guardian\'s 100 Best Crime Novels',
  'The Telegraph\'s 100 Best Crime Novels',
  
  // Children/YA incomplete
  'The Guardian\'s 100 Best Children\'s Books',
  'Time Magazine\'s 100 Best Young Adult Books',
  
  // Romance incomplete
  'The New York Times Best Sellers (Romance)',
  'Goodreads Best Romance Books',
  
  // Remaining classics incomplete
  'Franklin Library 100 Greatest Books',
  'The Great American Novels',
  'The Atlantic\'s Great American Novels',
  
  // Sci-Fi/Fantasy - check if incomplete (Locus, World Fantasy say "Representative selection" in comments)
  // Note: These say "Complete list" in description, so keeping them for now
]

async function main() {
  console.log('🧹 Cleaning up incomplete book collections...\n')
  
  let deletedCount = 0
  let keptCount = 0
  
  // Get all book collections
  const allCollections = await prisma.communityCollection.findMany({
    where: {
      category: 'Books',
    },
    select: {
      id: true,
      name: true,
    },
  })
  
  console.log(`Found ${allCollections.length} book collections\n`)
  
  for (const collection of allCollections) {
    // Keep 1001 Books (exception)
    if (collection.name.includes('1001 Books')) {
      console.log(`✅ Keeping: ${collection.name}`)
      keptCount++
      continue
    }
    
    // Check if this collection should be deleted
    const shouldDelete = collectionsToDelete.some(name => 
      collection.name.includes(name) || name.includes(collection.name)
    )
    
    if (shouldDelete) {
      console.log(`🗑️  Deleting: ${collection.name}`)
      
      // Delete items first (cascade)
      await prisma.communityItem.deleteMany({
        where: {
          communityCollectionId: collection.id,
        },
      })
      
      // Delete collection
      await prisma.communityCollection.delete({
        where: {
          id: collection.id,
        },
      })
      
      deletedCount++
    } else {
      console.log(`✅ Keeping: ${collection.name}`)
      keptCount++
    }
  }
  
  console.log(`\n✅ Cleanup complete!`)
  console.log(`   Deleted: ${deletedCount} incomplete collections`)
  console.log(`   Kept: ${keptCount} complete collections`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


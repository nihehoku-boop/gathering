/**
 * Cleanup script to remove duplicate books from collections
 * Keeps the first occurrence of each unique book (by normalized name)
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
  console.error('Error loading .env.local:', error)
}

const prisma = new PrismaClient()

function normalizeBookName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

async function cleanupCollection(collectionName: string) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`Cleaning up: ${collectionName}`)
  console.log(`${'='.repeat(60)}\n`)

  const collection = await prisma.communityCollection.findFirst({
    where: { name: collectionName },
    include: {
      items: {
        orderBy: { id: 'asc' }, // Keep first occurrence (oldest ID)
      },
    },
  })

  if (!collection) {
    console.log(`❌ Collection not found: ${collectionName}`)
    return
  }

  console.log(`📚 Found ${collection.items.length} items`)

  // Group items by normalized name
  const nameMap = new Map<string, typeof collection.items>()
  const duplicates: string[] = []

  collection.items.forEach(item => {
    const normalized = normalizeBookName(item.name)
    if (!nameMap.has(normalized)) {
      nameMap.set(normalized, [])
    }
    nameMap.get(normalized)!.push(item)
  })

  // Find duplicates
  nameMap.forEach((items, normalizedName) => {
    if (items.length > 1) {
      duplicates.push(normalizedName)
    }
  })

  console.log(`📊 Unique books: ${nameMap.size}`)
  console.log(`⚠️  Duplicate groups: ${duplicates.length}`)

  if (duplicates.length === 0) {
    console.log(`✅ No duplicates found!`)
    return
  }

  // Calculate total duplicates to remove
  let totalToRemove = 0
  const itemsToDelete: string[] = []

  duplicates.forEach(normalizedName => {
    const items = nameMap.get(normalizedName)!
    // Keep first item (oldest ID), delete the rest
    const toKeep = items[0]
    const toDelete = items.slice(1)
    
    totalToRemove += toDelete.length
    toDelete.forEach(item => {
      itemsToDelete.push(item.id)
    })

    console.log(`\n   "${items[0].name}":`)
    console.log(`      ✅ Keeping: #${toKeep.number} (ID: ${toKeep.id})`)
    toDelete.forEach(item => {
      console.log(`      ❌ Removing: #${item.number} (ID: ${item.id})`)
    })
  })

  console.log(`\n🗑️  Total duplicates to remove: ${totalToRemove}`)

  // Delete duplicates
  if (itemsToDelete.length > 0) {
    const result = await prisma.communityItem.deleteMany({
      where: {
        id: { in: itemsToDelete },
      },
    })

    console.log(`\n✅ Removed ${result.count} duplicate items`)
    console.log(`📊 Final count: ${collection.items.length - result.count} items`)
  }
}

async function main() {
  console.log('🧹 Starting duplicate cleanup...\n')

  const collectionsToClean = [
    'Franklin Library 100 Greatest Books',
    "The Telegraph's 100 Best Nonfiction Books",
    "The Paris Review's 100 Best Nonfiction",
    "The Telegraph's 100 Best Crime Novels",
    'Top 100 Books of the 21st Century',
  ]

  try {
    for (const collectionName of collectionsToClean) {
      await cleanupCollection(collectionName)
    }

    console.log(`\n${'='.repeat(60)}`)
    console.log('🎉 Cleanup complete!')
    console.log(`${'='.repeat(60)}\n`)
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)


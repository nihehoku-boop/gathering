import { PrismaClient } from '@prisma/client'
import Database from 'better-sqlite3'

/**
 * Script to migrate collections from local SQLite database to production PostgreSQL
 * 
 * Usage:
 * 1. Make sure you have .env.local with production DATABASE_URL
 * 2. Run: npm run migrate-to-production <your-email>
 */

const prisma = new PrismaClient()

// Connect to local SQLite database
const localDbPath = './prisma/dev.db'
let localDb: Database | null = null

try {
  localDb = new Database(localDbPath)
  console.log('Connected to local SQLite database')
} catch (error) {
  console.error('Error connecting to local database:', error)
  process.exit(1)
}

async function migrateCollections(userEmail: string) {
  try {
    // Get the user from production database
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      console.error(`User ${userEmail} not found in production database. Please create the account first.`)
      process.exit(1)
    }

    console.log(`Migrating collections for user: ${userEmail} (${user.id})`)

    // Get all collections from local database
    const localCollections = localDb!.prepare(`
      SELECT * FROM Collection WHERE userId = (
        SELECT id FROM User WHERE email = ?
      )
    `).all(userEmail) as any[]

    if (localCollections.length === 0) {
      console.log('No collections found in local database for this user.')
      return
    }

    console.log(`Found ${localCollections.length} collections to migrate`)

    // Get all folders from local database
    const localFolders = localDb!.prepare(`
      SELECT * FROM Folder WHERE userId = (
        SELECT id FROM User WHERE email = ?
      )
    `).all(userEmail) as any[]

    // Create folder mapping (local folderId -> production folderId)
    const folderMap = new Map<string, string>()

    for (const localFolder of localFolders) {
      const folder = await prisma.folder.create({
        data: {
          name: localFolder.name,
          userId: user.id,
          parentId: localFolder.parentId ? folderMap.get(localFolder.parentId) || null : null,
        },
      })
      folderMap.set(localFolder.id, folder.id)
      console.log(`Created folder: ${folder.name}`)
    }

    // Migrate collections
    for (const localCollection of localCollections) {
      console.log(`Migrating collection: ${localCollection.name}`)

      // Get items for this collection
      const localItems = localDb!.prepare(`
        SELECT * FROM Item WHERE collectionId = ?
      `).all(localCollection.id) as any[]

      // Create collection in production
      const collection = await prisma.collection.create({
        data: {
          name: localCollection.name,
          description: localCollection.description,
          category: localCollection.category,
          template: localCollection.template || 'custom',
          customFieldDefinitions: localCollection.customFieldDefinitions || '[]',
          folderId: localCollection.folderId ? folderMap.get(localCollection.folderId) || null : null,
          coverImage: localCollection.coverImage,
          coverImageAspectRatio: localCollection.coverImageAspectRatio,
          tags: localCollection.tags || '[]',
          userId: user.id,
          isPublic: localCollection.isPublic || false,
          items: {
            create: localItems.map(item => ({
              name: item.name,
              number: item.number,
              isOwned: Boolean(item.isOwned) || false,
              notes: item.notes,
              image: item.image,
              alternativeImages: item.alternativeImages || '[]',
              wear: item.wear,
              personalRating: item.personalRating,
              logDate: item.logDate ? new Date(item.logDate) : null,
              customFields: item.customFields || '{}',
            })),
          },
        },
      })

      console.log(`  ✓ Created collection "${collection.name}" with ${localItems.length} items`)
    }

    console.log(`\n✅ Successfully migrated ${localCollections.length} collections!`)
  } catch (error) {
    console.error('Error migrating collections:', error)
    throw error
  }
}

async function main() {
  const userEmail = process.argv[2]

  if (!userEmail) {
    console.error('Usage: npm run migrate-to-production <your-email>')
    console.error('Example: npm run migrate-to-production nihehoku@gmail.com')
    process.exit(1)
  }

  try {
    await migrateCollections(userEmail)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    if (localDb) {
      localDb.close()
    }
  }
}

main()


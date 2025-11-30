import { PrismaClient } from '@prisma/client'
import Database from 'better-sqlite3'

/**
 * Script to migrate recommended and community collections from local SQLite database to production PostgreSQL
 * 
 * Usage:
 * 1. Make sure you have .env.local with production DATABASE_URL
 * 2. Run: npm run migrate-recommended-community
 */

const prisma = new PrismaClient()

// Connect to local SQLite database
const localDbPath = './prisma/dev.db'
let localDb: InstanceType<typeof Database> | null = null

try {
  localDb = new Database(localDbPath)
  console.log('Connected to local SQLite database')
} catch (error) {
  console.error('Error connecting to local database:', error)
  process.exit(1)
}

async function migrateRecommendedCollections() {
  try {
    console.log('\n📚 Migrating Recommended Collections...')
    
    // Fetch recommended collections from local SQLite
    const localRecommendedCollections = localDb!.prepare('SELECT * FROM RecommendedCollection').all() as any[]
    console.log(`Found ${localRecommendedCollections.length} recommended collections to migrate`)

    for (const localCollection of localRecommendedCollections) {
      // Check if collection already exists in production
      const existing = await prisma.recommendedCollection.findFirst({
        where: { name: localCollection.name },
      })

      if (existing) {
        console.log(`  ⏭️  Skipping "${localCollection.name}" (already exists)`)
        continue
      }

      // Fetch items for the current collection from local SQLite
      const localItems = localDb!.prepare('SELECT * FROM RecommendedItem WHERE recommendedCollectionId = ?').all(localCollection.id) as any[]

      // Create collection in production
      const collection = await prisma.recommendedCollection.create({
        data: {
          id: localCollection.id, // Keep original ID for consistency
          name: localCollection.name,
          description: localCollection.description,
          category: localCollection.category,
          coverImage: localCollection.coverImage,
          tags: localCollection.tags || '[]',
          createdAt: new Date(localCollection.createdAt),
          updatedAt: new Date(localCollection.updatedAt),
          items: {
            create: localItems.map(localItem => ({
              id: localItem.id, // Keep original ID for consistency
              name: localItem.name,
              number: localItem.number !== null && localItem.number !== undefined ? parseInt(String(localItem.number)) : null,
              notes: localItem.notes,
              image: localItem.image,
              createdAt: new Date(localItem.createdAt),
              updatedAt: new Date(localItem.updatedAt),
            })),
          },
        },
      })
      console.log(`  ✓ Created recommended collection "${collection.name}" with ${localItems.length} items`)
    }
    console.log('✅ Successfully migrated all recommended collections!')
  } catch (error) {
    console.error('Error migrating recommended collections:', error)
    throw error
  }
}

async function migrateCommunityCollections() {
  try {
    console.log('\n👥 Migrating Community Collections...')
    
    // Fetch community collections from local SQLite
    const localCommunityCollections = localDb!.prepare('SELECT * FROM CommunityCollection').all() as any[]
    console.log(`Found ${localCommunityCollections.length} community collections to migrate`)

    for (const localCollection of localCommunityCollections) {
      // Check if collection already exists in production
      const existing = await prisma.communityCollection.findFirst({
        where: { id: localCollection.id },
      })

      if (existing) {
        console.log(`  ⏭️  Skipping "${localCollection.name}" (already exists)`)
        continue
      }

      // Check if user exists in production
      const user = await prisma.user.findUnique({
        where: { id: localCollection.userId },
      })

      if (!user) {
        console.log(`  ⚠️  Skipping "${localCollection.name}" (user ${localCollection.userId} not found)`)
        continue
      }

      // Fetch items for the current collection from local SQLite
      const localItems = localDb!.prepare('SELECT * FROM CommunityItem WHERE communityCollectionId = ?').all(localCollection.id) as any[]

      // Fetch votes for the current collection from local SQLite
      const localVotes = localDb!.prepare('SELECT * FROM CommunityCollectionVote WHERE communityCollectionId = ?').all(localCollection.id) as any[]

      // Filter votes to only include those from users that exist in production
      const validVotes = []
      for (const localVote of localVotes) {
        const voteUser = await prisma.user.findUnique({
          where: { id: localVote.userId },
        })
        if (voteUser) {
          validVotes.push({
            id: localVote.id,
            userId: localVote.userId,
            voteType: localVote.voteType,
            createdAt: new Date(localVote.createdAt),
          })
        }
      }

      // Create collection in production
      const collection = await prisma.communityCollection.create({
        data: {
          id: localCollection.id, // Keep original ID for consistency
          name: localCollection.name,
          description: localCollection.description,
          category: localCollection.category,
          coverImage: localCollection.coverImage,
          tags: localCollection.tags || '[]',
          userId: localCollection.userId,
          createdAt: new Date(localCollection.createdAt),
          updatedAt: new Date(localCollection.updatedAt),
          items: {
            create: localItems.map(localItem => ({
              id: localItem.id, // Keep original ID for consistency
              name: localItem.name,
              number: localItem.number !== null && localItem.number !== undefined ? parseInt(String(localItem.number)) : null,
              notes: localItem.notes,
              image: localItem.image,
              createdAt: new Date(localItem.createdAt),
              updatedAt: new Date(localItem.updatedAt),
            })),
          },
          votes: {
            create: validVotes,
          },
        },
      })
      console.log(`  ✓ Created community collection "${collection.name}" with ${localItems.length} items and ${localVotes.length} votes`)
    }
    console.log('✅ Successfully migrated all community collections!')
  } catch (error) {
    console.error('Error migrating community collections:', error)
    throw error
  }
}

async function main() {
  try {
    await migrateRecommendedCollections()
    await migrateCommunityCollections()
    console.log('\n🎉 Successfully migrated all recommended and community collections!')
  } catch (error) {
    console.error('Error during migration:', error)
    process.exit(1)
  } finally {
    localDb?.close()
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })


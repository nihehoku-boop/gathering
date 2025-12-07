import { PrismaClient } from '@prisma/client'

/**
 * Script to migrate data from one database to another
 * 
 * Usage:
 * 1. Set OLD_DATABASE_URL in .env.local (your current Prisma database)
 * 2. Set NEW_DATABASE_URL in .env.local (your new Neon database)
 * 3. Run: npx tsx scripts/migrate-database.ts
 * 
 * IMPORTANT: This script preserves ALL data including community collections, votes, and relationships.
 */

if (!process.env.OLD_DATABASE_URL) {
  console.error('❌ OLD_DATABASE_URL is not set in .env.local')
  process.exit(1)
}

if (!process.env.NEW_DATABASE_URL) {
  console.error('❌ NEW_DATABASE_URL is not set in .env.local')
  process.exit(1)
}

const oldPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.OLD_DATABASE_URL,
    },
  },
})

const newPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.NEW_DATABASE_URL,
    },
  },
})

async function verifyData() {
  console.log('\n🔍 Verifying migrated data...\n')
  
  const oldCounts = {
    users: await oldPrisma.user.count(),
    collections: await oldPrisma.collection.count(),
    items: await oldPrisma.item.count(),
    communityCollections: await oldPrisma.communityCollection.count(),
    communityItems: await oldPrisma.communityItem.count(),
    votes: await oldPrisma.communityCollectionVote.count(),
    recommendedCollections: await oldPrisma.recommendedCollection.count(),
    recommendedItems: await oldPrisma.recommendedItem.count(),
    wishlists: await oldPrisma.wishlist.count(),
    wishlistItems: await oldPrisma.wishlistItem.count(),
    folders: await oldPrisma.folder.count(),
  }

  const newCounts = {
    users: await newPrisma.user.count(),
    collections: await newPrisma.collection.count(),
    items: await newPrisma.item.count(),
    communityCollections: await newPrisma.communityCollection.count(),
    communityItems: await newPrisma.communityItem.count(),
    votes: await newPrisma.communityCollectionVote.count(),
    recommendedCollections: await newPrisma.recommendedCollection.count(),
    recommendedItems: await newPrisma.recommendedItem.count(),
    wishlists: await newPrisma.wishlist.count(),
    wishlistItems: await newPrisma.wishlistItem.count(),
    folders: await newPrisma.folder.count(),
  }

  let allMatch = true
  for (const [key, oldCount] of Object.entries(oldCounts)) {
    const newCount = newCounts[key as keyof typeof newCounts]
    if (oldCount !== newCount) {
      console.error(`❌ ${key}: OLD=${oldCount}, NEW=${newCount} - MISMATCH!`)
      allMatch = false
    } else {
      console.log(`✅ ${key}: ${oldCount} (matches)`)
    }
  }

  if (allMatch) {
    console.log('\n✅ All data counts match! Migration verified.\n')
  } else {
    console.error('\n❌ Data count mismatch detected! Please review the migration.\n')
    throw new Error('Data verification failed')
  }
}

async function migrateData() {
  try {
    console.log('🚀 Starting database migration...\n')
    console.log('⚠️  IMPORTANT: This will migrate ALL data including community collections\n')

    // Test connections
    console.log('📡 Testing connections...')
    try {
      await oldPrisma.$connect()
      console.log('✅ Connected to OLD database')
    } catch (error) {
      console.error('❌ Failed to connect to OLD database. Is it accessible?')
      console.error('   If the database is suspended, you may need to contact Prisma support to restore access.')
      throw error
    }
    
    try {
      await newPrisma.$connect()
      console.log('✅ Connected to NEW database\n')
    } catch (error) {
      console.error('❌ Failed to connect to NEW database. Check your Neon connection string.')
      throw error
    }

    // Migrate Users
    console.log('👥 Migrating Users...')
    const users = await oldPrisma.user.findMany()
    console.log(`   Found ${users.length} users`)
    
    for (const user of users) {
      await newPrisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user,
      })
    }
    console.log(`✅ Migrated ${users.length} users\n`)

    // Migrate Folders
    console.log('📁 Migrating Folders...')
    const folders = await oldPrisma.folder.findMany()
    console.log(`   Found ${folders.length} folders`)
    
    for (const folder of folders) {
      await newPrisma.folder.upsert({
        where: { id: folder.id },
        update: folder,
        create: folder,
      })
    }
    console.log(`✅ Migrated ${folders.length} folders\n`)

    // Migrate Collections
    console.log('📚 Migrating Collections...')
    const collections = await oldPrisma.collection.findMany()
    console.log(`   Found ${collections.length} collections`)
    
    for (const collection of collections) {
      await newPrisma.collection.upsert({
        where: { id: collection.id },
        update: collection,
        create: collection,
      })
    }
    console.log(`✅ Migrated ${collections.length} collections\n`)

    // Migrate Items
    console.log('📦 Migrating Items...')
    const items = await oldPrisma.item.findMany()
    console.log(`   Found ${items.length} items`)
    
    // Migrate in batches to avoid memory issues
    const batchSize = 100
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      await Promise.all(
        batch.map(item =>
          newPrisma.item.upsert({
            where: { id: item.id },
            update: item,
            create: item,
          })
        )
      )
      console.log(`   Migrated ${Math.min(i + batchSize, items.length)}/${items.length} items`)
    }
    console.log(`✅ Migrated ${items.length} items\n`)

    // Migrate Recommended Collections
    console.log('⭐ Migrating Recommended Collections...')
    const recommendedCollections = await oldPrisma.recommendedCollection.findMany()
    console.log(`   Found ${recommendedCollections.length} recommended collections`)
    
    for (const collection of recommendedCollections) {
      await newPrisma.recommendedCollection.upsert({
        where: { id: collection.id },
        update: collection,
        create: collection,
      })
    }
    console.log(`✅ Migrated ${recommendedCollections.length} recommended collections\n`)

    // Migrate Recommended Items
    console.log('⭐ Migrating Recommended Items...')
    const recommendedItems = await oldPrisma.recommendedItem.findMany()
    console.log(`   Found ${recommendedItems.length} recommended items`)
    
    for (const item of recommendedItems) {
      await newPrisma.recommendedItem.upsert({
        where: { id: item.id },
        update: item,
        create: item,
      })
    }
    console.log(`✅ Migrated ${recommendedItems.length} recommended items\n`)

    // Migrate Community Collections
    console.log('🌐 Migrating Community Collections...')
    const communityCollections = await oldPrisma.communityCollection.findMany()
    console.log(`   Found ${communityCollections.length} community collections`)
    
    for (const collection of communityCollections) {
      await newPrisma.communityCollection.upsert({
        where: { id: collection.id },
        update: collection,
        create: collection,
      })
    }
    console.log(`✅ Migrated ${communityCollections.length} community collections\n`)

    // Migrate Community Items
    console.log('🌐 Migrating Community Items...')
    const communityItems = await oldPrisma.communityItem.findMany()
    console.log(`   Found ${communityItems.length} community items`)
    
    for (const item of communityItems) {
      await newPrisma.communityItem.upsert({
        where: { id: item.id },
        update: item,
        create: item,
      })
    }
    console.log(`✅ Migrated ${communityItems.length} community items\n`)

    // Migrate Community Collection Votes
    console.log('👍 Migrating Community Collection Votes...')
    const votes = await oldPrisma.communityCollectionVote.findMany()
    console.log(`   Found ${votes.length} votes`)
    
    for (const vote of votes) {
      await newPrisma.communityCollectionVote.upsert({
        where: {
          communityCollectionId_userId: {
            communityCollectionId: vote.communityCollectionId,
            userId: vote.userId,
          },
        },
        update: vote,
        create: vote,
      })
    }
    console.log(`✅ Migrated ${votes.length} votes\n`)

    // Migrate Wishlists
    console.log('💝 Migrating Wishlists...')
    const wishlists = await oldPrisma.wishlist.findMany()
    console.log(`   Found ${wishlists.length} wishlists`)
    
    for (const wishlist of wishlists) {
      await newPrisma.wishlist.upsert({
        where: { id: wishlist.id },
        update: wishlist,
        create: wishlist,
      })
    }
    console.log(`✅ Migrated ${wishlists.length} wishlists\n`)

    // Migrate Wishlist Items
    console.log('💝 Migrating Wishlist Items...')
    const wishlistItems = await oldPrisma.wishlistItem.findMany()
    console.log(`   Found ${wishlistItems.length} wishlist items`)
    
    for (const item of wishlistItems) {
      await newPrisma.wishlistItem.upsert({
        where: { id: item.id },
        update: item,
        create: item,
      })
    }
    console.log(`✅ Migrated ${wishlistItems.length} wishlist items\n`)

    // Migrate Accounts (for NextAuth)
    console.log('🔐 Migrating Accounts...')
    const accounts = await oldPrisma.account.findMany()
    console.log(`   Found ${accounts.length} accounts`)
    
    for (const account of accounts) {
      await newPrisma.account.upsert({
        where: {
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        },
        update: account,
        create: account,
      })
    }
    console.log(`✅ Migrated ${accounts.length} accounts\n`)

    // Migrate Sessions (for NextAuth)
    console.log('🔐 Migrating Sessions...')
    const sessions = await oldPrisma.session.findMany()
    console.log(`   Found ${sessions.length} sessions`)
    
    for (const session of sessions) {
      await newPrisma.session.upsert({
        where: { sessionToken: session.sessionToken },
        update: session,
        create: session,
      })
    }
    console.log(`✅ Migrated ${sessions.length} sessions\n`)

    // Migrate Verification Tokens (for NextAuth)
    console.log('🔐 Migrating Verification Tokens...')
    const verificationTokens = await oldPrisma.verificationToken.findMany()
    console.log(`   Found ${verificationTokens.length} verification tokens`)
    
    for (const token of verificationTokens) {
      await newPrisma.verificationToken.upsert({
        where: {
          identifier_token: {
            identifier: token.identifier,
            token: token.token,
          },
        },
        update: token,
        create: token,
      })
    }
    console.log(`✅ Migrated ${verificationTokens.length} verification tokens\n`)

    // Verify all data was migrated correctly
    await verifyData()

    console.log('🎉 Migration completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   - Users: ${await newPrisma.user.count()}`)
    console.log(`   - Collections: ${await newPrisma.collection.count()}`)
    console.log(`   - Items: ${await newPrisma.item.count()}`)
    console.log(`   - Community Collections: ${await newPrisma.communityCollection.count()}`)
    console.log(`   - Community Items: ${await newPrisma.communityItem.count()}`)
    console.log(`   - Votes: ${await newPrisma.communityCollectionVote.count()}`)
    console.log(`   - Recommended Collections: ${await newPrisma.recommendedCollection.count()}`)
    console.log(`   - Recommended Items: ${await newPrisma.recommendedItem.count()}`)
    console.log(`   - Wishlists: ${await newPrisma.wishlist.count()}`)
    console.log(`   - Wishlist Items: ${await newPrisma.wishlistItem.count()}`)
    console.log(`   - Folders: ${await newPrisma.folder.count()}`)
    console.log('\n✅ All data has been safely migrated to Neon!\n')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await oldPrisma.$disconnect()
    await newPrisma.$disconnect()
  }
}

migrateData()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })


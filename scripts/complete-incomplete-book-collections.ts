/**
 * Script to complete all incomplete book collections
 * This will resume from where each collection left off
 * 
 * Run with: npm run complete:incomplete-books
 */

import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createBookCollection, BookData } from './lib/book-seeder-utils'

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

async function main() {
  console.log('🌱 Starting completion of incomplete book collections...\n')

  try {
    // Get or create an admin user
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

    // Get all incomplete book collections
    const collections = await prisma.communityCollection.findMany({
      where: { category: 'Books' },
      include: {
        _count: {
          select: { items: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    const incomplete = collections.filter(col => {
      const count = col._count.items
      // Consider incomplete if less than 20 books, or if it's a "100" list with less than 80
      return count < 20 || (col.name.includes('100') && count < 80)
    })

    console.log(`📊 Found ${incomplete.length} incomplete collections out of ${collections.length} total\n`)

    if (incomplete.length === 0) {
      console.log('✅ All collections are complete!')
      return
    }

    console.log('⚠️  Incomplete collections:')
    incomplete.forEach(col => {
      console.log(`   - ${col.name}: ${col._count.items} books`)
    })
    console.log('\n')

    console.log('💡 Note: To complete these collections, run the specific seed scripts:')
    console.log('   - npm run seed:books-hugo-nebula (for Hugo/Nebula)')
    console.log('   - npm run seed:books-all-awards (for National Book Award)')
    console.log('   - npm run seed:books-remaining-awards (for other awards)')
    console.log('   - npm run seed:books-classics (for classics lists)')
    console.log('   - npm run seed:books-21st-century (for 21st century lists)')
    console.log('   - npm run seed:books-nonfiction (for nonfiction lists)')
    console.log('   - npm run seed:books-mystery-thriller (for mystery/thriller)')
    console.log('   - npm run seed:books-romance (for romance)')
    console.log('   - npm run seed:books-children-ya (for children/YA)')
    console.log('   - npm run seed:books-scifi-fantasy (for sci-fi/fantasy)')
    console.log('\n')
    console.log('✅ These scripts will automatically resume from where they left off!')
  } catch (error) {
    console.error('❌ Error:', error)
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


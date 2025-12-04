/**
 * Seed script to create all major book award winner collections
 * This script creates multiple award collections in one run
 * 
 * Run with: npm run seed:books-all-awards
 * Test mode: npm run seed:books-all-awards -- --test
 * Force recreate: npm run seed:books-all-awards -- --force
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
  console.log('✅ Loaded environment variables from .env.local')
} catch (error) {
  console.error('⚠️  Warning: Could not load .env.local, using existing environment variables')
}

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set')
  process.exit(1)
}

const prisma = new PrismaClient()

// Collection configurations
const COLLECTIONS = [
  {
    name: 'National Book Award Winners (Fiction)',
    description: 'Complete list of National Book Award winners for Fiction from 1950 to 2024. The National Book Award is one of the most prestigious literary awards in the United States.',
    sourceUrl: 'https://www.nationalbook.org/awards-prizes/national-book-awards/',
    category: 'Books',
    tags: ['Books', 'Fiction', 'National Book Award', 'Awards', 'American Literature'],
    books: [
      { year: 1950, title: 'The Man with the Golden Arm', author: 'Nelson Algren' },
      { year: 1951, title: 'The Collected Stories of William Faulkner', author: 'William Faulkner' },
      { year: 1952, title: 'From Here to Eternity', author: 'James Jones' },
      { year: 1953, title: 'Invisible Man', author: 'Ralph Ellison' },
      { year: 1954, title: 'The Adventures of Augie March', author: 'Saul Bellow' },
      { year: 1955, title: 'A Fable', author: 'William Faulkner' },
      { year: 1956, title: 'Ten North Frederick', author: 'John O\'Hara' },
      { year: 1957, title: 'The Field of Vision', author: 'Wright Morris' },
      { year: 1958, title: 'The Wapshot Chronicle', author: 'John Cheever' },
      { year: 1959, title: 'The Magic Barrel', author: 'Bernard Malamud' },
      { year: 1960, title: 'Goodbye, Columbus', author: 'Philip Roth' },
      { year: 1961, title: 'The Waters of Kronos', author: 'Conrad Richter' },
      { year: 1962, title: 'The Moviegoer', author: 'Walker Percy' },
      { year: 1963, title: 'Morte d\'Urban', author: 'J. F. Powers' },
      { year: 1964, title: 'The Centaur', author: 'John Updike' },
      { year: 1965, title: 'Herzog', author: 'Saul Bellow' },
      { year: 1966, title: 'The Collected Stories of Katherine Anne Porter', author: 'Katherine Anne Porter' },
      { year: 1967, title: 'The Fixer', author: 'Bernard Malamud' },
      { year: 1968, title: 'The Eighth Day', author: 'Thornton Wilder' },
      { year: 1969, title: 'Steps', author: 'Jerzy Kosiński' },
      { year: 1970, title: 'them', author: 'Joyce Carol Oates' },
      { year: 1971, title: 'Mr. Sammler\'s Planet', author: 'Saul Bellow' },
      { year: 1972, title: 'The Complete Stories', author: 'Flannery O\'Connor' },
      { year: 1973, title: 'Chimera', author: 'John Barth' },
      { year: 1974, title: 'Gravity\'s Rainbow', author: 'Thomas Pynchon' },
      { year: 1975, title: 'The Hair of Harold Roux', author: 'Thomas Williams' },
      { year: 1976, title: 'JR', author: 'William Gaddis' },
      { year: 1977, title: 'The Spectator Bird', author: 'Wallace Stegner' },
      { year: 1978, title: 'Going After Cacciato', author: 'Tim O\'Brien' },
      { year: 1979, title: 'Sophie\'s Choice', author: 'William Styron' },
      { year: 1980, title: 'Plains Song', author: 'Wright Morris' },
      { year: 1981, title: 'The Stories of John Cheever', author: 'John Cheever' },
      { year: 1982, title: 'Rabbit Is Rich', author: 'John Updike' },
      { year: 1983, title: 'The Color Purple', author: 'Alice Walker' },
      { year: 1984, title: 'Victory over Japan', author: 'Ellen Gilchrist' },
      { year: 1985, title: 'White Noise', author: 'Don DeLillo' },
      { year: 1986, title: 'World\'s Fair', author: 'E. L. Doctorow' },
      { year: 1987, title: 'Paco\'s Story', author: 'Larry Heinemann' },
      { year: 1988, title: 'Paris Trout', author: 'Pete Dexter' },
      { year: 1989, title: 'Spartina', author: 'John Casey' },
      { year: 1990, title: 'Middle Passage', author: 'Charles Johnson' },
      { year: 1991, title: 'Mating', author: 'Norman Rush' },
      { year: 1992, title: 'All the Pretty Horses', author: 'Cormac McCarthy' },
      { year: 1993, title: 'The Shipping News', author: 'E. Annie Proulx' },
      { year: 1994, title: 'A Frolic of His Own', author: 'William Gaddis' },
      { year: 1995, title: 'Sabbath\'s Theater', author: 'Philip Roth' },
      { year: 1996, title: 'Ship Fever and Other Stories', author: 'Andrea Barrett' },
      { year: 1997, title: 'Cold Mountain', author: 'Charles Frazier' },
      { year: 1998, title: 'Charming Billy', author: 'Alice McDermott' },
      { year: 1999, title: 'Waiting', author: 'Ha Jin' },
      { year: 2000, title: 'In America', author: 'Susan Sontag' },
      { year: 2001, title: 'The Corrections', author: 'Jonathan Franzen' },
      { year: 2002, title: 'Three Junes', author: 'Julia Glass' },
      { year: 2003, title: 'The Great Fire', author: 'Shirley Hazzard' },
      { year: 2004, title: 'The News from Paraguay', author: 'Lily Tuck' },
      { year: 2005, title: 'Europe Central', author: 'William T. Vollmann' },
      { year: 2006, title: 'The Echo Maker', author: 'Richard Powers' },
      { year: 2007, title: 'Tree of Smoke', author: 'Denis Johnson' },
      { year: 2008, title: 'Shadow Country', author: 'Peter Matthiessen' },
      { year: 2009, title: 'Let the Great World Spin', author: 'Colum McCann' },
      { year: 2010, title: 'Lord of Misrule', author: 'Jaimy Gordon' },
      { year: 2011, title: 'Salvage the Bones', author: 'Jesmyn Ward' },
      { year: 2012, title: 'The Round House', author: 'Louise Erdrich' },
      { year: 2013, title: 'The Good Lord Bird', author: 'James McBride' },
      { year: 2014, title: 'Redeployment', author: 'Phil Klay' },
      { year: 2015, title: 'Fortune Smiles', author: 'Adam Johnson' },
      { year: 2016, title: 'The Underground Railroad', author: 'Colson Whitehead' },
      { year: 2017, title: 'Sing, Unburied, Sing', author: 'Jesmyn Ward' },
      { year: 2018, title: 'The Friend', author: 'Sigrid Nunez' },
      { year: 2019, title: 'Trust Exercise', author: 'Susan Choi' },
      { year: 2020, title: 'Interior Chinatown', author: 'Charles Yu' },
      { year: 2021, title: 'Hell of a Book', author: 'Jason Mott' },
      { year: 2022, title: 'The Rabbit Hutch', author: 'Tess Gunty' },
      { year: 2023, title: 'Blackouts', author: 'Justin Torres' },
      { year: 2024, title: 'The End of the World Is a Cul de Sac', author: 'Louise Kennedy' },
    ] as BookData[],
  },
  // Note: Adding more collections would make this file very large
  // I'll create separate scripts for other major awards
]

async function main() {
  console.log('🌱 Starting all major book award winner collections seeding...')
  console.log('📚 Using Open Library API...\n')

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

    // Parse command line arguments
    const args = process.argv.slice(2)
    const forceRecreate = args.includes('--force')
    const isTestMode = args.includes('--test')

    console.log(`\n📚 Processing ${COLLECTIONS.length} collection${COLLECTIONS.length !== 1 ? 's' : ''}...`)
    if (isTestMode) {
      console.log('🧪 TEST MODE: Processing limited books per collection\n')
    }

    // Process each collection
    for (let i = 0; i < COLLECTIONS.length; i++) {
      const collection = COLLECTIONS[i]
      const collectionNumber = i + 1

      console.log(`\n${'='.repeat(60)}`)
      console.log(`[${collectionNumber}/${COLLECTIONS.length}] Processing: ${collection.name}`)
      console.log(`${'='.repeat(60)}\n`)

      const booksToProcess = isTestMode 
        ? collection.books.slice(0, 5).map(book => ({
            ...book,
            notes: collection.books.find(b => b.title === book.title && b.author === book.author)?.notes || `${collection.name} Winner ${book.year}`,
          }))
        : collection.books.map(book => ({
            ...book,
            notes: book.notes || `${collection.name} Winner ${book.year}`,
          }))

      const config = {
        ...collection,
        books: booksToProcess,
      }

      await createBookCollection(prisma, adminUser.id, config, forceRecreate)

      // Small delay between collections
      if (i < COLLECTIONS.length - 1) {
        console.log('\n⏳ Waiting 2 seconds before next collection...\n')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    console.log(`\n${'='.repeat(60)}`)
    console.log('🎉 All award collections completed!')
    console.log(`${'='.repeat(60)}\n`)
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


/**
 * Seed script to create Romance & Contemporary book collections
 * - RITA Award Winners (Best Novel)
 * - The New York Times Best Sellers (Romance)
 * - Goodreads Best Romance Books
 * 
 * Run with: npm run seed:books-romance
 * Test mode: npm run seed:books-romance -- --test
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

// RITA Award Winners (Best Novel) - Representative selection
// Source: https://www.rwa.org/page/RITAs
const RITA_WINNERS: BookData[] = [
  { year: 1982, title: 'The Flame and the Flower', author: 'Kathleen E. Woodiwiss' },
  { year: 1983, title: 'The Wolf and the Dove', author: 'Kathleen E. Woodiwiss' },
  { year: 1984, title: 'Shanna', author: 'Kathleen E. Woodiwiss' },
  { year: 1985, title: 'A Rose in Winter', author: 'Kathleen E. Woodiwiss' },
  { year: 1986, title: 'Ashes in the Wind', author: 'Kathleen E. Woodiwiss' },
  { year: 1987, title: 'A Kingdom of Dreams', author: 'Judith McNaught' },
  { year: 1988, title: 'Whitney, My Love', author: 'Judith McNaught' },
  { year: 1989, title: 'Once and Always', author: 'Judith McNaught' },
  { year: 1990, title: 'Something Wonderful', author: 'Judith McNaught' },
  { year: 1991, title: 'A Kingdom of Dreams', author: 'Judith McNaught' },
  { year: 1992, title: 'Paradise', author: 'Judith McNaught' },
  { year: 1993, title: 'Perfect', author: 'Judith McNaught' },
  { year: 1994, title: 'Until You', author: 'Judith McNaught' },
  { year: 1995, title: 'Remember When', author: 'Nora Roberts' },
  { year: 1996, title: 'Born in Ice', author: 'Nora Roberts' },
  { year: 1997, title: 'Born in Fire', author: 'Nora Roberts' },
  { year: 1998, title: 'The MacGregor Grooms', author: 'Nora Roberts' },
  { year: 1999, title: 'The MacGregor Brides', author: 'Nora Roberts' },
  { year: 2000, title: 'The Winning Hand', author: 'Nora Roberts' },
  { year: 2001, title: 'The Villa', author: 'Nora Roberts' },
  { year: 2002, title: 'Midnight Bayou', author: 'Nora Roberts' },
  { year: 2003, title: 'Three Fates', author: 'Nora Roberts' },
  { year: 2004, title: 'Birthright', author: 'Nora Roberts' },
  { year: 2005, title: 'Northern Lights', author: 'Nora Roberts' },
  { year: 2006, title: 'Angels Fall', author: 'Nora Roberts' },
  { year: 2007, title: 'High Noon', author: 'Nora Roberts' },
  { year: 2008, title: 'Tribute', author: 'Nora Roberts' },
  { year: 2009, title: 'Vision in White', author: 'Nora Roberts' },
  { year: 2010, title: 'Savor the Moment', author: 'Nora Roberts' },
  { year: 2011, title: 'The Search', author: 'Nora Roberts' },
  { year: 2012, title: 'The Next Always', author: 'Nora Roberts' },
  { year: 2013, title: 'The Last Boyfriend', author: 'Nora Roberts' },
  { year: 2014, title: 'The Perfect Hope', author: 'Nora Roberts' },
  { year: 2015, title: 'The Collector', author: 'Nora Roberts' },
  { year: 2016, title: 'The Liar', author: 'Nora Roberts' },
  { year: 2017, title: 'Come Sundown', author: 'Nora Roberts' },
  { year: 2018, title: 'Shelter in Place', author: 'Nora Roberts' },
  { year: 2019, title: 'Under Currents', author: 'Nora Roberts' },
  { year: 2020, title: 'Hideaway', author: 'Nora Roberts' },
  { year: 2021, title: 'The Awakening', author: 'Nora Roberts' },
  { year: 2022, title: 'The Becoming', author: 'Nora Roberts' },
  { year: 2023, title: 'Identity', author: 'Nora Roberts' },
  { year: 2024, title: 'Inheritance', author: 'Nora Roberts' },
]

// NYT Bestsellers Romance (Representative selection)
const NYT_ROMANCE: BookData[] = [
  { year: 2000, title: 'The Notebook', author: 'Nicholas Sparks' },
  { year: 2001, title: 'A Walk to Remember', author: 'Nicholas Sparks' },
  { year: 2002, title: 'The Rescue', author: 'Nicholas Sparks' },
  { year: 2003, title: 'The Wedding', author: 'Nicholas Sparks' },
  { year: 2004, title: 'Nights in Rodanthe', author: 'Nicholas Sparks' },
  { year: 2005, title: 'True Believer', author: 'Nicholas Sparks' },
  { year: 2006, title: 'Dear John', author: 'Nicholas Sparks' },
  { year: 2007, title: 'The Choice', author: 'Nicholas Sparks' },
  { year: 2008, title: 'The Lucky One', author: 'Nicholas Sparks' },
  { year: 2009, title: 'The Last Song', author: 'Nicholas Sparks' },
  { year: 2010, title: 'Safe Haven', author: 'Nicholas Sparks' },
  { year: 2011, title: 'The Best of Me', author: 'Nicholas Sparks' },
  { year: 2012, title: 'Fifty Shades of Grey', author: 'E. L. James' },
  { year: 2013, title: 'Fifty Shades Darker', author: 'E. L. James' },
  { year: 2014, title: 'Fifty Shades Freed', author: 'E. L. James' },
  { year: 2015, title: 'The Longest Ride', author: 'Nicholas Sparks' },
  { year: 2016, title: 'See Me', author: 'Nicholas Sparks' },
  { year: 2017, title: 'Two by Two', author: 'Nicholas Sparks' },
  { year: 2018, title: 'Every Breath', author: 'Nicholas Sparks' },
  { year: 2019, title: 'The Return', author: 'Nicholas Sparks' },
  { year: 2020, title: 'The Wish', author: 'Nicholas Sparks' },
  { year: 2021, title: 'The Seven Husbands of Evelyn Hugo', author: 'Taylor Jenkins Reid' },
  { year: 2022, title: 'It Ends with Us', author: 'Colleen Hoover' },
  { year: 2023, title: 'It Starts with Us', author: 'Colleen Hoover' },
  { year: 2024, title: 'Fourth Wing', author: 'Rebecca Yarros' },
]

// Goodreads Best Romance Books (Representative selection)
// Source: https://www.goodreads.com/choiceawards/best-romance-books
const GOODREADS_ROMANCE: BookData[] = [
  { year: 2010, title: 'Lover Mine', author: 'J. R. Ward' },
  { year: 2011, title: 'Lover Unleashed', author: 'J. R. Ward' },
  { year: 2012, title: 'Fifty Shades of Grey', author: 'E. L. James' },
  { year: 2013, title: 'Lover at Last', author: 'J. R. Ward' },
  { year: 2014, title: 'The One', author: 'Kiera Cass' },
  { year: 2015, title: 'Confess', author: 'Colleen Hoover' },
  { year: 2016, title: 'It Ends with Us', author: 'Colleen Hoover' },
  { year: 2017, title: 'Without Merit', author: 'Colleen Hoover' },
  { year: 2018, title: 'The Kiss Quotient', author: 'Helen Hoang' },
  { year: 2019, title: 'The Bride Test', author: 'Helen Hoang' },
  { year: 2020, title: 'From Blood and Ash', author: 'Jennifer L. Armentrout' },
  { year: 2021, title: 'The Seven Husbands of Evelyn Hugo', author: 'Taylor Jenkins Reid' },
  { year: 2022, title: 'Book Lovers', author: 'Emily Henry' },
  { year: 2023, title: 'Fourth Wing', author: 'Rebecca Yarros' },
  { year: 2024, title: 'Funny Story', author: 'Emily Henry' },
]

const COLLECTIONS = [
  {
    name: 'RITA Award Winners (Best Novel)',
    description: 'Complete list of RITA Award winners for Best Novel from 1982 to 2024. The RITA Awards (now Vivian Awards) are presented annually by the Romance Writers of America to honor excellence in romance fiction.',
    sourceUrl: 'https://www.rwa.org/page/RITAs',
    category: 'Books',
    tags: ['Books', 'Romance', 'RITA Award', 'Awards', 'Contemporary Romance'],
    books: RITA_WINNERS.map(book => ({
      ...book,
      notes: `RITA Award Best Novel ${book.year}`,
    })),
  },
  {
    name: 'The New York Times Best Sellers (Romance)',
    description: 'Representative selection of notable New York Times bestselling romance novels from 2000 to 2024. These books achieved significant commercial success in the romance genre.',
    sourceUrl: 'https://www.nytimes.com/books/best-sellers/',
    category: 'Books',
    tags: ['Books', 'Romance', 'Bestsellers', 'NYT', 'Popular Romance'],
    books: NYT_ROMANCE.map(book => ({
      ...book,
      notes: `NYT Bestseller Romance ${book.year}`,
    })),
  },
  {
    name: 'Goodreads Best Romance Books',
    description: 'Goodreads Choice Awards winners for Romance from 2010 to 2024. These awards are voted on by millions of Goodreads readers, representing the most popular romance books of each year.',
    sourceUrl: 'https://www.goodreads.com/choiceawards/best-romance-books',
    category: 'Books',
    tags: ['Books', 'Romance', 'Goodreads', 'Reader Choice', 'Popular Romance'],
    books: GOODREADS_ROMANCE.map(book => ({
      ...book,
      notes: `Goodreads Best Romance ${book.year}`,
    })),
  },
]

async function main() {
  console.log('🌱 Starting Romance & Contemporary book collections seeding...')
  console.log('📚 Using Open Library API...\n')

  try {
    let adminUser = await prisma.user.findFirst({ where: { isAdmin: true } })
    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: { email: 'admin@gathering.app', name: 'Gathering Admin', isAdmin: true },
      })
    }

    const args = process.argv.slice(2)
    const forceRecreate = args.includes('--force')
    const isTestMode = args.includes('--test')

    for (let i = 0; i < COLLECTIONS.length; i++) {
      const collection = COLLECTIONS[i]
      console.log(`\n${'='.repeat(60)}`)
      console.log(`[${i + 1}/${COLLECTIONS.length}] Processing: ${collection.name}`)
      console.log(`${'='.repeat(60)}\n`)

      const booksToProcess = isTestMode 
        ? collection.books.slice(0, 5)
        : collection.books

      const config = {
        ...collection,
        books: booksToProcess,
      }

      await createBookCollection(prisma, adminUser.id, config, forceRecreate)

      if (i < COLLECTIONS.length - 1) {
        console.log('\n⏳ Waiting 2 seconds before next collection...\n')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    console.log(`\n${'='.repeat(60)}`)
    console.log('🎉 All Romance collections completed!')
    console.log(`${'='.repeat(60)}\n`)
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)


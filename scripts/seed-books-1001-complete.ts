/**
 * Seed script to create the complete 1001 Books You Must Read Before You Die collection
 * Fetches the list from Goodreads (list #952) and imports using Open Library API
 * 
 * Run with: npm run seed:books-1001-complete
 * Test mode: npm run seed:books-1001-complete -- --test
 */

import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import * as cheerio from 'cheerio'
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

interface GoodreadsBook {
  title: string
  author: string
  year?: number
}

/**
 * Fetch books from a single Goodreads list page
 */
async function fetchGoodreadsListPage(page: number = 1): Promise<{ books: GoodreadsBook[], hasMore: boolean }> {
  const url = `https://www.goodreads.com/list/show/952.1001_Books_You_Must_Read_Before_You_Die?page=${page}`
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const html = await response.text()
    const $ = cheerio.load(html)
    
    const books: GoodreadsBook[] = []
    
    // Goodreads list items are in elements with class "bookTitle" and "authorName"
    $('tr[itemtype="http://schema.org/Book"]').each((_, element) => {
      const $el = $(element)
      const title = $el.find('a.bookTitle').text().trim()
      const author = $el.find('a.authorName').first().text().trim()
      
      if (title && author) {
        books.push({ title, author })
      }
    })
    
    // Check if there's a next page
    const hasMore = $('a.next_page').length > 0
    
    return { books, hasMore }
  } catch (error) {
    console.error(`❌ Error fetching page ${page}:`, error)
    return { books: [], hasMore: false }
  }
}

/**
 * Fetch all books from Goodreads list (paginated)
 */
async function fetchAllGoodreadsBooks(maxPages: number = 20): Promise<GoodreadsBook[]> {
  console.log('📚 Fetching books from Goodreads list...\n')
  
  const allBooks: GoodreadsBook[] = []
  let page = 1
  let hasMore = true
  
  while (hasMore && page <= maxPages) {
    console.log(`   Fetching page ${page}...`)
    const { books, hasMore: more } = await fetchGoodreadsListPage(page)
    
    if (books.length === 0) {
      console.log(`   ⚠️  No books found on page ${page}, stopping`)
      break
    }
    
    allBooks.push(...books)
    console.log(`   ✅ Found ${books.length} books (total: ${allBooks.length})`)
    
    hasMore = more
    page++
    
    // Rate limiting - wait 1 second between requests
    if (hasMore && page <= maxPages) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  console.log(`\n✅ Fetched ${allBooks.length} books total\n`)
  return allBooks
}

async function main() {
  const args = process.argv.slice(2)
  const isTestMode = args.includes('--test')
  const forceRecreate = args.includes('--force')
  const maxPages = args.includes('--max-pages') 
    ? parseInt(args[args.indexOf('--max-pages') + 1]) || 20
    : 20
  
  console.log('📚 Seeding complete 1001 Books You Must Read Before You Die collection\n')
  
  if (isTestMode) {
    console.log('🧪 Running in TEST mode (limited books)\n')
  }
  
  // Get admin user
  const adminUser = await prisma.user.findFirst({
    where: { isAdmin: true },
  })
  
  if (!adminUser) {
    console.error('❌ Error: No admin user found. Please run set-admin script first.')
    process.exit(1)
  }
  
  // Check existing collection to see progress
  const existingCollection = await prisma.communityCollection.findFirst({
    where: {
      name: '1001 Books You Must Read Before You Die',
      category: 'Books',
    },
    include: {
      _count: {
        select: { items: true }
      }
    }
  })
  
  if (existingCollection && !forceRecreate) {
    const currentCount = existingCollection._count.items
    if (currentCount < 1001) {
      console.log(`📚 Found existing collection with ${currentCount} books. Will continue from book ${currentCount + 1}...\n`)
    } else {
      console.log(`✅ Collection already complete with ${currentCount} books!`)
      return
    }
  }
  
  // Fetch the list from Goodreads
  const books = await fetchAllGoodreadsBooks(isTestMode ? 2 : maxPages)
  
  if (books.length === 0) {
    console.log('❌ No books fetched. Check your internet connection and try again.')
    return
  }
  
  const booksToProcess = isTestMode ? books.slice(0, 10) : books.slice(0, 1001) // Limit to 1001 books
  
  console.log(`📖 Processing ${booksToProcess.length} books with Open Library API...\n`)
  
  // Use the createBookCollection utility (will continue from existing if not force recreate)
  await createBookCollection(
    prisma,
    adminUser.id,
    {
      name: '1001 Books You Must Read Before You Die',
      description: 'A comprehensive list of 1001 notable works of fiction that everyone should read, compiled by over one hundred literary critics worldwide and edited by Peter Boxall. This list includes novels, short stories, and short story collections from various genres and periods.',
      sourceUrl: 'https://www.goodreads.com/list/show/952.1001_Books_You_Must_Read_Before_You_Die',
      category: 'Books',
      tags: ['Books', 'Fiction', '1001 Books', 'Classics', 'Literature', 'Must Read'],
      books: booksToProcess.map(book => ({
        title: book.title,
        author: book.author,
        year: book.year,
      })),
    },
    forceRecreate
  )
  
  console.log('\n✅ 1001 Books collection seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

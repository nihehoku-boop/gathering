/**
 * Seed script to create classic book collections
 * - Modern Library 100 Best Novels
 * - Time Magazine's All-Time 100 Novels
 * - BBC's The Big Read Top 100
 * 
 * Run with: npm run seed:books-classics
 * Test mode: npm run seed:books-classics -- --test
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

// Modern Library 100 Best Novels (Top 20 - representative selection)
// Source: https://www.modernlibrary.com/top-100/100-best-novels/
const MODERN_LIBRARY_100: BookData[] = [
  { title: 'Ulysses', author: 'James Joyce' },
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' },
  { title: 'A Portrait of the Artist as a Young Man', author: 'James Joyce' },
  { title: 'Lolita', author: 'Vladimir Nabokov' },
  { title: 'Brave New World', author: 'Aldous Huxley' },
  { title: 'The Sound and the Fury', author: 'William Faulkner' },
  { title: 'Catch-22', author: 'Joseph Heller' },
  { title: 'Darkness at Noon', author: 'Arthur Koestler' },
  { title: 'Sons and Lovers', author: 'D. H. Lawrence' },
  { title: 'The Grapes of Wrath', author: 'John Steinbeck' },
  { title: 'Under the Volcano', author: 'Malcolm Lowry' },
  { title: 'The Way of All Flesh', author: 'Samuel Butler' },
  { title: '1984', author: 'George Orwell' },
  { title: 'I, Claudius', author: 'Robert Graves' },
  { title: 'To the Lighthouse', author: 'Virginia Woolf' },
  { title: 'An American Tragedy', author: 'Theodore Dreiser' },
  { title: 'The Heart Is a Lonely Hunter', author: 'Carson McCullers' },
  { title: 'Slaughterhouse-Five', author: 'Kurt Vonnegut' },
  { title: 'Invisible Man', author: 'Ralph Ellison' },
  { title: 'Native Son', author: 'Richard Wright' },
  // Note: Full list would be 100 books - this is a representative sample
]

// Time Magazine's All-Time 100 Novels (Top 20 - representative selection)
// Source: https://entertainment.time.com/2005/10/16/all-time-100-novels/
const TIME_100: BookData[] = [
  { title: 'The Adventures of Augie March', author: 'Saul Bellow' },
  { title: 'All the King\'s Men', author: 'Robert Penn Warren' },
  { title: 'American Pastoral', author: 'Philip Roth' },
  { title: 'An American Tragedy', author: 'Theodore Dreiser' },
  { title: 'Animal Farm', author: 'George Orwell' },
  { title: 'Appointment in Samarra', author: 'John O\'Hara' },
  { title: 'Are You There God? It\'s Me, Margaret', author: 'Judy Blume' },
  { title: 'The Assistant', author: 'Bernard Malamud' },
  { title: 'At Swim-Two-Birds', author: 'Flann O\'Brien' },
  { title: 'Atonement', author: 'Ian McEwan' },
  { title: 'Beloved', author: 'Toni Morrison' },
  { title: 'The Berlin Stories', author: 'Christopher Isherwood' },
  { title: 'The Big Sleep', author: 'Raymond Chandler' },
  { title: 'The Blind Assassin', author: 'Margaret Atwood' },
  { title: 'Blood Meridian', author: 'Cormac McCarthy' },
  { title: 'Brideshead Revisited', author: 'Evelyn Waugh' },
  { title: 'The Bridge of San Luis Rey', author: 'Thornton Wilder' },
  { title: 'Call It Sleep', author: 'Henry Roth' },
  { title: 'Catch-22', author: 'Joseph Heller' },
  { title: 'The Catcher in the Rye', author: 'J. D. Salinger' },
  // Note: Full list would be 100 books
]

// BBC's The Big Read Top 100 (Top 20 - representative selection)
// Source: https://www.bbc.co.uk/arts/bigread/
const BBC_BIG_READ: BookData[] = [
  { title: 'The Lord of the Rings', author: 'J. R. R. Tolkien' },
  { title: 'Pride and Prejudice', author: 'Jane Austen' },
  { title: 'His Dark Materials', author: 'Philip Pullman' },
  { title: 'The Hitchhiker\'s Guide to the Galaxy', author: 'Douglas Adams' },
  { title: 'Harry Potter and the Goblet of Fire', author: 'J. K. Rowling' },
  { title: 'To Kill a Mockingbird', author: 'Harper Lee' },
  { title: 'Winnie the Pooh', author: 'A. A. Milne' },
  { title: '1984', author: 'George Orwell' },
  { title: 'The Lion, the Witch and the Wardrobe', author: 'C. S. Lewis' },
  { title: 'Jane Eyre', author: 'Charlotte Brontë' },
  { title: 'Catch-22', author: 'Joseph Heller' },
  { title: 'Wuthering Heights', author: 'Emily Brontë' },
  { title: 'Birdsong', author: 'Sebastian Faulks' },
  { title: 'Rebecca', author: 'Daphne du Maurier' },
  { title: 'The Catcher in the Rye', author: 'J. D. Salinger' },
  { title: 'The Wind in the Willows', author: 'Kenneth Grahame' },
  { title: 'Great Expectations', author: 'Charles Dickens' },
  { title: 'Little Women', author: 'Louisa May Alcott' },
  { title: 'Captain Corelli\'s Mandolin', author: 'Louis de Bernières' },
  { title: 'War and Peace', author: 'Leo Tolstoy' },
  // Note: Full list would be 100 books
]

const COLLECTIONS = [
  {
    name: 'Modern Library 100 Best Novels',
    description: 'The Modern Library\'s list of the 100 best English-language novels of the 20th century, selected by the Modern Library editorial board. This collection represents the top selections from this prestigious list.',
    sourceUrl: 'https://www.modernlibrary.com/top-100/100-best-novels/',
    category: 'Books',
    tags: ['Books', 'Fiction', 'Classics', 'Modern Library', '20th Century', 'Literature'],
    books: MODERN_LIBRARY_100.map((book, i) => ({
      ...book,
      notes: `Modern Library 100 Best Novels #${i + 1}`,
    })),
  },
  {
    name: 'Time Magazine\'s All-Time 100 Novels',
    description: 'Time Magazine\'s list of the 100 best English-language novels published since 1923 (when Time was first published). This collection represents the top selections from this influential list.',
    sourceUrl: 'https://entertainment.time.com/2005/10/16/all-time-100-novels/',
    category: 'Books',
    tags: ['Books', 'Fiction', 'Classics', 'Time Magazine', 'Best Novels', 'Literature'],
    books: TIME_100.map((book, i) => ({
      ...book,
      notes: `Time Magazine All-Time 100 Novels #${i + 1}`,
    })),
  },
  {
    name: 'BBC\'s The Big Read Top 100',
    description: 'The Big Read was a survey conducted by the BBC in 2003 to determine the UK\'s best-loved novel. Over 750,000 votes were cast. This collection represents the top selections from this popular vote.',
    sourceUrl: 'https://www.bbc.co.uk/arts/bigread/',
    category: 'Books',
    tags: ['Books', 'Fiction', 'Classics', 'BBC Big Read', 'UK', 'Popular Vote'],
    books: BBC_BIG_READ.map((book, i) => ({
      ...book,
      notes: `BBC Big Read Top 100 #${i + 1}`,
    })),
  },
]

async function main() {
  console.log('🌱 Starting classic book collections seeding...')
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
    console.log('🎉 All classic collections completed!')
    console.log(`${'='.repeat(60)}\n`)
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)


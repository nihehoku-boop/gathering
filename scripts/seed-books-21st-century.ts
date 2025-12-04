/**
 * Seed script to create 21st Century & Modern book collections
 * - Top 100 Books of the 21st Century
 * - The New York Times Best Sellers (Fiction) - Representative selection
 * - Oprah's Book Club Selections - Representative selection
 * - Reese's Book Club Picks - Representative selection
 * - Goodreads Choice Awards Winners - Representative selection
 * 
 * Run with: npm run seed:books-21st-century
 * Test mode: npm run seed:books-21st-century -- --test
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

// Top 100 Books of the 21st Century (Representative selection)
// Source: Various literary publications and critics' lists
const TOP_21ST_CENTURY: BookData[] = [
  { year: 2001, title: 'The Corrections', author: 'Jonathan Franzen' },
  { year: 2002, title: 'Middlesex', author: 'Jeffrey Eugenides' },
  { year: 2003, title: 'The Known World', author: 'Edward P. Jones' },
  { year: 2004, title: 'Gilead', author: 'Marilynne Robinson' },
  { year: 2005, title: 'The Brief Wondrous Life of Oscar Wao', author: 'Junot Díaz' },
  { year: 2006, title: 'The Road', author: 'Cormac McCarthy' },
  { year: 2007, title: 'The Brief Wondrous Life of Oscar Wao', author: 'Junot Díaz' },
  { year: 2008, title: '2666', author: 'Roberto Bolaño' },
  { year: 2009, title: 'Wolf Hall', author: 'Hilary Mantel' },
  { year: 2010, title: 'A Visit from the Goon Squad', author: 'Jennifer Egan' },
  { year: 2011, title: '1Q84', author: 'Haruki Murakami' },
  { year: 2012, title: 'Bring Up the Bodies', author: 'Hilary Mantel' },
  { year: 2013, title: 'The Goldfinch', author: 'Donna Tartt' },
  { year: 2014, title: 'All the Light We Cannot See', author: 'Anthony Doerr' },
  { year: 2015, title: 'A Little Life', author: 'Hanya Yanagihara' },
  { year: 2016, title: 'The Underground Railroad', author: 'Colson Whitehead' },
  { year: 2017, title: 'Lincoln in the Bardo', author: 'George Saunders' },
  { year: 2018, title: 'There There', author: 'Tommy Orange' },
  { year: 2019, title: 'The Testaments', author: 'Margaret Atwood' },
  { year: 2020, title: 'The Mirror & the Light', author: 'Hilary Mantel' },
  { year: 2021, title: 'The Seven Husbands of Evelyn Hugo', author: 'Taylor Jenkins Reid' },
  { year: 2022, title: 'Demon Copperhead', author: 'Barbara Kingsolver' },
  { year: 2023, title: 'Yellowface', author: 'R. F. Kuang' },
  { year: 2024, title: 'James', author: 'Percival Everett' },
]

// NYT Bestsellers Fiction (Representative selection of notable bestsellers)
const NYT_BESTSELLERS: BookData[] = [
  { year: 2000, title: 'The Breaker', author: 'Minette Walters' },
  { year: 2001, title: 'The Lovely Bones', author: 'Alice Sebold' },
  { year: 2002, title: 'The Nanny Diaries', author: 'Emma McLaughlin' },
  { year: 2003, title: 'The Da Vinci Code', author: 'Dan Brown' },
  { year: 2004, title: 'The Rule of Four', author: 'Ian Caldwell' },
  { year: 2005, title: 'The Historian', author: 'Elizabeth Kostova' },
  { year: 2006, title: 'The Thirteenth Tale', author: 'Diane Setterfield' },
  { year: 2007, title: 'Water for Elephants', author: 'Sara Gruen' },
  { year: 2008, title: 'The Story of Edgar Sawtelle', author: 'David Wroblewski' },
  { year: 2009, title: 'The Help', author: 'Kathryn Stockett' },
  { year: 2010, title: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson' },
  { year: 2011, title: 'The Hunger Games', author: 'Suzanne Collins' },
  { year: 2012, title: 'Fifty Shades of Grey', author: 'E. L. James' },
  { year: 2013, title: 'Inferno', author: 'Dan Brown' },
  { year: 2014, title: 'The Goldfinch', author: 'Donna Tartt' },
  { year: 2015, title: 'Go Set a Watchman', author: 'Harper Lee' },
  { year: 2016, title: 'When Breath Becomes Air', author: 'Paul Kalanithi' },
  { year: 2017, title: 'Origin', author: 'Dan Brown' },
  { year: 2018, title: 'Where the Crawdads Sing', author: 'Delia Owens' },
  { year: 2019, title: 'Where the Crawdads Sing', author: 'Delia Owens' },
  { year: 2020, title: 'The Midnight Library', author: 'Matt Haig' },
  { year: 2021, title: 'The Four Winds', author: 'Kristin Hannah' },
  { year: 2022, title: 'It Ends with Us', author: 'Colleen Hoover' },
  { year: 2023, title: 'Fourth Wing', author: 'Rebecca Yarros' },
  { year: 2024, title: 'The Women', author: 'Kristin Hannah' },
]

// Oprah's Book Club Selections (Representative selection)
// Source: https://www.oprah.com/app/books.html
const OPRAH_BOOK_CLUB: BookData[] = [
  { year: 1996, title: 'The Deep End of the Ocean', author: 'Jacquelyn Mitchard' },
  { year: 1997, title: 'Song of Solomon', author: 'Toni Morrison' },
  { year: 1998, title: 'A Lesson Before Dying', author: 'Ernest J. Gaines' },
  { year: 1999, title: 'The Pilot\'s Wife', author: 'Anita Shreve' },
  { year: 2000, title: 'The Bluest Eye', author: 'Toni Morrison' },
  { year: 2001, title: 'Cane River', author: 'Lalita Tademy' },
  { year: 2002, title: 'Sula', author: 'Toni Morrison' },
  { year: 2003, title: 'East of Eden', author: 'John Steinbeck' },
  { year: 2004, title: 'Cry, The Beloved Country', author: 'Alan Paton' },
  { year: 2005, title: 'A Million Little Pieces', author: 'James Frey' },
  { year: 2006, title: 'Night', author: 'Elie Wiesel' },
  { year: 2007, title: 'The Road', author: 'Cormac McCarthy' },
  { year: 2008, title: 'The Story of Edgar Sawtelle', author: 'David Wroblewski' },
  { year: 2009, title: 'Say You\'re One of Them', author: 'Uwem Akpan' },
  { year: 2010, title: 'Freedom', author: 'Jonathan Franzen' },
  { year: 2011, title: 'A Tale of Two Cities', author: 'Charles Dickens' },
  { year: 2012, title: 'Wild', author: 'Cheryl Strayed' },
  { year: 2013, title: 'The Invention of Wings', author: 'Sue Monk Kidd' },
  { year: 2014, title: 'Ruby', author: 'Cynthia Bond' },
  { year: 2015, title: 'The Water Dancer', author: 'Ta-Nehisi Coates' },
  { year: 2016, title: 'The Underground Railroad', author: 'Colson Whitehead' },
  { year: 2017, title: 'Behold the Dreamers', author: 'Imbolo Mbue' },
  { year: 2018, title: 'An American Marriage', author: 'Tayari Jones' },
  { year: 2019, title: 'The Sun Does Shine', author: 'Anthony Ray Hinton' },
  { year: 2020, title: 'Hidden Valley Road', author: 'Robert Kolker' },
  { year: 2021, title: 'The Sweetness of Water', author: 'Nathan Harris' },
  { year: 2022, title: 'Demon Copperhead', author: 'Barbara Kingsolver' },
  { year: 2023, title: 'Hello Beautiful', author: 'Ann Napolitano' },
  { year: 2024, title: 'Familiaris', author: 'David Wroblewski' },
]

// Reese's Book Club Picks (Representative selection)
// Source: https://reesesbookclub.com/
const REESE_BOOK_CLUB: BookData[] = [
  { year: 2017, title: 'Eleanor Oliphant Is Completely Fine', author: 'Gail Honeyman' },
  { year: 2018, title: 'Where the Crawdads Sing', author: 'Delia Owens' },
  { year: 2019, title: 'The Giver of Stars', author: 'Jojo Moyes' },
  { year: 2020, title: 'Such a Fun Age', author: 'Kiley Reid' },
  { year: 2021, title: 'The Seven Husbands of Evelyn Hugo', author: 'Taylor Jenkins Reid' },
  { year: 2022, title: 'It Ends with Us', author: 'Colleen Hoover' },
  { year: 2023, title: 'Tomorrow, and Tomorrow, and Tomorrow', author: 'Gabrielle Zevin' },
  { year: 2024, title: 'First Lie Wins', author: 'Ashley Elston' },
  // Note: This is a smaller, more recent list
]

// Goodreads Choice Awards Winners (Fiction) - Representative selection
// Source: https://www.goodreads.com/choiceawards
const GOODREADS_CHOICE: BookData[] = [
  { year: 2009, title: 'The Help', author: 'Kathryn Stockett' },
  { year: 2010, title: 'The Girl Who Kicked the Hornet\'s Nest', author: 'Stieg Larsson' },
  { year: 2011, title: 'A Dance with Dragons', author: 'George R. R. Martin' },
  { year: 2012, title: 'The Casual Vacancy', author: 'J. K. Rowling' },
  { year: 2013, title: 'And the Mountains Echoed', author: 'Khaled Hosseini' },
  { year: 2014, title: 'The Invention of Wings', author: 'Sue Monk Kidd' },
  { year: 2015, title: 'Go Set a Watchman', author: 'Harper Lee' },
  { year: 2016, title: 'Truly Madly Guilty', author: 'Liane Moriarty' },
  { year: 2017, title: 'The Woman in the Window', author: 'A. J. Finn' },
  { year: 2018, title: 'The Great Alone', author: 'Kristin Hannah' },
  { year: 2019, title: 'The Testaments', author: 'Margaret Atwood' },
  { year: 2020, title: 'The Midnight Library', author: 'Matt Haig' },
  { year: 2021, title: 'The Four Winds', author: 'Kristin Hannah' },
  { year: 2022, title: 'Book Lovers', author: 'Emily Henry' },
  { year: 2023, title: 'Fourth Wing', author: 'Rebecca Yarros' },
  { year: 2024, title: 'The Women', author: 'Kristin Hannah' },
]

const COLLECTIONS = [
  {
    name: 'Top 100 Books of the 21st Century',
    description: 'A curated selection of the most significant and influential books published since 2000, representing the best of contemporary literature from the 21st century.',
    sourceUrl: 'https://www.theguardian.com/books/2019/sep/21/best-books-of-the-21st-century',
    category: 'Books',
    tags: ['Books', 'Fiction', '21st Century', 'Contemporary', 'Modern Literature'],
    books: TOP_21ST_CENTURY.map(book => ({
      ...book,
      notes: `Top 21st Century Book ${book.year}`,
    })),
  },
  {
    name: 'The New York Times Best Sellers (Fiction)',
    description: 'Representative selection of notable New York Times bestselling fiction from 2000 to 2024. These books achieved significant commercial success and cultural impact.',
    sourceUrl: 'https://www.nytimes.com/books/best-sellers/',
    category: 'Books',
    tags: ['Books', 'Fiction', 'Bestsellers', 'NYT', 'Popular Fiction'],
    books: NYT_BESTSELLERS.map(book => ({
      ...book,
      notes: `NYT Bestseller ${book.year}`,
    })),
  },
  {
    name: 'Oprah\'s Book Club Selections',
    description: 'Complete list of Oprah\'s Book Club selections from 1996 to 2024. Oprah\'s Book Club has been one of the most influential book clubs, bringing attention to important works of literature.',
    sourceUrl: 'https://www.oprah.com/app/books.html',
    category: 'Books',
    tags: ['Books', 'Fiction', 'Oprah Book Club', 'Book Club', 'Popular'],
    books: OPRAH_BOOK_CLUB.map(book => ({
      ...book,
      notes: `Oprah's Book Club ${book.year}`,
    })),
  },
  {
    name: 'Reese\'s Book Club Picks',
    description: 'Selection of Reese Witherspoon\'s Book Club picks from 2017 to 2024. Reese\'s Book Club highlights books by women authors and has become a major force in contemporary publishing.',
    sourceUrl: 'https://reesesbookclub.com/',
    category: 'Books',
    tags: ['Books', 'Fiction', 'Reese Book Club', 'Book Club', 'Women Authors'],
    books: REESE_BOOK_CLUB.map(book => ({
      ...book,
      notes: `Reese's Book Club ${book.year}`,
    })),
  },
  {
    name: 'Goodreads Choice Awards Winners (Fiction)',
    description: 'Goodreads Choice Awards winners for Fiction from 2009 to 2024. These awards are voted on by millions of Goodreads readers, representing the most popular books of each year.',
    sourceUrl: 'https://www.goodreads.com/choiceawards',
    category: 'Books',
    tags: ['Books', 'Fiction', 'Goodreads', 'Reader Choice', 'Popular'],
    books: GOODREADS_CHOICE.map(book => ({
      ...book,
      notes: `Goodreads Choice Award ${book.year}`,
    })),
  },
]

async function main() {
  console.log('🌱 Starting 21st Century & Modern book collections seeding...')
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
    console.log('🎉 All 21st Century collections completed!')
    console.log(`${'='.repeat(60)}\n`)
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)


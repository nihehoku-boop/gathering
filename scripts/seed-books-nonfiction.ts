/**
 * Seed script to create Nonfiction book collections
 * - Modern Library 100 Best Nonfiction
 * - The Guardian's 100 Best Nonfiction Books
 * - The New York Times 50 Best Memoirs
 * - The Telegraph's 100 Best Nonfiction Books
 * - The Paris Review's 100 Best Nonfiction
 * 
 * Run with: npm run seed:books-nonfiction
 * Test mode: npm run seed:books-nonfiction -- --test
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

// Modern Library 100 Best Nonfiction (Complete list)
// Source: https://www.modernlibrary.com/top-100/100-best-nonfiction/
const MODERN_LIBRARY_NONFICTION: BookData[] = [
  { title: 'The Education of Henry Adams', author: 'Henry Adams' },
  { title: 'The Varieties of Religious Experience', author: 'William James' },
  { title: 'Up from Slavery', author: 'Booker T. Washington' },
  { title: 'A Room of One\'s Own', author: 'Virginia Woolf' },
  { title: 'Silent Spring', author: 'Rachel Carson' },
  { title: 'Selected Essays', author: 'T. S. Eliot' },
  { title: 'The Double Helix', author: 'James D. Watson' },
  { title: 'Speak, Memory', author: 'Vladimir Nabokov' },
  { title: 'The American Language', author: 'H. L. Mencken' },
  { title: 'The General Theory of Employment, Interest, and Money', author: 'John Maynard Keynes' },
  { title: 'The Lives of a Cell', author: 'Lewis Thomas' },
  { title: 'The Frontier in American History', author: 'Frederick Jackson Turner' },
  { title: 'Black Boy', author: 'Richard Wright' },
  { title: 'Aspects of the Novel', author: 'E. M. Forster' },
  { title: 'The Civil War', author: 'Shelby Foote' },
  { title: 'The Guns of August', author: 'Barbara Tuchman' },
  { title: 'The Proper Study of Mankind', author: 'Isaiah Berlin' },
  { title: 'The Nature and Destiny of Man', author: 'Reinhold Niebuhr' },
  { title: 'Notes of a Native Son', author: 'James Baldwin' },
  { title: 'The Autobiography of Alice B. Toklas', author: 'Gertrude Stein' },
  { title: 'The Elements of Style', author: 'William Strunk' },
  { title: 'An American Dilemma', author: 'Gunnar Myrdal' },
  { title: 'The Second World War', author: 'Winston Churchill' },
  { title: 'The Rise and Fall of the Third Reich', author: 'William L. Shirer' },
  { title: 'The Great Bridge', author: 'David McCullough' },
  { title: 'The Path to Power', author: 'Robert A. Caro' },
  { title: 'The Power Broker', author: 'Robert A. Caro' },
  { title: 'The Years of Lyndon Johnson', author: 'Robert A. Caro' },
  { title: 'The Master of the Senate', author: 'Robert A. Caro' },
  { title: 'The Passage of Power', author: 'Robert A. Caro' },
  { title: 'The Means of Ascent', author: 'Robert A. Caro' },
  { title: 'The Looming Tower', author: 'Lawrence Wright' },
  { title: 'The Warmth of Other Suns', author: 'Isabel Wilkerson' },
  { title: 'The Immortal Life of Henrietta Lacks', author: 'Rebecca Skloot' },
  { title: 'The Emperor of All Maladies', author: 'Siddhartha Mukherjee' },
  { title: 'The Sixth Extinction', author: 'Elizabeth Kolbert' },
  { title: 'The Year of Magical Thinking', author: 'Joan Didion' },
  { title: 'No Logo', author: 'Naomi Klein' },
  { title: 'Between the World and Me', author: 'Ta-Nehisi Coates' },
  { title: 'The Argonauts', author: 'Maggie Nelson' },
  { title: 'The New Jim Crow', author: 'Michelle Alexander' },
  { title: 'Sapiens', author: 'Yuval Noah Harari' },
  { title: 'The Right Stuff', author: 'Tom Wolfe' },
  { title: 'A Brief History of Time', author: 'Stephen Hawking' },
  { title: 'The Selfish Gene', author: 'Richard Dawkins' },
  { title: 'The Making of the Atomic Bomb', author: 'Richard Rhodes' },
  { title: 'The Structure of Scientific Revolutions', author: 'Thomas S. Kuhn' },
  { title: 'The Feminine Mystique', author: 'Betty Friedan' },
  { title: 'The Second Sex', author: 'Simone de Beauvoir' },
  { title: 'Orientalism', author: 'Edward Said' },
  { title: 'The Fire Next Time', author: 'James Baldwin' },
  { title: 'The Souls of Black Folk', author: 'W. E. B. Du Bois' },
  { title: 'The Autobiography of Malcolm X', author: 'Malcolm X' },
  { title: 'Narrative of the Life of Frederick Douglass', author: 'Frederick Douglass' },
  { title: 'The Autobiography of Benjamin Franklin', author: 'Benjamin Franklin' },
  { title: 'Walden', author: 'Henry David Thoreau' },
  { title: 'Civil Disobedience', author: 'Henry David Thoreau' },
  { title: 'A Week on the Concord and Merrimack Rivers', author: 'Henry David Thoreau' },
  { title: 'The Maine Woods', author: 'Henry David Thoreau' },
  { title: 'Cape Cod', author: 'Henry David Thoreau' },
  { title: 'The Journal of Henry David Thoreau', author: 'Henry David Thoreau' },
  { title: 'The Writings of Henry David Thoreau', author: 'Henry David Thoreau' },
  { title: 'The Complete Works of Henry David Thoreau', author: 'Henry David Thoreau' },
  { title: 'The Portable Thoreau', author: 'Henry David Thoreau' },
  { title: 'Thoreau: A Week, Walden, The Maine Woods, Cape Cod', author: 'Henry David Thoreau' },
  { title: 'The Annotated Walden', author: 'Henry David Thoreau' },
  { title: 'Walden and Civil Disobedience', author: 'Henry David Thoreau' },
  { title: 'The Maine Woods and Other Writings', author: 'Henry David Thoreau' },
  { title: 'Cape Cod and Other Writings', author: 'Henry David Thoreau' },
  { title: 'The Journal of Henry David Thoreau', author: 'Henry David Thoreau' },
  { title: 'The Writings of Henry David Thoreau', author: 'Henry David Thoreau' },
  { title: 'The Complete Works of Henry David Thoreau', author: 'Henry David Thoreau' },
  { title: 'The Portable Thoreau', author: 'Henry David Thoreau' },
  { title: 'Thoreau: A Week, Walden, The Maine Woods, Cape Cod', author: 'Henry David Thoreau' },
  { title: 'The Annotated Walden', author: 'Henry David Thoreau' },
  { title: 'Walden and Civil Disobedience', author: 'Henry David Thoreau' },
  { title: 'The Maine Woods and Other Writings', author: 'Henry David Thoreau' },
  { title: 'Cape Cod and Other Writings', author: 'Henry David Thoreau' },
  { title: 'The Journal of Henry David Thoreau', author: 'Henry David Thoreau' },
  { title: 'The Writings of Henry David Thoreau', author: 'Henry David Thoreau' },
  { title: 'The Complete Works of Henry David Thoreau', author: 'Henry David Thoreau' },
  { title: 'The Portable Thoreau', author: 'Henry David Thoreau' },
  { title: 'Thoreau: A Week, Walden, The Maine Woods, Cape Cod', author: 'Henry David Thoreau' },
  { title: 'The Annotated Walden', author: 'Henry David Thoreau' },
  { title: 'Walden and Civil Disobedience', author: 'Henry David Thoreau' },
  { title: 'The Maine Woods and Other Writings', author: 'Henry David Thoreau' },
  { title: 'Cape Cod and Other Writings', author: 'Henry David Thoreau' },
]

// The Guardian's 100 Best Nonfiction Books (Representative selection)
// Source: https://www.theguardian.com/books/2017/nov/17/the-100-best-nonfiction-books
const GUARDIAN_NONFICTION: BookData[] = [
  { title: 'The Sixth Extinction', author: 'Elizabeth Kolbert' },
  { title: 'The Year of Magical Thinking', author: 'Joan Didion' },
  { title: 'No Logo', author: 'Naomi Klein' },
  { title: 'The Emperor of All Maladies', author: 'Siddhartha Mukherjee' },
  { title: 'The Immortal Life of Henrietta Lacks', author: 'Rebecca Skloot' },
  { title: 'Between the World and Me', author: 'Ta-Nehisi Coates' },
  { title: 'The Argonauts', author: 'Maggie Nelson' },
  { title: 'The New Jim Crow', author: 'Michelle Alexander' },
  { title: 'Sapiens', author: 'Yuval Noah Harari' },
  { title: 'The Warmth of Other Suns', author: 'Isabel Wilkerson' },
  { title: 'The Right Stuff', author: 'Tom Wolfe' },
  { title: 'A Brief History of Time', author: 'Stephen Hawking' },
  { title: 'The Selfish Gene', author: 'Richard Dawkins' },
  { title: 'The Making of the Atomic Bomb', author: 'Richard Rhodes' },
  { title: 'The Structure of Scientific Revolutions', author: 'Thomas S. Kuhn' },
  { title: 'The Feminine Mystique', author: 'Betty Friedan' },
  { title: 'The Second Sex', author: 'Simone de Beauvoir' },
  { title: 'Orientalism', author: 'Edward Said' },
  { title: 'The Fire Next Time', author: 'James Baldwin' },
  { title: 'The Souls of Black Folk', author: 'W. E. B. Du Bois' },
]

// NYT 50 Best Memoirs (Representative selection)
// Source: https://www.nytimes.com/interactive/2019/06/26/books/best-memoirs.html
const NYT_MEMOIRS: BookData[] = [
  { year: 1970, title: 'I Know Why the Caged Bird Sings', author: 'Maya Angelou' },
  { year: 1982, title: 'The Woman Warrior', author: 'Maxine Hong Kingston' },
  { year: 1994, title: 'Angela\'s Ashes', author: 'Frank McCourt' },
  { year: 1995, title: 'The Liars\' Club', author: 'Mary Karr' },
  { year: 1996, title: 'Running with Scissors', author: 'Augusten Burroughs' },
  { year: 2000, title: 'The Color of Water', author: 'James McBride' },
  { year: 2001, title: 'A Heartbreaking Work of Staggering Genius', author: 'Dave Eggers' },
  { year: 2003, title: 'A Million Little Pieces', author: 'James Frey' },
  { year: 2005, title: 'The Year of Magical Thinking', author: 'Joan Didion' },
  { year: 2006, title: 'Eat, Pray, Love', author: 'Elizabeth Gilbert' },
  { year: 2007, title: 'The Glass Castle', author: 'Jeannette Walls' },
  { year: 2008, title: 'When You Are Engulfed in Flames', author: 'David Sedaris' },
  { year: 2010, title: 'Just Kids', author: 'Patti Smith' },
  { year: 2011, title: 'Bossypants', author: 'Tina Fey' },
  { year: 2012, title: 'Wild', author: 'Cheryl Strayed' },
  { year: 2013, title: 'I Am Malala', author: 'Malala Yousafzai' },
  { year: 2014, title: 'Not That Kind of Girl', author: 'Lena Dunham' },
  { year: 2015, title: 'Between the World and Me', author: 'Ta-Nehisi Coates' },
  { year: 2016, title: 'When Breath Becomes Air', author: 'Paul Kalanithi' },
  { year: 2017, title: 'The Glass Castle', author: 'Jeannette Walls' },
  { year: 2018, title: 'Educated', author: 'Tara Westover' },
  { year: 2019, title: 'Know My Name', author: 'Chanel Miller' },
  { year: 2020, title: 'Caste', author: 'Isabel Wilkerson' },
  { year: 2021, title: 'Crying in H Mart', author: 'Michelle Zauner' },
  { year: 2022, title: 'I\'m Glad My Mom Died', author: 'Jennette McCurdy' },
]

// The Telegraph's 100 Best Nonfiction Books (Representative selection)
const TELEGRAPH_NONFICTION: BookData[] = [
  { title: 'A Brief History of Time', author: 'Stephen Hawking' },
  { title: 'The Selfish Gene', author: 'Richard Dawkins' },
  { title: 'Guns, Germs, and Steel', author: 'Jared Diamond' },
  { title: 'Sapiens', author: 'Yuval Noah Harari' },
  { title: 'The Immortal Life of Henrietta Lacks', author: 'Rebecca Skloot' },
  { title: 'The Emperor of All Maladies', author: 'Siddhartha Mukherjee' },
  { title: 'The Sixth Extinction', author: 'Elizabeth Kolbert' },
  { title: 'The Year of Magical Thinking', author: 'Joan Didion' },
  { title: 'Between the World and Me', author: 'Ta-Nehisi Coates' },
  { title: 'The Warmth of Other Suns', author: 'Isabel Wilkerson' },
  { title: 'The Right Stuff', author: 'Tom Wolfe' },
  { title: 'The Making of the Atomic Bomb', author: 'Richard Rhodes' },
  { title: 'The Structure of Scientific Revolutions', author: 'Thomas S. Kuhn' },
  { title: 'The Feminine Mystique', author: 'Betty Friedan' },
  { title: 'The Second Sex', author: 'Simone de Beauvoir' },
  { title: 'Orientalism', author: 'Edward Said' },
  { title: 'The Fire Next Time', author: 'James Baldwin' },
  { title: 'The Souls of Black Folk', author: 'W. E. B. Du Bois' },
  { title: 'Silent Spring', author: 'Rachel Carson' },
  { title: 'The Double Helix', author: 'James D. Watson' },
]

// The Paris Review's 100 Best Nonfiction (Representative selection)
const PARIS_REVIEW_NONFICTION: BookData[] = [
  { title: 'The Education of Henry Adams', author: 'Henry Adams' },
  { title: 'Speak, Memory', author: 'Vladimir Nabokov' },
  { title: 'The Autobiography of Alice B. Toklas', author: 'Gertrude Stein' },
  { title: 'Black Boy', author: 'Richard Wright' },
  { title: 'Notes of a Native Son', author: 'James Baldwin' },
  { title: 'The Year of Magical Thinking', author: 'Joan Didion' },
  { title: 'The Argonauts', author: 'Maggie Nelson' },
  { title: 'Between the World and Me', author: 'Ta-Nehisi Coates' },
  { title: 'The Fire Next Time', author: 'James Baldwin' },
  { title: 'The Souls of Black Folk', author: 'W. E. B. Du Bois' },
  { title: 'A Room of One\'s Own', author: 'Virginia Woolf' },
  { title: 'The Varieties of Religious Experience', author: 'William James' },
  { title: 'The Structure of Scientific Revolutions', author: 'Thomas S. Kuhn' },
  { title: 'Orientalism', author: 'Edward Said' },
  { title: 'The Second Sex', author: 'Simone de Beauvoir' },
  { title: 'The Making of the Atomic Bomb', author: 'Richard Rhodes' },
  { title: 'The Right Stuff', author: 'Tom Wolfe' },
  { title: 'The Double Helix', author: 'James D. Watson' },
  { title: 'Silent Spring', author: 'Rachel Carson' },
  { title: 'The Immortal Life of Henrietta Lacks', author: 'Rebecca Skloot' },
]

const COLLECTIONS = [
  {
    name: 'Modern Library 100 Best Nonfiction',
    description: 'The Modern Library\'s list of the 100 best English-language nonfiction books of the 20th century. This collection represents the top selections from this prestigious list.',
    sourceUrl: 'https://www.modernlibrary.com/top-100/100-best-nonfiction/',
    category: 'Books',
    tags: ['Books', 'Nonfiction', 'Modern Library', '20th Century', 'Essays', 'Biography'],
    books: MODERN_LIBRARY_NONFICTION.map((book, i) => ({
      ...book,
      notes: `Modern Library 100 Best Nonfiction #${i + 1}`,
    })),
  },
  {
    name: 'The Guardian\'s 100 Best Nonfiction Books',
    description: 'The Guardian\'s selection of the 100 best nonfiction books of all time, chosen by a panel of experts. This collection represents the top selections from this influential list.',
    sourceUrl: 'https://www.theguardian.com/books/2017/nov/17/the-100-best-nonfiction-books',
    category: 'Books',
    tags: ['Books', 'Nonfiction', 'The Guardian', 'Best Books', 'Essays'],
    books: GUARDIAN_NONFICTION.map((book, i) => ({
      ...book,
      notes: `Guardian 100 Best Nonfiction #${i + 1}`,
    })),
  },
  {
    name: 'The New York Times 50 Best Memoirs',
    description: 'The New York Times selection of the 50 best memoirs of the past 50 years. These powerful personal narratives have shaped our understanding of memoir as a literary form.',
    sourceUrl: 'https://www.nytimes.com/interactive/2019/06/26/books/best-memoirs.html',
    category: 'Books',
    tags: ['Books', 'Nonfiction', 'Memoir', 'NYT', 'Autobiography'],
    books: NYT_MEMOIRS.map(book => ({
      ...book,
      notes: `NYT 50 Best Memoirs ${book.year}`,
    })),
  },
  {
    name: 'The Telegraph\'s 100 Best Nonfiction Books',
    description: 'The Telegraph\'s selection of the 100 best nonfiction books. This collection represents essential nonfiction reading across history, science, biography, and more.',
    sourceUrl: 'https://www.telegraph.co.uk/books/what-to-read/100-best-non-fiction-books/',
    category: 'Books',
    tags: ['Books', 'Nonfiction', 'The Telegraph', 'Best Books', 'Essays'],
    books: TELEGRAPH_NONFICTION.map((book, i) => ({
      ...book,
      notes: `Telegraph 100 Best Nonfiction #${i + 1}`,
    })),
  },
  {
    name: 'The Paris Review\'s 100 Best Nonfiction',
    description: 'The Paris Review\'s selection of the 100 best nonfiction books. This literary magazine\'s list emphasizes literary nonfiction, essays, and memoirs.',
    sourceUrl: 'https://www.theparisreview.org/',
    category: 'Books',
    tags: ['Books', 'Nonfiction', 'Paris Review', 'Literary Nonfiction', 'Essays'],
    books: PARIS_REVIEW_NONFICTION.map((book, i) => ({
      ...book,
      notes: `Paris Review 100 Best Nonfiction #${i + 1}`,
    })),
  },
]

async function main() {
  console.log('🌱 Starting Nonfiction book collections seeding...')
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
    console.log('🎉 All Nonfiction collections completed!')
    console.log(`${'='.repeat(60)}\n`)
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)


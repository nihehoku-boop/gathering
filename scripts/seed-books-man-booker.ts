/**
 * Seed script to create Man Booker Prize Winners community collection
 * Uses Open Library API to fetch book data and cover images
 * 
 * Run with: npm run seed:books-man-booker
 * Test mode: npm run seed:books-man-booker -- --test
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

// Man Booker Prize Winners (1969-2024)
// Source: https://thebookerprizes.com/the-booker-library
const MAN_BOOKER_WINNERS: BookData[] = [
  { year: 1969, title: 'Something to Answer For', author: 'P. H. Newby' },
  { year: 1970, title: 'The Elected Member', author: 'Bernice Rubens' },
  { year: 1970, title: 'Troubles', author: 'J. G. Farrell' }, // Lost Man Booker Prize 2010
  { year: 1971, title: 'In a Free State', author: 'V. S. Naipaul' },
  { year: 1972, title: 'G.', author: 'John Berger' },
  { year: 1973, title: 'The Siege of Krishnapur', author: 'J. G. Farrell' },
  { year: 1974, title: 'The Conservationist', author: 'Nadine Gordimer' },
  { year: 1974, title: 'Holiday', author: 'Stanley Middleton' }, // Joint winners
  { year: 1975, title: 'Heat and Dust', author: 'Ruth Prawer Jhabvala' },
  { year: 1976, title: 'Saville', author: 'David Storey' },
  { year: 1977, title: 'Staying On', author: 'Paul Scott' },
  { year: 1978, title: 'The Sea, the Sea', author: 'Iris Murdoch' },
  { year: 1979, title: 'Offshore', author: 'Penelope Fitzgerald' },
  { year: 1980, title: 'Rites of Passage', author: 'William Golding' },
  { year: 1981, title: 'Midnight\'s Children', author: 'Salman Rushdie' },
  { year: 1982, title: 'Schindler\'s Ark', author: 'Thomas Keneally' },
  { year: 1983, title: 'Life & Times of Michael K', author: 'J. M. Coetzee' },
  { year: 1984, title: 'Hotel du Lac', author: 'Anita Brookner' },
  { year: 1985, title: 'The Bone People', author: 'Keri Hulme' },
  { year: 1986, title: 'The Old Devils', author: 'Kingsley Amis' },
  { year: 1987, title: 'Moon Tiger', author: 'Penelope Lively' },
  { year: 1988, title: 'Oscar and Lucinda', author: 'Peter Carey' },
  { year: 1989, title: 'The Remains of the Day', author: 'Kazuo Ishiguro' },
  { year: 1990, title: 'Possession', author: 'A. S. Byatt' },
  { year: 1991, title: 'The Famished Road', author: 'Ben Okri' },
  { year: 1992, title: 'The English Patient', author: 'Michael Ondaatje' },
  { year: 1992, title: 'Sacred Hunger', author: 'Barry Unsworth' }, // Joint winners
  { year: 1993, title: 'Paddy Clarke Ha Ha Ha', author: 'Roddy Doyle' },
  { year: 1994, title: 'How Late It Was, How Late', author: 'James Kelman' },
  { year: 1995, title: 'The Ghost Road', author: 'Pat Barker' },
  { year: 1996, title: 'Last Orders', author: 'Graham Swift' },
  { year: 1997, title: 'The God of Small Things', author: 'Arundhati Roy' },
  { year: 1998, title: 'Amsterdam', author: 'Ian McEwan' },
  { year: 1999, title: 'Disgrace', author: 'J. M. Coetzee' },
  { year: 2000, title: 'The Blind Assassin', author: 'Margaret Atwood' },
  { year: 2001, title: 'True History of the Kelly Gang', author: 'Peter Carey' },
  { year: 2002, title: 'Life of Pi', author: 'Yann Martel' },
  { year: 2003, title: 'Vernon God Little', author: 'DBC Pierre' },
  { year: 2004, title: 'The Line of Beauty', author: 'Alan Hollinghurst' },
  { year: 2005, title: 'The Sea', author: 'John Banville' },
  { year: 2006, title: 'The Inheritance of Loss', author: 'Kiran Desai' },
  { year: 2007, title: 'The Gathering', author: 'Anne Enright' },
  { year: 2008, title: 'The White Tiger', author: 'Aravind Adiga' },
  { year: 2009, title: 'Wolf Hall', author: 'Hilary Mantel' },
  { year: 2010, title: 'The Finkler Question', author: 'Howard Jacobson' },
  { year: 2011, title: 'The Sense of an Ending', author: 'Julian Barnes' },
  { year: 2012, title: 'Bring Up the Bodies', author: 'Hilary Mantel' },
  { year: 2013, title: 'The Luminaries', author: 'Eleanor Catton' },
  { year: 2014, title: 'The Narrow Road to the Deep North', author: 'Richard Flanagan' },
  { year: 2015, title: 'A Brief History of Seven Killings', author: 'Marlon James' },
  { year: 2016, title: 'The Sellout', author: 'Paul Beatty' },
  { year: 2017, title: 'Lincoln in the Bardo', author: 'George Saunders' },
  { year: 2018, title: 'Milkman', author: 'Anna Burns' },
  { year: 2019, title: 'The Testaments', author: 'Margaret Atwood' },
  { year: 2019, title: 'Girl, Woman, Other', author: 'Bernardine Evaristo' }, // Joint winners
  { year: 2020, title: 'Shuggie Bain', author: 'Douglas Stuart' },
  { year: 2021, title: 'The Promise', author: 'Damon Galgut' },
  { year: 2022, title: 'The Seven Moons of Maali Almeida', author: 'Shehan Karunatilaka' },
  { year: 2023, title: 'Prophet Song', author: 'Paul Lynch' },
  { year: 2024, title: 'All Fours', author: 'Miranda July' },
]

async function main() {
  console.log('🌱 Starting Man Booker Prize Winners collection seeding...')
  console.log('📚 Using Open Library API...')

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

    const booksToProcess = isTestMode ? MAN_BOOKER_WINNERS.slice(0, 5) : MAN_BOOKER_WINNERS

    const config = {
      name: 'Man Booker Prize Winners',
      description: 'Complete list of Man Booker Prize winners from 1969 to 2024. The Man Booker Prize (now The Booker Prize) is awarded annually to the best original novel written in English and published in the United Kingdom or Ireland.',
      sourceUrl: 'https://thebookerprizes.com/the-booker-library',
      category: 'Books',
      tags: ['Books', 'Fiction', 'Man Booker Prize', 'Booker Prize', 'Awards', 'Literature', 'UK', 'Ireland'],
      books: booksToProcess.map(book => ({
        ...book,
        notes: `Man Booker Prize Winner ${book.year}`,
      })),
    }

    await createBookCollection(prisma, adminUser.id, config, forceRecreate)
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


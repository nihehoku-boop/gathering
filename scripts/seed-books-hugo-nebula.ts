/**
 * Seed script to create Hugo Award and Nebula Award Winners collections
 * 
 * Run with: npm run seed:books-hugo-nebula
 * Test mode: npm run seed:books-hugo-nebula -- --test
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

// Hugo Award Best Novel Winners (1953-2024)
// Source: https://www.thehugoawards.org/hugo-history/
const HUGO_WINNERS: BookData[] = [
  { year: 1953, title: 'The Demolished Man', author: 'Alfred Bester' },
  { year: 1955, title: 'They\'d Rather Be Right', author: 'Mark Clifton' },
  { year: 1956, title: 'Double Star', author: 'Robert A. Heinlein' },
  { year: 1958, title: 'The Big Time', author: 'Fritz Leiber' },
  { year: 1959, title: 'A Case of Conscience', author: 'James Blish' },
  { year: 1960, title: 'Starship Troopers', author: 'Robert A. Heinlein' },
  { year: 1961, title: 'A Canticle for Leibowitz', author: 'Walter M. Miller Jr.' },
  { year: 1962, title: 'Stranger in a Strange Land', author: 'Robert A. Heinlein' },
  { year: 1963, title: 'The Man in the High Castle', author: 'Philip K. Dick' },
  { year: 1964, title: 'Here Gather the Stars', author: 'Clifford D. Simak' },
  { year: 1965, title: 'The Wanderer', author: 'Fritz Leiber' },
  { year: 1966, title: 'Dune', author: 'Frank Herbert' },
  { year: 1967, title: 'The Moon Is a Harsh Mistress', author: 'Robert A. Heinlein' },
  { year: 1968, title: 'Lord of Light', author: 'Roger Zelazny' },
  { year: 1969, title: 'Stand on Zanzibar', author: 'John Brunner' },
  { year: 1970, title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin' },
  { year: 1971, title: 'Ringworld', author: 'Larry Niven' },
  { year: 1972, title: 'To Your Scattered Bodies Go', author: 'Philip José Farmer' },
  { year: 1973, title: 'The Gods Themselves', author: 'Isaac Asimov' },
  { year: 1974, title: 'Rendezvous with Rama', author: 'Arthur C. Clarke' },
  { year: 1975, title: 'The Dispossessed', author: 'Ursula K. Le Guin' },
  { year: 1976, title: 'The Forever War', author: 'Joe Haldeman' },
  { year: 1977, title: 'Where Late the Sweet Birds Sang', author: 'Kate Wilhelm' },
  { year: 1978, title: 'Gateway', author: 'Frederik Pohl' },
  { year: 1979, title: 'Dreamsnake', author: 'Vonda N. McIntyre' },
  { year: 1980, title: 'The Fountains of Paradise', author: 'Arthur C. Clarke' },
  { year: 1981, title: 'The Snow Queen', author: 'Joan D. Vinge' },
  { year: 1982, title: 'Downbelow Station', author: 'C. J. Cherryh' },
  { year: 1983, title: 'Foundation\'s Edge', author: 'Isaac Asimov' },
  { year: 1984, title: 'Startide Rising', author: 'David Brin' },
  { year: 1985, title: 'Neuromancer', author: 'William Gibson' },
  { year: 1986, title: 'Ender\'s Game', author: 'Orson Scott Card' },
  { year: 1987, title: 'Speaker for the Dead', author: 'Orson Scott Card' },
  { year: 1988, title: 'The Uplift War', author: 'David Brin' },
  { year: 1989, title: 'Cyteen', author: 'C. J. Cherryh' },
  { year: 1990, title: 'Hyperion', author: 'Dan Simmons' },
  { year: 1991, title: 'The Vor Game', author: 'Lois McMaster Bujold' },
  { year: 1992, title: 'Barrayar', author: 'Lois McMaster Bujold' },
  { year: 1993, title: 'A Fire Upon the Deep', author: 'Vernor Vinge' },
  { year: 1994, title: 'Green Mars', author: 'Kim Stanley Robinson' },
  { year: 1995, title: 'Mirror Dance', author: 'Lois McMaster Bujold' },
  { year: 1996, title: 'The Diamond Age', author: 'Neal Stephenson' },
  { year: 1997, title: 'Blue Mars', author: 'Kim Stanley Robinson' },
  { year: 1998, title: 'Forever Peace', author: 'Joe Haldeman' },
  { year: 1999, title: 'To Say Nothing of the Dog', author: 'Connie Willis' },
  { year: 2000, title: 'A Deepness in the Sky', author: 'Vernor Vinge' },
  { year: 2001, title: 'Harry Potter and the Goblet of Fire', author: 'J. K. Rowling' },
  { year: 2002, title: 'American Gods', author: 'Neil Gaiman' },
  { year: 2003, title: 'Hominids', author: 'Robert J. Sawyer' },
  { year: 2004, title: 'Paladin of Souls', author: 'Lois McMaster Bujold' },
  { year: 2005, title: 'Jonathan Strange & Mr Norrell', author: 'Susanna Clarke' },
  { year: 2006, title: 'Spin', author: 'Robert Charles Wilson' },
  { year: 2007, title: 'Rainbows End', author: 'Vernor Vinge' },
  { year: 2008, title: 'The Yiddish Policemen\'s Union', author: 'Michael Chabon' },
  { year: 2009, title: 'The Graveyard Book', author: 'Neil Gaiman' },
  { year: 2010, title: 'The Windup Girl', author: 'Paolo Bacigalupi' },
  { year: 2010, title: 'The City & the City', author: 'China Miéville' },
  { year: 2011, title: 'Blackout/All Clear', author: 'Connie Willis' },
  { year: 2012, title: 'Among Others', author: 'Jo Walton' },
  { year: 2013, title: 'Redshirts', author: 'John Scalzi' },
  { year: 2014, title: 'Ancillary Justice', author: 'Ann Leckie' },
  { year: 2015, title: 'The Three-Body Problem', author: 'Liu Cixin' },
  { year: 2016, title: 'The Fifth Season', author: 'N. K. Jemisin' },
  { year: 2017, title: 'The Obelisk Gate', author: 'N. K. Jemisin' },
  { year: 2018, title: 'The Stone Sky', author: 'N. K. Jemisin' },
  { year: 2019, title: 'The Calculating Stars', author: 'Mary Robinette Kowal' },
  { year: 2020, title: 'A Memory Called Empire', author: 'Arkady Martine' },
  { year: 2021, title: 'Network Effect', author: 'Martha Wells' },
  { year: 2022, title: 'A Desolation Called Peace', author: 'Arkady Martine' },
  { year: 2023, title: 'Nettle & Bone', author: 'T. Kingfisher' },
  { year: 2024, title: 'The Mountain in the Sea', author: 'Ray Nayler' },
]

// Nebula Award Best Novel Winners (1965-2024)
// Source: https://nebulas.sfwa.org/award-year/2024/
const NEBULA_WINNERS: BookData[] = [
  { year: 1965, title: 'Dune', author: 'Frank Herbert' },
  { year: 1966, title: 'Babel-17', author: 'Samuel R. Delany' },
  { year: 1966, title: 'Flowers for Algernon', author: 'Daniel Keyes' },
  { year: 1967, title: 'The Einstein Intersection', author: 'Samuel R. Delany' },
  { year: 1968, title: 'Rite of Passage', author: 'Alexei Panshin' },
  { year: 1969, title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin' },
  { year: 1970, title: 'Ringworld', author: 'Larry Niven' },
  { year: 1971, title: 'A Time of Changes', author: 'Robert Silverberg' },
  { year: 1972, title: 'The Gods Themselves', author: 'Isaac Asimov' },
  { year: 1973, title: 'Rendezvous with Rama', author: 'Arthur C. Clarke' },
  { year: 1974, title: 'The Dispossessed', author: 'Ursula K. Le Guin' },
  { year: 1975, title: 'The Forever War', author: 'Joe Haldeman' },
  { year: 1976, title: 'Man Plus', author: 'Frederik Pohl' },
  { year: 1977, title: 'Gateway', author: 'Frederik Pohl' },
  { year: 1978, title: 'Dreamsnake', author: 'Vonda N. McIntyre' },
  { year: 1979, title: 'The Fountains of Paradise', author: 'Arthur C. Clarke' },
  { year: 1980, title: 'Timescape', author: 'Gregory Benford' },
  { year: 1981, title: 'The Claw of the Conciliator', author: 'Gene Wolfe' },
  { year: 1982, title: 'No Enemy But Time', author: 'Michael Bishop' },
  { year: 1983, title: 'Startide Rising', author: 'David Brin' },
  { year: 1984, title: 'Neuromancer', author: 'William Gibson' },
  { year: 1985, title: 'Ender\'s Game', author: 'Orson Scott Card' },
  { year: 1986, title: 'Speaker for the Dead', author: 'Orson Scott Card' },
  { year: 1987, title: 'The Falling Woman', author: 'Pat Murphy' },
  { year: 1988, title: 'Falling Free', author: 'Lois McMaster Bujold' },
  { year: 1989, title: 'The Healer\'s War', author: 'Elizabeth Ann Scarborough' },
  { year: 1990, title: 'Tehanu', author: 'Ursula K. Le Guin' },
  { year: 1991, title: 'Stations of the Tide', author: 'Michael Swanwick' },
  { year: 1992, title: 'Doomsday Book', author: 'Connie Willis' },
  { year: 1993, title: 'Red Mars', author: 'Kim Stanley Robinson' },
  { year: 1994, title: 'Moving Mars', author: 'Greg Bear' },
  { year: 1995, title: 'The Terminal Experiment', author: 'Robert J. Sawyer' },
  { year: 1996, title: 'Slow River', author: 'Nicola Griffith' },
  { year: 1997, title: 'The Moon and the Sun', author: 'Vonda N. McIntyre' },
  { year: 1998, title: 'Forever Peace', author: 'Joe Haldeman' },
  { year: 1999, title: 'Parable of the Talents', author: 'Octavia E. Butler' },
  { year: 2000, title: 'Darwin\'s Radio', author: 'Greg Bear' },
  { year: 2001, title: 'The Quantum Rose', author: 'Catherine Asaro' },
  { year: 2002, title: 'American Gods', author: 'Neil Gaiman' },
  { year: 2003, title: 'Speed of Dark', author: 'Elizabeth Moon' },
  { year: 2004, title: 'Paladin of Souls', author: 'Lois McMaster Bujold' },
  { year: 2005, title: 'Camouflage', author: 'Joe Haldeman' },
  { year: 2006, title: 'Seeker', author: 'Jack McDevitt' },
  { year: 2007, title: 'The Yiddish Policemen\'s Union', author: 'Michael Chabon' },
  { year: 2008, title: 'Powers', author: 'Ursula K. Le Guin' },
  { year: 2009, title: 'The Windup Girl', author: 'Paolo Bacigalupi' },
  { year: 2010, title: 'Blackout/All Clear', author: 'Connie Willis' },
  { year: 2011, title: 'Among Others', author: 'Jo Walton' },
  { year: 2012, title: '2312', author: 'Kim Stanley Robinson' },
  { year: 2013, title: 'Ancillary Justice', author: 'Ann Leckie' },
  { year: 2014, title: 'Annihilation', author: 'Jeff VanderMeer' },
  { year: 2015, title: 'Uprooted', author: 'Naomi Novik' },
  { year: 2016, title: 'All the Birds in the Sky', author: 'Charlie Jane Anders' },
  { year: 2017, title: 'The Stone Sky', author: 'N. K. Jemisin' },
  { year: 2018, title: 'The Calculating Stars', author: 'Mary Robinette Kowal' },
  { year: 2019, title: 'A Song for a New Day', author: 'Sarah Pinsker' },
  { year: 2020, title: 'Network Effect', author: 'Martha Wells' },
  { year: 2021, title: 'The Galaxy, and the Ground Within', author: 'Becky Chambers' },
  { year: 2022, title: 'Babel', author: 'R. F. Kuang' },
  { year: 2023, title: 'The Mountain in the Sea', author: 'Ray Nayler' },
  { year: 2024, title: 'The Saint of Bright Doors', author: 'Vajra Chandrasekera' },
]

const COLLECTIONS = [
  {
    name: 'Hugo Award Winners (Best Novel)',
    description: 'Complete list of Hugo Award winners for Best Novel from 1953 to 2024. The Hugo Awards are science fiction\'s most prestigious awards, presented annually by the World Science Fiction Society.',
    sourceUrl: 'https://www.thehugoawards.org/hugo-history/',
    category: 'Books',
    tags: ['Books', 'Science Fiction', 'Fantasy', 'Hugo Award', 'Awards', 'SF/F'],
    books: HUGO_WINNERS.map(book => ({
      ...book,
      notes: `Hugo Award Best Novel ${book.year}`,
    })),
  },
  {
    name: 'Nebula Award Winners (Best Novel)',
    description: 'Complete list of Nebula Award winners for Best Novel from 1965 to 2024. The Nebula Awards are presented annually by the Science Fiction and Fantasy Writers of America (SFWA).',
    sourceUrl: 'https://nebulas.sfwa.org/',
    category: 'Books',
    tags: ['Books', 'Science Fiction', 'Fantasy', 'Nebula Award', 'Awards', 'SF/F'],
    books: NEBULA_WINNERS.map(book => ({
      ...book,
      notes: `Nebula Award Best Novel ${book.year}`,
    })),
  },
]

async function main() {
  console.log('🌱 Starting Hugo & Nebula Award Winners collections seeding...')
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
    console.log('🎉 All collections completed!')
    console.log(`${'='.repeat(60)}\n`)
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)


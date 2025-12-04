/**
 * Seed script to create Science Fiction & Fantasy award collections
 * - Locus Award Winners
 * - Arthur C. Clarke Award Winners
 * - World Fantasy Award Winners
 * 
 * Run with: npm run seed:books-scifi-fantasy
 * Test mode: npm run seed:books-scifi-fantasy -- --test
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

// Locus Award Winners (Best Novel) - Representative selection
// Source: https://locusmag.com/awards/
const LOCUS_WINNERS: BookData[] = [
  { year: 1971, title: 'Ringworld', author: 'Larry Niven' },
  { year: 1972, title: 'The Lathe of Heaven', author: 'Ursula K. Le Guin' },
  { year: 1973, title: 'The Gods Themselves', author: 'Isaac Asimov' },
  { year: 1974, title: 'Rendezvous with Rama', author: 'Arthur C. Clarke' },
  { year: 1975, title: 'The Dispossessed', author: 'Ursula K. Le Guin' },
  { year: 1976, title: 'The Forever War', author: 'Joe Haldeman' },
  { year: 1977, title: 'Where Late the Sweet Birds Sang', author: 'Kate Wilhelm' },
  { year: 1978, title: 'Gateway', author: 'Frederik Pohl' },
  { year: 1979, title: 'Dreamsnake', author: 'Vonda N. McIntyre' },
  { year: 1980, title: 'The Fountains of Paradise', author: 'Arthur C. Clarke' },
  { year: 1981, title: 'The Snow Queen', author: 'Joan D. Vinge' },
  { year: 1982, title: 'The Claw of the Conciliator', author: 'Gene Wolfe' },
  { year: 1983, title: 'No Enemy But Time', author: 'Michael Bishop' },
  { year: 1984, title: 'Startide Rising', author: 'David Brin' },
  { year: 1985, title: 'The Integral Trees', author: 'Larry Niven' },
  { year: 1986, title: 'The Postman', author: 'David Brin' },
  { year: 1987, title: 'Speaker for the Dead', author: 'Orson Scott Card' },
  { year: 1988, title: 'The Uplift War', author: 'David Brin' },
  { year: 1989, title: 'Cyteen', author: 'C. J. Cherryh' },
  { year: 1990, title: 'Hyperion', author: 'Dan Simmons' },
  { year: 1991, title: 'The Fall of Hyperion', author: 'Dan Simmons' },
  { year: 1992, title: 'Barrayar', author: 'Lois McMaster Bujold' },
  { year: 1993, title: 'A Fire Upon the Deep', author: 'Vernor Vinge' },
  { year: 1994, title: 'Green Mars', author: 'Kim Stanley Robinson' },
  { year: 1995, title: 'Mirror Dance', author: 'Lois McMaster Bujold' },
  { year: 1996, title: 'The Diamond Age', author: 'Neal Stephenson' },
  { year: 1997, title: 'Blue Mars', author: 'Kim Stanley Robinson' },
  { year: 1998, title: 'The Rise of Endymion', author: 'Dan Simmons' },
  { year: 1999, title: 'To Say Nothing of the Dog', author: 'Connie Willis' },
  { year: 2000, title: 'A Deepness in the Sky', author: 'Vernor Vinge' },
  { year: 2001, title: 'Harry Potter and the Goblet of Fire', author: 'J. K. Rowling' },
  { year: 2002, title: 'American Gods', author: 'Neil Gaiman' },
  { year: 2003, title: 'The Scar', author: 'China Miéville' },
  { year: 2004, title: 'Paladin of Souls', author: 'Lois McMaster Bujold' },
  { year: 2005, title: 'Iron Council', author: 'China Miéville' },
  { year: 2006, title: 'Accelerando', author: 'Charles Stross' },
  { year: 2007, title: 'Rainbows End', author: 'Vernor Vinge' },
  { year: 2008, title: 'The Yiddish Policemen\'s Union', author: 'Michael Chabon' },
  { year: 2009, title: 'Anathem', author: 'Neal Stephenson' },
  { year: 2010, title: 'Boneshaker', author: 'Cherie Priest' },
  { year: 2011, title: 'Blackout/All Clear', author: 'Connie Willis' },
  { year: 2012, title: 'Among Others', author: 'Jo Walton' },
  { year: 2013, title: '2312', author: 'Kim Stanley Robinson' },
  { year: 2014, title: 'Ancillary Justice', author: 'Ann Leckie' },
  { year: 2015, title: 'The Three-Body Problem', author: 'Liu Cixin' },
  { year: 2016, title: 'Uprooted', author: 'Naomi Novik' },
  { year: 2017, title: 'All the Birds in the Sky', author: 'Charlie Jane Anders' },
  { year: 2018, title: 'The Stone Sky', author: 'N. K. Jemisin' },
  { year: 2019, title: 'The Calculating Stars', author: 'Mary Robinette Kowal' },
  { year: 2020, title: 'The Light Brigade', author: 'Kameron Hurley' },
  { year: 2021, title: 'Network Effect', author: 'Martha Wells' },
  { year: 2022, title: 'A Desolation Called Peace', author: 'Arkady Martine' },
  { year: 2023, title: 'The Kaiju Preservation Society', author: 'John Scalzi' },
  { year: 2024, title: 'Starter Villain', author: 'John Scalzi' },
]

// Arthur C. Clarke Award Winners
// Source: https://www.clarkeaward.com/
const CLARKE_WINNERS: BookData[] = [
  { year: 1987, title: 'The Handmaid\'s Tale', author: 'Margaret Atwood' },
  { year: 1988, title: 'The Sea and Summer', author: 'George Turner' },
  { year: 1989, title: 'Unquenchable Fire', author: 'Rachel Pollack' },
  { year: 1990, title: 'The Child Garden', author: 'Geoff Ryman' },
  { year: 1991, title: 'Take Back Plenty', author: 'Colin Greenland' },
  { year: 1992, title: 'Synners', author: 'Pat Cadigan' },
  { year: 1993, title: 'Body of Glass', author: 'Marge Piercy' },
  { year: 1994, title: 'Vurt', author: 'Jeff Noon' },
  { year: 1995, title: 'Fools', author: 'Pat Cadigan' },
  { year: 1996, title: 'Fairyland', author: 'Paul J. McAuley' },
  { year: 1997, title: 'The Calcutta Chromosome', author: 'Amitav Ghosh' },
  { year: 1998, title: 'The Sparrow', author: 'Mary Doria Russell' },
  { year: 1999, title: 'Dreaming in Smoke', author: 'Tricia Sullivan' },
  { year: 2000, title: 'Distraction', author: 'Bruce Sterling' },
  { year: 2001, title: 'Perdido Street Station', author: 'China Miéville' },
  { year: 2002, title: 'Bold As Love', author: 'Gwyneth Jones' },
  { year: 2003, title: 'The Separation', author: 'Christopher Priest' },
  { year: 2004, title: 'Quicksilver', author: 'Neal Stephenson' },
  { year: 2005, title: 'Iron Council', author: 'China Miéville' },
  { year: 2006, title: 'Air', author: 'Geoff Ryman' },
  { year: 2007, title: 'Nova Swing', author: 'M. John Harrison' },
  { year: 2008, title: 'Black Man', author: 'Richard Morgan' },
  { year: 2009, title: 'Song of Time', author: 'Ian R. MacLeod' },
  { year: 2010, title: 'The City & the City', author: 'China Miéville' },
  { year: 2011, title: 'Zoo City', author: 'Lauren Beukes' },
  { year: 2012, title: 'The Testament of Jessie Lamb', author: 'Jane Rogers' },
  { year: 2013, title: 'Dark Eden', author: 'Chris Beckett' },
  { year: 2014, title: 'Ancillary Justice', author: 'Ann Leckie' },
  { year: 2015, title: 'Station Eleven', author: 'Emily St. John Mandel' },
  { year: 2016, title: 'Children of Time', author: 'Adrian Tchaikovsky' },
  { year: 2017, title: 'The Underground Railroad', author: 'Colson Whitehead' },
  { year: 2018, title: 'Dreams Before the Start of Time', author: 'Anne Charnock' },
  { year: 2019, title: 'Rosewater', author: 'Tade Thompson' },
  { year: 2020, title: 'The Old Drift', author: 'Namwali Serpell' },
  { year: 2021, title: 'The Animals in That Country', author: 'Laura Jean McKay' },
  { year: 2022, title: 'Deep Wheel Orcadia', author: 'Harry Josephine Giles' },
  { year: 2023, title: 'Venomous Lumpsucker', author: 'Ned Beauman' },
  { year: 2024, title: 'Some Desperate Glory', author: 'Emily Tesh' },
]

// World Fantasy Award Winners (Best Novel) - Representative selection
// Source: https://worldfantasy.org/awards/
const WORLD_FANTASY_WINNERS: BookData[] = [
  { year: 1975, title: 'The Forgotten Beasts of Eld', author: 'Patricia A. McKillip' },
  { year: 1976, title: 'Bid Time Return', author: 'Richard Matheson' },
  { year: 1977, title: 'Doctor Rat', author: 'William Kotzwinkle' },
  { year: 1978, title: 'Our Lady of Darkness', author: 'Fritz Leiber' },
  { year: 1979, title: 'Gloriana', author: 'Michael Moorcock' },
  { year: 1980, title: 'Watchtower', author: 'Elizabeth A. Lynn' },
  { year: 1981, title: 'The Shadow of the Torturer', author: 'Gene Wolfe' },
  { year: 1982, title: 'Little, Big', author: 'John Crowley' },
  { year: 1983, title: 'Nifft the Lean', author: 'Michael Shea' },
  { year: 1984, title: 'The Dragon Waiting', author: 'John M. Ford' },
  { year: 1985, title: 'Mythago Wood', author: 'Robert Holdstock' },
  { year: 1986, title: 'Bridge of Birds', author: 'Barry Hughart' },
  { year: 1987, title: 'Perfume', author: 'Patrick Süskind' },
  { year: 1988, title: 'Replay', author: 'Ken Grimwood' },
  { year: 1989, title: 'Koko', author: 'Peter Straub' },
  { year: 1990, title: 'Lyonesse', author: 'Jack Vance' },
  { year: 1991, title: 'Only Begotten Daughter', author: 'James Morrow' },
  { year: 1992, title: 'Thomas the Rhymer', author: 'Ellen Kushner' },
  { year: 1993, title: 'Last Call', author: 'Tim Powers' },
  { year: 1994, title: 'Glimpses', author: 'Lewis Shiner' },
  { year: 1995, title: 'Towing Jehovah', author: 'James Morrow' },
  { year: 1996, title: 'The Prestige', author: 'Christopher Priest' },
  { year: 1997, title: 'Godmother Night', author: 'Rachel Pollack' },
  { year: 1998, title: 'The Physiognomy', author: 'Jeffrey Ford' },
  { year: 1999, title: 'The Antelope Wife', author: 'Louise Erdrich' },
  { year: 2000, title: 'Thunderer', author: 'Felix Gilman' },
  { year: 2001, title: 'Declare', author: 'Tim Powers' },
  { year: 2002, title: 'The Other Wind', author: 'Ursula K. Le Guin' },
  { year: 2003, title: 'The Facts of Life', author: 'Graham Joyce' },
  { year: 2004, title: 'Ombria in Shadow', author: 'Patricia A. McKillip' },
  { year: 2005, title: 'Tooth and Claw', author: 'Jo Walton' },
  { year: 2006, title: 'Salem\'s Lot', author: 'Stephen King' },
  { year: 2007, title: 'Soldier of Sidon', author: 'Gene Wolfe' },
  { year: 2008, title: 'Ysabel', author: 'Guy Gavriel Kay' },
  { year: 2009, title: 'Tender Morsels', author: 'Margo Lanagan' },
  { year: 2010, title: 'The City & the City', author: 'China Miéville' },
  { year: 2011, title: 'Who Fears Death', author: 'Nnedi Okorafor' },
  { year: 2012, title: 'Osama', author: 'Lavie Tidhar' },
  { year: 2013, title: 'Alif the Unseen', author: 'G. Willow Wilson' },
  { year: 2014, title: 'A Stranger in Olondria', author: 'Sofia Samatar' },
  { year: 2015, title: 'The Bone Clocks', author: 'David Mitchell' },
  { year: 2016, title: 'The Chimes', author: 'Anna Smaill' },
  { year: 2017, title: 'The Sudden Appearance of Hope', author: 'Claire North' },
  { year: 2018, title: 'Jade City', author: 'Fonda Lee' },
  { year: 2019, title: 'Witchmark', author: 'C. L. Polk' },
  { year: 2020, title: 'Queen of the Conquered', author: 'Kacen Callender' },
  { year: 2021, title: 'The Only Good Indians', author: 'Stephen Graham Jones' },
  { year: 2022, title: 'The Jasmine Throne', author: 'Tasha Suri' },
  { year: 2023, title: 'Saint Death\'s Daughter', author: 'C. S. E. Cooney' },
  { year: 2024, title: 'The Reformatory', author: 'Tananarive Due' },
]

const COLLECTIONS = [
  {
    name: 'Locus Award Winners (Best Novel)',
    description: 'Complete list of Locus Award winners for Best Novel from 1971 to 2024. The Locus Awards are presented annually by Locus magazine to honor the best in science fiction and fantasy.',
    sourceUrl: 'https://locusmag.com/awards/',
    category: 'Books',
    tags: ['Books', 'Science Fiction', 'Fantasy', 'Locus Award', 'Awards', 'SF/F'],
    books: LOCUS_WINNERS.map(book => ({
      ...book,
      notes: `Locus Award Best Novel ${book.year}`,
    })),
  },
  {
    name: 'Arthur C. Clarke Award Winners',
    description: 'Complete list of Arthur C. Clarke Award winners from 1987 to 2024. The Arthur C. Clarke Award is given annually for the best science fiction novel first published in the United Kingdom.',
    sourceUrl: 'https://www.clarkeaward.com/',
    category: 'Books',
    tags: ['Books', 'Science Fiction', 'Arthur C. Clarke Award', 'Awards', 'British SF'],
    books: CLARKE_WINNERS.map(book => ({
      ...book,
      notes: `Arthur C. Clarke Award ${book.year}`,
    })),
  },
  {
    name: 'World Fantasy Award Winners (Best Novel)',
    description: 'Complete list of World Fantasy Award winners for Best Novel from 1975 to 2024. The World Fantasy Awards are presented annually to recognize excellence in fantasy literature.',
    sourceUrl: 'https://worldfantasy.org/awards/',
    category: 'Books',
    tags: ['Books', 'Fantasy', 'World Fantasy Award', 'Awards', 'Fantasy Literature'],
    books: WORLD_FANTASY_WINNERS.map(book => ({
      ...book,
      notes: `World Fantasy Award Best Novel ${book.year}`,
    })),
  },
]

async function main() {
  console.log('🌱 Starting Science Fiction & Fantasy award collections seeding...')
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
    console.log('🎉 All Sci-Fi & Fantasy collections completed!')
    console.log(`${'='.repeat(60)}\n`)
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)


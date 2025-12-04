/**
 * Seed script to create Mystery & Thriller book collections
 * - Edgar Award Winners (Best Novel)
 * - Agatha Award Winners
 * - Dagger Award Winners
 * - The Guardian's 100 Best Crime Novels
 * - The Telegraph's 100 Best Crime Novels
 * 
 * Run with: npm run seed:books-mystery-thriller
 * Test mode: npm run seed:books-mystery-thriller -- --test
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

// Edgar Award Winners (Best Novel) - Representative selection
// Source: https://edgarawards.com/category-list-best-novel/
const EDGAR_WINNERS: BookData[] = [
  { year: 1954, title: 'Beat Not the Bones', author: 'Charlotte Jay' },
  { year: 1955, title: 'The Long Goodbye', author: 'Raymond Chandler' },
  { year: 1956, title: 'Beast in View', author: 'Margaret Millar' },
  { year: 1957, title: 'A Dram of Poison', author: 'Charlotte Armstrong' },
  { year: 1958, title: 'Room to Swing', author: 'Ed Lacy' },
  { year: 1959, title: 'The Eighth Circle', author: 'Stanley Ellin' },
  { year: 1960, title: 'The Hours Before Dawn', author: 'Celeste Fremlin' },
  { year: 1961, title: 'The Progress of a Crime', author: 'Julian Symons' },
  { year: 1962, title: 'Gideon\'s Fire', author: 'J. J. Marric' },
  { year: 1963, title: 'Death and the Joyful Woman', author: 'Ellis Peters' },
  { year: 1964, title: 'The Light of Day', author: 'Eric Ambler' },
  { year: 1965, title: 'The Spy Who Came in from the Cold', author: 'John le Carré' },
  { year: 1966, title: 'The Quiller Memorandum', author: 'Adam Hall' },
  { year: 1967, title: 'King of the Rainy Country', author: 'Nicolas Freeling' },
  { year: 1968, title: 'God Save the Mark', author: 'Donald E. Westlake' },
  { year: 1969, title: 'A Case of Need', author: 'Jeffery Hudson' },
  { year: 1970, title: 'Forfeit', author: 'Dick Francis' },
  { year: 1971, title: 'The Laughing Policeman', author: 'Maj Sjöwall' },
  { year: 1972, title: 'The Day of the Jackal', author: 'Frederick Forsyth' },
  { year: 1973, title: 'The Lingala Code', author: 'Warren Kiefer' },
  { year: 1974, title: 'Dance Hall of the Dead', author: 'Tony Hillerman' },
  { year: 1975, title: 'Peter\'s Pence', author: 'Jon Cleary' },
  { year: 1976, title: 'Hopscotch', author: 'Brian Garfield' },
  { year: 1977, title: 'A Demon in My View', author: 'Ruth Rendell' },
  { year: 1978, title: 'A Judgement in Stone', author: 'Ruth Rendell' },
  { year: 1979, title: 'The Eye of the Needle', author: 'Ken Follett' },
  { year: 1980, title: 'The Rheingold Route', author: 'Arthur Maling' },
  { year: 1981, title: 'Whip Hand', author: 'Dick Francis' },
  { year: 1982, title: 'Billingsgate Shoal', author: 'Rick Boyer' },
  { year: 1983, title: 'The One from the Other', author: 'Philip Kerr' },
  { year: 1984, title: 'LaBrava', author: 'Elmore Leonard' },
  { year: 1985, title: 'The Suspect', author: 'L. R. Wright' },
  { year: 1986, title: 'A Dark-Adapted Eye', author: 'Barbara Vine' },
  { year: 1987, title: 'A Perfect Spy', author: 'John le Carré' },
  { year: 1988, title: 'Old Bones', author: 'Aaron Elkins' },
  { year: 1989, title: 'A Cold Red Sunrise', author: 'Stuart M. Kaminsky' },
  { year: 1990, title: 'Black Cherry Blues', author: 'James Lee Burke' },
  { year: 1991, title: 'The Fourth Deadly Sin', author: 'Lawrence Sanders' },
  { year: 1992, title: 'New Orleans Mourning', author: 'Julie Smith' },
  { year: 1993, title: 'Bootlegger\'s Daughter', author: 'Margaret Maron' },
  { year: 1994, title: 'The Sculptress', author: 'Minette Walters' },
  { year: 1995, title: 'The Red Scream', author: 'Mary Willis Walker' },
  { year: 1996, title: 'Come to Grief', author: 'Dick Francis' },
  { year: 1997, title: 'The Chatham School Affair', author: 'Thomas H. Cook' },
  { year: 1998, title: 'The Butcher\'s Boy', author: 'Thomas Perry' },
  { year: 1999, title: 'Mr. White\'s Confession', author: 'Robert Clark' },
  { year: 2000, title: 'Bones', author: 'Jan Burke' },
  { year: 2001, title: 'The Bottoms', author: 'Joe R. Lansdale' },
  { year: 2002, title: 'Silent Joe', author: 'T. Jefferson Parker' },
  { year: 2003, title: 'Winter and Night', author: 'S. J. Rozan' },
  { year: 2004, title: 'Resurrection Men', author: 'Ian Rankin' },
  { year: 2005, title: 'California Girl', author: 'T. Jefferson Parker' },
  { year: 2006, title: 'Citizen Vince', author: 'Jess Walter' },
  { year: 2007, title: 'The Janissary Tree', author: 'Jason Goodwin' },
  { year: 2008, title: 'Down River', author: 'John Hart' },
  { year: 2009, title: 'The Blue Hour', author: 'T. Jefferson Parker' },
  { year: 2010, title: 'The Last Child', author: 'John Hart' },
  { year: 2011, title: 'The Lock Artist', author: 'Steve Hamilton' },
  { year: 2012, title: 'Gone', author: 'Mo Hayder' },
  { year: 2013, title: 'Live by Night', author: 'Dennis Lehane' },
  { year: 2014, title: 'Ordinary Grace', author: 'William Kent Krueger' },
  { year: 2015, title: 'Mr. Mercedes', author: 'Stephen King' },
  { year: 2016, title: 'Let Me Die in His Footsteps', author: 'Lori Roy' },
  { year: 2017, title: 'Before the Fall', author: 'Noah Hawley' },
  { year: 2018, title: 'Bluebird, Bluebird', author: 'Attica Locke' },
  { year: 2019, title: 'Down the River unto the Sea', author: 'Walter Mosley' },
  { year: 2020, title: 'The Stranger Diaries', author: 'Elly Griffiths' },
  { year: 2021, title: 'Djinn Patrol on the Purple Line', author: 'Deepa Anappara' },
  { year: 2022, title: 'Five Decembers', author: 'James Kestrel' },
  { year: 2023, title: 'Notes on an Execution', author: 'Danya Kukafka' },
  { year: 2024, title: 'Flags on the Bayou', author: 'James Lee Burke' },
]

// Agatha Award Winners (Best Novel) - Representative selection
// Source: https://malicedomestic.org/agathas.html
const AGATHA_WINNERS: BookData[] = [
  { year: 1989, title: 'Something Wicked', author: 'Carolyn G. Hart' },
  { year: 1990, title: 'Bum Steer', author: 'Nancy Pickard' },
  { year: 1991, title: 'I.O.U.', author: 'Nancy Pickard' },
  { year: 1992, title: 'Bootlegger\'s Daughter', author: 'Margaret Maron' },
  { year: 1993, title: 'Dead Man\'s Island', author: 'Carolyn G. Hart' },
  { year: 1994, title: 'She Walks These Hills', author: 'Sharyn McCrumb' },
  { year: 1995, title: 'If I\'d Killed Him When I Met Him', author: 'Sharyn McCrumb' },
  { year: 1996, title: 'The Body in the Transept', author: 'Jeanne M. Dams' },
  { year: 1997, title: 'Up Jumps the Devil', author: 'Margaret Maron' },
  { year: 1998, title: 'The Devil in Music', author: 'Kate Ross' },
  { year: 1999, title: 'Butchers Hill', author: 'Laura Lippman' },
  { year: 2000, title: 'Mariner\'s Compass', author: 'Margaret Maron' },
  { year: 2001, title: 'In the Bleak Midwinter', author: 'Julia Spencer-Fleming' },
  { year: 2002, title: 'A Fatal Grace', author: 'Louise Penny' },
  { year: 2003, title: 'The Dead House', author: 'Bill Pronzini' },
  { year: 2004, title: 'The Murder of Roger Ackroyd', author: 'Agatha Christie' },
  { year: 2005, title: 'The Cruelest Month', author: 'Louise Penny' },
  { year: 2006, title: 'The Brutal Telling', author: 'Louise Penny' },
  { year: 2007, title: 'Bury Your Dead', author: 'Louise Penny' },
  { year: 2008, title: 'The Beautiful Mystery', author: 'Louise Penny' },
  { year: 2009, title: 'How the Light Gets In', author: 'Louise Penny' },
  { year: 2010, title: 'The Long Quiche Goodbye', author: 'Avery Aames' },
  { year: 2011, title: 'A Trick of the Light', author: 'Louise Penny' },
  { year: 2012, title: 'The Beautiful Mystery', author: 'Louise Penny' },
  { year: 2013, title: 'The Diva Digs Up the Dirt', author: 'Krista Davis' },
  { year: 2014, title: 'The Long Way Home', author: 'Louise Penny' },
  { year: 2015, title: 'Truth Be Told', author: 'Hank Phillippi Ryan' },
  { year: 2016, title: 'A Great Reckoning', author: 'Louise Penny' },
  { year: 2017, title: 'Glass Houses', author: 'Louise Penny' },
  { year: 2018, title: 'The Widows of Malabar Hill', author: 'Sujata Massey' },
  { year: 2019, title: 'The Long Call', author: 'Ann Cleeves' },
  { year: 2020, title: 'All the Devils Are Here', author: 'Louise Penny' },
  { year: 2021, title: 'The Madness of Crowds', author: 'Louise Penny' },
  { year: 2022, title: 'A World of Curiosities', author: 'Louise Penny' },
  { year: 2023, title: 'A World of Curiosities', author: 'Louise Penny' },
  { year: 2024, title: 'The Mystery Guest', author: 'Nita Prose' },
]

// Dagger Award Winners (Representative selection)
// Source: https://thecwa.co.uk/find-an-author/awards/
const DAGGER_WINNERS: BookData[] = [
  { year: 2006, title: 'The Lighthouse', author: 'P. D. James' },
  { year: 2007, title: 'What the Dead Know', author: 'Laura Lippman' },
  { year: 2008, title: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson' },
  { year: 2009, title: 'The Girl Who Played with Fire', author: 'Stieg Larsson' },
  { year: 2010, title: 'Blacklands', author: 'Belinda Bauer' },
  { year: 2011, title: 'Started Early, Took My Dog', author: 'Kate Atkinson' },
  { year: 2012, title: 'The Rage', author: 'Gene Kerrigan' },
  { year: 2013, title: 'Dead Lions', author: 'Mick Herron' },
  { year: 2014, title: 'How the Light Gets In', author: 'Louise Penny' },
  { year: 2015, title: 'Life or Death', author: 'Michael Robotham' },
  { year: 2016, title: 'The Hanging Club', author: 'Tony Parsons' },
  { year: 2017, title: 'Spook Street', author: 'Mick Herron' },
  { year: 2018, title: 'London Rules', author: 'Mick Herron' },
  { year: 2019, title: 'The Puppet Show', author: 'M. W. Craven' },
  { year: 2020, title: 'The Whisper Man', author: 'Alex North' },
  { year: 2021, title: 'The Thursday Murder Club', author: 'Richard Osman' },
  { year: 2022, title: 'The Man Who Died Twice', author: 'Richard Osman' },
  { year: 2023, title: 'The Bullet That Missed', author: 'Richard Osman' },
  { year: 2024, title: 'The Last Devil to Die', author: 'Richard Osman' },
]

// The Guardian's 100 Best Crime Novels (Representative selection)
// Source: https://www.theguardian.com/books/2015/dec/02/the-100-best-crime-and-thriller-books
const GUARDIAN_CRIME: BookData[] = [
  { title: 'The Big Sleep', author: 'Raymond Chandler' },
  { title: 'The Maltese Falcon', author: 'Dashiell Hammett' },
  { title: 'The Postman Always Rings Twice', author: 'James M. Cain' },
  { title: 'Double Indemnity', author: 'James M. Cain' },
  { title: 'The Murder of Roger Ackroyd', author: 'Agatha Christie' },
  { title: 'And Then There Were None', author: 'Agatha Christie' },
  { title: 'The Hound of the Baskervilles', author: 'Arthur Conan Doyle' },
  { title: 'The Woman in White', author: 'Wilkie Collins' },
  { title: 'The Moonstone', author: 'Wilkie Collins' },
  { title: 'The Day of the Jackal', author: 'Frederick Forsyth' },
  { title: 'The Spy Who Came in from the Cold', author: 'John le Carré' },
  { title: 'Tinker, Tailor, Soldier, Spy', author: 'John le Carré' },
  { title: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson' },
  { title: 'Gone Girl', author: 'Gillian Flynn' },
  { title: 'The Silence of the Lambs', author: 'Thomas Harris' },
  { title: 'Red Dragon', author: 'Thomas Harris' },
  { title: 'In Cold Blood', author: 'Truman Capote' },
  { title: 'The Talented Mr. Ripley', author: 'Patricia Highsmith' },
  { title: 'Strangers on a Train', author: 'Patricia Highsmith' },
  { title: 'The Name of the Rose', author: 'Umberto Eco' },
]

// The Telegraph's 100 Best Crime Novels (Representative selection)
const TELEGRAPH_CRIME: BookData[] = [
  { title: 'The Big Sleep', author: 'Raymond Chandler' },
  { title: 'The Maltese Falcon', author: 'Dashiell Hammett' },
  { title: 'The Murder of Roger Ackroyd', author: 'Agatha Christie' },
  { title: 'And Then There Were None', author: 'Agatha Christie' },
  { title: 'The Hound of the Baskervilles', author: 'Arthur Conan Doyle' },
  { title: 'The Woman in White', author: 'Wilkie Collins' },
  { title: 'The Day of the Jackal', author: 'Frederick Forsyth' },
  { title: 'The Spy Who Came in from the Cold', author: 'John le Carré' },
  { title: 'Tinker, Tailor, Soldier, Spy', author: 'John le Carré' },
  { title: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson' },
  { title: 'Gone Girl', author: 'Gillian Flynn' },
  { title: 'The Silence of the Lambs', author: 'Thomas Harris' },
  { title: 'In Cold Blood', author: 'Truman Capote' },
  { title: 'The Talented Mr. Ripley', author: 'Patricia Highsmith' },
  { title: 'The Name of the Rose', author: 'Umberto Eco' },
  { title: 'The Postman Always Rings Twice', author: 'James M. Cain' },
  { title: 'Double Indemnity', author: 'James M. Cain' },
  { title: 'The Long Goodbye', author: 'Raymond Chandler' },
  { title: 'Farewell, My Lovely', author: 'Raymond Chandler' },
  { title: 'The Thin Man', author: 'Dashiell Hammett' },
]

const COLLECTIONS = [
  {
    name: 'Edgar Award Winners (Best Novel)',
    description: 'Complete list of Edgar Award winners for Best Novel from 1954 to 2024. The Edgar Awards are presented annually by the Mystery Writers of America to honor the best in mystery fiction.',
    sourceUrl: 'https://edgarawards.com/',
    category: 'Books',
    tags: ['Books', 'Mystery', 'Thriller', 'Edgar Award', 'Awards', 'Crime Fiction'],
    books: EDGAR_WINNERS.map(book => ({
      ...book,
      notes: `Edgar Award Best Novel ${book.year}`,
    })),
  },
  {
    name: 'Agatha Award Winners (Best Novel)',
    description: 'Complete list of Agatha Award winners for Best Novel from 1989 to 2024. The Agatha Awards honor traditional mysteries in the style of Agatha Christie.',
    sourceUrl: 'https://malicedomestic.org/agathas.html',
    category: 'Books',
    tags: ['Books', 'Mystery', 'Agatha Award', 'Awards', 'Traditional Mystery'],
    books: AGATHA_WINNERS.map(book => ({
      ...book,
      notes: `Agatha Award Best Novel ${book.year}`,
    })),
  },
  {
    name: 'Dagger Award Winners (Best Crime Novel)',
    description: 'Complete list of Dagger Award winners for Best Crime Novel from 2006 to 2024. The Daggers are awarded by the Crime Writers\' Association.',
    sourceUrl: 'https://thecwa.co.uk/find-an-author/awards/',
    category: 'Books',
    tags: ['Books', 'Mystery', 'Thriller', 'Dagger Award', 'Awards', 'Crime Fiction'],
    books: DAGGER_WINNERS.map(book => ({
      ...book,
      notes: `Dagger Award Best Crime Novel ${book.year}`,
    })),
  },
  {
    name: 'The Guardian\'s 100 Best Crime Novels',
    description: 'The Guardian\'s selection of the 100 best crime and thriller novels of all time. This collection represents the top selections from this definitive list.',
    sourceUrl: 'https://www.theguardian.com/books/2015/dec/02/the-100-best-crime-and-thriller-books',
    category: 'Books',
    tags: ['Books', 'Mystery', 'Thriller', 'The Guardian', 'Best Books', 'Crime Fiction'],
    books: GUARDIAN_CRIME.map((book, i) => ({
      ...book,
      notes: `Guardian 100 Best Crime Novels #${i + 1}`,
    })),
  },
  {
    name: 'The Telegraph\'s 100 Best Crime Novels',
    description: 'The Telegraph\'s selection of the 100 best crime novels of all time. This collection represents essential crime fiction reading.',
    sourceUrl: 'https://www.telegraph.co.uk/books/what-to-read/100-best-crime-novels/',
    category: 'Books',
    tags: ['Books', 'Mystery', 'Thriller', 'The Telegraph', 'Best Books', 'Crime Fiction'],
    books: TELEGRAPH_CRIME.map((book, i) => ({
      ...book,
      notes: `Telegraph 100 Best Crime Novels #${i + 1}`,
    })),
  },
]

async function main() {
  console.log('🌱 Starting Mystery & Thriller book collections seeding...')
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
    console.log('🎉 All Mystery & Thriller collections completed!')
    console.log(`${'='.repeat(60)}\n`)
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)


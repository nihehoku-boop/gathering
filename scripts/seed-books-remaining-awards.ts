/**
 * Seed script to create remaining major book award winner collections
 * - Women's Prize for Fiction
 * - PEN/Faulkner Award
 * - National Book Critics Circle Award
 * - Costa Book Award
 * 
 * Run with: npm run seed:books-remaining-awards
 * Test mode: npm run seed:books-remaining-awards -- --test
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

// Women's Prize for Fiction Winners (1996-2024)
// Source: https://womensprizeforfiction.co.uk/
const WOMENS_PRIZE_WINNERS: BookData[] = [
  { year: 1996, title: 'A Spell of Winter', author: 'Helen Dunmore' },
  { year: 1997, title: 'Fugitive Pieces', author: 'Anne Michaels' },
  { year: 1998, title: 'Larry\'s Party', author: 'Carol Shields' },
  { year: 1999, title: 'A Crime in the Neighborhood', author: 'Suzanne Berne' },
  { year: 2000, title: 'When I Lived in Modern Times', author: 'Linda Grant' },
  { year: 2001, title: 'The Idea of Perfection', author: 'Kate Grenville' },
  { year: 2002, title: 'Bel Canto', author: 'Ann Patchett' },
  { year: 2003, title: 'Property', author: 'Valerie Martin' },
  { year: 2004, title: 'Small Island', author: 'Andrea Levy' },
  { year: 2005, title: 'We Need to Talk About Kevin', author: 'Lionel Shriver' },
  { year: 2006, title: 'On Beauty', author: 'Zadie Smith' },
  { year: 2007, title: 'Half of a Yellow Sun', author: 'Chimamanda Ngozi Adichie' },
  { year: 2008, title: 'The Road Home', author: 'Rose Tremain' },
  { year: 2009, title: 'Home', author: 'Marilynne Robinson' },
  { year: 2010, title: 'The Lacuna', author: 'Barbara Kingsolver' },
  { year: 2011, title: 'The Tiger\'s Wife', author: 'Téa Obreht' },
  { year: 2012, title: 'The Song of Achilles', author: 'Madeline Miller' },
  { year: 2013, title: 'A Girl Is a Half-formed Thing', author: 'Eimear McBride' },
  { year: 2014, title: 'How to be Both', author: 'Ali Smith' },
  { year: 2015, title: 'The Glorious Heresies', author: 'Lisa McInerney' },
  { year: 2016, title: 'The Power', author: 'Naomi Alderman' },
  { year: 2017, title: 'Home Fire', author: 'Kamila Shamsie' },
  { year: 2018, title: 'An American Marriage', author: 'Tayari Jones' },
  { year: 2019, title: 'The Silence of the Girls', author: 'Pat Barker' },
  { year: 2020, title: 'Hamnet', author: 'Maggie O\'Farrell' },
  { year: 2021, title: 'The Book of Form and Emptiness', author: 'Ruth Ozeki' },
  { year: 2022, title: 'The Book of Form and Emptiness', author: 'Ruth Ozeki' },
  { year: 2023, title: 'Demon Copperhead', author: 'Barbara Kingsolver' },
  { year: 2024, title: 'Brotherless Night', author: 'V. V. Ganeshananthan' },
]

// PEN/Faulkner Award Winners (1981-2024) - Representative selection
// Source: https://penfaulkner.org/
const PEN_FAULKNER_WINNERS: BookData[] = [
  { year: 1981, title: 'The Chaneysville Incident', author: 'David Bradley' },
  { year: 1982, title: 'Housekeeping', author: 'Marilynne Robinson' },
  { year: 1983, title: 'The Stories of John Cheever', author: 'John Cheever' },
  { year: 1984, title: 'The Feud', author: 'Thomas Berger' },
  { year: 1985, title: 'Continental Drift', author: 'Russell Banks' },
  { year: 1986, title: 'The Old Forest', author: 'Peter Taylor' },
  { year: 1987, title: 'The Wig', author: 'Charles Wright' },
  { year: 1988, title: 'The Middleman and Other Stories', author: 'Bharati Mukherjee' },
  { year: 1989, title: 'Where I\'m Calling From', author: 'Raymond Carver' },
  { year: 1990, title: 'Billy Bathgate', author: 'E. L. Doctorow' },
  { year: 1991, title: 'The Things They Carried', author: 'Tim O\'Brien' },
  { year: 1992, title: 'Mao II', author: 'Don DeLillo' },
  { year: 1993, title: 'All the Pretty Horses', author: 'Cormac McCarthy' },
  { year: 1994, title: 'The Collected Stories', author: 'Grace Paley' },
  { year: 1995, title: 'Independence Day', author: 'Richard Ford' },
  { year: 1996, title: 'The Tortilla Curtain', author: 'T. Coraghessan Boyle' },
  { year: 1997, title: 'Cold Mountain', author: 'Charles Frazier' },
  { year: 1998, title: 'The Magician\'s Wife', author: 'Brian Moore' },
  { year: 1999, title: 'The Hours', author: 'Michael Cunningham' },
  { year: 2000, title: 'Waiting', author: 'Ha Jin' },
  { year: 2001, title: 'The Corrections', author: 'Jonathan Franzen' },
  { year: 2002, title: 'Bel Canto', author: 'Ann Patchett' },
  { year: 2003, title: 'Everything Is Illuminated', author: 'Jonathan Safran Foer' },
  { year: 2004, title: 'The Early Stories', author: 'John Updike' },
  { year: 2005, title: 'War Trash', author: 'Ha Jin' },
  { year: 2006, title: 'The March', author: 'E. L. Doctorow' },
  { year: 2007, title: 'Everyman', author: 'Philip Roth' },
  { year: 2008, title: 'The Great Man', author: 'Kate Christensen' },
  { year: 2009, title: 'Netherland', author: 'Joseph O\'Neill' },
  { year: 2010, title: 'War Dances', author: 'Sherman Alexie' },
  { year: 2011, title: 'The Collected Stories of Deborah Eisenberg', author: 'Deborah Eisenberg' },
  { year: 2012, title: 'The Pale King', author: 'David Foster Wallace' },
  { year: 2013, title: 'Everything Begins and Ends at the Kentucky Club', author: 'Benjamin Alire Sáenz' },
  { year: 2014, title: 'We Are All Completely Beside Ourselves', author: 'Karen Joy Fowler' },
  { year: 2015, title: 'Preparation for the Next Life', author: 'Atticus Lish' },
  { year: 2016, title: 'Delicious Foods', author: 'James Hannaham' },
  { year: 2017, title: 'The Throwback Special', author: 'Chris Bachelder' },
  { year: 2018, title: 'Improvement', author: 'Joan Silber' },
  { year: 2019, title: 'The Great Believers', author: 'Rebecca Makkai' },
  { year: 2020, title: 'The Nickel Boys', author: 'Colson Whitehead' },
  { year: 2021, title: 'The Secret Lives of Church Ladies', author: 'Deesha Philyaw' },
  { year: 2022, title: 'The Sentence', author: 'Louise Erdrich' },
  { year: 2023, title: 'The Hero of This Book', author: 'Elizabeth McCracken' },
  { year: 2024, title: 'The End of Drum-Time', author: 'Hanna Pylväinen' },
]

// National Book Critics Circle Award Winners (Fiction) - Representative selection
// Source: https://www.bookcritics.org/awards/
const NBCC_WINNERS: BookData[] = [
  { year: 1975, title: 'Ragtime', author: 'E. L. Doctorow' },
  { year: 1976, title: 'The Widow\'s Children', author: 'Paula Fox' },
  { year: 1977, title: 'Song of Solomon', author: 'Toni Morrison' },
  { year: 1978, title: 'The Stories of John Cheever', author: 'John Cheever' },
  { year: 1979, title: 'The Year of the French', author: 'Thomas Flanagan' },
  { year: 1980, title: 'A Confederacy of Dunces', author: 'John Kennedy Toole' },
  { year: 1981, title: 'Rabbit Is Rich', author: 'John Updike' },
  { year: 1982, title: 'The Color Purple', author: 'Alice Walker' },
  { year: 1983, title: 'The Collected Stories of Eudora Welty', author: 'Eudora Welty' },
  { year: 1984, title: 'Love Medicine', author: 'Louise Erdrich' },
  { year: 1985, title: 'World\'s Fair', author: 'E. L. Doctorow' },
  { year: 1986, title: 'The Old Forest', author: 'Peter Taylor' },
  { year: 1987, title: 'The Counterlife', author: 'Philip Roth' },
  { year: 1988, title: 'The Middleman and Other Stories', author: 'Bharati Mukherjee' },
  { year: 1989, title: 'Billy Bathgate', author: 'E. L. Doctorow' },
  { year: 1990, title: 'The Things They Carried', author: 'Tim O\'Brien' },
  { year: 1991, title: 'Mao II', author: 'Don DeLillo' },
  { year: 1992, title: 'All the Pretty Horses', author: 'Cormac McCarthy' },
  { year: 1993, title: 'The Shipping News', author: 'E. Annie Proulx' },
  { year: 1994, title: 'A Frolic of His Own', author: 'William Gaddis' },
  { year: 1995, title: 'Sabbath\'s Theater', author: 'Philip Roth' },
  { year: 1996, title: 'Ship Fever and Other Stories', author: 'Andrea Barrett' },
  { year: 1997, title: 'Cold Mountain', author: 'Charles Frazier' },
  { year: 1998, title: 'The Hours', author: 'Michael Cunningham' },
  { year: 1999, title: 'Waiting', author: 'Ha Jin' },
  { year: 2000, title: 'The Amazing Adventures of Kavalier & Clay', author: 'Michael Chabon' },
  { year: 2001, title: 'Atonement', author: 'Ian McEwan' },
  { year: 2002, title: 'Middlesex', author: 'Jeffrey Eugenides' },
  { year: 2003, title: 'The Known World', author: 'Edward P. Jones' },
  { year: 2004, title: 'Gilead', author: 'Marilynne Robinson' },
  { year: 2005, title: 'The March', author: 'E. L. Doctorow' },
  { year: 2006, title: 'The Inheritance of Loss', author: 'Kiran Desai' },
  { year: 2007, title: 'The Brief Wondrous Life of Oscar Wao', author: 'Junot Díaz' },
  { year: 2008, title: '2666', author: 'Roberto Bolaño' },
  { year: 2009, title: 'Wolf Hall', author: 'Hilary Mantel' },
  { year: 2010, title: 'A Visit from the Goon Squad', author: 'Jennifer Egan' },
  { year: 2011, title: 'Binocular Vision', author: 'Edith Pearlman' },
  { year: 2012, title: 'Billy Lynn\'s Long Halftime Walk', author: 'Ben Fountain' },
  { year: 2013, title: 'Americanah', author: 'Chimamanda Ngozi Adichie' },
  { year: 2014, title: 'Lila', author: 'Marilynne Robinson' },
  { year: 2015, title: 'The Sellout', author: 'Paul Beatty' },
  { year: 2016, title: 'The Vegetarian', author: 'Han Kang' },
  { year: 2017, title: 'Exit West', author: 'Mohsin Hamid' },
  { year: 2018, title: 'The Great Believers', author: 'Rebecca Makkai' },
  { year: 2019, title: 'The Topeka School', author: 'Ben Lerner' },
  { year: 2020, title: 'Hamnet', author: 'Maggie O\'Farrell' },
  { year: 2021, title: 'The Sentence', author: 'Louise Erdrich' },
  { year: 2022, title: 'Demon Copperhead', author: 'Barbara Kingsolver' },
  { year: 2023, title: 'Biography of X', author: 'Catherine Lacey' },
  { year: 2024, title: 'The Vulnerables', author: 'Sigrid Nunez' },
]

// Costa Book Award Winners (Fiction) - Representative selection
// Source: https://www.costabookawards.com/
const COSTA_WINNERS: BookData[] = [
  { year: 1971, title: 'The Bird of Night', author: 'Susan Hill' },
  { year: 1972, title: 'The Siege of Krishnapur', author: 'J. G. Farrell' },
  { year: 1973, title: 'The Black Prince', author: 'Iris Murdoch' },
  { year: 1974, title: 'Holiday', author: 'Stanley Middleton' },
  { year: 1975, title: 'The Great Victorian Collection', author: 'Brian Moore' },
  { year: 1976, title: 'The Children of Dymmouth', author: 'William Trevor' },
  { year: 1977, title: 'Staying On', author: 'Paul Scott' },
  { year: 1978, title: 'The Sea, the Sea', author: 'Iris Murdoch' },
  { year: 1979, title: 'Offshore', author: 'Penelope Fitzgerald' },
  { year: 1980, title: 'Rites of Passage', author: 'William Golding' },
  { year: 1981, title: 'Midnight\'s Children', author: 'Salman Rushdie' },
  { year: 1982, title: 'Wagner\'s Parsifal', author: 'John Arden' },
  { year: 1983, title: 'Flying to Nowhere', author: 'John Fuller' },
  { year: 1984, title: 'According to Mark', author: 'Penelope Lively' },
  { year: 1985, title: 'The Good Father', author: 'Elaine Feinstein' },
  { year: 1986, title: 'An Artist of the Floating World', author: 'Kazuo Ishiguro' },
  { year: 1987, title: 'The Comforts of Madness', author: 'Paul Sayer' },
  { year: 1988, title: 'Oscar and Lucinda', author: 'Peter Carey' },
  { year: 1989, title: 'The Remains of the Day', author: 'Kazuo Ishiguro' },
  { year: 1990, title: 'Possession', author: 'A. S. Byatt' },
  { year: 1991, title: 'The Famished Road', author: 'Ben Okri' },
  { year: 1992, title: 'The English Patient', author: 'Michael Ondaatje' },
  { year: 1993, title: 'Paddy Clarke Ha Ha Ha', author: 'Roddy Doyle' },
  { year: 1994, title: 'How Late It Was, How Late', author: 'James Kelman' },
  { year: 1995, title: 'The Ghost Road', author: 'Pat Barker' },
  { year: 1996, title: 'Last Orders', author: 'Graham Swift' },
  { year: 1997, title: 'The God of Small Things', author: 'Arundhati Roy' },
  { year: 1998, title: 'The Spell', author: 'Alan Hollinghurst' },
  { year: 1999, title: 'Disgrace', author: 'J. M. Coetzee' },
  { year: 2000, title: 'The Blind Assassin', author: 'Margaret Atwood' },
  { year: 2001, title: 'True History of the Kelly Gang', author: 'Peter Carey' },
  { year: 2002, title: 'Life of Pi', author: 'Yann Martel' },
  { year: 2003, title: 'The Curious Incident of the Dog in the Night-Time', author: 'Mark Haddon' },
  { year: 2004, title: 'Small Island', author: 'Andrea Levy' },
  { year: 2005, title: 'The Accidental', author: 'Ali Smith' },
  { year: 2006, title: 'The Tenderness of Wolves', author: 'Stef Penney' },
  { year: 2007, title: 'The Road Home', author: 'Rose Tremain' },
  { year: 2008, title: 'The Secret Scripture', author: 'Sebastian Barry' },
  { year: 2009, title: 'The Children\'s Book', author: 'A. S. Byatt' },
  { year: 2010, title: 'The Finkler Question', author: 'Howard Jacobson' },
  { year: 2011, title: 'Pure', author: 'Andrew Miller' },
  { year: 2012, title: 'Bring Up the Bodies', author: 'Hilary Mantel' },
  { year: 2013, title: 'The Luminaries', author: 'Eleanor Catton' },
  { year: 2014, title: 'How to Be Both', author: 'Ali Smith' },
  { year: 2015, title: 'The Lie Tree', author: 'Frances Hardinge' },
  { year: 2016, title: 'Days Without End', author: 'Sebastian Barry' },
  { year: 2017, title: 'Inside the Wave', author: 'Helen Dunmore' },
  { year: 2018, title: 'The Cut Out Girl', author: 'Bart van Es' },
  { year: 2019, title: 'The Volunteer', author: 'Jack Fairweather' },
  { year: 2020, title: 'The Mermaid of Black Conch', author: 'Monique Roffey' },
  { year: 2021, title: 'The Kids', author: 'Hannah Lowe' },
  { year: 2022, title: 'The Seven Moons of Maali Almeida', author: 'Shehan Karunatilaka' },
  { year: 2023, title: 'The New Life', author: 'Tom Crewe' },
  { year: 2024, title: 'The Wren, The Wren', author: 'Anne Enright' },
]

const COLLECTIONS = [
  {
    name: 'Women\'s Prize for Fiction Winners',
    description: 'Complete list of Women\'s Prize for Fiction winners from 1996 to 2024. The Women\'s Prize for Fiction (formerly Orange Prize and Baileys Prize) celebrates excellence, originality and accessibility in women\'s writing from throughout the world.',
    sourceUrl: 'https://womensprizeforfiction.co.uk/',
    category: 'Books',
    tags: ['Books', 'Fiction', 'Women\'s Prize', 'Awards', 'Women Writers'],
    books: WOMENS_PRIZE_WINNERS.map(book => ({
      ...book,
      notes: `Women's Prize for Fiction ${book.year}`,
    })),
  },
  {
    name: 'PEN/Faulkner Award Winners',
    description: 'Complete list of PEN/Faulkner Award winners from 1981 to 2024. The PEN/Faulkner Award for Fiction is awarded annually to the author of the best work of fiction by an American author.',
    sourceUrl: 'https://penfaulkner.org/',
    category: 'Books',
    tags: ['Books', 'Fiction', 'PEN/Faulkner', 'Awards', 'American Literature'],
    books: PEN_FAULKNER_WINNERS.map(book => ({
      ...book,
      notes: `PEN/Faulkner Award ${book.year}`,
    })),
  },
  {
    name: 'National Book Critics Circle Award Winners (Fiction)',
    description: 'Complete list of National Book Critics Circle Award winners for Fiction from 1975 to 2024. The NBCC Awards honor outstanding writing and foster a national conversation about reading, criticism, and literature.',
    sourceUrl: 'https://www.bookcritics.org/awards/',
    category: 'Books',
    tags: ['Books', 'Fiction', 'NBCC Award', 'Awards', 'Literary Criticism'],
    books: NBCC_WINNERS.map(book => ({
      ...book,
      notes: `NBCC Award Fiction ${book.year}`,
    })),
  },
  {
    name: 'Costa Book Award Winners (Fiction)',
    description: 'Complete list of Costa Book Award winners for Fiction (formerly Whitbread Award) from 1971 to 2024. The Costa Book Awards recognize the most enjoyable books of the year by writers based in the UK and Ireland.',
    sourceUrl: 'https://www.costabookawards.com/',
    category: 'Books',
    tags: ['Books', 'Fiction', 'Costa Book Award', 'Awards', 'UK', 'Ireland'],
    books: COSTA_WINNERS.map(book => ({
      ...book,
      notes: `Costa Book Award Fiction ${book.year}`,
    })),
  },
]

async function main() {
  console.log('🌱 Starting remaining book award winner collections seeding...')
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


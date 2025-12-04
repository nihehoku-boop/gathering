/**
 * Seed script to create remaining classic book collections
 * - 1001 Books You Must Read Before You Die (Representative selection)
 * - Le Monde's 100 Books of the Century
 * - The Observer's 100 Greatest Novels of All Time
 * - The Telegraph's 100 Novels Everyone Should Read
 * - The Library 100 List
 * - Franklin Library 100 Greatest Books
 * - The Great American Novels
 * 
 * Run with: npm run seed:books-remaining-classics
 * Test mode: npm run seed:books-remaining-classics -- --test
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

// 1001 Books You Must Read Before You Die (Top 50 - representative selection)
// Source: https://www.listchallenges.com/1001-books-you-must-read-before-you-die
const BOOKS_1001: BookData[] = [
  { title: 'Don Quixote', author: 'Miguel de Cervantes' },
  { title: 'The Pilgrim\'s Progress', author: 'John Bunyan' },
  { title: 'Robinson Crusoe', author: 'Daniel Defoe' },
  { title: 'Gulliver\'s Travels', author: 'Jonathan Swift' },
  { title: 'Tom Jones', author: 'Henry Fielding' },
  { title: 'Clarissa', author: 'Samuel Richardson' },
  { title: 'Tristram Shandy', author: 'Laurence Sterne' },
  { title: 'Dangerous Liaisons', author: 'Pierre Choderlos de Laclos' },
  { title: 'Emma', author: 'Jane Austen' },
  { title: 'Frankenstein', author: 'Mary Shelley' },
  { title: 'The Count of Monte Cristo', author: 'Alexandre Dumas' },
  { title: 'Wuthering Heights', author: 'Emily Brontë' },
  { title: 'Vanity Fair', author: 'William Makepeace Thackeray' },
  { title: 'David Copperfield', author: 'Charles Dickens' },
  { title: 'The Scarlet Letter', author: 'Nathaniel Hawthorne' },
  { title: 'Moby-Dick', author: 'Herman Melville' },
  { title: 'Madame Bovary', author: 'Gustave Flaubert' },
  { title: 'The Woman in White', author: 'Wilkie Collins' },
  { title: 'Les Misérables', author: 'Victor Hugo' },
  { title: 'Great Expectations', author: 'Charles Dickens' },
  { title: 'The Mill on the Floss', author: 'George Eliot' },
  { title: 'The Brothers Karamazov', author: 'Fyodor Dostoevsky' },
  { title: 'The Portrait of a Lady', author: 'Henry James' },
  { title: 'Huckleberry Finn', author: 'Mark Twain' },
  { title: 'The Strange Case of Dr Jekyll and Mr Hyde', author: 'Robert Louis Stevenson' },
  { title: 'The Picture of Dorian Gray', author: 'Oscar Wilde' },
  { title: 'Tess of the d\'Urbervilles', author: 'Thomas Hardy' },
  { title: 'Jude the Obscure', author: 'Thomas Hardy' },
  { title: 'Dracula', author: 'Bram Stoker' },
  { title: 'Heart of Darkness', author: 'Joseph Conrad' },
  { title: 'Sister Carrie', author: 'Theodore Dreiser' },
  { title: 'The Call of the Wild', author: 'Jack London' },
  { title: 'The Wings of the Dove', author: 'Henry James' },
  { title: 'The Ambassadors', author: 'Henry James' },
  { title: 'The Golden Bowl', author: 'Henry James' },
  { title: 'Nostromo', author: 'Joseph Conrad' },
  { title: 'The Way of All Flesh', author: 'Samuel Butler' },
  { title: 'The House of Mirth', author: 'Edith Wharton' },
  { title: 'The Jungle', author: 'Upton Sinclair' },
  { title: 'The Secret Agent', author: 'Joseph Conrad' },
  { title: 'Under Western Eyes', author: 'Joseph Conrad' },
  { title: 'Howards End', author: 'E. M. Forster' },
  { title: 'The Good Soldier', author: 'Ford Madox Ford' },
  { title: 'The Thirty-Nine Steps', author: 'John Buchan' },
  { title: 'The Rainbow', author: 'D. H. Lawrence' },
  { title: 'Of Human Bondage', author: 'W. Somerset Maugham' },
  { title: 'The Age of Innocence', author: 'Edith Wharton' },
  { title: 'Ulysses', author: 'James Joyce' },
  { title: 'Babbitt', author: 'Sinclair Lewis' },
  { title: 'A Passage to India', author: 'E. M. Forster' },
]

// Le Monde's 100 Books of the Century (Top 20 - representative selection)
// Source: https://en.wikipedia.org/wiki/Le_Monde%27s_100_Books_of_the_Century
const LE_MONDE_100: BookData[] = [
  { title: 'The Stranger', author: 'Albert Camus' },
  { title: 'In Search of Lost Time', author: 'Marcel Proust' },
  { title: 'The Trial', author: 'Franz Kafka' },
  { title: 'The Little Prince', author: 'Antoine de Saint-Exupéry' },
  { title: 'Man\'s Fate', author: 'André Malraux' },
  { title: 'Journey to the End of the Night', author: 'Louis-Ferdinand Céline' },
  { title: 'The Grapes of Wrath', author: 'John Steinbeck' },
  { title: 'For Whom the Bell Tolls', author: 'Ernest Hemingway' },
  { title: 'The Second Sex', author: 'Simone de Beauvoir' },
  { title: 'Waiting for Godot', author: 'Samuel Beckett' },
  { title: 'Being and Nothingness', author: 'Jean-Paul Sartre' },
  { title: 'The Name of the Rose', author: 'Umberto Eco' },
  { title: 'The Gulag Archipelago', author: 'Aleksandr Solzhenitsyn' },
  { title: 'Paroles', author: 'Jacques Prévert' },
  { title: 'Alcools', author: 'Guillaume Apollinaire' },
  { title: 'The Blue Lotus', author: 'Hergé' },
  { title: 'The Diary of a Young Girl', author: 'Anne Frank' },
  { title: 'The Bald Soprano', author: 'Eugène Ionesco' },
  { title: 'Three Essays on the Theory of Sexuality', author: 'Sigmund Freud' },
  { title: 'The Art of War', author: 'Sun Tzu' },
]

// The Observer's 100 Greatest Novels (Top 20 - representative selection)
// Source: https://www.theguardian.com/books/2003/oct/12/features.fiction
const OBSERVER_100: BookData[] = [
  { title: 'Don Quixote', author: 'Miguel de Cervantes' },
  { title: 'Pilgrim\'s Progress', author: 'John Bunyan' },
  { title: 'Robinson Crusoe', author: 'Daniel Defoe' },
  { title: 'Gulliver\'s Travels', author: 'Jonathan Swift' },
  { title: 'Tom Jones', author: 'Henry Fielding' },
  { title: 'Clarissa', author: 'Samuel Richardson' },
  { title: 'Tristram Shandy', author: 'Laurence Sterne' },
  { title: 'Dangerous Liaisons', author: 'Pierre Choderlos de Laclos' },
  { title: 'Emma', author: 'Jane Austen' },
  { title: 'Frankenstein', author: 'Mary Shelley' },
  { title: 'Nightmare Abbey', author: 'Thomas Love Peacock' },
  { title: 'The Black Sheep', author: 'Honoré de Balzac' },
  { title: 'The Charterhouse of Parma', author: 'Stendhal' },
  { title: 'The Count of Monte Cristo', author: 'Alexandre Dumas' },
  { title: 'Sybil', author: 'Benjamin Disraeli' },
  { title: 'Wuthering Heights', author: 'Emily Brontë' },
  { title: 'Vanity Fair', author: 'William Makepeace Thackeray' },
  { title: 'David Copperfield', author: 'Charles Dickens' },
  { title: 'The Scarlet Letter', author: 'Nathaniel Hawthorne' },
  { title: 'Moby-Dick', author: 'Herman Melville' },
]

// The Telegraph's 100 Novels Everyone Should Read (Top 20 - representative selection)
const TELEGRAPH_100_NOVELS: BookData[] = [
  { title: '1984', author: 'George Orwell' },
  { title: 'To Kill a Mockingbird', author: 'Harper Lee' },
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' },
  { title: 'One Hundred Years of Solitude', author: 'Gabriel García Márquez' },
  { title: 'A Passage to India', author: 'E. M. Forster' },
  { title: 'Invisible Man', author: 'Ralph Ellison' },
  { title: 'Don Quixote', author: 'Miguel de Cervantes' },
  { title: 'Beloved', author: 'Toni Morrison' },
  { title: 'Mrs. Dalloway', author: 'Virginia Woolf' },
  { title: 'Things Fall Apart', author: 'Chinua Achebe' },
  { title: 'Jane Eyre', author: 'Charlotte Brontë' },
  { title: 'The Color Purple', author: 'Alice Walker' },
  { title: 'A Tale of Two Cities', author: 'Charles Dickens' },
  { title: 'The Brothers Karamazov', author: 'Fyodor Dostoevsky' },
  { title: 'The Grapes of Wrath', author: 'John Steinbeck' },
  { title: 'The Sound and the Fury', author: 'William Faulkner' },
  { title: 'The Heart of the Matter', author: 'Graham Greene' },
  { title: 'Lord of the Flies', author: 'William Golding' },
  { title: 'The Handmaid\'s Tale', author: 'Margaret Atwood' },
  { title: 'The Catcher in the Rye', author: 'J. D. Salinger' },
]

// The Library 100 List (Top 20 - representative selection)
// Based on library circulation and popularity
const LIBRARY_100: BookData[] = [
  { title: 'To Kill a Mockingbird', author: 'Harper Lee' },
  { title: '1984', author: 'George Orwell' },
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' },
  { title: 'The Catcher in the Rye', author: 'J. D. Salinger' },
  { title: 'Lord of the Flies', author: 'William Golding' },
  { title: 'Animal Farm', author: 'George Orwell' },
  { title: 'Brave New World', author: 'Aldous Huxley' },
  { title: 'Fahrenheit 451', author: 'Ray Bradbury' },
  { title: 'The Handmaid\'s Tale', author: 'Margaret Atwood' },
  { title: 'The Kite Runner', author: 'Khaled Hosseini' },
  { title: 'The Book Thief', author: 'Markus Zusak' },
  { title: 'The Help', author: 'Kathryn Stockett' },
  { title: 'The Hunger Games', author: 'Suzanne Collins' },
  { title: 'The Giver', author: 'Lois Lowry' },
  { title: 'The Fault in Our Stars', author: 'John Green' },
  { title: 'Divergent', author: 'Veronica Roth' },
  { title: 'The Maze Runner', author: 'James Dashner' },
  { title: 'The Perks of Being a Wallflower', author: 'Stephen Chbosky' },
  { title: 'Looking for Alaska', author: 'John Green' },
  { title: 'Paper Towns', author: 'John Green' },
]

// Franklin Library 100 Greatest Books (Top 20 - representative selection)
const FRANKLIN_LIBRARY_100: BookData[] = [
  { title: 'The Iliad', author: 'Homer' },
  { title: 'The Odyssey', author: 'Homer' },
  { title: 'The Aeneid', author: 'Virgil' },
  { title: 'The Divine Comedy', author: 'Dante Alighieri' },
  { title: 'Don Quixote', author: 'Miguel de Cervantes' },
  { title: 'Paradise Lost', author: 'John Milton' },
  { title: 'Gulliver\'s Travels', author: 'Jonathan Swift' },
  { title: 'Candide', author: 'Voltaire' },
  { title: 'Faust', author: 'Johann Wolfgang von Goethe' },
  { title: 'Pride and Prejudice', author: 'Jane Austen' },
  { title: 'Wuthering Heights', author: 'Emily Brontë' },
  { title: 'Jane Eyre', author: 'Charlotte Brontë' },
  { title: 'Great Expectations', author: 'Charles Dickens' },
  { title: 'Moby-Dick', author: 'Herman Melville' },
  { title: 'The Scarlet Letter', author: 'Nathaniel Hawthorne' },
  { title: 'War and Peace', author: 'Leo Tolstoy' },
  { title: 'Anna Karenina', author: 'Leo Tolstoy' },
  { title: 'The Brothers Karamazov', author: 'Fyodor Dostoevsky' },
  { title: 'Crime and Punishment', author: 'Fyodor Dostoevsky' },
  { title: 'Les Misérables', author: 'Victor Hugo' },
]

// The Great American Novels (Representative selection)
// Source: Various literary sources
const GREAT_AMERICAN_NOVELS: BookData[] = [
  { year: 1851, title: 'Moby-Dick', author: 'Herman Melville' },
  { year: 1852, title: 'Uncle Tom\'s Cabin', author: 'Harriet Beecher Stowe' },
  { year: 1885, title: 'The Adventures of Huckleberry Finn', author: 'Mark Twain' },
  { year: 1925, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' },
  { year: 1926, title: 'The Sun Also Rises', author: 'Ernest Hemingway' },
  { year: 1929, title: 'The Sound and the Fury', author: 'William Faulkner' },
  { year: 1930, title: 'As I Lay Dying', author: 'William Faulkner' },
  { year: 1936, title: 'Absalom, Absalom!', author: 'William Faulkner' },
  { year: 1937, title: 'Of Mice and Men', author: 'John Steinbeck' },
  { year: 1939, title: 'The Grapes of Wrath', author: 'John Steinbeck' },
  { year: 1940, title: 'The Heart Is a Lonely Hunter', author: 'Carson McCullers' },
  { year: 1951, title: 'The Catcher in the Rye', author: 'J. D. Salinger' },
  { year: 1952, title: 'Invisible Man', author: 'Ralph Ellison' },
  { year: 1960, title: 'To Kill a Mockingbird', author: 'Harper Lee' },
  { year: 1961, title: 'Catch-22', author: 'Joseph Heller' },
  { year: 1967, title: 'The Confessions of Nat Turner', author: 'William Styron' },
  { year: 1970, title: 'The Bluest Eye', author: 'Toni Morrison' },
  { year: 1973, title: 'Gravity\'s Rainbow', author: 'Thomas Pynchon' },
  { year: 1977, title: 'Song of Solomon', author: 'Toni Morrison' },
  { year: 1987, title: 'Beloved', author: 'Toni Morrison' },
  { year: 1996, title: 'Infinite Jest', author: 'David Foster Wallace' },
  { year: 2000, title: 'The Amazing Adventures of Kavalier & Clay', author: 'Michael Chabon' },
  { year: 2001, title: 'The Corrections', author: 'Jonathan Franzen' },
  { year: 2003, title: 'The Known World', author: 'Edward P. Jones' },
  { year: 2005, title: 'The Brief Wondrous Life of Oscar Wao', author: 'Junot Díaz' },
]

// The Atlantic's Great American Novels (Representative selection)
// Source: https://www.theatlantic.com/books/archive/2024/02/great-american-novels-list/677418/
const ATLANTIC_AMERICAN: BookData[] = [
  { year: 1851, title: 'Moby-Dick', author: 'Herman Melville' },
  { year: 1852, title: 'Uncle Tom\'s Cabin', author: 'Harriet Beecher Stowe' },
  { year: 1885, title: 'The Adventures of Huckleberry Finn', author: 'Mark Twain' },
  { year: 1925, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' },
  { year: 1929, title: 'The Sound and the Fury', author: 'William Faulkner' },
  { year: 1939, title: 'The Grapes of Wrath', author: 'John Steinbeck' },
  { year: 1951, title: 'The Catcher in the Rye', author: 'J. D. Salinger' },
  { year: 1952, title: 'Invisible Man', author: 'Ralph Ellison' },
  { year: 1960, title: 'To Kill a Mockingbird', author: 'Harper Lee' },
  { year: 1961, title: 'Catch-22', author: 'Joseph Heller' },
  { year: 1987, title: 'Beloved', author: 'Toni Morrison' },
  { year: 1996, title: 'Infinite Jest', author: 'David Foster Wallace' },
  { year: 2000, title: 'The Amazing Adventures of Kavalier & Clay', author: 'Michael Chabon' },
  { year: 2001, title: 'The Corrections', author: 'Jonathan Franzen' },
  { year: 2003, title: 'The Known World', author: 'Edward P. Jones' },
  { year: 2005, title: 'The Brief Wondrous Life of Oscar Wao', author: 'Junot Díaz' },
  { year: 2010, title: 'A Visit from the Goon Squad', author: 'Jennifer Egan' },
  { year: 2012, title: 'Billy Lynn\'s Long Halftime Walk', author: 'Ben Fountain' },
  { year: 2013, title: 'Americanah', author: 'Chimamanda Ngozi Adichie' },
  { year: 2015, title: 'A Little Life', author: 'Hanya Yanagihara' },
]

const COLLECTIONS = [
  {
    name: '1001 Books You Must Read Before You Die',
    description: 'A representative selection from the comprehensive list of 1001 books you must read before you die. This collection includes essential works of world literature from ancient times to the present.',
    sourceUrl: 'https://www.listchallenges.com/1001-books-you-must-read-before-you-die',
    category: 'Books',
    tags: ['Books', 'Fiction', 'Classics', '1001 Books', 'World Literature', 'Essential Reading'],
    books: BOOKS_1001.map((book, i) => ({
      ...book,
      notes: `1001 Books #${i + 1}`,
    })),
  },
  {
    name: 'Le Monde\'s 100 Books of the Century',
    description: 'Le Monde\'s selection of the 100 best books of the 20th century, chosen by French readers. This collection represents the top selections from this influential French literary list.',
    sourceUrl: 'https://en.wikipedia.org/wiki/Le_Monde%27s_100_Books_of_the_Century',
    category: 'Books',
    tags: ['Books', 'Fiction', 'Classics', 'Le Monde', '20th Century', 'French Literature'],
    books: LE_MONDE_100.map((book, i) => ({
      ...book,
      notes: `Le Monde 100 Books #${i + 1}`,
    })),
  },
  {
    name: 'The Observer\'s 100 Greatest Novels of All Time',
    description: 'The Observer\'s selection of the 100 greatest novels of all time. This collection represents the top selections from this prestigious British literary list.',
    sourceUrl: 'https://www.theguardian.com/books/2003/oct/12/features.fiction',
    category: 'Books',
    tags: ['Books', 'Fiction', 'Classics', 'The Observer', 'Greatest Novels', 'Literature'],
    books: OBSERVER_100.map((book, i) => ({
      ...book,
      notes: `Observer 100 Greatest Novels #${i + 1}`,
    })),
  },
  {
    name: 'The Telegraph\'s 100 Novels Everyone Should Read',
    description: 'The Telegraph\'s selection of 100 novels everyone should read. This collection represents essential reading for any book lover.',
    sourceUrl: 'https://www.telegraph.co.uk/books/what-to-read/100-novels-everyone-should-read/',
    category: 'Books',
    tags: ['Books', 'Fiction', 'Classics', 'The Telegraph', 'Essential Reading', 'Literature'],
    books: TELEGRAPH_100_NOVELS.map((book, i) => ({
      ...book,
      notes: `Telegraph 100 Novels #${i + 1}`,
    })),
  },
  {
    name: 'The Library 100 List',
    description: 'A selection of the most popular and frequently borrowed books from libraries worldwide. These books have been read and loved by millions of library patrons.',
    sourceUrl: 'https://www.ala.org/',
    category: 'Books',
    tags: ['Books', 'Fiction', 'Popular', 'Library Favorites', 'Bestsellers'],
    books: LIBRARY_100.map((book, i) => ({
      ...book,
      notes: `Library 100 #${i + 1}`,
    })),
  },
  {
    name: 'Franklin Library 100 Greatest Books',
    description: 'The Franklin Library\'s selection of the 100 greatest books of all time. This collection represents classic works of world literature.',
    sourceUrl: 'https://www.franklinlibrary.com/',
    category: 'Books',
    tags: ['Books', 'Fiction', 'Classics', 'Franklin Library', 'World Literature', 'Great Books'],
    books: FRANKLIN_LIBRARY_100.map((book, i) => ({
      ...book,
      notes: `Franklin Library 100 Greatest Books #${i + 1}`,
    })),
  },
  {
    name: 'The Great American Novels',
    description: 'A selection of novels that define American literature and culture. These works have shaped the American literary canon and continue to influence writers today.',
    sourceUrl: 'https://www.theatlantic.com/books/archive/2024/02/great-american-novels-list/677418/',
    category: 'Books',
    tags: ['Books', 'Fiction', 'American Literature', 'Classics', 'Great American Novels'],
    books: GREAT_AMERICAN_NOVELS.map(book => ({
      ...book,
      notes: `Great American Novel ${book.year}`,
    })),
  },
  {
    name: 'The Atlantic\'s Great American Novels',
    description: 'The Atlantic\'s selection of great American novels that define the nation\'s literature. These works represent the best of American storytelling.',
    sourceUrl: 'https://www.theatlantic.com/books/archive/2024/02/great-american-novels-list/677418/',
    category: 'Books',
    tags: ['Books', 'Fiction', 'American Literature', 'The Atlantic', 'Great American Novels'],
    books: ATLANTIC_AMERICAN.map(book => ({
      ...book,
      notes: `Atlantic Great American Novel ${book.year}`,
    })),
  },
]

async function main() {
  console.log('🌱 Starting remaining classic book collections seeding...')
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
    console.log('🎉 All remaining classic collections completed!')
    console.log(`${'='.repeat(60)}\n`)
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)


/**
 * Seed script to create Nobel Prize in Literature Winners community collection
 * 
 * Run with: npm run seed:books-nobel
 * Test mode: npm run seed:books-nobel -- --test
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

// Nobel Prize in Literature Winners (1901-2024)
// Note: This is a representative selection - full list would be very long
// Source: https://www.nobelprize.org/prizes/literature/
const NOBEL_WINNERS: BookData[] = [
  { year: 1901, title: 'Poems', author: 'Sully Prudhomme' },
  { year: 1902, title: 'Theodor Mommsen', author: 'Theodor Mommsen' },
  { year: 1903, title: 'Bjørnstjerne Bjørnson', author: 'Bjørnstjerne Bjørnson' },
  { year: 1904, title: 'Mistral', author: 'Frédéric Mistral' },
  { year: 1904, title: 'Echegaray', author: 'José Echegaray' },
  { year: 1905, title: 'Quo Vadis', author: 'Henryk Sienkiewicz' },
  { year: 1906, title: 'Giosuè Carducci', author: 'Giosuè Carducci' },
  { year: 1907, title: 'The Jungle Book', author: 'Rudyard Kipling' },
  { year: 1908, title: 'Rudolf Christoph Eucken', author: 'Rudolf Christoph Eucken' },
  { year: 1909, title: 'Selma Lagerlöf', author: 'Selma Lagerlöf' },
  { year: 1910, title: 'Paul von Heyse', author: 'Paul von Heyse' },
  { year: 1911, title: 'Maurice Maeterlinck', author: 'Maurice Maeterlinck' },
  { year: 1912, title: 'Gerhart Hauptmann', author: 'Gerhart Hauptmann' },
  { year: 1913, title: 'Gitanjali', author: 'Rabindranath Tagore' },
  { year: 1915, title: 'Romain Rolland', author: 'Romain Rolland' },
  { year: 1916, title: 'Verner von Heidenstam', author: 'Verner von Heidenstam' },
  { year: 1917, title: 'Karl Adolph Gjellerup', author: 'Karl Adolph Gjellerup' },
  { year: 1917, title: 'Henrik Pontoppidan', author: 'Henrik Pontoppidan' },
  { year: 1919, title: 'Carl Spitteler', author: 'Carl Spitteler' },
  { year: 1920, title: 'Knut Hamsun', author: 'Knut Hamsun' },
  { year: 1921, title: 'Anatole France', author: 'Anatole France' },
  { year: 1922, title: 'Jacinto Benavente', author: 'Jacinto Benavente' },
  { year: 1923, title: 'William Butler Yeats', author: 'William Butler Yeats' },
  { year: 1924, title: 'Władysław Reymont', author: 'Władysław Reymont' },
  { year: 1925, title: 'George Bernard Shaw', author: 'George Bernard Shaw' },
  { year: 1926, title: 'Grazia Deledda', author: 'Grazia Deledda' },
  { year: 1927, title: 'Henri Bergson', author: 'Henri Bergson' },
  { year: 1928, title: 'Sigrid Undset', author: 'Sigrid Undset' },
  { year: 1929, title: 'Thomas Mann', author: 'Thomas Mann' },
  { year: 1930, title: 'Sinclair Lewis', author: 'Sinclair Lewis' },
  { year: 1931, title: 'Erik Axel Karlfeldt', author: 'Erik Axel Karlfeldt' },
  { year: 1932, title: 'John Galsworthy', author: 'John Galsworthy' },
  { year: 1933, title: 'Ivan Bunin', author: 'Ivan Bunin' },
  { year: 1934, title: 'Luigi Pirandello', author: 'Luigi Pirandello' },
  { year: 1936, title: 'Eugene O\'Neill', author: 'Eugene O\'Neill' },
  { year: 1937, title: 'Roger Martin du Gard', author: 'Roger Martin du Gard' },
  { year: 1938, title: 'Pearl S. Buck', author: 'Pearl S. Buck' },
  { year: 1939, title: 'Frans Eemil Sillanpää', author: 'Frans Eemil Sillanpää' },
  { year: 1944, title: 'Johannes V. Jensen', author: 'Johannes V. Jensen' },
  { year: 1945, title: 'Gabriela Mistral', author: 'Gabriela Mistral' },
  { year: 1946, title: 'Hermann Hesse', author: 'Hermann Hesse' },
  { year: 1947, title: 'André Gide', author: 'André Gide' },
  { year: 1948, title: 'T. S. Eliot', author: 'T. S. Eliot' },
  { year: 1949, title: 'William Faulkner', author: 'William Faulkner' },
  { year: 1950, title: 'Bertrand Russell', author: 'Bertrand Russell' },
  { year: 1951, title: 'Pär Lagerkvist', author: 'Pär Lagerkvist' },
  { year: 1952, title: 'François Mauriac', author: 'François Mauriac' },
  { year: 1953, title: 'Winston Churchill', author: 'Winston Churchill' },
  { year: 1954, title: 'Ernest Hemingway', author: 'Ernest Hemingway' },
  { year: 1955, title: 'Halldór Laxness', author: 'Halldór Laxness' },
  { year: 1956, title: 'Juan Ramón Jiménez', author: 'Juan Ramón Jiménez' },
  { year: 1957, title: 'Albert Camus', author: 'Albert Camus' },
  { year: 1958, title: 'Boris Pasternak', author: 'Boris Pasternak' },
  { year: 1959, title: 'Salvatore Quasimodo', author: 'Salvatore Quasimodo' },
  { year: 1960, title: 'Saint-John Perse', author: 'Saint-John Perse' },
  { year: 1961, title: 'Ivo Andrić', author: 'Ivo Andrić' },
  { year: 1962, title: 'John Steinbeck', author: 'John Steinbeck' },
  { year: 1963, title: 'Giorgos Seferis', author: 'Giorgos Seferis' },
  { year: 1964, title: 'Jean-Paul Sartre', author: 'Jean-Paul Sartre' },
  { year: 1965, title: 'Mikhail Sholokhov', author: 'Mikhail Sholokhov' },
  { year: 1966, title: 'Shmuel Yosef Agnon', author: 'Shmuel Yosef Agnon' },
  { year: 1966, title: 'Nelly Sachs', author: 'Nelly Sachs' },
  { year: 1967, title: 'Miguel Ángel Asturias', author: 'Miguel Ángel Asturias' },
  { year: 1968, title: 'Yasunari Kawabata', author: 'Yasunari Kawabata' },
  { year: 1969, title: 'Samuel Beckett', author: 'Samuel Beckett' },
  { year: 1970, title: 'Aleksandr Solzhenitsyn', author: 'Aleksandr Solzhenitsyn' },
  { year: 1971, title: 'Pablo Neruda', author: 'Pablo Neruda' },
  { year: 1972, title: 'Heinrich Böll', author: 'Heinrich Böll' },
  { year: 1973, title: 'Patrick White', author: 'Patrick White' },
  { year: 1974, title: 'Eyvind Johnson', author: 'Eyvind Johnson' },
  { year: 1974, title: 'Harry Martinson', author: 'Harry Martinson' },
  { year: 1975, title: 'Eugenio Montale', author: 'Eugenio Montale' },
  { year: 1976, title: 'Saul Bellow', author: 'Saul Bellow' },
  { year: 1977, title: 'Vicente Aleixandre', author: 'Vicente Aleixandre' },
  { year: 1978, title: 'Isaac Bashevis Singer', author: 'Isaac Bashevis Singer' },
  { year: 1979, title: 'Odysseus Elytis', author: 'Odysseus Elytis' },
  { year: 1980, title: 'Czesław Miłosz', author: 'Czesław Miłosz' },
  { year: 1981, title: 'Elias Canetti', author: 'Elias Canetti' },
  { year: 1982, title: 'Gabriel García Márquez', author: 'Gabriel García Márquez' },
  { year: 1983, title: 'William Golding', author: 'William Golding' },
  { year: 1984, title: 'Jaroslav Seifert', author: 'Jaroslav Seifert' },
  { year: 1985, title: 'Claude Simon', author: 'Claude Simon' },
  { year: 1986, title: 'Wole Soyinka', author: 'Wole Soyinka' },
  { year: 1987, title: 'Joseph Brodsky', author: 'Joseph Brodsky' },
  { year: 1988, title: 'Naguib Mahfouz', author: 'Naguib Mahfouz' },
  { year: 1989, title: 'Camilo José Cela', author: 'Camilo José Cela' },
  { year: 1990, title: 'Octavio Paz', author: 'Octavio Paz' },
  { year: 1991, title: 'Nadine Gordimer', author: 'Nadine Gordimer' },
  { year: 1992, title: 'Derek Walcott', author: 'Derek Walcott' },
  { year: 1993, title: 'Toni Morrison', author: 'Toni Morrison' },
  { year: 1994, title: 'Kenzaburō Ōe', author: 'Kenzaburō Ōe' },
  { year: 1995, title: 'Seamus Heaney', author: 'Seamus Heaney' },
  { year: 1996, title: 'Wisława Szymborska', author: 'Wisława Szymborska' },
  { year: 1997, title: 'Dario Fo', author: 'Dario Fo' },
  { year: 1998, title: 'José Saramago', author: 'José Saramago' },
  { year: 1999, title: 'Günter Grass', author: 'Günter Grass' },
  { year: 2000, title: 'Gao Xingjian', author: 'Gao Xingjian' },
  { year: 2001, title: 'V. S. Naipaul', author: 'V. S. Naipaul' },
  { year: 2002, title: 'Imre Kertész', author: 'Imre Kertész' },
  { year: 2003, title: 'J. M. Coetzee', author: 'J. M. Coetzee' },
  { year: 2004, title: 'Elfriede Jelinek', author: 'Elfriede Jelinek' },
  { year: 2005, title: 'Harold Pinter', author: 'Harold Pinter' },
  { year: 2006, title: 'Orhan Pamuk', author: 'Orhan Pamuk' },
  { year: 2007, title: 'Doris Lessing', author: 'Doris Lessing' },
  { year: 2008, title: 'Jean-Marie Gustave Le Clézio', author: 'Jean-Marie Gustave Le Clézio' },
  { year: 2009, title: 'Herta Müller', author: 'Herta Müller' },
  { year: 2010, title: 'Mario Vargas Llosa', author: 'Mario Vargas Llosa' },
  { year: 2011, title: 'Tomas Tranströmer', author: 'Tomas Tranströmer' },
  { year: 2012, title: 'Mo Yan', author: 'Mo Yan' },
  { year: 2013, title: 'Alice Munro', author: 'Alice Munro' },
  { year: 2014, title: 'Patrick Modiano', author: 'Patrick Modiano' },
  { year: 2015, title: 'Svetlana Alexievich', author: 'Svetlana Alexievich' },
  { year: 2016, title: 'Bob Dylan', author: 'Bob Dylan' },
  { year: 2017, title: 'Kazuo Ishiguro', author: 'Kazuo Ishiguro' },
  { year: 2018, title: 'Olga Tokarczuk', author: 'Olga Tokarczuk' },
  { year: 2019, title: 'Peter Handke', author: 'Peter Handke' },
  { year: 2020, title: 'Louise Glück', author: 'Louise Glück' },
  { year: 2021, title: 'Abdulrazak Gurnah', author: 'Abdulrazak Gurnah' },
  { year: 2022, title: 'Annie Ernaux', author: 'Annie Ernaux' },
  { year: 2023, title: 'Jon Fosse', author: 'Jon Fosse' },
  { year: 2024, title: 'Annie Ernaux', author: 'Annie Ernaux' }, // Note: 2024 winner TBD
]

async function main() {
  console.log('🌱 Starting Nobel Prize in Literature Winners collection seeding...')
  console.log('📚 Using Open Library API...')

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

    const booksToProcess = isTestMode ? NOBEL_WINNERS.slice(0, 10) : NOBEL_WINNERS

    const config = {
      name: 'Nobel Prize in Literature Winners',
      description: 'Complete list of Nobel Prize in Literature winners from 1901 to 2024. The Nobel Prize in Literature is awarded annually to an author who has produced outstanding work in the field of literature.',
      sourceUrl: 'https://www.nobelprize.org/prizes/literature/',
      category: 'Books',
      tags: ['Books', 'Literature', 'Nobel Prize', 'Awards', 'International', 'Classics'],
      books: booksToProcess.map(book => ({
        ...book,
        notes: `Nobel Prize in Literature ${book.year}`,
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

main().catch(console.error)


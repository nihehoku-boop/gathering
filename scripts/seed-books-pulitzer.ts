/**
 * Seed script to create Pulitzer Prize Winners for Fiction community collection
 * Uses Open Library API to fetch book data and cover images
 * 
 * Run with: npm run seed:books-pulitzer
 * Test mode: npm run seed:books-pulitzer -- --test
 */

import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load environment variables from .env.local manually
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

// Verify DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set')
  process.exit(1)
}

const prisma = new PrismaClient()

// Open Library API base URLs
const OPEN_LIBRARY_API = 'https://openlibrary.org'
const OPEN_LIBRARY_COVERS = 'https://covers.openlibrary.org'

// Rate limiting
const DELAY_BETWEEN_REQUESTS = 200 // ms between requests

// Pulitzer Prize Winners for Fiction (1918-2024)
// Format: { year, title, author }
const PULITZER_WINNERS = [
  { year: 1918, title: 'His Family', author: 'Ernest Poole' },
  { year: 1919, title: 'The Magnificent Ambersons', author: 'Booth Tarkington' },
  { year: 1920, title: 'The Age of Innocence', author: 'Edith Wharton' },
  { year: 1921, title: 'The Able McLaughlins', author: 'Margaret Wilson' },
  { year: 1922, title: 'Alice Adams', author: 'Booth Tarkington' },
  { year: 1923, title: 'One of Ours', author: 'Willa Cather' },
  { year: 1924, title: 'The Able McLaughlins', author: 'Margaret Wilson' },
  { year: 1925, title: 'So Big', author: 'Edna Ferber' },
  { year: 1926, title: 'Arrowsmith', author: 'Sinclair Lewis' },
  { year: 1927, title: 'Early Autumn', author: 'Louis Bromfield' },
  { year: 1928, title: 'The Bridge of San Luis Rey', author: 'Thornton Wilder' },
  { year: 1929, title: 'Scarlet Sister Mary', author: 'Julia Peterkin' },
  { year: 1930, title: 'Laughing Boy', author: 'Oliver La Farge' },
  { year: 1931, title: 'Years of Grace', author: 'Margaret Ayer Barnes' },
  { year: 1932, title: 'The Good Earth', author: 'Pearl S. Buck' },
  { year: 1933, title: 'The Store', author: 'T. S. Stribling' },
  { year: 1934, title: 'Lamb in His Bosom', author: 'Caroline Miller' },
  { year: 1935, title: 'Now in November', author: 'Josephine Winslow Johnson' },
  { year: 1936, title: 'Honey in the Horn', author: 'Harold L. Davis' },
  { year: 1937, title: 'Gone with the Wind', author: 'Margaret Mitchell' },
  { year: 1938, title: 'The Late George Apley', author: 'John P. Marquand' },
  { year: 1939, title: 'The Yearling', author: 'Marjorie Kinnan Rawlings' },
  { year: 1940, title: 'The Grapes of Wrath', author: 'John Steinbeck' },
  { year: 1941, title: 'No award', author: '' },
  { year: 1942, title: 'In This Our Life', author: 'Ellen Glasgow' },
  { year: 1943, title: 'Dragon\'s Teeth', author: 'Upton Sinclair' },
  { year: 1944, title: 'Journey in the Dark', author: 'Martin Flavin' },
  { year: 1945, title: 'A Bell for Adano', author: 'John Hersey' },
  { year: 1946, title: 'No award', author: '' },
  { year: 1947, title: 'All the King\'s Men', author: 'Robert Penn Warren' },
  { year: 1948, title: 'Tales of the South Pacific', author: 'James A. Michener' },
  { year: 1949, title: 'Guard of Honor', author: 'James Gould Cozzens' },
  { year: 1950, title: 'The Way West', author: 'A. B. Guthrie Jr.' },
  { year: 1951, title: 'The Town', author: 'Conrad Richter' },
  { year: 1952, title: 'The Caine Mutiny', author: 'Herman Wouk' },
  { year: 1953, title: 'The Old Man and the Sea', author: 'Ernest Hemingway' },
  { year: 1954, title: 'No award', author: '' },
  { year: 1955, title: 'A Fable', author: 'William Faulkner' },
  { year: 1956, title: 'Andersonville', author: 'MacKinlay Kantor' },
  { year: 1957, title: 'No award', author: '' },
  { year: 1958, title: 'A Death in the Family', author: 'James Agee' },
  { year: 1959, title: 'The Travels of Jaimie McPheeters', author: 'Robert Lewis Taylor' },
  { year: 1960, title: 'Advise and Consent', author: 'Allen Drury' },
  { year: 1961, title: 'To Kill a Mockingbird', author: 'Harper Lee' },
  { year: 1962, title: 'The Edge of Sadness', author: 'Edwin O\'Connor' },
  { year: 1963, title: 'The Reivers', author: 'William Faulkner' },
  { year: 1964, title: 'No award', author: '' },
  { year: 1965, title: 'The Keepers of the House', author: 'Shirley Ann Grau' },
  { year: 1966, title: 'The Collected Stories of Katherine Anne Porter', author: 'Katherine Anne Porter' },
  { year: 1967, title: 'The Fixer', author: 'Bernard Malamud' },
  { year: 1968, title: 'The Confessions of Nat Turner', author: 'William Styron' },
  { year: 1969, title: 'House Made of Dawn', author: 'N. Scott Momaday' },
  { year: 1970, title: 'The Collected Stories of Jean Stafford', author: 'Jean Stafford' },
  { year: 1971, title: 'No award', author: '' },
  { year: 1972, title: 'Angle of Repose', author: 'Wallace Stegner' },
  { year: 1973, title: 'The Optimist\'s Daughter', author: 'Eudora Welty' },
  { year: 1974, title: 'No award', author: '' },
  { year: 1975, title: 'The Killer Angels', author: 'Michael Shaara' },
  { year: 1976, title: 'Humboldt\'s Gift', author: 'Saul Bellow' },
  { year: 1977, title: 'No award', author: '' },
  { year: 1978, title: 'Elbow Room', author: 'James Alan McPherson' },
  { year: 1979, title: 'The Stories of John Cheever', author: 'John Cheever' },
  { year: 1980, title: 'The Executioner\'s Song', author: 'Norman Mailer' },
  { year: 1981, title: 'A Confederacy of Dunces', author: 'John Kennedy Toole' },
  { year: 1982, title: 'Rabbit Is Rich', author: 'John Updike' },
  { year: 1983, title: 'The Color Purple', author: 'Alice Walker' },
  { year: 1984, title: 'Ironweed', author: 'William Kennedy' },
  { year: 1985, title: 'Foreign Affairs', author: 'Alison Lurie' },
  { year: 1986, title: 'Lonesome Dove', author: 'Larry McMurtry' },
  { year: 1987, title: 'A Summons to Memphis', author: 'Peter Taylor' },
  { year: 1988, title: 'Beloved', author: 'Toni Morrison' },
  { year: 1989, title: 'Breathing Lessons', author: 'Anne Tyler' },
  { year: 1990, title: 'The Mambo Kings Play Songs of Love', author: 'Oscar Hijuelos' },
  { year: 1991, title: 'Rabbit at Rest', author: 'John Updike' },
  { year: 1992, title: 'A Thousand Acres', author: 'Jane Smiley' },
  { year: 1993, title: 'A Good Scent from a Strange Mountain', author: 'Robert Olen Butler' },
  { year: 1994, title: 'The Shipping News', author: 'E. Annie Proulx' },
  { year: 1995, title: 'The Stone Diaries', author: 'Carol Shields' },
  { year: 1996, title: 'Independence Day', author: 'Richard Ford' },
  { year: 1997, title: 'Martin Dressler: The Tale of an American Dreamer', author: 'Steven Millhauser' },
  { year: 1998, title: 'American Pastoral', author: 'Philip Roth' },
  { year: 1999, title: 'The Hours', author: 'Michael Cunningham' },
  { year: 2000, title: 'Interpreter of Maladies', author: 'Jhumpa Lahiri' },
  { year: 2001, title: 'The Amazing Adventures of Kavalier & Clay', author: 'Michael Chabon' },
  { year: 2002, title: 'Empire Falls', author: 'Richard Russo' },
  { year: 2003, title: 'Middlesex', author: 'Jeffrey Eugenides' },
  { year: 2004, title: 'The Known World', author: 'Edward P. Jones' },
  { year: 2005, title: 'Gilead', author: 'Marilynne Robinson' },
  { year: 2006, title: 'March', author: 'Geraldine Brooks' },
  { year: 2007, title: 'The Road', author: 'Cormac McCarthy' },
  { year: 2008, title: 'The Brief Wondrous Life of Oscar Wao', author: 'Junot Díaz' },
  { year: 2009, title: 'Olive Kitteridge', author: 'Elizabeth Strout' },
  { year: 2010, title: 'Tinkers', author: 'Paul Harding' },
  { year: 2011, title: 'A Visit from the Goon Squad', author: 'Jennifer Egan' },
  { year: 2012, title: 'No award', author: '' },
  { year: 2013, title: 'The Orphan Master\'s Son', author: 'Adam Johnson' },
  { year: 2014, title: 'The Goldfinch', author: 'Donna Tartt' },
  { year: 2015, title: 'All the Light We Cannot See', author: 'Anthony Doerr' },
  { year: 2016, title: 'The Sympathizer', author: 'Viet Thanh Nguyen' },
  { year: 2017, title: 'The Underground Railroad', author: 'Colson Whitehead' },
  { year: 2018, title: 'Less', author: 'Andrew Sean Greer' },
  { year: 2019, title: 'The Overstory', author: 'Richard Powers' },
  { year: 2020, title: 'The Nickel Boys', author: 'Colson Whitehead' },
  { year: 2021, title: 'The Night Watchman', author: 'Louise Erdrich' },
  { year: 2022, title: 'The Netanyahus', author: 'Joshua Cohen' },
  { year: 2023, title: 'Trust', author: 'Hernan Diaz' },
  { year: 2024, title: 'Night Watch', author: 'Jayne Anne Phillips' },
]

interface OpenLibraryBook {
  title: string
  authors?: Array<{ name: string }>
  isbn?: string[]
  isbn_10?: string[]
  isbn_13?: string[]
  publish_date?: string
  publishers?: string[]
  number_of_pages?: number
  covers?: number[]
  olid?: string
  key?: string
}

// Helper function to fetch from Open Library API with rate limiting
async function openLibraryFetch(url: string): Promise<any> {
  await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS))
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Gathering/1.0 (https://gathering-jade.vercel.app)',
    },
  })

  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    throw new Error(`Open Library API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Search for a book in Open Library and get best edition with ISBN
async function searchBook(title: string, author: string): Promise<{ book: any, isbn: string | null, olid: string | null } | null> {
  try {
    // Try searching by title and author (simpler query format)
    const searchQuery = encodeURIComponent(`${title} ${author}`)
    const searchUrl = `${OPEN_LIBRARY_API}/search.json?q=${searchQuery}&limit=10`
    
    const searchResults = await openLibraryFetch(searchUrl)
    
    if (!searchResults || !searchResults.docs || searchResults.docs.length === 0) {
      // Try just title
      const titleQuery = encodeURIComponent(title)
      const titleSearchUrl = `${OPEN_LIBRARY_API}/search.json?q=${titleQuery}&limit=10`
      const titleResults = await openLibraryFetch(titleSearchUrl)
      
      if (!titleResults || !titleResults.docs || titleResults.docs.length === 0) {
        return null
      }
      
      // Find best match by author name
      const bestMatch = titleResults.docs.find((doc: any) => 
        doc.author_name && doc.author_name.some((name: string) => 
          name.toLowerCase().includes(author.toLowerCase().split(' ')[0])
        )
      ) || titleResults.docs[0]
      
      // Get ISBN and OLID from search result
      const isbn = bestMatch.isbn?.[0] || bestMatch.isbn_13?.[0] || bestMatch.isbn_10?.[0] || null
      const olid = bestMatch.cover_edition_key || bestMatch.edition_key?.[0] || null
      
      // Fetch full work details
      if (bestMatch.key) {
        const bookKey = bestMatch.key.replace('/works/', '')
        const bookUrl = `${OPEN_LIBRARY_API}/works/${bookKey}.json`
        const bookData = await openLibraryFetch(bookUrl)
        
        // If we don't have ISBN, try to get it from editions
        if (!isbn && bookData && olid) {
          const editionUrl = `${OPEN_LIBRARY_API}/books/${olid}.json`
          const editionData = await openLibraryFetch(editionUrl)
          if (editionData) {
            const editionIsbn = editionData.isbn_13?.[0] || editionData.isbn_10?.[0] || editionData.isbn?.[0] || null
            return { book: bookData || bestMatch, isbn: editionIsbn, olid }
          }
        }
        
        return { book: bookData || bestMatch, isbn, olid }
      }
      
      return { book: bestMatch, isbn, olid }
    }
    
    // Get the first result and fetch full details
    const firstResult = searchResults.docs[0]
    const isbn = firstResult.isbn?.[0] || firstResult.isbn_13?.[0] || firstResult.isbn_10?.[0] || null
    const olid = firstResult.cover_edition_key || firstResult.edition_key?.[0] || null
    
    if (firstResult.key) {
      const bookKey = firstResult.key.replace('/works/', '')
      const bookUrl = `${OPEN_LIBRARY_API}/works/${bookKey}.json`
      const bookData = await openLibraryFetch(bookUrl)
      
      // If we don't have ISBN, try to get it from editions
      if (!isbn && bookData && olid) {
        const editionUrl = `${OPEN_LIBRARY_API}/books/${olid}.json`
        const editionData = await openLibraryFetch(editionUrl)
        if (editionData) {
          const editionIsbn = editionData.isbn_13?.[0] || editionData.isbn_10?.[0] || editionData.isbn?.[0] || null
          return { book: bookData || firstResult, isbn: editionIsbn, olid }
        }
      }
      
      return { book: bookData || firstResult, isbn, olid }
    }
    
    return { book: firstResult, isbn, olid }
  } catch (error) {
    console.error(`   ⚠️  Error searching for "${title}" by ${author}:`, error)
    return null
  }
}

// Get book cover image URL from ISBN or OLID
function getCoverImageUrl(isbn: string | null, olid: string | null): string | null {
  // Prefer ISBN, fallback to OLID
  if (isbn) {
    // Clean ISBN (remove dashes, spaces)
    const cleanIsbn = isbn.replace(/[-\s]/g, '')
    return `${OPEN_LIBRARY_COVERS}/b/isbn/${cleanIsbn}-L.jpg`
  }
  
  if (olid) {
    return `${OPEN_LIBRARY_COVERS}/b/olid/${olid}-L.jpg`
  }
  
  return null
}

// Get best ISBN from book data (prefer ISBN-13, fallback to ISBN-10)
function getBestIsbn(book: OpenLibraryBook): string | null {
  if (book.isbn_13 && book.isbn_13.length > 0) {
    return book.isbn_13[0]
  }
  if (book.isbn_10 && book.isbn_10.length > 0) {
    return book.isbn_10[0]
  }
  if (book.isbn && book.isbn.length > 0) {
    return book.isbn[0]
  }
  return null
}

async function main() {
  console.log('🌱 Starting Pulitzer Prize Winners for Fiction collection seeding...')
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

    // Check if collection already exists
    const existingCollection = await prisma.communityCollection.findFirst({
      where: {
        name: 'Pulitzer Prize Winners for Fiction',
        category: 'Books',
      },
    })

    if (existingCollection) {
      console.log('⚠️  Collection already exists. Use --force to recreate.')
      return
    }

    console.log(`\n📖 Processing ${PULITZER_WINNERS.length} Pulitzer Prize winners...`)
    console.log(`⏱️  Estimated time: ${Math.round((PULITZER_WINNERS.length * DELAY_BETWEEN_REQUESTS) / 1000 / 60)} minutes\n`)

    const bookItems: Array<{
      name: string
      number: number | null
      notes: string | null
      image: string | null
      customFields: string
    }> = []

    let processed = 0
    let skipped = 0
    const startTime = Date.now()

    // Process each book
    for (let i = 0; i < PULITZER_WINNERS.length; i++) {
      const winner = PULITZER_WINNERS[i]
      const bookNumber = i + 1

      // Skip "No award" years
      if (winner.title === 'No award' || !winner.author) {
        console.log(`[${bookNumber}/${PULITZER_WINNERS.length}] ⏭️  Skipping ${winner.year} - No award`)
        skipped++
        continue
      }

      try {
        console.log(`[${bookNumber}/${PULITZER_WINNERS.length}] 📚 "${winner.title}" by ${winner.author} (${winner.year})...`)
        
        // Search for book in Open Library
        const searchResult = await searchBook(winner.title, winner.author)
        
        if (!searchResult || !searchResult.book) {
          console.log(`   ⚠️  Book not found in Open Library, creating with basic info`)
          
          // Create item with basic info
          const customFields: Record<string, any> = {
            author: winner.author,
            publicationDate: `${winner.year}-01-01`,
          }
          
          bookItems.push({
            name: winner.title,
            number: winner.year,
            notes: `Pulitzer Prize Winner ${winner.year}`,
            image: null,
            customFields: JSON.stringify(customFields),
          })
          continue
        }

        const bookData = searchResult.book
        const isbn = searchResult.isbn
        const olid = searchResult.olid

        // Extract book information
        const author = bookData.authors?.[0]?.name || bookData.author_name?.[0] || winner.author
        const coverImage = getCoverImageUrl(isbn, olid)
        const publisher = bookData.publishers?.[0] || bookData.publisher?.[0] || null
        const publishDate = bookData.publish_date || bookData.first_publish_year ? `${bookData.first_publish_year}-01-01` : `${winner.year}-01-01`
        const pages = bookData.number_of_pages || null

        // Build customFields for book template
        const customFields: Record<string, any> = {
          author: author,
        }

        if (isbn) {
          customFields.isbn = isbn
        }
        if (publisher) {
          customFields.publisher = publisher
        }
        if (publishDate) {
          // Try to parse date, fallback to year
          const dateMatch = publishDate.match(/(\d{4})/)
          if (dateMatch) {
            customFields.publicationDate = `${dateMatch[1]}-01-01`
          } else {
            customFields.publicationDate = publishDate
          }
        }
        if (pages) {
          customFields.pages = pages
        }

        // Remove null values
        Object.keys(customFields).forEach(key => {
          if (customFields[key] === null || customFields[key] === undefined) {
            delete customFields[key]
          }
        })

        bookItems.push({
          name: bookData.title || winner.title,
          number: winner.year,
          notes: `Pulitzer Prize Winner ${winner.year}`,
          image: coverImage,
          customFields: JSON.stringify(customFields),
        })

        const coverStatus = coverImage ? ' (with cover)' : ' (no cover)'
        console.log(`   ✅ Added "${bookData.title || winner.title}"${coverStatus}${isbn ? ` [ISBN: ${isbn}]` : olid ? ` [OLID: ${olid}]` : ''}`)
        processed++

        // Progress update every 10 books
        if (processed % 10 === 0) {
          const elapsed = Math.round((Date.now() - startTime) / 1000)
          console.log(`\n   📊 Progress: ${processed} processed, ${skipped} skipped | Time: ${Math.round(elapsed / 60)}m ${elapsed % 60}s\n`)
        }
      } catch (error) {
        console.error(`   ❌ Error processing "${winner.title}":`, error)
        skipped++
      }
    }

    console.log(`\n✅ Processed ${processed} books, skipped ${skipped}`)
    console.log(`📦 Creating community collection...`)

    // Create the community collection
    const collection = await prisma.communityCollection.create({
      data: {
        name: 'Pulitzer Prize Winners for Fiction',
        description: 'Complete list of Pulitzer Prize winners for Fiction from 1918 to 2024. The Pulitzer Prize for Fiction is awarded annually to distinguished fiction by an American author, preferably dealing with American life.\n\nSource: https://www.pulitzer.org/prize-winners-by-category/218',
        category: 'Books',
        template: 'book',
        tags: JSON.stringify(['Books', 'Fiction', 'Pulitzer Prize', 'Awards', 'Classics', 'Literature']),
        userId: adminUser.id,
        items: {
          create: bookItems,
        },
      },
      include: {
        items: true,
      },
    })

    const totalTime = Math.round((Date.now() - startTime) / 1000)
    const minutes = Math.floor(totalTime / 60)
    const seconds = totalTime % 60

    console.log(`\n🎉 Pulitzer Prize Winners collection created!`)
    console.log(`📊 Final Summary:`)
    console.log(`   ✅ Books added: ${collection.items.length}`)
    console.log(`   ⏭️  Skipped: ${skipped} books`)
    console.log(`   ⏱️  Total time: ${minutes}m ${seconds}s`)
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


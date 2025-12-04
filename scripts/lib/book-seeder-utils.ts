/**
 * Shared utilities for book collection seeding
 */

import { PrismaClient } from '@prisma/client'

export const OPEN_LIBRARY_API = 'https://openlibrary.org'
export const OPEN_LIBRARY_COVERS = 'https://covers.openlibrary.org'
export const DELAY_BETWEEN_REQUESTS = 200 // ms between requests

export interface BookData {
  title: string
  author: string
  year?: number | string
  notes?: string
}

export interface CollectionConfig {
  name: string
  description: string
  sourceUrl: string
  category: string
  tags: string[]
  books: BookData[]
}

export interface BookSearchResult {
  book: any
  isbn: string | null
  olid: string | null
}

// Helper function to fetch from Open Library API with rate limiting
export async function openLibraryFetch(url: string): Promise<any> {
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
export async function searchBook(title: string, author: string): Promise<BookSearchResult | null> {
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
export function getCoverImageUrl(isbn: string | null, olid: string | null): string | null {
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

// Process a single book and return item data
export async function processBook(
  bookData: BookData,
  index: number
): Promise<{
  name: string
  number: number | null
  notes: string | null
  image: string | null
  customFields: string
} | null> {
  try {
    // Search for book in Open Library
    const searchResult = await searchBook(bookData.title, bookData.author)
    
    if (!searchResult || !searchResult.book) {
      // Create item with basic info
      const customFields: Record<string, any> = {
        author: bookData.author,
      }
      
      if (bookData.year) {
        customFields.publicationDate = typeof bookData.year === 'number' 
          ? `${bookData.year}-01-01` 
          : bookData.year
      }
      
      return {
        name: bookData.title,
        number: typeof bookData.year === 'number' ? bookData.year : index + 1,
        notes: bookData.notes || null,
        image: null,
        customFields: JSON.stringify(customFields),
      }
    }

    const book = searchResult.book
    const isbn = searchResult.isbn
    const olid = searchResult.olid

    // Extract book information
    const author = book.authors?.[0]?.name || book.author_name?.[0] || bookData.author
    const coverImage = getCoverImageUrl(isbn, olid)
    const publisher = book.publishers?.[0] || book.publisher?.[0] || null
    const publishDate = book.publish_date || book.first_publish_year 
      ? `${book.first_publish_year}-01-01` 
      : bookData.year 
        ? (typeof bookData.year === 'number' ? `${bookData.year}-01-01` : bookData.year)
        : null
    const pages = book.number_of_pages || null

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

    return {
      name: book.title || bookData.title,
      number: typeof bookData.year === 'number' ? bookData.year : index + 1,
      notes: bookData.notes || null,
      image: coverImage,
      customFields: JSON.stringify(customFields),
    }
  } catch (error) {
    console.error(`   ❌ Error processing "${bookData.title}":`, error)
    return null
  }
}

// Create a book collection from config
export async function createBookCollection(
  prisma: PrismaClient,
  adminUserId: string,
  config: CollectionConfig,
  forceRecreate: boolean = false
) {
  // Check if collection already exists
  const existingCollection = await prisma.communityCollection.findFirst({
    where: {
      name: config.name,
      category: 'Books',
    },
  })

  if (existingCollection && !forceRecreate) {
    console.log(`⚠️  Collection "${config.name}" already exists. Use --force to recreate.`)
    return existingCollection
  }

  if (existingCollection && forceRecreate) {
    console.log(`🔄 Recreating "${config.name}"...`)
    await prisma.communityCollection.delete({
      where: { id: existingCollection.id },
    })
  }

  console.log(`\n📖 Processing ${config.books.length} books for "${config.name}"...`)
  console.log(`⏱️  Estimated time: ${Math.round((config.books.length * DELAY_BETWEEN_REQUESTS) / 1000 / 60)} minutes\n`)

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
  for (let i = 0; i < config.books.length; i++) {
    const book = config.books[i]
    const bookNumber = i + 1

    try {
      console.log(`[${bookNumber}/${config.books.length}] 📚 "${book.title}" by ${book.author}...`)
      
      const item = await processBook(book, i)
      
      if (!item) {
        console.log(`   ⚠️  Failed to process book`)
        skipped++
        continue
      }

      bookItems.push(item)

      const coverStatus = item.image ? ' (with cover)' : ' (no cover)'
      console.log(`   ✅ Added "${item.name}"${coverStatus}`)
      processed++

      // Progress update every 10 books
      if (processed % 10 === 0) {
        const elapsed = Math.round((Date.now() - startTime) / 1000)
        console.log(`\n   📊 Progress: ${processed} processed, ${skipped} skipped | Time: ${Math.round(elapsed / 60)}m ${elapsed % 60}s\n`)
      }
    } catch (error) {
      console.error(`   ❌ Error processing "${book.title}":`, error)
      skipped++
    }
  }

  console.log(`\n✅ Processed ${processed} books, skipped ${skipped}`)
  console.log(`📦 Creating community collection...`)

  // Add source link to description
  const descriptionWithSource = `${config.description}\n\nSource: ${config.sourceUrl}`

  // Create the community collection
  const collection = await prisma.communityCollection.create({
    data: {
      name: config.name,
      description: descriptionWithSource,
      category: 'Books',
      template: 'book',
      tags: JSON.stringify(config.tags),
      userId: adminUserId,
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

  console.log(`\n🎉 Collection "${config.name}" created!`)
  console.log(`📊 Final Summary:`)
  console.log(`   ✅ Books added: ${collection.items.length}`)
  console.log(`   ⏭️  Skipped: ${skipped} books`)
  console.log(`   ⏱️  Total time: ${minutes}m ${seconds}s`)

  return collection
}


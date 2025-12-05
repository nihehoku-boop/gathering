/**
 * Seed script to create European comic community collections
 * Includes: Asterix, Spirou et Fantasio, Tintin, and German Donald Duck comics
 * 
 * Run with: npm run seed:comics-european
 * Force recreate: npm run seed:comics-european -- --force
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
} catch (error) {
  // Ignore
}

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set')
  process.exit(1)
}

const prisma = new PrismaClient()

// Parse command line arguments
const args = process.argv.slice(2)
const forceRecreate = args.includes('--force')

// Open Library API constants
const OPEN_LIBRARY_API = 'https://openlibrary.org'
const OPEN_LIBRARY_COVERS = 'https://covers.openlibrary.org'
const DELAY_BETWEEN_REQUESTS = 200 // ms between requests

// Helper function to fetch from Open Library API with rate limiting
async function openLibraryFetch(url: string): Promise<any> {
  await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS))
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Gathering/1.0 (https://gathering-jade.vercel.app)',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      return null // Don't throw, just return null
    }

    return response.json()
  } catch (error) {
    return null
  }
}

// Search for a comic in Open Library and get cover image
async function searchComicCover(title: string, seriesName?: string): Promise<string | null> {
  try {
    // Try searching with series name if provided
    const searchQuery = seriesName 
      ? encodeURIComponent(`${seriesName} ${title}`)
      : encodeURIComponent(title)
    const searchUrl = `${OPEN_LIBRARY_API}/search.json?q=${searchQuery}&limit=5`
    
    const searchResults = await openLibraryFetch(searchUrl)
    
    if (!searchResults || !searchResults.docs || searchResults.docs.length === 0) {
      return null
    }
    
    // Find best match (prefer results with cover)
    const bestMatch = searchResults.docs.find((doc: any) => doc.cover_edition_key) || searchResults.docs[0]
    
    // Get ISBN or OLID
    const isbn = bestMatch.isbn?.[0] || bestMatch.isbn_13?.[0] || bestMatch.isbn_10?.[0] || null
    const olid = bestMatch.cover_edition_key || bestMatch.edition_key?.[0] || null
    
    // Get cover image URL
    if (isbn) {
      const cleanIsbn = isbn.replace(/[-\s]/g, '')
      // Test if image exists
      const coverUrl = `${OPEN_LIBRARY_COVERS}/b/isbn/${cleanIsbn}-L.jpg?default=false`
      const testResponse = await fetch(coverUrl, { method: 'HEAD' })
      if (testResponse.ok) {
        return coverUrl.replace('?default=false', '')
      }
    }
    
    if (olid) {
      const coverUrl = `${OPEN_LIBRARY_COVERS}/b/olid/${olid}-L.jpg?default=false`
      const testResponse = await fetch(coverUrl, { method: 'HEAD' })
      if (testResponse.ok) {
        return coverUrl.replace('?default=false', '')
      }
    }
    
    return null
  } catch (error) {
    return null
  }
}

// Complete list of Asterix albums (40 main albums) - English titles
const ASTERIX_ALBUMS = [
  { number: 1, name: 'Asterix the Gaul', year: 1961 },
  { number: 2, name: 'Asterix and the Golden Sickle', year: 1962 },
  { number: 3, name: 'Asterix and the Goths', year: 1963 },
  { number: 4, name: 'Asterix the Gladiator', year: 1964 },
  { number: 5, name: 'Asterix and the Banquet', year: 1965 },
  { number: 6, name: 'Asterix and Cleopatra', year: 1965 },
  { number: 7, name: 'Asterix and the Big Fight', year: 1966 },
  { number: 8, name: 'Asterix in Britain', year: 1966 },
  { number: 9, name: 'Asterix and the Normans', year: 1967 },
  { number: 10, name: 'Asterix the Legionary', year: 1967 },
  { number: 11, name: 'Asterix and the Chieftain\'s Shield', year: 1968 },
  { number: 12, name: 'Asterix at the Olympic Games', year: 1968 },
  { number: 13, name: 'Asterix and the Cauldron', year: 1969 },
  { number: 14, name: 'Asterix in Spain', year: 1969 },
  { number: 15, name: 'Asterix and the Roman Agent', year: 1970 },
  { number: 16, name: 'Asterix in Switzerland', year: 1970 },
  { number: 17, name: 'The Mansions of the Gods', year: 1971 },
  { number: 18, name: 'Asterix and the Laurel Wreath', year: 1972 },
  { number: 19, name: 'Asterix and the Soothsayer', year: 1972 },
  { number: 20, name: 'Asterix in Corsica', year: 1973 },
  { number: 21, name: 'Asterix and Caesar\'s Gift', year: 1974 },
  { number: 22, name: 'Asterix and the Great Crossing', year: 1975 },
  { number: 23, name: 'Obelix and Co.', year: 1976 },
  { number: 24, name: 'Asterix in Belgium', year: 1979 },
  { number: 25, name: 'Asterix and the Great Divide', year: 1980 },
  { number: 26, name: 'Asterix and the Black Gold', year: 1981 },
  { number: 27, name: 'Asterix and Son', year: 1983 },
  { number: 28, name: 'Asterix and the Magic Carpet', year: 1987 },
  { number: 29, name: 'Asterix and the Secret Weapon', year: 1991 },
  { number: 30, name: 'Asterix and Obelix All at Sea', year: 1996 },
  { number: 31, name: 'Asterix and the Actress', year: 2001 },
  { number: 32, name: 'Asterix and the Class Act', year: 2003 },
  { number: 33, name: 'Asterix and the Falling Sky', year: 2005 },
  { number: 34, name: 'Asterix and Obelix\'s Birthday: The Golden Book', year: 2009 },
  { number: 35, name: 'Asterix and the Picts', year: 2013 },
  { number: 36, name: 'Asterix and the Missing Scroll', year: 2015 },
  { number: 37, name: 'Asterix and the Chariot Race', year: 2017 },
  { number: 38, name: 'Asterix and the Chieftain\'s Daughter', year: 2019 },
  { number: 39, name: 'Asterix and the Griffin', year: 2021 },
  { number: 40, name: 'The White Iris', year: 2023 },
]

// Complete list of Spirou et Fantasio albums (main series) - English titles
const SPIROU_ALBUMS = [
  { number: 1, name: 'Four Adventures of Spirou and Fantasio', year: 1950 },
  { number: 2, name: 'There\'s a Wizard in Champignac', year: 1951 },
  { number: 3, name: 'The Black Hats', year: 1952 },
  { number: 4, name: 'Spirou and the Heirs', year: 1952 },
  { number: 5, name: 'The Marsupilami Thieves', year: 1952 },
  { number: 6, name: 'The Rhinoceros Horn', year: 1953 },
  { number: 7, name: 'The Dictator and the Mushroom', year: 1953 },
  { number: 8, name: 'The Wrong Head', year: 1954 },
  { number: 9, name: 'The Moray Eel\'s Lair', year: 1954 },
  { number: 10, name: 'The Pirates of Silence', year: 1955 },
  { number: 11, name: 'The Gorilla\'s Good Looks', year: 1956 },
  { number: 12, name: 'The Marsupilamis\' Nest', year: 1957 },
  { number: 13, name: 'The Mesozoic Traveler', year: 1957 },
  { number: 14, name: 'The Prisoner of the Buddha', year: 1959 },
  { number: 15, name: 'Z as in Zorglub', year: 1960 },
  { number: 16, name: 'The Shadow of Z', year: 1962 },
  { number: 17, name: 'Spirou and the Bubble Men', year: 1964 },
  { number: 18, name: 'QRN on Bretzelburg', year: 1966 },
  { number: 19, name: 'Trouble in Champignac', year: 1968 },
  { number: 20, name: 'The Gold Maker', year: 1970 },
  { number: 21, name: 'Glucose for Noémie', year: 1971 },
  { number: 22, name: 'The Ankou', year: 1972 },
  { number: 23, name: 'Kodo the Tyrant', year: 1973 },
  { number: 24, name: 'Beans Everywhere', year: 1974 },
  { number: 25, name: 'The Quick Super', year: 1978 },
  { number: 26, name: 'The Rigged Abbey', year: 1979 },
  { number: 27, name: 'Tora Torapa', year: 1980 },
  { number: 28, name: 'The Gri-gri of Niokolo-Koba', year: 1983 },
  { number: 29, name: 'Cider for the Stars', year: 1984 },
  { number: 30, name: 'The Champignac Encyclopedia', year: 1985 },
  { number: 31, name: 'The Gray-Green Bellboy', year: 1986 },
  { number: 32, name: 'Spirou in Moscow', year: 1990 },
  { number: 33, name: 'Vito the Unlucky', year: 1991 },
  { number: 34, name: 'Back to the Z', year: 1993 },
  { number: 35, name: 'The Man Who Wouldn\'t Die', year: 1995 },
  { number: 36, name: 'Spirou in New York', year: 1987 },
  { number: 37, name: 'The Spirit of Champignac', year: 1998 },
  { number: 38, name: 'The Dream Machine', year: 1998 },
  { number: 39, name: 'The Valley of the Banned', year: 1999 },
  { number: 40, name: 'Adventure in Australia', year: 2000 },
  { number: 41, name: 'The Silence Makers', year: 2001 },
  { number: 42, name: 'The Marsupilami\'s Wrath', year: 2002 },
  { number: 43, name: 'The Diary of a Naive Man', year: 2007 },
  { number: 44, name: 'Back to the Z', year: 2008 },
  { number: 45, name: 'Go to Bed, Spirou!', year: 2010 },
  { number: 46, name: 'The Petrified Giants', year: 2013 },
  { number: 47, name: 'The Hidden Face of Z', year: 2014 },
  { number: 48, name: 'In the Viper\'s Claws', year: 2015 },
  { number: 49, name: 'The Death of Spirou', year: 2016 },
  { number: 50, name: 'Spirou in Tokyo', year: 2018 },
  { number: 51, name: 'The Memory Thieves', year: 2020 },
  { number: 52, name: 'Spirou and Fantasio in New York', year: 2021 },
]

// Complete list of Lucky Luke albums (main series) - English titles
const LUCKY_LUKE_ALBUMS = [
  { number: 1, name: 'Arizona 1880', year: 1951 },
  { number: 2, name: 'Under a Western Sky', year: 1952 },
  { number: 3, name: 'Oklahoma Jim', year: 1953 },
  { number: 4, name: 'Rantanplan\'s Inheritance', year: 1954 },
  { number: 5, name: 'Oklahoma Rush', year: 1955 },
  { number: 6, name: 'The Daltons Escape', year: 1956 },
  { number: 7, name: 'On the Daltons\' Trail', year: 1957 },
  { number: 8, name: 'In the Shadow of the Derricks', year: 1958 },
  { number: 9, name: 'The Rivals of Painful Gulch', year: 1959 },
  { number: 10, name: 'Billy the Kid', year: 1960 },
  { number: 11, name: 'The Black Hills', year: 1961 },
  { number: 12, name: 'The Daltons in the Blizzard', year: 1962 },
  { number: 13, name: 'The Daltons Always on the Run', year: 1963 },
  { number: 14, name: 'The Caravan', year: 1964 },
  { number: 15, name: 'The Ghost Town', year: 1965 },
  { number: 16, name: 'The Daltons Redeem Themselves', year: 1966 },
  { number: 17, name: 'The 20th Cavalry', year: 1967 },
  { number: 18, name: 'The Escort', year: 1968 },
  { number: 19, name: 'Barbed Wire on the Prairie', year: 1969 },
  { number: 20, name: 'Calamity Jane', year: 1970 },
  { number: 21, name: 'Tortillas for the Daltons', year: 1971 },
  { number: 22, name: 'The Stagecoach', year: 1972 },
  { number: 23, name: 'Tenderfoot', year: 1973 },
  { number: 24, name: 'Dalton City', year: 1974 },
  { number: 25, name: 'Jesse James', year: 1975 },
  { number: 26, name: 'Western Circus', year: 1976 },
  { number: 27, name: 'Apache Canyon', year: 1977 },
  { number: 28, name: 'Ma Dalton', year: 1978 },
  { number: 29, name: 'The Bounty Hunter', year: 1979 },
  { number: 30, name: 'The Grand Duke', year: 1980 },
  { number: 31, name: 'The White Rider', year: 1981 },
  { number: 32, name: 'The Daltons\' Cure', year: 1982 },
  { number: 33, name: 'Emperor Smith', year: 1983 },
  { number: 34, name: 'The Singing Wire', year: 1984 },
  { number: 35, name: 'The Daltons\' Ballad', year: 1985 },
  { number: 36, name: 'The Daily Star', year: 1986 },
  { number: 37, name: 'The Bride of Lucky Luke', year: 1987 },
  { number: 38, name: 'The Cursed Ranch', year: 1988 },
  { number: 39, name: 'Nitroglycerin', year: 1989 },
  { number: 40, name: 'The Alibi', year: 1990 },
  { number: 41, name: 'The Pony Express', year: 1991 },
  { number: 42, name: 'The Daltons\' Bluff', year: 1992 },
  { number: 43, name: 'The Daltons\' Stash', year: 1993 },
  { number: 44, name: 'Belle Starr', year: 1994 },
  { number: 45, name: 'The Klondike', year: 1995 },
  { number: 46, name: 'O.K. Corral', year: 1996 },
  { number: 47, name: 'Marcel Dalton', year: 1997 },
  { number: 48, name: 'The Promised Land', year: 1998 },
  { number: 49, name: 'The Daltons\' Amnesia', year: 1999 },
  { number: 50, name: 'Chinatown', year: 2000 },
  { number: 51, name: 'The Daltons\' School', year: 2001 },
  { number: 52, name: 'The Daltons\' Uncle', year: 2002 },
  { number: 53, name: 'The Daltons\' Cousins', year: 2003 },
  { number: 54, name: 'The Daltons\' Nephews', year: 2004 },
  { number: 55, name: 'A Cowboy in High Cotton', year: 2005 },
  { number: 56, name: 'The Daltons\' Mother', year: 2006 },
  { number: 57, name: 'The Daltons\' Father', year: 2007 },
  { number: 58, name: 'The Daltons\' Sister', year: 2008 },
  { number: 59, name: 'The Daltons\' Brother', year: 2009 },
  { number: 60, name: 'The Daltons\' Grandfather', year: 2010 },
]

// Complete list of Tintin albums (24 main albums) - English titles
const TINTIN_ALBUMS = [
  { number: 1, name: 'Tintin in the Land of the Soviets', year: 1930 },
  { number: 2, name: 'Tintin in the Congo', year: 1931 },
  { number: 3, name: 'Tintin in America', year: 1932 },
  { number: 4, name: 'Cigars of the Pharaoh', year: 1934 },
  { number: 5, name: 'The Blue Lotus', year: 1936 },
  { number: 6, name: 'The Broken Ear', year: 1937 },
  { number: 7, name: 'The Black Island', year: 1938 },
  { number: 8, name: 'King Ottokar\'s Sceptre', year: 1939 },
  { number: 9, name: 'The Crab with the Golden Claws', year: 1941 },
  { number: 10, name: 'The Shooting Star', year: 1942 },
  { number: 11, name: 'The Secret of the Unicorn', year: 1943 },
  { number: 12, name: 'Red Rackham\'s Treasure', year: 1944 },
  { number: 13, name: 'The Seven Crystal Balls', year: 1948 },
  { number: 14, name: 'Prisoners of the Sun', year: 1949 },
  { number: 15, name: 'Land of Black Gold', year: 1950 },
  { number: 16, name: 'Destination Moon', year: 1953 },
  { number: 17, name: 'Explorers on the Moon', year: 1954 },
  { number: 18, name: 'The Calculus Affair', year: 1956 },
  { number: 19, name: 'The Red Sea Sharks', year: 1958 },
  { number: 20, name: 'Tintin in Tibet', year: 1960 },
  { number: 21, name: 'The Castafiore Emerald', year: 1963 },
  { number: 22, name: 'Flight 714 to Sydney', year: 1968 },
  { number: 23, name: 'Tintin and the Picaros', year: 1976 },
  { number: 24, name: 'Tintin and Alph-Art', year: 1986 },
]

// Generate LTB special edition issues
function generateLTBSpecialIssues(seriesName: string, start: number = 1, end: number = 50): Array<{ number: number; name: string }> {
  const issues: Array<{ number: number; name: string }> = []
  for (let i = start; i <= end; i++) {
    issues.push({
      number: i,
      name: `${seriesName} #${i}`,
    })
  }
  return issues
}

async function createComicCollection(
  name: string,
  description: string,
  albums: Array<{ number: number; name: string; year?: number }>,
  category: string = 'Comics',
  tags: string[] = ['Comics', 'European Comics'],
  coverImage?: string,
  fetchImages: boolean = true
) {
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
  }

  // Check if collection already exists
  const existingCollection = await prisma.communityCollection.findFirst({
    where: { name },
  })

  if (existingCollection) {
    if (forceRecreate) {
      console.log(`🗑️  Deleting existing collection: ${name}`)
      // Delete existing items
      await prisma.communityItem.deleteMany({
        where: { communityCollectionId: existingCollection.id },
      })
      // Delete collection
      await prisma.communityCollection.delete({
        where: { id: existingCollection.id },
      })
    } else {
      console.log(`⏭️  Collection "${name}" already exists. Use --force to recreate.`)
      return
    }
  }

  console.log(`\n📚 Creating collection: ${name}`)
  console.log(`   ${albums.length} albums/issues`)

  // Fetch images for items if requested
  let itemsWithImages: Array<{ name: string; number: number; image: string | null; customFields: string }> = []
  
  if (fetchImages) {
    console.log(`   🔍 Fetching cover images from Open Library...`)
    let foundImages = 0
    
    for (let i = 0; i < albums.length; i++) {
      const album = albums[i]
      const imageUrl = await searchComicCover(album.name, name)
      
      if (imageUrl) {
        foundImages++
      }
      
      itemsWithImages.push({
        name: album.name,
        number: album.number,
        image: imageUrl,
        customFields: JSON.stringify({
          publisher: category === 'Comics' ? 'Various' : undefined,
          releaseDate: album.year ? `${album.year}-01-01` : undefined,
        }),
      })
      
      // Progress indicator
      if ((i + 1) % 10 === 0 || i === albums.length - 1) {
        process.stdout.write(`\r   📸 Fetched ${i + 1}/${albums.length} images (${foundImages} found)`)
      }
    }
    console.log('') // New line after progress
  } else {
    // No image fetching, just create items without images
    itemsWithImages = albums.map((album) => ({
      name: album.name,
      number: album.number,
      image: null,
      customFields: JSON.stringify({
        publisher: category === 'Comics' ? 'Various' : undefined,
        releaseDate: album.year ? `${album.year}-01-01` : undefined,
      }),
    }))
  }

  // Create collection with items
  const collection = await prisma.communityCollection.create({
    data: {
      name,
      description,
      category,
      template: 'comic-book',
      tags: JSON.stringify(tags),
      coverImage: coverImage || null, // Leave empty if not provided
      userId: adminUser.id,
      items: {
        create: itemsWithImages,
      },
    },
  })

  const imagesCount = itemsWithImages.filter(item => item.image).length
  console.log(`✅ Created collection "${name}" with ${albums.length} items (${imagesCount} with images)`)
  return collection
}

async function main() {
  console.log('🌱 Starting European comics community collection seeding...')
  console.log(forceRecreate ? '🔄 Force recreate mode: ON' : 'ℹ️  Use --force to recreate existing collections')

  try {
    // Create Asterix collection (with image fetching)
    await createComicCollection(
      'Asterix',
      'The complete collection of Asterix comic albums by René Goscinny and Albert Uderzo. Join the indomitable Gauls in their fight against the Romans!',
      ASTERIX_ALBUMS,
      'Comics',
      ['Comics', 'European Comics', 'Asterix', 'French Comics', 'Franco-Belgian Comics'],
      undefined,
      true // Fetch images
    )

    // Create Spirou et Fantasio collection (with image fetching)
    await createComicCollection(
      'Spirou and Fantasio',
      'The complete collection of Spirou and Fantasio comic albums. Follow the adventures of the intrepid reporter Spirou and his friend Fantasio!',
      SPIROU_ALBUMS,
      'Comics',
      ['Comics', 'European Comics', 'Spirou', 'French Comics', 'Franco-Belgian Comics'],
      undefined,
      true // Fetch images
    )

    // Create Tintin collection (with image fetching)
    await createComicCollection(
      'The Adventures of Tintin',
      'The complete collection of Tintin comic albums by Hergé. Follow the adventures of the intrepid reporter Tintin and his faithful dog Snowy.',
      TINTIN_ALBUMS,
      'Comics',
      ['Comics', 'European Comics', 'Tintin', 'French Comics', 'Franco-Belgian Comics'],
      undefined,
      true // Fetch images
    )

    // Create Lucky Luke collection (with image fetching)
    await createComicCollection(
      'Lucky Luke',
      'The complete collection of Lucky Luke comic albums by Morris and various writers. Follow the adventures of the fastest gun in the West!',
      LUCKY_LUKE_ALBUMS,
      'Comics',
      ['Comics', 'European Comics', 'Lucky Luke', 'French Comics', 'Franco-Belgian Comics', 'Western'],
      undefined,
      true // Fetch images
    )

    // Create LTB Spezial collection (German - special editions) - skip image fetching for numbered series
    const ltbSpezialIssues = generateLTBSpecialIssues('Lustiges Taschenbuch Spezial', 1, 100)
    await createComicCollection(
      'Lustiges Taschenbuch Spezial',
      'Spezial-Ausgaben der Lustigen Taschenbücher mit besonderen Geschichten und Themen. Special editions of the German Donald Duck comics with special stories and themes.',
      ltbSpezialIssues,
      'Comics',
      ['Comics', 'European Comics', 'Donald Duck', 'German Comics', 'Disney Comics', 'LTB', 'LTB Spezial'],
      undefined,
      false // Skip image fetching for numbered series
    )

    // Create LTB Crime collection (German - crime-themed editions)
    const ltbCrimeIssues = generateLTBSpecialIssues('Lustiges Taschenbuch Crime', 1, 50)
    await createComicCollection(
      'Lustiges Taschenbuch Crime',
      'Krimi-Ausgaben der Lustigen Taschenbücher mit spannenden Detektivgeschichten. Crime-themed editions of the German Donald Duck comics with exciting detective stories.',
      ltbCrimeIssues,
      'Comics',
      ['Comics', 'European Comics', 'Donald Duck', 'German Comics', 'Disney Comics', 'LTB', 'LTB Crime'],
      undefined,
      false // Skip image fetching for numbered series
    )

    // Create LTB Premium collection (German - premium editions)
    const ltbPremiumIssues = generateLTBSpecialIssues('Lustiges Taschenbuch Premium', 1, 30)
    await createComicCollection(
      'Lustiges Taschenbuch Premium',
      'Premium-Ausgaben der Lustigen Taschenbücher mit hochwertigen Geschichten. Premium editions of the German Donald Duck comics with high-quality stories.',
      ltbPremiumIssues,
      'Comics',
      ['Comics', 'European Comics', 'Donald Duck', 'German Comics', 'Disney Comics', 'LTB', 'LTB Premium'],
      undefined,
      false // Skip image fetching for numbered series
    )

    // Create LTB Enten-Edition collection (German - duck-themed special)
    const ltbEntenIssues = generateLTBSpecialIssues('Lustiges Taschenbuch Enten-Edition', 1, 20)
    await createComicCollection(
      'Lustiges Taschenbuch Enten-Edition',
      'Enten-Edition der Lustigen Taschenbücher mit Geschichten rund um Entenhausen. Duck-themed special edition of the German Donald Duck comics with stories about Duckburg.',
      ltbEntenIssues,
      'Comics',
      ['Comics', 'European Comics', 'Donald Duck', 'German Comics', 'Disney Comics', 'LTB', 'LTB Enten-Edition'],
      undefined,
      false // Skip image fetching for numbered series
    )

    console.log('\n✅ European comics seeding completed!')
  } catch (error) {
    console.error('❌ Error seeding European comics:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


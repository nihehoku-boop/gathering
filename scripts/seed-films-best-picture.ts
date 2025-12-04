import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { processMovie, sleep, DELAY_BETWEEN_REQUESTS } from './lib/tmdb-utils'

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

if (!process.env.TMDB_API_KEY) {
  console.error('❌ Error: TMDB_API_KEY environment variable is not set')
  console.error('   Get a free API key from: https://www.themoviedb.org/settings/api')
  process.exit(1)
}

const prisma = new PrismaClient()

// Complete list of Best Picture winners (1929-2024)
const BEST_PICTURE_WINNERS = [
  { year: 2024, title: 'Oppenheimer' },
  { year: 2023, title: 'Everything Everywhere All at Once' },
  { year: 2022, title: 'CODA' },
  { year: 2021, title: 'Nomadland' },
  { year: 2020, title: 'Parasite' },
  { year: 2019, title: 'Green Book' },
  { year: 2018, title: 'The Shape of Water' },
  { year: 2017, title: 'Moonlight' },
  { year: 2016, title: 'Spotlight' },
  { year: 2015, title: 'Birdman or (The Unexpected Virtue of Ignorance)' },
  { year: 2014, title: '12 Years a Slave' },
  { year: 2013, title: 'Argo' },
  { year: 2012, title: 'The Artist' },
  { year: 2011, title: 'The King\'s Speech' },
  { year: 2010, title: 'The Hurt Locker' },
  { year: 2009, title: 'Slumdog Millionaire' },
  { year: 2008, title: 'No Country for Old Men' },
  { year: 2007, title: 'The Departed' },
  { year: 2006, title: 'Crash' },
  { year: 2005, title: 'Million Dollar Baby' },
  { year: 2004, title: 'The Lord of the Rings: The Return of the King' },
  { year: 2003, title: 'Chicago' },
  { year: 2002, title: 'A Beautiful Mind' },
  { year: 2001, title: 'Gladiator' },
  { year: 2000, title: 'American Beauty' },
  { year: 1999, title: 'Shakespeare in Love' },
  { year: 1998, title: 'Titanic' },
  { year: 1997, title: 'The English Patient' },
  { year: 1996, title: 'Braveheart' },
  { year: 1995, title: 'Forrest Gump' },
  { year: 1994, title: 'Schindler\'s List' },
  { year: 1993, title: 'Unforgiven' },
  { year: 1992, title: 'The Silence of the Lambs' },
  { year: 1991, title: 'Dances with Wolves' },
  { year: 1990, title: 'Driving Miss Daisy' },
  { year: 1989, title: 'Rain Man' },
  { year: 1988, title: 'The Last Emperor' },
  { year: 1987, title: 'Platoon' },
  { year: 1986, title: 'Out of Africa' },
  { year: 1985, title: 'Amadeus' },
  { year: 1984, title: 'Terms of Endearment' },
  { year: 1983, title: 'Gandhi' },
  { year: 1982, title: 'Chariots of Fire' },
  { year: 1981, title: 'Ordinary People' },
  { year: 1980, title: 'Kramer vs. Kramer' },
  { year: 1979, title: 'The Deer Hunter' },
  { year: 1978, title: 'Annie Hall' },
  { year: 1977, title: 'Rocky' },
  { year: 1976, title: 'One Flew Over the Cuckoo\'s Nest' },
  { year: 1975, title: 'The Godfather Part II' },
  { year: 1974, title: 'The Sting' },
  { year: 1973, title: 'The Godfather' },
  { year: 1972, title: 'The French Connection' },
  { year: 1971, title: 'Patton' },
  { year: 1970, title: 'Midnight Cowboy' },
  { year: 1969, title: 'Oliver!' },
  { year: 1968, title: 'In the Heat of the Night' },
  { year: 1967, title: 'A Man for All Seasons' },
  { year: 1966, title: 'The Sound of Music' },
  { year: 1965, title: 'My Fair Lady' },
  { year: 1964, title: 'Tom Jones' },
  { year: 1963, title: 'Lawrence of Arabia' },
  { year: 1962, title: 'West Side Story' },
  { year: 1961, title: 'The Apartment' },
  { year: 1960, title: 'Ben-Hur' },
  { year: 1959, title: 'Gigi' },
  { year: 1958, title: 'The Bridge on the River Kwai' },
  { year: 1957, title: 'Around the World in 80 Days' },
  { year: 1956, title: 'Marty' },
  { year: 1955, title: 'On the Waterfront' },
  { year: 1954, title: 'From Here to Eternity' },
  { year: 1953, title: 'The Greatest Show on Earth' },
  { year: 1952, title: 'An American in Paris' },
  { year: 1951, title: 'All About Eve' },
  { year: 1950, title: 'All the King\'s Men' },
  { year: 1949, title: 'Hamlet' },
  { year: 1948, title: 'Gentleman\'s Agreement' },
  { year: 1947, title: 'The Best Years of Our Lives' },
  { year: 1946, title: 'The Lost Weekend' },
  { year: 1944, title: 'Going My Way' }, // Note: Award was for 1944, film released 1944
  { year: 1944, title: 'Casablanca' },
  { year: 1943, title: 'Mrs. Miniver' },
  { year: 1942, title: 'How Green Was My Valley' },
  { year: 1941, title: 'Rebecca' },
  { year: 1940, title: 'Gone with the Wind' },
  { year: 1939, title: 'You Can\'t Take It with You' },
  { year: 1938, title: 'The Life of Emile Zola' },
  { year: 1937, title: 'The Great Ziegfeld' },
  { year: 1936, title: 'Mutiny on the Bounty' },
  { year: 1935, title: 'It Happened One Night' },
  { year: 1934, title: 'Cavalcade' },
  { year: 1933, title: 'Grand Hotel' },
  { year: 1932, title: 'Cimarron' },
  { year: 1931, title: 'All Quiet on the Western Front' },
  { year: 1930, title: 'The Broadway Melody' },
  { year: 1929, title: 'Wings' },
]

interface CollectionConfig {
  name: string
  description: string
  sourceUrl: string
  category: string
  tags: string[]
  movies: Array<{ title: string; year: number }>
}

async function createFilmCollection(
  prisma: PrismaClient,
  adminUserId: string,
  config: CollectionConfig,
  forceRecreate: boolean = false
) {
  // Check if collection already exists
  const existingCollection = await prisma.communityCollection.findFirst({
    where: {
      name: config.name,
      category: config.category,
    },
  })

  if (existingCollection && !forceRecreate) {
    console.log(`⚠️  Collection "${config.name}" already exists. Use --force to recreate.`)
    return existingCollection
  }

  if (existingCollection && forceRecreate) {
    console.log(`🔄 Recreating "${config.name}"...`)
    await prisma.communityItem.deleteMany({
      where: { communityCollectionId: existingCollection.id },
    })
    await prisma.communityCollection.delete({
      where: { id: existingCollection.id },
    })
  }

  console.log(`\n🎬 Processing ${config.movies.length} films for "${config.name}"...`)
  console.log(`⏱️  Estimated time: ${Math.round((config.movies.length * DELAY_BETWEEN_REQUESTS) / 1000 / 60)} minutes\n`)

  const filmItems: Array<{
    name: string
    number: number | null
    notes: string | null
    image: string | null
    customFields: string
  }> = []

  let processed = 0
  let skipped = 0
  const startTime = Date.now()

  // Process each film
  for (let i = 0; i < config.movies.length; i++) {
    const movie = config.movies[i]
    const filmNumber = i + 1

    try {
      console.log(`[${filmNumber}/${config.movies.length}] 🎬 "${movie.title}" (${movie.year})...`)
      
      let movieData = await processMovie(movie.title, movie.year, DELAY_BETWEEN_REQUESTS)
      
      // Special handling for problematic films
      if (!movieData || (movie.title === 'Oliver!' && movieData.title !== 'Oliver!' && movieData.title !== 'Oliver')) {
        if (movie.title === 'Oliver!' && movie.year === 1969) {
          // Oliver! (1968 musical) - try without exclamation and correct year
          console.log(`   🔄 Retrying "Oliver!" with alternative search...`)
          await sleep(DELAY_BETWEEN_REQUESTS)
          movieData = await processMovie('Oliver', 1968, 0)
        } else if (movie.title === 'Going My Way' && movie.year === 1944) {
          // Try 1945 as well (award was for 1944 but film might be listed as 1945)
          console.log(`   🔄 Retrying "Going My Way" with 1945...`)
          await sleep(DELAY_BETWEEN_REQUESTS)
          movieData = await processMovie('Going My Way', 1945, 0)
        }
      }
      
      if (!movieData) {
        console.log(`   ⚠️  Failed to process film`)
        skipped++
        continue
      }
      
      // Verify Oliver! got the right match
      if (movie.title === 'Oliver!' && movieData.title !== 'Oliver!' && movieData.title !== 'Oliver') {
        console.log(`   ⚠️  Warning: Got "${movieData.title}" instead of "Oliver!" - may need manual fix`)
      }

      // Build customFields JSON for film template
      const customFields = {
        director: movieData.director,
        year: movieData.year,
        format: 'Blu-ray', // Default format
        edition: 'Standard', // Default edition
        region: 'Region A (Americas)', // Default region
        runtime: movieData.runtime,
        rating: movieData.rating,
        genre: movieData.genre,
        studio: 'Various', // Will be filled from TMDB if available
      }

      filmItems.push({
        name: movieData.title,
        number: filmNumber,
        notes: `Best Picture Winner ${movie.year}`,
        image: movieData.posterUrl,
        customFields: JSON.stringify(customFields),
      })

      const posterStatus = movieData.posterUrl ? ' (with poster)' : ' (no poster)'
      console.log(`   ✅ Added "${movieData.title}"${posterStatus}`)
      processed++

      // Progress update every 10 films
      if (processed % 10 === 0) {
        const elapsed = Math.round((Date.now() - startTime) / 1000)
        console.log(`\n   📊 Progress: ${processed} processed, ${skipped} skipped | Time: ${Math.round(elapsed / 60)}m ${elapsed % 60}s\n`)
      }
    } catch (error) {
      console.error(`   ❌ Error processing "${movie.title}":`, error)
      skipped++
    }
  }

  console.log(`\n✅ Processed ${processed} films, skipped ${skipped}`)
  console.log(`📦 Creating community collection...`)

  // Add source link and TMDB attribution to description
  const descriptionWithSource = `${config.description}\n\nSource: ${config.sourceUrl}\n\nThis product uses the TMDb API but is not endorsed or certified by TMDb. Movie data and images provided by The Movie Database (TMDb).`

  // Create the community collection
  const collection = await prisma.communityCollection.create({
    data: {
      name: config.name,
      description: descriptionWithSource,
      category: config.category,
      template: 'film',
      tags: JSON.stringify(config.tags),
      userId: adminUserId,
      items: {
        create: filmItems,
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
  console.log(`   ✅ Films added: ${collection.items.length}`)
  console.log(`   ⏭️  Skipped: ${skipped} films`)
  console.log(`   ⏱️  Total time: ${minutes}m ${seconds}s`)

  return collection
}

async function main() {
  const args = process.argv.slice(2)
  const forceRecreate = args.includes('--force')
  const isTestMode = args.includes('--test')

  console.log('🎬 Seeding Best Picture Winners collection\n')

  if (isTestMode) {
    console.log('🧪 Running in TEST mode (limited films)\n')
  }

  // Get admin user
  const adminUser = await prisma.user.findFirst({
    where: { isAdmin: true },
  })

  if (!adminUser) {
    console.error('❌ Error: Admin user not found. Please create an admin user first.')
    process.exit(1)
  }

  const moviesToProcess = isTestMode 
    ? BEST_PICTURE_WINNERS.slice(0, 5) // Test with first 5
    : BEST_PICTURE_WINNERS

  console.log(`📖 Processing ${moviesToProcess.length} Best Picture winners with TMDB API...\n`)

  const collectionConfig: CollectionConfig = {
    name: 'Academy Award Best Picture Winners',
    description: 'Complete list of all Academy Award winners for Best Picture from 1929 to 2024. These are the most prestigious films in cinema history.',
    sourceUrl: 'https://www.oscars.org/oscars/ceremonies',
    category: 'Films',
    tags: ['Films', 'Movies', 'Oscars', 'Academy Awards', 'Best Picture', 'Cinema'],
    movies: moviesToProcess,
  }

  await createFilmCollection(prisma, adminUser.id, collectionConfig, forceRecreate)

  console.log('\n✅ Best Picture Winners collection seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


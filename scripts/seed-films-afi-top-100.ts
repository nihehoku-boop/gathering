import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { processMovie, sleep, DELAY_BETWEEN_REQUESTS } from './lib/tmdb-utils'

// Load environment variables
try {
  const envPath = resolve(process.cwd(), '.env.local')
  const envFile = readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = value
      }
    }
  })
} catch (error) {
  console.warn('⚠️  Could not load .env.local file')
}

if (!process.env.TMDB_API_KEY) {
  console.error('❌ Error: TMDB_API_KEY environment variable is not set')
  console.error('   Get a free API key from: https://www.themoviedb.org/settings/api')
  process.exit(1)
}

const prisma = new PrismaClient()

// AFI's 100 Years...100 Movies (2007 edition - the most recent)
// This is the definitive list from the American Film Institute
const AFI_TOP_100_FILMS = [
  { year: 1941, title: 'Citizen Kane' },
  { year: 1942, title: 'Casablanca' },
  { year: 1972, title: 'The Godfather' },
  { year: 1939, title: 'Gone with the Wind' },
  { year: 1958, title: 'Lawrence of Arabia' },
  { year: 1939, title: 'The Wizard of Oz' },
  { year: 1967, title: 'The Graduate' },
  { year: 1946, title: 'On the Waterfront' },
  { year: 1954, title: 'Schindler\'s List' },
  { year: 1975, title: 'Singin\' in the Rain' },
  { year: 1957, title: 'It\'s a Wonderful Life' },
  { year: 1950, title: 'Sunset Boulevard' },
  { year: 1965, title: 'The Bridge on the River Kwai' },
  { year: 1982, title: 'Some Like It Hot' },
  { year: 1960, title: 'Star Wars' },
  { year: 1940, title: 'All About Eve' },
  { year: 1964, title: 'The African Queen' },
  { year: 1966, title: 'Psycho' },
  { year: 1975, title: 'Chinatown' },
  { year: 2001, title: 'One Flew Over the Cuckoo\'s Nest' },
  { year: 1993, title: 'The Grapes of Wrath' },
  { year: 1940, title: '2001: A Space Odyssey' },
  { year: 1968, title: 'The Maltese Falcon' },
  { year: 1941, title: 'Raging Bull' },
  { year: 1980, title: 'E.T. the Extra-Terrestrial' },
  { year: 1982, title: 'Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb' },
  { year: 1964, title: 'Bonnie and Clyde' },
  { year: 1967, title: 'Apocalypse Now' },
  { year: 1979, title: 'Mr. Smith Goes to Washington' },
  { year: 1939, title: 'The Treasure of the Sierra Madre' },
  { year: 1948, title: 'Annie Hall' },
  { year: 1977, title: 'The Godfather Part II' },
  { year: 1974, title: 'High Noon' },
  { year: 1952, title: 'To Kill a Mockingbird' },
  { year: 1962, title: 'It Happened One Night' },
  { year: 1934, title: 'Midnight Cowboy' },
  { year: 1969, title: 'The Best Years of Our Lives' },
  { year: 1946, title: 'Double Indemnity' },
  { year: 1944, title: 'Doctor Zhivago' },
  { year: 1965, title: 'North by Northwest' },
  { year: 1959, title: 'West Side Story' },
  { year: 1961, title: 'Rear Window' },
  { year: 1954, title: 'King Kong' },
  { year: 1933, title: 'The Birth of a Nation' },
  { year: 1915, title: 'A Streetcar Named Desire' },
  { year: 1951, title: 'A Clockwork Orange' },
  { year: 1971, title: 'Taxi Driver' },
  { year: 1976, title: 'Jaws' },
  { year: 1975, title: 'Snow White and the Seven Dwarfs' },
  { year: 1937, title: 'Butch Cassidy and the Sundance Kid' },
  { year: 1969, title: 'The Philadelphia Story' },
  { year: 1940, title: 'From Here to Eternity' },
  { year: 1953, title: 'Amadeus' },
  { year: 1984, title: 'All Quiet on the Western Front' },
  { year: 1930, title: 'The Third Man' },
  { year: 1949, title: 'Fantasia' },
  { year: 1940, title: 'Rebel Without a Cause' },
  { year: 1955, title: 'Raiders of the Lost Ark' },
  { year: 1981, title: 'Vertigo' },
  { year: 1958, title: 'Tootsie' },
  { year: 1982, title: 'Stagecoach' },
  { year: 1939, title: 'Close Encounters of the Third Kind' },
  { year: 1977, title: 'The Silence of the Lambs' },
  { year: 1991, title: 'Network' },
  { year: 1976, title: 'The Manchurian Candidate' },
  { year: 1962, title: 'An American in Paris' },
  { year: 1951, title: 'Shane' },
  { year: 1953, title: 'The French Connection' },
  { year: 1971, title: 'Forrest Gump' },
  { year: 1994, title: 'Ben-Hur' },
  { year: 1959, title: 'Wuthering Heights' },
  { year: 1939, title: 'The Gold Rush' },
  { year: 1925, title: 'Dances with Wolves' },
  { year: 1990, title: 'City Lights' },
  { year: 1931, title: 'American Graffiti' },
  { year: 1973, title: 'Rocky' },
  { year: 1976, title: 'The Deer Hunter' },
  { year: 1978, title: 'The Wild Bunch' },
  { year: 1969, title: 'Modern Times' },
  { year: 1936, title: 'Giant' },
  { year: 1956, title: 'Platoon' },
  { year: 1986, title: 'Fargo' },
  { year: 1996, title: 'Duck Soup' },
  { year: 1933, title: 'Mutiny on the Bounty' },
  { year: 1935, title: 'Frankenstein' },
  { year: 1931, title: 'Easy Rider' },
  { year: 1969, title: 'Patton' },
  { year: 1970, title: 'The Jazz Singer' },
  { year: 1927, title: 'My Fair Lady' },
  { year: 1964, title: 'A Place in the Sun' },
  { year: 1951, title: 'The Apartment' },
  { year: 1960, title: 'Goodfellas' },
  { year: 1990, title: 'Pulp Fiction' },
  { year: 1994, title: 'The Searchers' },
  { year: 1956, title: 'Bringing Up Baby' },
  { year: 1938, title: 'Unforgiven' },
  { year: 1992, title: 'Guess Who\'s Coming to Dinner' },
  { year: 1967, title: 'Yankee Doodle Dandy' },
  { year: 1942, title: 'Yankee Doodle Dandy' },
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
      
      const movieData = await processMovie(movie.title, movie.year, DELAY_BETWEEN_REQUESTS)
      
      if (!movieData) {
        console.log(`   ⚠️  Failed to process film`)
        skipped++
        continue
      }

      // Build customFields JSON for film template
      const customFields = {
        director: movieData.director,
        releaseYear: movieData.year,
        format: 'Blu-ray', // Default format
        edition: 'Standard', // Default edition
        region: 'Region A/1', // Default region
        runtime: movieData.runtime,
        rating: movieData.rating,
        genre: movieData.genre,
        studio: 'Various', // Will be filled from TMDB if available
      }

      filmItems.push({
        name: movieData.title,
        number: filmNumber,
        notes: `AFI Top 100 #${filmNumber} (${movie.year})`,
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
  console.log(`   ✅ Films added: ${processed}`)
  console.log(`   ⏭️  Skipped: ${skipped} films`)
  console.log(`   ⏱️  Total time: ${minutes}m ${seconds}s\n`)

  return collection
}

async function main() {
  const forceRecreate = process.argv.includes('--force')
  const isTestMode = process.argv.includes('--test')

  // Get admin user
  const adminUser = await prisma.user.findFirst({
    where: { isAdmin: true },
  })

  if (!adminUser) {
    console.error('❌ Error: Admin user not found. Please create an admin user first.')
    process.exit(1)
  }

  const moviesToProcess = isTestMode 
    ? AFI_TOP_100_FILMS.slice(0, 5) // Test with first 5
    : AFI_TOP_100_FILMS

  console.log(`📖 Processing ${moviesToProcess.length} AFI Top 100 films with TMDB API...\n`)

  const collectionConfig: CollectionConfig = {
    name: 'AFI\'s 100 Years...100 Movies',
    description: 'The American Film Institute\'s list of the 100 greatest American films of all time, as selected by a panel of over 1,500 film artists, critics, and historians. This is the 2007 edition, the most recent version of the list.',
    sourceUrl: 'https://www.afi.com/afis-100-years-100-movies-10th-anniversary-edition/',
    category: 'Films',
    tags: ['Films', 'Classic', 'American Cinema', 'AFI', 'Top 100'],
    movies: moviesToProcess,
  }

  await createFilmCollection(prisma, adminUser.id, collectionConfig, forceRecreate)

  console.log('\n✅ AFI Top 100 collection seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


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

// Marvel Cinematic Universe films in release order (Phase 1-5)
const MCU_FILMS = [
  { year: 2008, title: 'Iron Man' },
  { year: 2008, title: 'The Incredible Hulk' },
  { year: 2010, title: 'Iron Man 2' },
  { year: 2011, title: 'Thor' },
  { year: 2011, title: 'Captain America: The First Avenger' },
  { year: 2012, title: 'The Avengers' },
  { year: 2013, title: 'Iron Man 3' },
  { year: 2013, title: 'Thor: The Dark World' },
  { year: 2014, title: 'Captain America: The Winter Soldier' },
  { year: 2014, title: 'Guardians of the Galaxy' },
  { year: 2015, title: 'Avengers: Age of Ultron' },
  { year: 2015, title: 'Ant-Man' },
  { year: 2016, title: 'Captain America: Civil War' },
  { year: 2016, title: 'Doctor Strange' },
  { year: 2017, title: 'Guardians of the Galaxy Vol. 2' },
  { year: 2017, title: 'Spider-Man: Homecoming' },
  { year: 2017, title: 'Thor: Ragnarok' },
  { year: 2018, title: 'Black Panther' },
  { year: 2018, title: 'Avengers: Infinity War' },
  { year: 2018, title: 'Ant-Man and the Wasp' },
  { year: 2019, title: 'Captain Marvel' },
  { year: 2019, title: 'Avengers: Endgame' },
  { year: 2019, title: 'Spider-Man: Far From Home' },
  { year: 2021, title: 'Black Widow' },
  { year: 2021, title: 'Shang-Chi and the Legend of the Ten Rings' },
  { year: 2021, title: 'Eternals' },
  { year: 2021, title: 'Spider-Man: No Way Home' },
  { year: 2022, title: 'Doctor Strange in the Multiverse of Madness' },
  { year: 2022, title: 'Thor: Love and Thunder' },
  { year: 2022, title: 'Black Panther: Wakanda Forever' },
  { year: 2023, title: 'Ant-Man and the Wasp: Quantumania' },
  { year: 2023, title: 'Guardians of the Galaxy Vol. 3' },
  { year: 2023, title: 'The Marvels' },
  { year: 2024, title: 'Deadpool & Wolverine' },
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

      // Determine phase based on release order
      let phase = 'Phase 1'
      if (filmNumber >= 7 && filmNumber <= 12) phase = 'Phase 2'
      else if (filmNumber >= 13 && filmNumber <= 20) phase = 'Phase 3'
      else if (filmNumber >= 21 && filmNumber <= 28) phase = 'Phase 4'
      else if (filmNumber >= 29) phase = 'Phase 5'

      // Build customFields JSON for film template
      const customFields = {
        director: movieData.director,
        releaseYear: movieData.year,
        format: 'Blu-ray', // Default format
        edition: `${phase} - MCU`, // Phase information
        region: 'Region A/1', // Default region
        runtime: movieData.runtime,
        rating: movieData.rating,
        genre: movieData.genre,
        studio: 'Marvel Studios',
      }

      filmItems.push({
        name: movieData.title,
        number: filmNumber,
        notes: `MCU ${phase} - Film #${filmNumber} (${movie.year})`,
        image: movieData.posterUrl,
        customFields: JSON.stringify(customFields),
      })

      const posterStatus = movieData.posterUrl ? ' (with poster)' : ' (no poster)'
      console.log(`   ✅ Added "${movieData.title}"${posterStatus}`)
      processed++

      // Progress update every 5 films
      if (processed % 5 === 0) {
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
    ? MCU_FILMS.slice(0, 3) // Test with first 3
    : MCU_FILMS

  console.log(`📖 Processing ${moviesToProcess.length} MCU films with TMDB API...\n`)

  const collectionConfig: CollectionConfig = {
    name: 'Marvel Cinematic Universe',
    description: 'Complete collection of all Marvel Cinematic Universe (MCU) films in release order. The MCU is a shared universe of superhero films produced by Marvel Studios, featuring characters from Marvel Comics.',
    sourceUrl: 'https://www.marvel.com/movies',
    category: 'Films',
    tags: ['Films', 'Superhero', 'Marvel', 'MCU', 'Action', 'Comics'],
    movies: moviesToProcess,
  }

  await createFilmCollection(prisma, adminUser.id, collectionConfig, forceRecreate)

  console.log('\n✅ MCU collection seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


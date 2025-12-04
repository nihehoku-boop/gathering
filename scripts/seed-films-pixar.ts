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

// Pixar Animation Studios films in release order
const PIXAR_FILMS = [
  { year: 1995, title: 'Toy Story' },
  { year: 1998, title: 'A Bug\'s Life' },
  { year: 1999, title: 'Toy Story 2' },
  { year: 2001, title: 'Monsters, Inc.' },
  { year: 2003, title: 'Finding Nemo' },
  { year: 2004, title: 'The Incredibles' },
  { year: 2006, title: 'Cars' },
  { year: 2007, title: 'Ratatouille' },
  { year: 2008, title: 'WALL-E' },
  { year: 2009, title: 'Up' },
  { year: 2010, title: 'Toy Story 3' },
  { year: 2011, title: 'Cars 2' },
  { year: 2012, title: 'Brave' },
  { year: 2013, title: 'Monsters University' },
  { year: 2015, title: 'Inside Out' },
  { year: 2015, title: 'The Good Dinosaur' },
  { year: 2016, title: 'Finding Dory' },
  { year: 2017, title: 'Cars 3' },
  { year: 2017, title: 'Coco' },
  { year: 2018, title: 'Incredibles 2' },
  { year: 2019, title: 'Toy Story 4' },
  { year: 2020, title: 'Onward' },
  { year: 2020, title: 'Soul' },
  { year: 2021, title: 'Luca' },
  { year: 2022, title: 'Turning Red' },
  { year: 2022, title: 'Lightyear' },
  { year: 2023, title: 'Elemental' },
  { year: 2024, title: 'Inside Out 2' },
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
        edition: 'Pixar Animation', // Special edition marker
        region: 'Region A/1', // Default region
        runtime: movieData.runtime,
        rating: movieData.rating,
        genre: movieData.genre,
        studio: 'Pixar Animation Studios',
      }

      filmItems.push({
        name: movieData.title,
        number: filmNumber,
        notes: `Pixar Film #${filmNumber} (${movie.year})`,
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
    ? PIXAR_FILMS.slice(0, 3) // Test with first 3
    : PIXAR_FILMS

  console.log(`📖 Processing ${moviesToProcess.length} Pixar films with TMDB API...\n`)

  const collectionConfig: CollectionConfig = {
    name: 'Pixar Animation Studios Collection',
    description: 'Complete collection of all feature films from Pixar Animation Studios. Pixar is known for creating groundbreaking computer-animated films that combine innovative technology with compelling storytelling.',
    sourceUrl: 'https://www.pixar.com/feature-films',
    category: 'Films',
    tags: ['Films', 'Animation', 'Pixar', 'Family', 'Disney'],
    movies: moviesToProcess,
  }

  await createFilmCollection(prisma, adminUser.id, collectionConfig, forceRecreate)

  console.log('\n✅ Pixar collection seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


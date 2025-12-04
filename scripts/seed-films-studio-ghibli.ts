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

// Studio Ghibli films (all feature films)
const STUDIO_GHIBLI_FILMS = [
  { year: 1986, title: 'Castle in the Sky' },
  { year: 1988, title: 'Grave of the Fireflies' },
  { year: 1988, title: 'My Neighbor Totoro' },
  { year: 1989, title: 'Kiki\'s Delivery Service' },
  { year: 1991, title: 'Only Yesterday' },
  { year: 1992, title: 'Porco Rosso' },
  { year: 1993, title: 'Ocean Waves' },
  { year: 1994, title: 'Pom Poko' },
  { year: 1995, title: 'Whisper of the Heart' },
  { year: 1997, title: 'Princess Mononoke' },
  { year: 1999, title: 'My Neighbors the Yamadas' },
  { year: 2001, title: 'Spirited Away' },
  { year: 2002, title: 'The Cat Returns' },
  { year: 2004, title: 'Howl\'s Moving Castle' },
  { year: 2006, title: 'Tales from Earthsea' },
  { year: 2008, title: 'Ponyo' },
  { year: 2010, title: 'The Secret World of Arrietty' },
  { year: 2011, title: 'From Up on Poppy Hill' },
  { year: 2013, title: 'The Wind Rises' },
  { year: 2013, title: 'The Tale of the Princess Kaguya' },
  { year: 2014, title: 'When Marnie Was There' },
  { year: 2020, title: 'Earwig and the Witch' },
  { year: 2023, title: 'The Boy and the Heron' },
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
      if (!movieData) {
        // Try alternative titles for known problematic films
        if (movie.title === 'Grave of the Fireflies') {
          console.log(`   🔄 Trying alternative search...`)
          await sleep(DELAY_BETWEEN_REQUESTS)
          movieData = await processMovie('Hotaru no haka', movie.year, 0)
        } else if (movie.title === 'Only Yesterday') {
          console.log(`   🔄 Trying alternative search...`)
          await sleep(DELAY_BETWEEN_REQUESTS)
          movieData = await processMovie('Omohide poro poro', movie.year, 0)
        } else if (movie.title === 'Ocean Waves') {
          console.log(`   🔄 Trying alternative search...`)
          await sleep(DELAY_BETWEEN_REQUESTS)
          movieData = await processMovie('Umi ga kikoeru', movie.year, 0)
        } else if (movie.title === 'Pom Poko') {
          console.log(`   🔄 Trying alternative search...`)
          await sleep(DELAY_BETWEEN_REQUESTS)
          movieData = await processMovie('Heisei tanuki gassen ponpoko', movie.year, 0)
        } else if (movie.title === 'Whisper of the Heart') {
          console.log(`   🔄 Trying alternative search...`)
          await sleep(DELAY_BETWEEN_REQUESTS)
          movieData = await processMovie('Mimi wo sumaseba', movie.year, 0)
        } else if (movie.title === 'My Neighbors the Yamadas') {
          console.log(`   🔄 Trying alternative search...`)
          await sleep(DELAY_BETWEEN_REQUESTS)
          movieData = await processMovie('Hôhokekyo tonari no Yamada-kun', movie.year, 0)
        } else if (movie.title === 'The Cat Returns') {
          console.log(`   🔄 Trying alternative search...`)
          await sleep(DELAY_BETWEEN_REQUESTS)
          movieData = await processMovie('Neko no ongaeshi', movie.year, 0)
        } else if (movie.title === 'Tales from Earthsea') {
          console.log(`   🔄 Trying alternative search...`)
          await sleep(DELAY_BETWEEN_REQUESTS)
          movieData = await processMovie('Gedo senki', movie.year, 0)
        } else if (movie.title === 'The Secret World of Arrietty') {
          console.log(`   🔄 Trying alternative search...`)
          await sleep(DELAY_BETWEEN_REQUESTS)
          movieData = await processMovie('Arrietty', movie.year, 0)
        } else if (movie.title === 'From Up on Poppy Hill') {
          console.log(`   🔄 Trying alternative search...`)
          await sleep(DELAY_BETWEEN_REQUESTS)
          movieData = await processMovie('Kokuriko-zaka kara', movie.year, 0)
        } else if (movie.title === 'The Tale of the Princess Kaguya') {
          console.log(`   🔄 Trying alternative search...`)
          await sleep(DELAY_BETWEEN_REQUESTS)
          movieData = await processMovie('Kaguya-hime no monogatari', movie.year, 0)
        } else if (movie.title === 'When Marnie Was There') {
          console.log(`   🔄 Trying alternative search...`)
          await sleep(DELAY_BETWEEN_REQUESTS)
          movieData = await processMovie('Omoide no Mânî', movie.year, 0)
        } else if (movie.title === 'Earwig and the Witch') {
          console.log(`   🔄 Trying alternative search...`)
          await sleep(DELAY_BETWEEN_REQUESTS)
          movieData = await processMovie('Âya to majo', movie.year, 0)
        }
      }
      
      if (!movieData) {
        console.log(`   ⚠️  Failed to process film`)
        skipped++
        continue
      }

      // Build customFields JSON for film template
      const customFields = {
        director: movieData.director,
        year: movieData.year,
        format: 'Blu-ray', // Default format
        edition: 'Studio Ghibli', // Special edition marker
        region: 'Region A/1', // Default region
        runtime: movieData.runtime,
        rating: movieData.rating,
        genre: movieData.genre,
        studio: 'Studio Ghibli',
      }

      filmItems.push({
        name: movieData.title,
        number: filmNumber,
        notes: `Studio Ghibli Film (${movie.year})`,
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
    ? STUDIO_GHIBLI_FILMS.slice(0, 3) // Test with first 3
    : STUDIO_GHIBLI_FILMS

  console.log(`📖 Processing ${moviesToProcess.length} Studio Ghibli films with TMDB API...\n`)

  const collectionConfig: CollectionConfig = {
    name: 'Studio Ghibli Collection',
    description: 'Complete collection of all Studio Ghibli feature films. Studio Ghibli is a Japanese animation studio known for its high-quality animated films, including classics like Spirited Away, My Neighbor Totoro, and Princess Mononoke.',
    sourceUrl: 'https://www.ghibli.jp/works/',
    category: 'Films',
    tags: ['Films', 'Animation', 'Studio Ghibli', 'Japanese', 'Anime', 'Family'],
    movies: moviesToProcess,
  }

  await createFilmCollection(prisma, adminUser.id, collectionConfig, forceRecreate)

  console.log('\n✅ Studio Ghibli collection seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


/**
 * Quick test script to generate a single cover image for preview
 */

import { prisma } from '../lib/prisma'
import { generateSVGCover } from '../lib/generate-cover'
import * as fs from 'fs'
import * as path from 'path'

async function main() {
  console.log('🎨 Generating test cover image...\n')

  let collectionName = 'My Test Collection'
  let collectionCategory: string | null = 'Books'
  let collectionId = 'test'

  // Try to find a real collection if database is available
  if (process.env.DATABASE_URL || process.env.PRISMA_DATABASE_URL) {
    try {
      const collection = await prisma.collection.findFirst({
        where: {
          OR: [
            { coverImage: null },
            { coverImage: '' },
          ],
        },
        select: {
          id: true,
          name: true,
          category: true,
        },
      })

      if (collection) {
        collectionName = collection.name
        collectionCategory = collection.category
        collectionId = collection.id
        console.log(`Found collection: "${collectionName}" (${collectionCategory || 'No category'})\n`)
      } else {
        console.log('All collections have covers. Generating test sample...\n')
      }
    } catch (error) {
      console.log('Database not available. Generating test sample...\n')
    }
  } else {
    console.log('Generating test sample (no database connection)...\n')
  }

  // Generate SVG using shared utility
  const svg = generateSVGCover(collectionName, collectionCategory)
  
  // Save to public folder
  const outputDir = path.join(process.cwd(), 'public', 'collection-covers')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  const fileName = `test-cover.svg`
  const filePath = path.join(outputDir, fileName)
  fs.writeFileSync(filePath, svg, 'utf-8')
  
  console.log(`✅ Generated test cover image:`)
  console.log(`   File: ${filePath}`)
  console.log(`   Collection: "${collectionName}"`)
  console.log(`   Category: ${collectionCategory || 'None'}`)
  console.log(`\n   Preview at: http://localhost:3000/collection-covers/${fileName}`)
  console.log(`   Or open the file directly in your browser: ${filePath}`)

  try {
    await prisma.$disconnect()
  } catch (error) {
    // Ignore disconnect errors if not connected
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

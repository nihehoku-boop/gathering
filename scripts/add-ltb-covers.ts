import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  try {
    // Find the Lustige Taschenbuch recommended collection
    const allCollections = await prisma.recommendedCollection.findMany({
      include: {
        items: true,
      },
    })

    const collection = allCollections.find(
      (c) => c.name.toLowerCase().includes('lustige') || c.name.toLowerCase().includes('taschenbuch')
    )

    if (!collection) {
      console.error('Lustige Taschenbuch collection not found')
      process.exit(1)
    }

    console.log(`Found collection: ${collection.name} (${collection.id})`)
    console.log(`Collection has ${collection.items.length} items`)

    // Get all image files from ltbcover folder
    const ltbcoverPath = path.join(process.cwd(), 'ltbcover')
    if (!fs.existsSync(ltbcoverPath)) {
      console.error('ltbcover folder not found')
      process.exit(1)
    }

    const files = fs.readdirSync(ltbcoverPath).filter(
      (file) => file.match(/\.(jpg|jpeg|png)$/i) && !file.startsWith('.')
    )

    console.log(`Found ${files.length} image files`)

    // Create a map of number -> image filename
    const imageMap = new Map<number, string>()

    for (const file of files) {
      // Extract number from filename
      // Patterns: LTB-604, LTB_598, LTB_287, LTB231, LTB28, Ltb075, etc.
      const numberMatch = file.match(/LTB[_-]?(\d+)/i)
      if (numberMatch) {
        const number = parseInt(numberMatch[1], 10)
        if (!isNaN(number)) {
          // Use the first image found for each number (prefer A variant if available)
          const isVariantA = file.includes('Variantcover_(A)') || file.includes('Variantcover_A')
          const existing = imageMap.get(number)
          
          if (!existing || isVariantA) {
            // Use relative path from public folder
            imageMap.set(number, `/ltbcover/${file}`)
          }
        }
      }
    }

    console.log(`Extracted ${imageMap.size} unique numbers from filenames`)

    // Update items with images
    let updated = 0
    let notFound = 0

    for (const item of collection.items) {
      if (item.number && imageMap.has(item.number)) {
        const imagePath = imageMap.get(item.number)!
        
        // Only update if item doesn't already have an image
        if (!item.image) {
          await prisma.recommendedItem.update({
            where: { id: item.id },
            data: { image: imagePath },
          })
          updated++
          console.log(`Updated item #${item.number} (${item.name}) with image: ${imagePath}`)
        } else {
          console.log(`Item #${item.number} already has an image, skipping`)
        }
      } else if (item.number) {
        notFound++
        console.log(`No image found for item #${item.number} (${item.name})`)
      }
    }

    console.log(`\nSummary:`)
    console.log(`- Updated ${updated} items with images`)
    console.log(`- ${notFound} items had no matching image`)
    console.log(`- ${collection.items.length - updated - notFound} items already had images or no number`)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()


/**
 * Update Cover Image Fit Script
 * 
 * Updates all existing collections to use "contain" as the default cover image fit
 * instead of "cover".
 * 
 * Usage:
 *   npm run update:cover-fit
 */

import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function updateCoverImageFit() {
  try {
    console.log('[Update] Starting cover image fit update...')

    // Update regular collections
    const collectionsResult = await prisma.collection.updateMany({
      where: {
        coverImageFit: 'cover',
      },
      data: {
        coverImageFit: 'contain',
      },
    })
    console.log(`[Update] Updated ${collectionsResult.count} regular collections`)

    // Update recommended collections
    const recommendedResult = await prisma.recommendedCollection.updateMany({
      where: {
        coverImageFit: 'cover',
      },
      data: {
        coverImageFit: 'contain',
      },
    })
    console.log(`[Update] Updated ${recommendedResult.count} recommended collections`)

    // Update community collections
    const communityResult = await prisma.communityCollection.updateMany({
      where: {
        coverImageFit: 'cover',
      },
      data: {
        coverImageFit: 'contain',
      },
    })
    console.log(`[Update] Updated ${communityResult.count} community collections`)

    // Also update null values to 'contain' (for collections that don't have it set)
    const collectionsNullResult = await prisma.collection.updateMany({
      where: {
        coverImageFit: null,
      },
      data: {
        coverImageFit: 'contain',
      },
    })
    console.log(`[Update] Updated ${collectionsNullResult.count} collections with null coverImageFit`)

    const recommendedNullResult = await prisma.recommendedCollection.updateMany({
      where: {
        coverImageFit: null,
      },
      data: {
        coverImageFit: 'contain',
      },
    })
    console.log(`[Update] Updated ${recommendedNullResult.count} recommended collections with null coverImageFit`)

    const communityNullResult = await prisma.communityCollection.updateMany({
      where: {
        coverImageFit: null,
      },
      data: {
        coverImageFit: 'contain',
      },
    })
    console.log(`[Update] Updated ${communityNullResult.count} community collections with null coverImageFit`)

    const total =
      collectionsResult.count +
      recommendedResult.count +
      communityResult.count +
      collectionsNullResult.count +
      recommendedNullResult.count +
      communityNullResult.count

    console.log(`[Update] ✓ Successfully updated ${total} collections total`)
    console.log('[Update] All collections now use "contain" as the default cover image fit')
  } catch (error) {
    console.error('[Update] ✗ Error updating cover image fit:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if executed directly
if (require.main === module) {
  updateCoverImageFit()
    .then(() => {
      console.log('\n[Update] Done!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n[Update] Error:', error)
      process.exit(1)
    })
}

export { updateCoverImageFit }


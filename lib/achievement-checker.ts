import { prisma } from '@/lib/prisma'
import { parseAchievements, stringifyAchievements } from '@/lib/achievements'

/**
 * Unlocks an achievement for a user if not already unlocked
 */
export async function unlockAchievement(userId: string, achievementId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { achievements: true },
    })

    if (!user) {
      console.error(`[Achievements] User ${userId} not found`)
      return false
    }

    const currentAchievements = parseAchievements(user.achievements || '[]')

    // Check if already unlocked
    if (currentAchievements.includes(achievementId)) {
      console.log(`[Achievements] Achievement ${achievementId} already unlocked for user ${userId}`)
      return false
    }

    // Add new achievement
    const updatedAchievements = [...currentAchievements, achievementId]

    await prisma.user.update({
      where: { id: userId },
      data: {
        achievements: stringifyAchievements(updatedAchievements),
      },
    })

    console.log(`[Achievements] Successfully unlocked ${achievementId} for user ${userId}`)
    return true
  } catch (error) {
    console.error(`[Achievements] Error unlocking achievement ${achievementId} for user ${userId}:`, error)
    return false
  }
}

/**
 * Checks and unlocks achievements related to collections
 */
export async function checkCollectionAchievements(userId: string): Promise<string[]> {
  const newlyUnlocked: string[] = []

  try {
    // Get user's collections
    const collections = await prisma.collection.findMany({
      where: { userId },
      select: {
        id: true,
        coverImage: true,
        category: true,
        tags: true,
        items: {
          select: {
            isOwned: true,
          },
        },
      },
    })

    const collectionCount = collections.length

    // Collection count achievements
    if (collectionCount >= 1 && await unlockAchievement(userId, 'first_collection')) {
      newlyUnlocked.push('first_collection')
    }
    if (collectionCount >= 5 && await unlockAchievement(userId, 'five_collections')) {
      newlyUnlocked.push('five_collections')
    }
    if (collectionCount >= 10 && await unlockAchievement(userId, 'ten_collections')) {
      newlyUnlocked.push('ten_collections')
    }
    if (collectionCount >= 25 && await unlockAchievement(userId, 'twenty_five_collections')) {
      newlyUnlocked.push('twenty_five_collections')
    }
    if (collectionCount >= 50 && await unlockAchievement(userId, 'fifty_collections')) {
      newlyUnlocked.push('fifty_collections')
    }
    if (collectionCount >= 100 && await unlockAchievement(userId, 'hundred_collections')) {
      newlyUnlocked.push('hundred_collections')
    }

    // Cover image achievements
    const collectionsWithCovers = collections.filter(c => c.coverImage).length
    if (collectionsWithCovers >= 5 && await unlockAchievement(userId, 'cover_images')) {
      newlyUnlocked.push('cover_images')
    }
    if (collectionsWithCovers === collectionCount && collectionCount > 0 && await unlockAchievement(userId, 'all_covers')) {
      newlyUnlocked.push('all_covers')
    }

    // Category variety achievements
    const uniqueCategories = new Set(collections.map(c => c.category).filter(Boolean))
    if (uniqueCategories.size >= 3 && await unlockAchievement(userId, 'three_categories')) {
      newlyUnlocked.push('three_categories')
    }
    if (uniqueCategories.size >= 5 && await unlockAchievement(userId, 'five_categories')) {
      newlyUnlocked.push('five_categories')
    }
    if (uniqueCategories.size >= 10 && await unlockAchievement(userId, 'ten_categories')) {
      newlyUnlocked.push('ten_categories')
    }

    // Completion achievements
    const completedCollections = collections.filter(c => {
      const totalItems = c.items.length
      const ownedItems = c.items.filter(i => i.isOwned).length
      return totalItems > 0 && ownedItems === totalItems
    }).length

    if (completedCollections >= 1 && await unlockAchievement(userId, 'first_complete')) {
      newlyUnlocked.push('first_complete')
    }
    if (completedCollections >= 5 && await unlockAchievement(userId, 'five_complete')) {
      newlyUnlocked.push('five_complete')
    }
    if (completedCollections >= 10 && await unlockAchievement(userId, 'ten_complete')) {
      newlyUnlocked.push('ten_complete')
    }
    if (completedCollections >= 20 && await unlockAchievement(userId, 'twenty_complete')) {
      newlyUnlocked.push('twenty_complete')
    }

    // Overall progress achievements
    const totalItems = collections.reduce((sum, c) => sum + c.items.length, 0)
    const totalOwned = collections.reduce((sum, c) => sum + c.items.filter(i => i.isOwned).length, 0)
    const overallProgress = totalItems > 0 ? (totalOwned / totalItems) * 100 : 0

    if (overallProgress >= 50 && await unlockAchievement(userId, 'overall_fifty')) {
      newlyUnlocked.push('overall_fifty')
    }
    if (overallProgress >= 75 && await unlockAchievement(userId, 'overall_seventy_five')) {
      newlyUnlocked.push('overall_seventy_five')
    }
    if (overallProgress >= 90 && await unlockAchievement(userId, 'overall_ninety')) {
      newlyUnlocked.push('overall_ninety')
    }

  } catch (error) {
    console.error('Error checking collection achievements:', error)
  }

  return newlyUnlocked
}

/**
 * Checks and unlocks achievements related to items
 */
export async function checkItemAchievements(userId: string): Promise<string[]> {
  const newlyUnlocked: string[] = []

  try {
    // Get all items for the user
    const collections = await prisma.collection.findMany({
      where: { userId },
      select: {
        items: {
          select: {
            isOwned: true,
            notes: true,
            image: true,
            personalRating: true,
            logDate: true,
          },
        },
      },
    })

    const allItems = collections.flatMap(c => c.items)
    const totalItems = allItems.length
    const ownedItems = allItems.filter(i => i.isOwned).length
    const itemsWithNotes = allItems.filter(i => i.notes).length
    const itemsWithImages = allItems.filter(i => i.image).length
    const itemsWithRatings = allItems.filter(i => i.personalRating !== null).length
    const itemsWithLogDates = allItems.filter(i => i.logDate !== null).length

    // Total items achievements
    if (totalItems >= 10 && await unlockAchievement(userId, 'ten_items')) {
      newlyUnlocked.push('ten_items')
    }
    if (totalItems >= 50 && await unlockAchievement(userId, 'fifty_items')) {
      newlyUnlocked.push('fifty_items')
    }
    if (totalItems >= 100 && await unlockAchievement(userId, 'hundred_items')) {
      newlyUnlocked.push('hundred_items')
    }
    if (totalItems >= 500 && await unlockAchievement(userId, 'five_hundred_items')) {
      newlyUnlocked.push('five_hundred_items')
    }
    if (totalItems >= 1000 && await unlockAchievement(userId, 'thousand_items')) {
      newlyUnlocked.push('thousand_items')
    }
    if (totalItems >= 5000 && await unlockAchievement(userId, 'five_thousand_items')) {
      newlyUnlocked.push('five_thousand_items')
    }

    // Owned items achievements
    if (ownedItems >= 10 && await unlockAchievement(userId, 'ten_owned')) {
      newlyUnlocked.push('ten_owned')
    }
    if (ownedItems >= 50 && await unlockAchievement(userId, 'fifty_owned')) {
      newlyUnlocked.push('fifty_owned')
    }
    if (ownedItems >= 100 && await unlockAchievement(userId, 'hundred_owned')) {
      newlyUnlocked.push('hundred_owned')
    }
    if (ownedItems >= 500 && await unlockAchievement(userId, 'five_hundred_owned')) {
      newlyUnlocked.push('five_hundred_owned')
    }
    if (ownedItems >= 1000 && await unlockAchievement(userId, 'thousand_owned')) {
      newlyUnlocked.push('thousand_owned')
    }
    if (ownedItems >= 5000 && await unlockAchievement(userId, 'five_thousand_owned')) {
      newlyUnlocked.push('five_thousand_owned')
    }

    // Item detail achievements
    if (itemsWithNotes >= 25 && await unlockAchievement(userId, 'notes_master')) {
      newlyUnlocked.push('notes_master')
    }
    if (itemsWithImages >= 50 && await unlockAchievement(userId, 'item_images')) {
      newlyUnlocked.push('item_images')
    }
    if (itemsWithRatings >= 50 && await unlockAchievement(userId, 'rating_master')) {
      newlyUnlocked.push('rating_master')
    }
    if (itemsWithLogDates >= 25 && await unlockAchievement(userId, 'log_dates')) {
      newlyUnlocked.push('log_dates')
    }

  } catch (error) {
    console.error('Error checking item achievements:', error)
  }

  return newlyUnlocked
}

/**
 * Checks and unlocks achievements related to community collections
 */
export async function checkCommunityCollectionAchievements(userId: string): Promise<string[]> {
  const newlyUnlocked: string[] = []

  try {
    // Get user's collections that came from community collections
    const communityCollections = await prisma.collection.findMany({
      where: { 
        userId,
        communityCollectionId: { not: null }, // Collections from community collections
      },
      select: { id: true },
    })

    const communityCollectionCount = communityCollections.length
    
    console.log(`[Achievements] User ${userId} has ${communityCollectionCount} community collections`)

    if (communityCollectionCount >= 1) {
      const unlocked = await unlockAchievement(userId, 'first_recommended')
      if (unlocked) {
        console.log(`[Achievements] Unlocked 'first_recommended' for user ${userId}`)
        newlyUnlocked.push('first_recommended')
      }
    }
    if (communityCollectionCount >= 5) {
      const unlocked = await unlockAchievement(userId, 'five_recommended')
      if (unlocked) {
        console.log(`[Achievements] Unlocked 'five_recommended' for user ${userId}`)
        newlyUnlocked.push('five_recommended')
      }
    }
    if (communityCollectionCount >= 10) {
      const unlocked = await unlockAchievement(userId, 'ten_recommended')
      if (unlocked) {
        console.log(`[Achievements] Unlocked 'ten_recommended' for user ${userId}`)
        newlyUnlocked.push('ten_recommended')
      }
    }

  } catch (error) {
    console.error('Error checking community collection achievements:', error)
  }

  return newlyUnlocked
}

/**
 * Checks all achievements for a user
 */
export async function checkAllAchievements(userId: string): Promise<string[]> {
  const allNewlyUnlocked: string[] = []

  const collectionAchievements = await checkCollectionAchievements(userId)
  const itemAchievements = await checkItemAchievements(userId)
  const communityAchievements = await checkCommunityCollectionAchievements(userId)

  allNewlyUnlocked.push(...collectionAchievements, ...itemAchievements, ...communityAchievements)

  return allNewlyUnlocked
}


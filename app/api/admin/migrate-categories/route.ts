import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { normalizeCategory } from '@/lib/categories'
import { parseTags, stringifyTags } from '@/lib/tags'

// Collection types that should be removed from tags (now categories)
const COLLECTION_TYPE_TAGS = [
  'Comics', 'Books', 'Movies', 'Games', 'Music', 'Art',
  'Trading Cards', 'Sports Cards', 'Action Figures', 'Toys',
  'Vinyl Records', 'CDs', 'DVDs', 'Blu-ray', 'Video Games',
  'Board Games', 'Coins', 'Stamps', 'Posters', 'Art Prints',
  'Collectibles', 'TCG'
]

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { isUserAdmin } = await import('@/lib/user-cache')
    const isAdmin = await isUserAdmin(session.user.id)
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let collectionsUpdated = 0
    let recommendedUpdated = 0
    let communityUpdated = 0
    let tagsCleaned = 0
    const errors: string[] = []

    try {
      // Migrate user Collections
      const collections = await prisma.collection.findMany({
        select: {
          id: true,
          category: true,
          tags: true,
        },
      })

      for (const collection of collections) {
        try {
          let needsUpdate = false
          const updates: { category?: string | null; tags?: string } = {}

          // Normalize category
          if (collection.category) {
            const normalized = normalizeCategory(collection.category)
            if (normalized && normalized !== collection.category) {
              updates.category = normalized
              needsUpdate = true
            } else if (!normalized) {
              updates.category = 'Other'
              needsUpdate = true
            }
          }

          // Clean tags - remove collection types
          const tags = parseTags(collection.tags)
          const cleanedTags = tags.filter(tag => !COLLECTION_TYPE_TAGS.includes(tag))
          
          if (cleanedTags.length !== tags.length) {
            updates.tags = stringifyTags(cleanedTags)
            needsUpdate = true
            tagsCleaned += tags.length - cleanedTags.length
          }

          if (needsUpdate) {
            await prisma.collection.update({
              where: { id: collection.id },
              data: updates,
            })
            collectionsUpdated++
          }
        } catch (error: any) {
          errors.push(`Collection ${collection.id}: ${error.message}`)
        }
      }

      // Migrate RecommendedCollections
      const recommended = await prisma.recommendedCollection.findMany({
        select: {
          id: true,
          category: true,
          tags: true,
        },
      })

      for (const rec of recommended) {
        try {
          let needsUpdate = false
          const updates: { category?: string | null; tags?: string } = {}

          // Normalize category
          if (rec.category) {
            const normalized = normalizeCategory(rec.category)
            if (normalized && normalized !== rec.category) {
              updates.category = normalized
              needsUpdate = true
            } else if (!normalized) {
              updates.category = 'Other'
              needsUpdate = true
            }
          }

          // Clean tags
          const tags = parseTags(rec.tags)
          const cleanedTags = tags.filter(tag => !COLLECTION_TYPE_TAGS.includes(tag))
          
          if (cleanedTags.length !== tags.length) {
            updates.tags = stringifyTags(cleanedTags)
            needsUpdate = true
            tagsCleaned += tags.length - cleanedTags.length
          }

          if (needsUpdate) {
            await prisma.recommendedCollection.update({
              where: { id: rec.id },
              data: updates,
            })
            recommendedUpdated++
          }
        } catch (error: any) {
          errors.push(`Recommended ${rec.id}: ${error.message}`)
        }
      }

      // Migrate CommunityCollections
      const community = await prisma.communityCollection.findMany({
        select: {
          id: true,
          category: true,
          tags: true,
        },
      })

      for (const comm of community) {
        try {
          let needsUpdate = false
          const updates: { category?: string | null; tags?: string } = {}

          // Normalize category
          if (comm.category) {
            const normalized = normalizeCategory(comm.category)
            if (normalized && normalized !== comm.category) {
              updates.category = normalized
              needsUpdate = true
            } else if (!normalized) {
              updates.category = 'Other'
              needsUpdate = true
            }
          }

          // Clean tags
          const tags = parseTags(comm.tags)
          const cleanedTags = tags.filter(tag => !COLLECTION_TYPE_TAGS.includes(tag))
          
          if (cleanedTags.length !== tags.length) {
            updates.tags = stringifyTags(cleanedTags)
            needsUpdate = true
            tagsCleaned += tags.length - cleanedTags.length
          }

          if (needsUpdate) {
            await prisma.communityCollection.update({
              where: { id: comm.id },
              data: updates,
            })
            communityUpdated++
          }
        } catch (error: any) {
          errors.push(`Community ${comm.id}: ${error.message}`)
        }
      }

      return NextResponse.json({
        success: true,
        collectionsUpdated,
        recommendedUpdated,
        communityUpdated,
        tagsCleaned,
        errors: errors.length > 0 ? errors : undefined,
      })
    } catch (error: any) {
      console.error('Migration error:', error)
      return NextResponse.json(
        { error: 'Migration failed', details: error.message },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error in migrate-categories route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


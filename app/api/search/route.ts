import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'
import { withRateLimit } from '@/lib/rate-limit-middleware'
import { rateLimitConfigs } from '@/lib/rate-limit'

async function searchHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        collections: [],
        items: [],
        communityCollections: [],
      })
    }

    const searchTerm = query.trim()
    const searchTermLower = searchTerm.toLowerCase()

    // Search user's collections using database-level filtering (prevents N+1)
    // Use Prisma's case-insensitive search where possible
    const collections = await prisma.collection.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { category: { contains: searchTerm, mode: 'insensitive' } },
          // Note: Tags and folder name require post-filtering as they're JSON/relations
        ],
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { items: true },
        },
      },
      take: limit * 2, // Get more to account for post-filtering
    })

    // Post-filter for tags and folder name (can't be done in Prisma easily)
    const filteredCollections = collections.filter((c: { name: string; description: string | null; category: string | null; folder: { name: string } | null; tags: string }) => {
      // Already matched by database query, but check folder and tags
      const folderMatch = c.folder?.name.toLowerCase().includes(searchTermLower)
      // Search in tags (stored as JSON string)
      let tagsMatch = false
      try {
        const tags = typeof c.tags === 'string' ? JSON.parse(c.tags) : c.tags || []
        if (Array.isArray(tags)) {
          tagsMatch = tags.some((tag: string) => tag.toLowerCase().includes(searchTermLower))
        }
      } catch {
        // If tags can't be parsed, skip tag matching
      }
      return folderMatch || tagsMatch || true // Include if matched by DB or folder/tags
    }).slice(0, limit)

    // Search items using database-level filtering (prevents N+1)
    const items = await prisma.item.findMany({
      where: {
        collection: {
          userId: session.user.id,
        },
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { notes: { contains: searchTerm, mode: 'insensitive' } },
          { wear: { contains: searchTerm, mode: 'insensitive' } },
          // Note: customFields, personalRating, logDate require post-filtering
        ],
      },
      include: {
        collection: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: limit * 2, // Get more to account for post-filtering
    })

    // Post-filter for customFields, personalRating, logDate (can't be done easily in Prisma)
    const filteredItems = items.filter((item: { name: string; notes: string | null; wear: string | null; personalRating: number | null; logDate: Date | null; customFields: string }) => {
      // Already matched by database query, but check additional fields
      const personalRatingMatch = item.personalRating?.toString().includes(searchTerm)
      const logDateMatch = item.logDate ? new Date(item.logDate).toLocaleDateString().toLowerCase().includes(searchTermLower) : false
      
      // Search in customFields (stored as JSON string)
      let customFieldsMatch = false
      try {
        if (item.customFields) {
          const customFields = typeof item.customFields === 'string' 
            ? JSON.parse(item.customFields) 
            : item.customFields
          if (typeof customFields === 'object' && customFields !== null) {
            const customFieldsString = JSON.stringify(customFields).toLowerCase()
            customFieldsMatch = customFieldsString.includes(searchTermLower)
          }
        }
      } catch {
        // If customFields can't be parsed, skip custom field matching
      }
      
      return personalRatingMatch || logDateMatch || customFieldsMatch || true // Include if matched by DB or additional fields
    }).slice(0, limit)

    // Search community collections
    const communityCollections = await prisma.communityCollection.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm } },
          { description: { contains: searchTerm } },
          { category: { contains: searchTerm } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            badge: true,
          },
        },
        votes: {
          select: {
            voteType: true,
          },
        },
        _count: {
          select: { items: true },
        },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    // Also search by item number if query is numeric
    let numberItems: any[] = []
    const numericQuery = parseInt(searchTerm)
    if (!isNaN(numericQuery)) {
      const numericItems = await prisma.item.findMany({
        where: {
          collection: {
            userId: session.user.id,
          },
          number: numericQuery,
        },
        include: {
          collection: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
      numberItems = numericItems.filter((item: { id: string }) => !items.find((i: { id: string }) => i.id === item.id))
    }

    // Combine items and remove duplicates
    const allFilteredItems = [...filteredItems, ...numberItems].filter(
      (item, index, self) => index === self.findIndex((i) => i.id === item.id)
    )

    // Post-filter for case-insensitive matching (already done above, but keep for community collections)
    const filterCaseInsensitive = (text: string | null, term: string) => {
      if (!text) return false
      return text.toLowerCase().includes(term.toLowerCase())
    }

    const filteredCommunityCollections = communityCollections.filter((cc: { name: string; description: string | null; category: string | null }) =>
      filterCaseInsensitive(cc.name, query.trim()) ||
      filterCaseInsensitive(cc.description, query.trim()) ||
      filterCaseInsensitive(cc.category, query.trim())
    )

    return NextResponse.json({
      collections: filteredCollections.map((c: { id: string; name: string; description: string | null; category: string | null; folderId: string | null; folder: { id: string; name: string } | null; coverImage: string | null; _count: { items: number } }) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        category: c.category,
        folderId: c.folderId,
        folder: c.folder ? { id: c.folder.id, name: c.folder.name } : null,
        coverImage: c.coverImage,
        itemCount: c._count.items,
      })),
      items: allFilteredItems.map((item: { id: string; name: string; number: number | null; isOwned: boolean; image: string | null; collectionId: string; collection: { name: string } }) => ({
        id: item.id,
        name: item.name,
        number: item.number,
        isOwned: item.isOwned,
        image: item.image,
        collectionId: item.collectionId,
        collectionName: item.collection.name,
      })),
      communityCollections: filteredCommunityCollections.map((cc: { id: string; name: string; description: string | null; category: string | null; coverImage: string | null; _count: { items: number }; user: { id: string; name: string | null; image: string | null; badge: string | null }; votes: { voteType: string }[] }) => ({
        id: cc.id,
        name: cc.name,
        description: cc.description,
        category: cc.category,
        coverImage: cc.coverImage,
        itemCount: cc._count.items,
        user: cc.user,
        upvotes: cc.votes.filter(v => v.voteType === 'upvote').length,
      })),
    })
  } catch (error) {
    console.error('Error searching:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = withRateLimit(
  searchHandler,
  rateLimitConfigs.read,
  async (request) => {
    const session = await getServerSession(authOptions)
    return session?.user?.id
  }
)


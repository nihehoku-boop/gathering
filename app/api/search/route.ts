import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
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

    const searchTerm = query.trim().toLowerCase()

    // Search user's collections (including tags)
    const allCollections = await prisma.collection.findMany({
      where: {
        userId: session.user.id,
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
    })

    // Filter collections by search term (including tags)
    const collections = allCollections.filter(c => {
      const nameMatch = c.name?.toLowerCase().includes(searchTerm)
      const descriptionMatch = c.description?.toLowerCase().includes(searchTerm)
      const categoryMatch = c.category?.toLowerCase().includes(searchTerm)
      const folderMatch = c.folder?.name.toLowerCase().includes(searchTerm)
      // Search in tags (stored as JSON string)
      let tagsMatch = false
      try {
        const tags = typeof c.tags === 'string' ? JSON.parse(c.tags) : c.tags || []
        if (Array.isArray(tags)) {
          tagsMatch = tags.some((tag: string) => tag.toLowerCase().includes(searchTerm))
        }
      } catch {
        // If tags can't be parsed, skip tag matching
      }
      return nameMatch || descriptionMatch || categoryMatch || folderMatch || tagsMatch
    }).slice(0, limit)

    // Search items within user's collections (including custom fields and other fields)
    const allItems = await prisma.item.findMany({
      where: {
        collection: {
          userId: session.user.id,
        },
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

    // Filter items by search term (including custom fields, wear, personalRating, etc.)
    const items = allItems.filter(item => {
      const nameMatch = item.name?.toLowerCase().includes(searchTerm)
      const notesMatch = item.notes?.toLowerCase().includes(searchTerm)
      const wearMatch = item.wear?.toLowerCase().includes(searchTerm)
      const personalRatingMatch = item.personalRating?.toString().includes(searchTerm)
      const logDateMatch = item.logDate ? new Date(item.logDate).toLocaleDateString().toLowerCase().includes(searchTerm) : false
      
      // Search in customFields (stored as JSON string)
      let customFieldsMatch = false
      try {
        if (item.customFields) {
          const customFields = typeof item.customFields === 'string' 
            ? JSON.parse(item.customFields) 
            : item.customFields
          if (typeof customFields === 'object' && customFields !== null) {
            const customFieldsString = JSON.stringify(customFields).toLowerCase()
            customFieldsMatch = customFieldsString.includes(searchTerm)
          }
        }
      } catch {
        // If customFields can't be parsed, skip custom field matching
      }
      
      return nameMatch || notesMatch || wearMatch || personalRatingMatch || logDateMatch || customFieldsMatch
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
      numberItems = numericItems.filter(item => !items.find(i => i.id === item.id))
    }

    // Combine items and remove duplicates
    const allFilteredItems = [...items, ...numberItems].filter(
      (item, index, self) => index === self.findIndex((i) => i.id === item.id)
    )

    // Post-filter for case-insensitive matching (already done above, but keep for community collections)
    const filterCaseInsensitive = (text: string | null, term: string) => {
      if (!text) return false
      return text.toLowerCase().includes(term.toLowerCase())
    }

    const filteredCommunityCollections = communityCollections.filter(cc =>
      filterCaseInsensitive(cc.name, query.trim()) ||
      filterCaseInsensitive(cc.description, query.trim()) ||
      filterCaseInsensitive(cc.category, query.trim())
    )

    return NextResponse.json({
      collections: collections.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        category: c.category,
        folderId: c.folderId,
        folder: c.folder ? { id: c.folder.id, name: c.folder.name } : null,
        coverImage: c.coverImage,
        itemCount: c._count.items,
      })),
      items: allFilteredItems.map((item) => ({
        id: item.id,
        name: item.name,
        number: item.number,
        isOwned: item.isOwned,
        image: item.image,
        collectionId: item.collectionId,
        collectionName: item.collection.name,
      })),
      communityCollections: filteredCommunityCollections.map((cc) => ({
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


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

    // Search user's collections (SQLite doesn't support case-insensitive, so we'll use contains)
    const collections = await prisma.collection.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { name: { contains: searchTerm } },
          { description: { contains: searchTerm } },
          { category: { contains: searchTerm } },
          { folder: { name: { contains: searchTerm } } },
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
      take: limit,
      orderBy: { name: 'asc' },
    })

    // Search items within user's collections
    const items = await prisma.item.findMany({
      where: {
        collection: {
          userId: session.user.id,
        },
        OR: [
          { name: { contains: searchTerm } },
          { notes: { contains: searchTerm } },
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
      take: limit,
      orderBy: { name: 'asc' },
    })

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
      numberItems = await prisma.item.findMany({
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
        take: 5,
        orderBy: { name: 'asc' },
      })
    }

    // Combine items and remove duplicates
    const allItems = [...items, ...numberItems].filter(
      (item, index, self) => index === self.findIndex((i) => i.id === item.id)
    )

    // Post-filter for case-insensitive matching (SQLite contains is case-sensitive)
    const filterCaseInsensitive = (text: string | null, term: string) => {
      if (!text) return false
      return text.toLowerCase().includes(term.toLowerCase())
    }

    const filteredCollections = collections.filter(c =>
      filterCaseInsensitive(c.name, query.trim()) ||
      filterCaseInsensitive(c.description, query.trim()) ||
      filterCaseInsensitive(c.category, query.trim())
    )

    const filteredItems = allItems.filter(item =>
      filterCaseInsensitive(item.name, query.trim()) ||
      filterCaseInsensitive(item.notes, query.trim())
    )

    const filteredCommunityCollections = communityCollections.filter(cc =>
      filterCaseInsensitive(cc.name, query.trim()) ||
      filterCaseInsensitive(cc.description, query.trim()) ||
      filterCaseInsensitive(cc.category, query.trim())
    )

    return NextResponse.json({
      collections: filteredCollections.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        category: c.category,
        folderId: c.folderId,
        folder: c.folder ? { id: c.folder.id, name: c.folder.name } : null,
        coverImage: c.coverImage,
        itemCount: c._count.items,
      })),
      items: filteredItems.map((item) => ({
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


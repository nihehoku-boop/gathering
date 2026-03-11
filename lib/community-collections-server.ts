/**
 * Server-only: fetch first page of community collections for initial paint (LCP).
 * Used by the Community page server component; same shape as GET /api/community-collections.
 */
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

const DEFAULT_LIMIT = 20

export async function getFirstPageCommunityCollections() {
  const session = await getServerSession(authOptions)
  const where = { isHidden: false }
  const totalCount = await prisma.communityCollection.count({ where })

  const collections = await prisma.communityCollection.findMany({
    where,
    orderBy: { upvotesCount: 'desc' },
    take: DEFAULT_LIMIT,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          badge: true,
          isVerified: true,
        },
      },
      ...(session?.user?.id && {
        votes: { where: { userId: session.user.id }, select: { voteType: true } },
      }),
      _count: {
        select: { items: true, votes: true },
      },
    },
  })

  type Row = (typeof collections)[0] & { votes?: { voteType: string }[] }
  const collectionsWithVotes = collections.map((collection: Row) => {
    const upvotes = Number((collection as { upvotesCount?: number }).upvotesCount) || 0
    const userVote = collection.votes?.[0]?.voteType ?? null
    return {
      ...collection,
      items: [] as { id: string; name: string; number: number | null }[],
      upvotes,
      score: upvotes,
      userVote,
      votes: undefined,
    }
  })

  const hasMore = DEFAULT_LIMIT < totalCount
  return {
    collections: collectionsWithVotes,
    pagination: {
      page: 1,
      limit: DEFAULT_LIMIT,
      total: totalCount,
      totalPages: Math.ceil(totalCount / DEFAULT_LIMIT),
      hasMore,
    },
  }
}

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

  const anyWithCount = await prisma.communityCollection.findFirst({
    where: { ...where, upvotesCount: { gt: 0 } },
    select: { id: true },
  })
  const usePopularFallback = !anyWithCount

  const take = usePopularFallback ? Math.min(totalCount, 500) : DEFAULT_LIMIT
  const collections = await prisma.communityCollection.findMany({
    where,
    orderBy: usePopularFallback ? { createdAt: 'desc' } : [{ upvotesCount: 'desc' }, { createdAt: 'desc' }],
    take,
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
  let collectionsWithVotes = collections.map((collection: Row) => {
    const upvotes =
      Number((collection as { upvotesCount?: number }).upvotesCount) ||
      (collection as { _count?: { votes?: number } })._count?.votes ||
      0
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

  if (usePopularFallback) {
    collectionsWithVotes = collectionsWithVotes
      .sort((a: { upvotes?: number }, b: { upvotes?: number }) => (b.upvotes ?? 0) - (a.upvotes ?? 0))
      .slice(0, DEFAULT_LIMIT)
  }

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

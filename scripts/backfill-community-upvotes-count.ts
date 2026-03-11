/**
 * One-time backfill: set CommunityCollection.upvotesCount from current vote counts.
 * Run after adding the upvotesCount column: npx tsx scripts/backfill-community-upvotes-count.ts
 */
import { prisma } from '../lib/prisma'

async function main() {
  const votes = await prisma.communityCollectionVote.groupBy({
    by: ['communityCollectionId'],
    where: { voteType: 'upvote' },
    _count: { id: true },
  })
  let updated = 0
  for (const v of votes) {
    await prisma.communityCollection.update({
      where: { id: v.communityCollectionId },
      data: { upvotesCount: v._count.id },
    })
    updated++
  }
  console.log(`Backfilled upvotesCount for ${updated} community collections.`)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

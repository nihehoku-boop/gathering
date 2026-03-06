/**
 * List all recommended collections with name, category, isPublic, and item count.
 * Use this to decide which collections to keep public (Admin → toggle eye) or remove.
 *
 * Usage: npx tsx scripts/list-recommended-collections.ts
 * Or add to package.json: "list:recommended": "tsx scripts/list-recommended-collections.ts"
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const collections = await prisma.recommendedCollection.findMany({
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
    include: {
      _count: { select: { items: true } },
    },
  })

  const publicCount = collections.filter((c) => c.isPublic).length
  const privateCount = collections.length - publicCount

  console.log('\n📋 Recommended collections\n')
  console.log(`Total: ${collections.length}  |  Public: ${publicCount}  |  Hidden: ${privateCount}\n`)

  // Group by category for easier review
  const byCategory = collections.reduce<Record<string, typeof collections>>((acc, c) => {
    const cat = c.category || '(no category)'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(c)
    return acc
  }, {})

  for (const [category, items] of Object.entries(byCategory).sort(([a], [b]) => a.localeCompare(b))) {
    console.log(`\n--- ${category} (${items.length}) ---`)
    for (const c of items) {
      const visibility = c.isPublic ? '👁 public ' : '🙈 hidden '
      console.log(`  ${visibility} ${c.name}  (${c._count.items} items)  [id: ${c.id}]`)
    }
  }

  console.log('\n💡 In Admin → Recommended Collections you can toggle 👁/🙈 (public/hidden) or delete.\n')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

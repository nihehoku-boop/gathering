import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Updating collections without template...')
  const result = await prisma.collection.updateMany({
    where: {
      template: null,
    },
    data: {
      template: 'custom',
    },
  })
  console.log(`Updated ${result.count} collections`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })




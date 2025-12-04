import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load environment variables
try {
  const envPath = resolve(process.cwd(), '.env.local')
  const envFile = readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach(line => {
    const trimmedLine = line.trim()
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '')
        process.env[key.trim()] = value.trim()
      }
    }
  })
} catch (error) {
  // Ignore
}

const prisma = new PrismaClient()

async function main() {
  try {
    const collection = await prisma.communityCollection.findFirst({
      where: { name: '1001 Books You Must Read Before You Die' },
      include: { 
        items: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        _count: {
          select: { items: true }
        }
      }
    })
    
    if (collection) {
      console.log('\n📊 1001 Books Collection Status:')
      console.log(`   ✅ Total books imported: ${collection._count.items}`)
      console.log(`   📚 Collection ID: ${collection.id}`)
      console.log(`\n   Last 5 books added:`)
      collection.items.forEach((item, i) => {
        console.log(`   ${collection._count.items - 4 + i}. ${item.name}`)
      })
      const progress = Math.round((collection._count.items / 1001) * 100)
      console.log(`\n   Progress: ${collection._count.items}/1001 books (${progress}%)`)
      
      if (collection._count.items < 1001) {
        console.log(`\n   ⚠️  Import incomplete. ${1001 - collection._count.items} books remaining.`)
      } else {
        console.log(`\n   ✅ Import complete!`)
      }
    } else {
      console.log('❌ Collection not found')
    }
  } catch (error: any) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()


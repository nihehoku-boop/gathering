/**
 * Script to fix Pokemon TCG collection cover images with quality and extension
 */

import { PrismaClient } from '@prisma/client'
import TCGdex from '@tcgdex/sdk'
import { readFileSync } from 'fs'
import { resolve } from 'path'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

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
  // Use existing env vars
}

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL not set')
  process.exit(1)
}

const prisma = new PrismaClient()
const sdk = new TCGdex('en')

function fixCoverImageUrl(url: string | null): string | null {
  if (!url) return null
  
  // If URL is from TCGdex assets, use symbol.webp format
  if (url.includes('assets.tcgdx') || url.includes('assets.tcgdex')) {
    // Remove any existing extension and trailing slash
    let cleanUrl = url.replace(/\.(jpg|jpeg|png|webp)$/i, '').replace(/\/$/, '')
    // Remove /logo or /symbol if present, then add /symbol.webp
    cleanUrl = cleanUrl.replace(/\/(logo|symbol)$/i, '')
    return cleanUrl + '/symbol.webp'
  }
  return url
}

async function main() {
  console.log('🖼️  Fixing Pokemon TCG cover images...\n')

  try {
    const collections = await prisma.communityCollection.findMany({
      where: {
        OR: [
          { tags: { contains: 'Pokemon' } },
          { tags: { contains: 'TCG' } },
          { category: 'Trading Cards' },
        ],
      },
    })

    console.log(`📦 Found ${collections.length} collections\n`)

    let updated = 0
    let skipped = 0

    for (const collection of collections) {
      try {
        const currentCoverImage = collection.coverImage
        const fixedCoverImage = fixCoverImageUrl(currentCoverImage)

        // Only update if the URL changed
        if (fixedCoverImage !== currentCoverImage) {
          await prisma.communityCollection.update({
            where: { id: collection.id },
            data: { coverImage: fixedCoverImage },
          })
          console.log(`✅ Updated "${collection.name}"`)
          updated++
        } else {
          skipped++
        }
      } catch (error) {
        console.error(`❌ Error updating "${collection.name}":`, error)
        skipped++
      }
    }

    console.log(`\n🎉 Done! Updated: ${updated}, Skipped: ${skipped}`)
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)


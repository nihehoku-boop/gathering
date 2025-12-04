/**
 * Update Pulitzer Prize collection description with source link
 */

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

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set')
  process.exit(1)
}

const prisma = new PrismaClient()

async function main() {
  try {
    const collection = await prisma.communityCollection.findFirst({
      where: {
        name: 'Pulitzer Prize Winners for Fiction',
      },
    })

    if (!collection) {
      console.log('⚠️  Pulitzer Prize collection not found')
      return
    }

    await prisma.communityCollection.update({
      where: { id: collection.id },
      data: {
        description: 'Complete list of Pulitzer Prize winners for Fiction from 1918 to 2024. The Pulitzer Prize for Fiction is awarded annually to distinguished fiction by an American author, preferably dealing with American life.\n\nSource: https://www.pulitzer.org/prize-winners-by-category/218',
      },
    })

    console.log('✅ Updated Pulitzer Prize collection description with source link')
  } catch (error) {
    console.error('❌ Error updating collection:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()


import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { generateCoverDataURL } from '@/lib/generate-cover'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { isUserAdmin } = await import('@/lib/user-cache')
    const isAdmin = await isUserAdmin(session.user.id)
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Find collections without cover images
    const collectionsWithoutCovers = await prisma.collection.findMany({
      where: {
        OR: [
          { coverImage: null },
          { coverImage: '' },
        ],
      },
      select: {
        id: true,
        name: true,
        category: true,
      },
    })

    if (collectionsWithoutCovers.length === 0) {
      return NextResponse.json({ 
        message: 'All collections already have cover images',
        generated: 0,
        updated: 0 
      })
    }

    let generated = 0
    let updated = 0
    const errors: string[] = []

    for (const collection of collectionsWithoutCovers) {
      try {
        // Generate cover as data URL (works in Vercel/serverless environments)
        const coverDataURL = generateCoverDataURL(collection.name, collection.category)
        generated++

        // Update database with data URL
        await prisma.collection.update({
          where: { id: collection.id },
          data: { coverImage: coverDataURL },
        })

        updated++
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`${collection.name}: ${errorMessage}`)
        console.error(`Error generating cover for ${collection.name}:`, errorMessage)
      }
    }

    return NextResponse.json({
      message: 'Cover generation complete',
      generated,
      updated,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Error generating covers:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}


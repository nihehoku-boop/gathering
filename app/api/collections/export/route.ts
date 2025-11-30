import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const format = request.nextUrl.searchParams.get('format') || 'json'

    const collections = await prisma.collection.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          orderBy: [
            { number: 'asc' },
            { name: 'asc' },
          ],
        },
      },
    })

    if (format === 'csv') {
      // Generate CSV for all collections
      const lines: string[] = []
      
      collections.forEach((collection) => {
        lines.push(`Collection: ${collection.name}`)
        lines.push(`Description: ${collection.description || ''}`)
        lines.push(`Category: ${collection.category || ''}`)
        lines.push('')
        lines.push('Number,Name,Owned,Image,Alternative Images,Notes,Wear,Rating,Log Date')
        
        collection.items.forEach((item) => {
          let altImages = ''
          try {
            const parsed = item.alternativeImages ? JSON.parse(item.alternativeImages) : []
            altImages = Array.isArray(parsed) ? parsed.join('; ') : ''
          } catch {
            altImages = ''
          }

          const row = [
            item.number?.toString() || '',
            `"${item.name.replace(/"/g, '""')}"`,
            item.isOwned ? 'Yes' : 'No',
            item.image || '',
            `"${altImages.replace(/"/g, '""')}"`,
            `"${(item.notes || '').replace(/"/g, '""')}"`,
            item.wear || '',
            item.personalRating?.toString() || '',
            item.logDate ? new Date(item.logDate).toISOString().split('T')[0] : '',
          ]
          lines.push(row.join(','))
        })
        
        lines.push('')
        lines.push('---')
        lines.push('')
      })

      return new NextResponse(lines.join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="all_collections_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    } else {
      // Generate JSON
      const exportData = {
        exportedAt: new Date().toISOString(),
        collections: collections.map((collection) => ({
          name: collection.name,
          description: collection.description,
          category: collection.category,
          coverImage: collection.coverImage,
          coverImageAspectRatio: collection.coverImageAspectRatio,
          tags: collection.tags ? JSON.parse(collection.tags) : [],
          items: collection.items.map((item) => {
            let altImages: string[] = []
            try {
              const parsed = item.alternativeImages ? JSON.parse(item.alternativeImages) : []
              altImages = Array.isArray(parsed) ? parsed : []
            } catch {
              altImages = []
            }

            return {
              name: item.name,
              number: item.number,
              isOwned: item.isOwned,
              image: item.image,
              alternativeImages: altImages,
              notes: item.notes,
              wear: item.wear,
              personalRating: item.personalRating,
              logDate: item.logDate ? new Date(item.logDate).toISOString() : null,
            }
          }),
        })),
      }

      return NextResponse.json(exportData, {
        headers: {
          'Content-Disposition': `attachment; filename="all_collections_${new Date().toISOString().split('T')[0]}.json"`,
        },
      })
    }
  } catch (error) {
    console.error('Error exporting collections:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}




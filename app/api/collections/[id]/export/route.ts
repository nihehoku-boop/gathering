import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)
    const collectionId = resolvedParams.id
    const format = request.nextUrl.searchParams.get('format') || 'json'

    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: session.user.id,
      },
      include: {
        items: {
          orderBy: [
            { number: 'asc' },
            { name: 'asc' },
          ],
        },
      },
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    if (format === 'csv') {
      // Generate CSV
      const headers = ['Number', 'Name', 'Owned', 'Image', 'Alternative Images', 'Notes', 'Wear', 'Rating', 'Log Date']
      const rows = collection.items.map((item: { number: number | null; name: string; isOwned: boolean; image: string | null; alternativeImages: string; notes: string | null; wear: string | null; personalRating: number | null; logDate: Date | null }) => {
        let altImages = ''
        try {
          const parsed = item.alternativeImages ? JSON.parse(item.alternativeImages) : []
          altImages = Array.isArray(parsed) ? parsed.join('; ') : ''
        } catch {
          altImages = ''
        }

        return [
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
      })

      const csvContent = [
        headers.join(','),
        ...rows.map((row: string[]) => row.join(',')),
      ].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${collection.name.replace(/[^a-z0-9]/gi, '_')}.csv"`,
        },
      })
    } else {
      // Generate JSON
      const exportData = {
        collection: {
          name: collection.name,
          description: collection.description,
          category: collection.category,
          coverImage: collection.coverImage,
          coverImageAspectRatio: collection.coverImageAspectRatio,
          tags: collection.tags ? JSON.parse(collection.tags) : [],
          exportedAt: new Date().toISOString(),
        },
        items: collection.items.map((item: { number: number | null; name: string; isOwned: boolean; image: string | null; alternativeImages: string; notes: string | null; wear: string | null; personalRating: number | null; logDate: Date | null }) => {
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
      }

      return NextResponse.json(exportData, {
        headers: {
          'Content-Disposition': `attachment; filename="${collection.name.replace(/[^a-z0-9]/gi, '_')}.json"`,
        },
      })
    }
  } catch (error) {
    console.error('Error exporting collection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}




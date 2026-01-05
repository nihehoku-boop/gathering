import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'
import { isUserAdmin } from '@/lib/user-cache'

// Build optimized search query based on collection type and item name
function buildSearchQuery(itemName: string, collectionName: string, category?: string | null, template?: string | null): string {
  // Remove common prefixes/suffixes that don't help search
  let cleanItemName = itemName
    .replace(/^#\s*/, '') // Remove leading #
    .replace(/\s*-\s*.*$/, '') // Remove everything after first dash (often subtitle)
    .trim()

  // Build query based on collection type
  if (template === 'comic-book' || category?.toLowerCase().includes('comic')) {
    return `${collectionName} ${cleanItemName} cover`
  } else if (template === 'trading-card' || category?.toLowerCase().includes('card')) {
    return `${cleanItemName} ${category || 'trading card'}`
  } else if (template === 'book') {
    return `${cleanItemName} book cover`
  } else if (template === 'video-game') {
    return `${cleanItemName} game cover`
  } else if (template === 'film') {
    return `${cleanItemName} movie poster`
  } else if (template === 'vinyl-record') {
    return `${cleanItemName} vinyl cover`
  } else {
    return category ? `${cleanItemName} ${category}` : cleanItemName
  }
}

// Search for images using Google Custom Search API
async function searchImageGoogle(query: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY
  const searchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID

  if (!apiKey || !searchEngineId) {
    console.error('[Image Search] Missing API credentials:', {
      hasApiKey: !!apiKey,
      hasSearchEngineId: !!searchEngineId,
    })
    return null
  }

  try {
    const encodedQuery = encodeURIComponent(query)
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodedQuery}&searchType=image&num=1&safe=active`
    
    const response = await fetch(url)
    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      console.error('[Image Search] Google API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText.substring(0, 200), // First 200 chars of error
      })
      
      // Provide helpful error message for common issues
      if (response.status === 403) {
        console.error('[Image Search] 403 Forbidden - Check:')
        console.error('  1. API key is correct and added to Vercel environment variables')
        console.error('  2. Custom Search API is enabled in Google Cloud Console')
        console.error('  3. API key has proper permissions')
        console.error('  4. Search Engine ID is correct')
      }
      return null
    }

    const data = await response.json()
    if (data.items && data.items.length > 0) {
      return data.items[0].link
    }
  } catch (error) {
    console.error('[Image Search] Request error:', error)
  }

  return null
}

// Main image search function
async function searchImage(
  itemName: string,
  collectionName: string,
  category?: string | null,
  template?: string | null
): Promise<string | null> {
  try {
    const searchQuery = buildSearchQuery(itemName, collectionName, category, template)
    console.log(`[Image Search] Searching for: "${searchQuery}"`)

    const googleResult = await searchImageGoogle(searchQuery)
    if (googleResult) {
      console.log(`[Image Search] Found via Google: ${googleResult}`)
      return googleResult
    }

    console.log(`[Image Search] No image found for: "${searchQuery}"`)
    return null
  } catch (error) {
    console.error('Image search error:', error)
    return null
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  console.log('[Fill Images] Route handler called')
  try {
    console.log('[Fill Images] Getting session...')
    const session = await getServerSession(authOptions)
    console.log('[Fill Images] Session:', { hasSession: !!session, userId: session?.user?.id })
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminStatus = await isUserAdmin(session.user.id)
    if (!adminStatus) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const resolvedParams = await Promise.resolve(params)
    const collectionId = resolvedParams.id
    
    if (!collectionId) {
      return NextResponse.json(
        { error: 'Collection ID is required' },
        { status: 400 }
      )
    }
    
    // Read request body - same pattern as working route
    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error('[Fill Images] Failed to parse request body:', error)
      return NextResponse.json(
        { error: 'Invalid JSON in request body', details: error instanceof Error ? error.message : String(error) },
        { status: 400 }
      )
    }
    
    const { itemIds, autoFill } = body || {}
    
    if (!itemIds) {
      console.error('[Fill Images] Missing itemIds in body:', { bodyKeys: Object.keys(body || {}) })
      return NextResponse.json(
        { error: 'itemIds is required in request body' },
        { status: 400 }
      )
    }
    
    if (!Array.isArray(itemIds)) {
      console.error('[Fill Images] itemIds is not an array:', { type: typeof itemIds, value: itemIds })
      return NextResponse.json(
        { error: 'itemIds must be an array' },
        { status: 400 }
      )
    }
    
    if (itemIds.length === 0) {
      console.error('[Fill Images] itemIds array is empty')
      return NextResponse.json(
        { error: 'itemIds array must not be empty' },
        { status: 400 }
      )
    }

    // Verify collection exists
    const collection = await prisma.communityCollection.findFirst({
      where: {
        id: collectionId,
      },
      select: {
        id: true,
        name: true,
        category: true,
        template: true,
      },
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    // Get items that need images
    const items = await prisma.communityItem.findMany({
      where: {
        id: { in: itemIds || [] },
        communityCollectionId: collectionId,
        OR: [
          { image: null },
          { image: '' },
        ],
      },
      select: {
        id: true,
        name: true,
        number: true,
      },
    })

    if (items.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No items found that need images',
        filled: 0,
        failed: 0,
      })
    }

    const results = {
      filled: 0,
      failed: 0,
      details: [] as Array<{ itemId: string; itemName: string; success: boolean; imageUrl?: string; error?: string }>,
    }

    // Fill images for each item
    for (const item of items) {
      try {
        const imageUrl = await searchImage(
          item.name,
          collection.name,
          collection.category,
          collection.template
        )

        if (imageUrl) {
          await prisma.communityItem.update({
            where: { id: item.id },
            data: { image: imageUrl },
          })
          results.filled++
          results.details.push({
            itemId: item.id,
            itemName: item.name,
            success: true,
            imageUrl,
          })
        } else {
          results.failed++
          results.details.push({
            itemId: item.id,
            itemName: item.name,
            success: false,
            error: 'No image found',
          })
        }

        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (error) {
        console.error(`Error filling image for item ${item.id}:`, error)
        results.failed++
        results.details.push({
          itemId: item.id,
          itemName: item.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      success: true,
      filled: results.filled,
      failed: results.failed,
      total: items.length,
      details: results.details,
    })
  } catch (error) {
    console.error('[Fill Images] Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('[Fill Images] Error stack:', errorStack)
    
    // Return detailed error in development, generic in production
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    )
  }
}


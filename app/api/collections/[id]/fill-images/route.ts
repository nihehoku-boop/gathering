import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'

// Build optimized search query based on collection type and item name
function buildSearchQuery(itemName: string, collectionName: string, category?: string | null, template?: string | null): string {
  // Remove common prefixes/suffixes that don't help search
  let cleanItemName = itemName
    .replace(/^#\s*/, '') // Remove leading #
    .replace(/\s*-\s*.*$/, '') // Remove everything after first dash (often subtitle)
    .trim()

  // Build query based on collection type
  if (template === 'comic-book' || category?.toLowerCase().includes('comic')) {
    // For comics: "Tintin #1 cover" or "Lucky Luke album 1 cover"
    return `${collectionName} ${cleanItemName} cover`
  } else if (template === 'trading-card' || category?.toLowerCase().includes('card')) {
    // For cards: "Pokemon Pikachu card" or "Magic the Gathering card name"
    return `${cleanItemName} ${category || 'trading card'}`
  } else if (template === 'book') {
    // For books: "Book title cover"
    return `${cleanItemName} book cover`
  } else if (template === 'video-game') {
    // For games: "Game title cover art"
    return `${cleanItemName} game cover`
  } else if (template === 'film') {
    // For movies: "Movie title poster"
    return `${cleanItemName} movie poster`
  } else if (template === 'vinyl-record') {
    // For vinyl: "Album title vinyl cover"
    return `${cleanItemName} vinyl cover`
  } else {
    // Generic: use item name + category
    return category ? `${cleanItemName} ${category}` : cleanItemName
  }
}

// Search for images using Google Custom Search API (best for specific covers/posters)
async function searchImageGoogle(query: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY
  const searchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID

  if (!apiKey || !searchEngineId) {
    return null
  }

  try {
    const encodedQuery = encodeURIComponent(query)
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodedQuery}&searchType=image&num=1&safe=active`
    
    const response = await fetch(url)
    if (!response.ok) {
      console.error('Google Custom Search API error:', response.status, response.statusText)
      return null
    }

    const data = await response.json()
    if (data.items && data.items.length > 0) {
      return data.items[0].link
    }
  } catch (error) {
    console.error('Google Custom Search error:', error)
  }

  return null
}

// Fallback: Try DuckDuckGo image search (no API key, but less reliable)
async function searchImageDuckDuckGo(query: string): Promise<string | null> {
  try {
    // DuckDuckGo doesn't have a public API, but we can try their HTML search
    // This is a workaround and may not be reliable
    const encodedQuery = encodeURIComponent(query)
    const url = `https://duckduckgo.com/?q=${encodedQuery}&iax=images&ia=images`
    
    // Note: DuckDuckGo doesn't have a proper API, so this won't work directly
    // We'd need to scrape HTML which is not recommended
    return null
  } catch (error) {
    console.error('DuckDuckGo search error:', error)
    return null
  }
}

// Main image search function
async function searchImage(
  itemName: string,
  collectionName: string,
  category?: string | null,
  template?: string | null
): Promise<string | null> {
  try {
    // Build optimized search query
    const searchQuery = buildSearchQuery(itemName, collectionName, category, template)
    console.log(`[Image Search] Searching for: "${searchQuery}"`)

    // Try Google Custom Search first (best for specific covers)
    const googleResult = await searchImageGoogle(searchQuery)
    if (googleResult) {
      console.log(`[Image Search] Found via Google: ${googleResult}`)
      return googleResult
    }

    // Could add more fallbacks here (Bing, etc.)
    // For now, return null if Google search fails
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
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)
    const collectionId = resolvedParams.id
    const body = await request.json()
    const { itemIds, autoFill } = body

    // Verify collection belongs to user
    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: session.user.id,
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
    const items = await prisma.item.findMany({
      where: {
        id: { in: itemIds || [] },
        collectionId: collectionId,
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
        // Search for image using optimized query based on collection type
        const imageUrl = await searchImage(
          item.name,
          collection.name,
          collection.category,
          collection.template
        )

        if (imageUrl) {
          // Update item with found image
          await prisma.item.update({
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

        // Add small delay to avoid rate limiting
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
    console.error('Error filling images:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


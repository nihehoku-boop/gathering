import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'
import { getDataSource, listDataSources } from '@/lib/data-fetchers'
import '@/lib/data-fetchers/init' // Initialize data sources

/**
 * Admin API endpoint for extracting collection data from a URL using AI
 * 
 * POST /api/admin/extract-from-url
 * Body: { url: string }
 */
export async function POST(request: NextRequest) {
  let url: string | undefined = undefined
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    url = body.url

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format and prevent SSRF attacks
    let urlObj: URL
    try {
      urlObj = new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Prevent SSRF: Block internal/private IP addresses
    const hostname = urlObj.hostname.toLowerCase()
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
    const isPrivateIP = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(hostname)
    const isInternalDomain = hostname.endsWith('.local') || hostname.endsWith('.internal')
    
    if (isLocalhost || isPrivateIP || isInternalDomain) {
      return NextResponse.json(
        { error: 'Internal URLs are not allowed for security reasons' },
        { status: 400 }
      )
    }

    // Only allow HTTP/HTTPS protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return NextResponse.json(
        { error: 'Only HTTP and HTTPS protocols are allowed' },
        { status: 400 }
      )
    }

    // Optional: Whitelist allowed domains (uncomment and configure as needed)
    // const allowedDomains = ['example.com', 'another-domain.com']
    // if (!allowedDomains.includes(hostname)) {
    //   return NextResponse.json(
    //     { error: 'Domain not allowed' },
    //     { status: 400 }
    //   )
    // }

    // Get AI data source
    // Ensure data sources are initialized
    try {
      await import('@/lib/data-fetchers/init')
    } catch (initError) {
      console.error('[Extract URL] Failed to initialize data sources:', initError)
    }
    
    const aiSource = getDataSource('ai')
    if (!aiSource) {
      console.error('[Extract URL] AI data source not found. Available sources:', listDataSources())
      return NextResponse.json(
        { error: 'AI data source not available. Make sure data sources are initialized.' },
        { status: 500 }
      )
    }
    
    console.log('[Extract URL] Using AI source:', aiSource.name)

    console.log('[Extract URL] Extracting from:', url)

    // Fetch items from URL using AI
    let items: any[] = []
    let metadata: any = {
      name: 'Extracted Collection',
      description: null,
      category: null,
      coverImage: null,
      tags: [],
    }

    try {
      items = await aiSource.fetchItems(url)
      console.log('[Extract URL] Fetched', items.length, 'items from URL')
    } catch (error) {
      console.error('[Extract URL] Error fetching items:', error)
      // Continue with empty items - metadata extraction might still work
    }

    // Try to get metadata by extracting from the URL content
    // We'll extract metadata from the same URL fetch
    try {
      // If fetchItems already extracted metadata, use it
      // Otherwise, try a search
      const searchResults = await aiSource.search(url)
      if (searchResults && searchResults.length > 0) {
        metadata = searchResults[0]
        console.log('[Extract URL] Got metadata from search:', metadata.name)
      }
    } catch (error) {
      console.error('[Extract URL] Error getting metadata:', error)
      // Use default metadata
    }

    console.log('[Extract URL] Final result:', items.length, 'items, metadata:', metadata.name)

    return NextResponse.json({
      metadata,
      items,
      itemsCount: items.length,
    })
  } catch (error) {
    console.error('[Extract URL] Error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    const errorUrl = url !== undefined ? url : 'not provided'
    
    console.error('[Extract URL] Error details:', {
      message: errorMessage,
      stack: errorStack,
      url: errorUrl,
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to extract from URL', 
        details: errorMessage,
        // Include stack in development
        ...(process.env.NODE_ENV === 'development' && errorStack ? { stack: errorStack } : {}),
      },
      { status: 500 }
    )
  }
}


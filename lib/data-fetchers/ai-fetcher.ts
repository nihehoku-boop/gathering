/**
 * AI-Powered Data Fetcher
 * 
 * Uses AI (OpenAI, Anthropic, or similar) to extract collection data from:
 * - URLs (web pages, product pages, catalog pages)
 * - Search queries (finds and extracts collection information)
 * 
 * This allows automatic extraction of:
 * - Collection name, description, category
 * - All items with titles, numbers, and cover images
 * - Metadata and tags
 */

import { CollectionItem, CollectionMetadata, DataSource } from './index'

interface AIConfig {
  apiKey?: string
  provider?: 'openai' | 'anthropic' | 'google'
  model?: string
}

/**
 * Fetch webpage content (for URL-based extraction)
 */
async function fetchWebpageContent(url: string): Promise<string> {
  console.log('[AI Fetcher] Fetching webpage:', url)
  
  // Use Node.js fetch (available in Node 18+) or undici
  // Create timeout controller
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
  
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
    }
    
    const text = await response.text()
    console.log('[AI Fetcher] Fetched', text.length, 'characters from URL')
    
    // Limit content size to avoid token limits (keep first 50k chars)
    if (text.length > 50000) {
      console.log('[AI Fetcher] Truncating content from', text.length, 'to 50000 characters')
      return text.substring(0, 50000)
    }
    
    return text
  } catch (error) {
    clearTimeout(timeoutId)
    console.error('[AI Fetcher] Error fetching webpage:', error)
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout: URL took too long to respond')
      }
      throw new Error(`Failed to fetch webpage: ${error.message}`)
    }
    throw error
  }
}

/**
 * Call AI to extract collection data from content
 */
async function extractCollectionWithAI(
  content: string,
  url?: string,
  config?: AIConfig
): Promise<{ metadata: CollectionMetadata; items: CollectionItem[] }> {
  // For now, we'll use a simple approach
  // In production, you'd call OpenAI, Anthropic, or similar API
  
  const apiKey = config?.apiKey || process.env.OPENAI_API_KEY
  const provider = config?.provider || 'openai'
  const model = config?.model || 'gpt-4o-mini'
  
  if (!apiKey) {
    console.error('[AI Fetcher] No API key found. OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Set (hidden)' : 'Not set')
    throw new Error('AI API key not configured. Please set OPENAI_API_KEY in your .env file')
  }
  
  console.log('[AI Fetcher] Using provider:', provider, 'model:', model)
  
  // Prepare the prompt for AI
  const prompt = `You are a collection data extractor. Extract collection information from the following content.

${url ? `URL: ${url}\n` : ''}
Content:
${content.substring(0, 50000)} // Limit content size

Please extract and return a JSON object with this structure:
{
  "metadata": {
    "name": "Collection name",
    "description": "Collection description",
    "category": "Category (e.g., Comics, Books, Cards)",
    "coverImage": "URL to cover image if available",
    "tags": ["tag1", "tag2"]
  },
  "items": [
    {
      "name": "Item name (e.g., 'Lustiges Taschenbuch #1')",
      "number": 1,
      "image": "URL to item cover image if available",
      "notes": "Optional notes"
    }
  ]
}

Extract ALL items from the collection. If the content shows a numbered series (like issues 1-604), include all of them.
Return ONLY valid JSON, no other text.`

  try {
    let response
    
    if (provider === 'openai') {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that extracts collection data and returns only valid JSON.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
      })
    } else if (provider === 'anthropic') {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: model || 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      })
    } else {
      throw new Error(`Unsupported AI provider: ${provider}`)
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(`AI API error: ${response.status} - ${JSON.stringify(errorData)}`)
    }
    
    const data = await response.json()
    
    // Extract JSON from response
    let jsonText = ''
    if (provider === 'openai') {
      jsonText = data.choices[0]?.message?.content || ''
    } else if (provider === 'anthropic') {
      jsonText = data.content[0]?.text || ''
    }
    
    // Parse the JSON response
    let extracted: any
    try {
      extracted = JSON.parse(jsonText)
    } catch (parseError) {
      console.error('[AI Fetcher] Failed to parse AI response:', jsonText.substring(0, 500))
      // Try to extract JSON from text if it's wrapped
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        extracted = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('AI returned invalid JSON. Response: ' + jsonText.substring(0, 200))
      }
    }
    
    console.log('[AI Fetcher] Extracted metadata:', extracted.metadata?.name, 'Items:', extracted.items?.length || 0)
    
    return {
      metadata: extracted.metadata || {
        name: 'Unknown Collection',
        description: null,
        category: null,
        coverImage: null,
        tags: [],
      },
      items: extracted.items || [],
    }
  } catch (error) {
    console.error('[AI Fetcher] Error calling AI:', error)
    if (error instanceof Error) {
      throw new Error(`AI extraction failed: ${error.message}`)
    }
    throw error
  }
}

/**
 * Search for collection information using AI
 */
async function searchCollectionWithAI(
  query: string,
  config?: AIConfig
): Promise<CollectionMetadata[]> {
  const apiKey = config?.apiKey || process.env.OPENAI_API_KEY
  const provider = config?.provider || 'openai'
  const model = config?.model || 'gpt-4o-mini'
  
  if (!apiKey) {
    // Return a helpful message instead of error
    return [{
      name: query,
      description: 'AI search requires OPENAI_API_KEY to be set in environment variables',
      category: null,
      tags: [],
    }]
  }
  
  const prompt = `Search for information about this collection: "${query}"

Return a JSON array of collection metadata objects. Each object should have:
{
  "name": "Collection name",
  "description": "Brief description",
  "category": "Category",
  "coverImage": "Image URL if known",
  "tags": ["tag1", "tag2"],
  "sourceId": "identifier for fetching items"
}

Return up to 5 relevant collections. Return ONLY valid JSON array, no other text.`

  try {
    let response
    
    if (provider === 'openai') {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that searches for collection information and returns only valid JSON arrays.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.5,
        }),
      })
    } else {
      throw new Error(`Search not yet implemented for provider: ${provider}`)
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(`AI API error: ${response.status} - ${JSON.stringify(errorData)}`)
    }
    
    const data = await response.json()
    const jsonText = data.choices[0]?.message?.content || '{}'
    
    // Try to parse as JSON object first
    let parsed: any
    try {
      parsed = JSON.parse(jsonText)
    } catch {
      // If parsing fails, try to extract JSON from text
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0])
      } else {
        parsed = {}
      }
    }
    
    // Handle both array and object with results/collections key
    let results: any[] = []
    if (Array.isArray(parsed)) {
      results = parsed
    } else if (parsed.results && Array.isArray(parsed.results)) {
      results = parsed.results
    } else if (parsed.collections && Array.isArray(parsed.collections)) {
      results = parsed.collections
    } else if (parsed.data && Array.isArray(parsed.data)) {
      results = parsed.data
    } else if (Object.keys(parsed).length > 0) {
      // Single result object
      results = [parsed]
    }
    
    return results.map((result: any) => ({
      name: result.name || query,
      description: result.description || null,
      category: result.category || null,
      coverImage: result.coverImage || null,
      tags: result.tags || [],
      sourceId: result.sourceId || result.url || result.name,
    }))
  } catch (error) {
    console.error('[AI Fetcher] Error searching with AI:', error)
    return []
  }
}

export function createAISource(config?: AIConfig): DataSource {
  return {
    name: 'AI-Powered Extraction',
    async search(query: string): Promise<CollectionMetadata[]> {
      return await searchCollectionWithAI(query, config)
    },
    async fetchItems(sourceId: string, metadata?: any): Promise<CollectionItem[]> {
      // sourceId can be a URL or a search result identifier
      // If it's a URL, fetch the page and extract
      // If it's a search result, try to use metadata or search again
      
      if (sourceId.startsWith('http://') || sourceId.startsWith('https://')) {
        // It's a URL - fetch the page and extract
        try {
          console.log('[AI Fetcher] Fetching from URL:', sourceId)
          const content = await fetchWebpageContent(sourceId)
          const extracted = await extractCollectionWithAI(content, sourceId, config)
          console.log('[AI Fetcher] Extracted', extracted.items.length, 'items from URL')
          return extracted.items
        } catch (error) {
          console.error('[AI Fetcher] Error fetching from URL:', error)
          throw error
        }
      } else if (metadata?.url) {
        // Metadata contains a URL
        try {
          console.log('[AI Fetcher] Fetching from metadata URL:', metadata.url)
          const content = await fetchWebpageContent(metadata.url)
          const extracted = await extractCollectionWithAI(content, metadata.url, config)
          console.log('[AI Fetcher] Extracted', extracted.items.length, 'items from metadata URL')
          return extracted.items
        } catch (error) {
          console.error('[AI Fetcher] Error fetching from metadata URL:', error)
          throw error
        }
      } else if (metadata?.items && Array.isArray(metadata.items)) {
        // Metadata already contains items (from search result)
        console.log('[AI Fetcher] Using items from metadata:', metadata.items.length)
        return metadata.items
      } else {
        // Fallback: try to search again with sourceId as query
        console.log('[AI Fetcher] No URL found, trying search with:', sourceId)
        const searchResults = await searchCollectionWithAI(sourceId, config)
        if (searchResults.length > 0 && searchResults[0].sourceId) {
          // Recursively fetch items using the sourceId (which might be a URL)
          const aiSource = createAISource(config)
          return await aiSource.fetchItems(searchResults[0].sourceId, searchResults[0])
        }
        return []
      }
    },
  }
}


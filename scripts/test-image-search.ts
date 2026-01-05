// Test script for Google Custom Search API
// Run with: npx tsx scripts/test-image-search.ts

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env file
config({ path: resolve(process.cwd(), '.env') })

async function testImageSearch() {
  const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY
  const searchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID

  console.log('🔍 Testing Google Custom Search API...\n')
  
  if (!apiKey) {
    console.error('❌ GOOGLE_CUSTOM_SEARCH_API_KEY is not set in environment variables')
    process.exit(1)
  }
  
  if (!searchEngineId) {
    console.error('❌ GOOGLE_CUSTOM_SEARCH_ENGINE_ID is not set in environment variables')
    process.exit(1)
  }

  console.log('✅ API Key found:', apiKey.substring(0, 10) + '...')
  console.log('✅ Search Engine ID:', searchEngineId)
  console.log('')

  // Test with a sample query (Tintin comic cover)
  const testQuery = 'Tintin #1 cover'
  const encodedQuery = encodeURIComponent(testQuery)
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodedQuery}&searchType=image&num=1&safe=active`

  console.log('📝 Test Query:', testQuery)
  console.log('🌐 Request URL:', url.replace(apiKey, 'API_KEY_HIDDEN'))
  console.log('')

  try {
    console.log('⏳ Sending request...')
    const response = await fetch(url)
    
    console.log('📊 Response Status:', response.status, response.statusText)
    console.log('')

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error Response:')
      console.error(errorText)
      process.exit(1)
    }

    const data = await response.json()
    
    if (data.error) {
      console.error('❌ API Error:', data.error.message)
      if (data.error.errors) {
        data.error.errors.forEach((err: any) => {
          console.error('  -', err.message)
        })
      }
      process.exit(1)
    }

    if (data.items && data.items.length > 0) {
      const image = data.items[0]
      console.log('✅ SUCCESS! Image found:')
      console.log('   Title:', image.title)
      console.log('   URL:', image.link)
      console.log('   Display URL:', image.displayLink)
      console.log('   Image Size:', image.image?.width, 'x', image.image?.height)
      console.log('')
      console.log('🎉 Image search is working correctly!')
    } else {
      console.log('⚠️  No images found for query:', testQuery)
      console.log('   This might be normal if the query is too specific')
      console.log('   Try a different query or check your search engine settings')
    }

    // Show quota info if available
    if (data.searchInformation) {
      console.log('')
      console.log('📈 Search Information:')
      console.log('   Total Results:', data.searchInformation.totalResults)
      console.log('   Search Time:', data.searchInformation.searchTime, 'seconds')
    }

  } catch (error) {
    console.error('❌ Network Error:')
    console.error(error)
    process.exit(1)
  }
}

testImageSearch()


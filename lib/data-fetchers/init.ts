/**
 * Initialize data sources
 * 
 * This file registers all available data sources
 */

import { registerDataSource } from './index'
import { createManualSource } from './manual'
import { createAISource } from './ai-fetcher'

// Register data sources
export function initializeDataSources() {
  // Manual source (always available)
  registerDataSource('manual', createManualSource())
  
  // AI-powered source (extracts data from URLs or search queries)
  registerDataSource('ai', createAISource())
  
  // Comic Vine source (requires API key - uncomment and configure)
  // import { createComicVineSource } from './comic-vine'
  // registerDataSource('comic-vine', createComicVineSource({
  //   apiKey: process.env.COMIC_VINE_API_KEY || '',
  // }))
}

// Initialize on import
initializeDataSources()


/**
 * Comic Vine API Data Fetcher
 * 
 * Comic Vine API: https://comicvine.gamespot.com/api/
 * Requires API key (free): https://comicvine.gamespot.com/api/
 */

import { CollectionItem, CollectionMetadata, DataSource } from './index'

interface ComicVineConfig {
  apiKey: string
  baseUrl?: string
}

export function createComicVineSource(config: ComicVineConfig): DataSource {
  const baseUrl = config.baseUrl || 'https://comicvine.gamespot.com/api'

  return {
    name: 'Comic Vine',
    async search(query: string): Promise<CollectionMetadata[]> {
      try {
        const response = await fetch(
          `${baseUrl}/search/?api_key=${config.apiKey}&format=json&resources=volume&query=${encodeURIComponent(query)}&limit=10`
        )
        const data = await response.json()
        
        return (data.results || []).map((result: any) => ({
          name: result.name,
          description: result.description,
          category: 'Comics',
          coverImage: result.image?.original_url || null,
          tags: [],
        }))
      } catch (error) {
        console.error('Comic Vine search error:', error)
        return []
      }
    },
    async fetchItems(sourceId: string): Promise<CollectionItem[]> {
      try {
        // Fetch volume details
        const volumeResponse = await fetch(
          `${baseUrl}/volume/${sourceId}/?api_key=${config.apiKey}&format=json`
        )
        const volumeData = await volumeResponse.json()
        
        if (!volumeData.results) return []
        
        // Fetch issues
        const issuesResponse = await fetch(
          `${baseUrl}/issues/?api_key=${config.apiKey}&format=json&volume=${sourceId}&limit=1000`
        )
        const issuesData = await issuesResponse.json()
        
        return (issuesData.results || []).map((issue: any) => ({
          name: issue.name || `Issue #${issue.issue_number}`,
          number: issue.issue_number ? parseInt(issue.issue_number) : null,
          image: issue.image?.original_url || null,
          notes: issue.description || null,
        }))
      } catch (error) {
        console.error('Comic Vine fetch error:', error)
        return []
      }
    },
  }
}




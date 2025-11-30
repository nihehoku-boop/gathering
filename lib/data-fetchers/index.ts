/**
 * Data Fetcher System
 * 
 * This module provides a flexible system for fetching collection data
 * from various external sources (APIs, web scraping, etc.)
 */

export interface CollectionItem {
  name: string
  number: number | null
  image: string | null
  notes?: string | null
}

export interface CollectionMetadata {
  name: string
  description?: string
  category?: string
  coverImage?: string
  tags?: string[]
}

export interface DataSource {
  name: string
  search: (query: string) => Promise<CollectionMetadata[]>
  fetchItems: (sourceId: string, metadata?: any) => Promise<CollectionItem[]>
}

// Registry of available data sources
const dataSources: Map<string, DataSource> = new Map()

export function registerDataSource(id: string, source: DataSource) {
  dataSources.set(id, source)
}

export function getDataSource(id: string): DataSource | undefined {
  return dataSources.get(id)
}

export function listDataSources(): string[] {
  return Array.from(dataSources.keys())
}




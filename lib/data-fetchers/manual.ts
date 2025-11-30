/**
 * Manual Data Source
 * 
 * Allows manual entry or custom data fetching logic
 */

import { CollectionItem, CollectionMetadata, DataSource } from './index'

export function createManualSource(): DataSource {
  return {
    name: 'Manual Entry',
    async search(query: string): Promise<CollectionMetadata[]> {
      // Manual source doesn't search - user provides data directly
      return []
    },
    async fetchItems(sourceId: string, metadata?: any): Promise<CollectionItem[]> {
      // For manual source, items should be provided in metadata
      return metadata?.items || []
    },
  }
}




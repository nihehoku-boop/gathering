/**
 * Predefined tags for collections
 * Tags are specific descriptors (MANY per collection)
 * Note: Collection types (Comics, Books, etc.) are now categories, not tags
 */

export const AVAILABLE_TAGS = [
  // Condition & Rarity
  'Vintage',
  'Limited Edition',
  'Signed',
  'Rare',
  'First Edition',
  'Graded',
  'Mint',
  'Near Mint',
  'Sealed',
  'Promotional',
  'Special Edition',
  'Exclusive',
  'Collector\'s Edition',
  'Anniversary Edition',
  
  // Brand/Series (Trading Cards & Collectibles)
  'Pokemon',
  'Magic: The Gathering',
  'Yu-Gi-Oh!',
  'Marvel',
  'DC',
  'Star Wars',
  'Disney',
  'Harry Potter',
  'Lord of the Rings',
  'Dungeons & Dragons',
  
  // Format/Type (Media-specific)
  'Hardcover',
  'Paperback',
  'Digital',
  '4K',
  'Blu-ray',
  'DVD',
  'Vinyl',
  'CD',
  'Digital Download',
  'Physical',
  'Streaming',
  
  // Genre/Theme (Content-based)
  'Sci-Fi',
  'Fantasy',
  'Horror',
  'Comedy',
  'Drama',
  'Action',
  'Adventure',
  'Romance',
  'Mystery',
  'Thriller',
  'Biography',
  'Non-Fiction',
  'Fiction',
  
  // Other Attributes
  'Memorabilia',
  'Autographs',
  'Pre-order',
  'Bundle',
  'Box Set',
  'Deluxe Edition',
] as const

export type Tag = typeof AVAILABLE_TAGS[number]

// Color mapping for each tag
export const TAG_COLORS: Record<Tag, { bg: string; text: string; border: string }> = {
  // Condition & Rarity
  'Vintage': { bg: '#95A5A6', text: '#FFFFFF', border: '#7F8C8D' },
  'Limited Edition': { bg: '#E74C3C', text: '#FFFFFF', border: '#C0392B' },
  'Signed': { bg: '#16A085', text: '#FFFFFF', border: '#138D75' },
  'Rare': { bg: '#D4AF37', text: '#000000', border: '#B8941F' },
  'First Edition': { bg: '#8E24AA', text: '#FFFFFF', border: '#6A1B9A' },
  'Graded': { bg: '#00BCD4', text: '#FFFFFF', border: '#0097A7' },
  'Mint': { bg: '#4CAF50', text: '#FFFFFF', border: '#388E3C' },
  'Near Mint': { bg: '#8BC34A', text: '#000000', border: '#689F38' },
  'Sealed': { bg: '#FF9800', text: '#FFFFFF', border: '#F57C00' },
  'Promotional': { bg: '#FF5722', text: '#FFFFFF', border: '#E64A19' },
  'Special Edition': { bg: '#9C27B0', text: '#FFFFFF', border: '#7B1FA2' },
  'Exclusive': { bg: '#F44336', text: '#FFFFFF', border: '#D32F2F' },
  'Collector\'s Edition': { bg: '#9C27B0', text: '#FFFFFF', border: '#7B1FA2' },
  'Anniversary Edition': { bg: '#FF9800', text: '#FFFFFF', border: '#F57C00' },
  
  // Brand/Series
  'Pokemon': { bg: '#FFD700', text: '#000000', border: '#FFA500' },
  'Magic: The Gathering': { bg: '#8B4513', text: '#FFFFFF', border: '#654321' },
  'Yu-Gi-Oh!': { bg: '#FF6B6B', text: '#FFFFFF', border: '#FF5252' },
  'Marvel': { bg: '#E74C3C', text: '#FFFFFF', border: '#C0392B' },
  'DC': { bg: '#3498DB', text: '#FFFFFF', border: '#2980B9' },
  'Star Wars': { bg: '#F39C12', text: '#000000', border: '#E67E22' },
  'Disney': { bg: '#9B59B6', text: '#FFFFFF', border: '#8E44AD' },
  'Harry Potter': { bg: '#8E24AA', text: '#FFFFFF', border: '#6A1B9A' },
  'Lord of the Rings': { bg: '#8B4513', text: '#FFFFFF', border: '#654321' },
  'Dungeons & Dragons': { bg: '#D35400', text: '#FFFFFF', border: '#C0392B' },
  
  // Format/Type
  'Hardcover': { bg: '#8B4513', text: '#FFFFFF', border: '#654321' },
  'Paperback': { bg: '#95A5A6', text: '#FFFFFF', border: '#7F8C8D' },
  'Digital': { bg: '#34495E', text: '#FFFFFF', border: '#2C3E50' },
  '4K': { bg: '#3498DB', text: '#FFFFFF', border: '#2980B9' },
  'Blu-ray': { bg: '#3498DB', text: '#FFFFFF', border: '#2980B9' },
  'DVD': { bg: '#16A085', text: '#FFFFFF', border: '#138D75' },
  'Vinyl': { bg: '#34495E', text: '#FFFFFF', border: '#2C3E50' },
  'CD': { bg: '#95A5A6', text: '#FFFFFF', border: '#7F8C8D' },
  'Digital Download': { bg: '#34495E', text: '#FFFFFF', border: '#2C3E50' },
  'Physical': { bg: '#607D8B', text: '#FFFFFF', border: '#455A64' },
  'Streaming': { bg: '#9B59B6', text: '#FFFFFF', border: '#8E44AD' },
  
  // Genre/Theme
  'Sci-Fi': { bg: '#3498DB', text: '#FFFFFF', border: '#2980B9' },
  'Fantasy': { bg: '#9B59B6', text: '#FFFFFF', border: '#8E44AD' },
  'Horror': { bg: '#E74C3C', text: '#FFFFFF', border: '#C0392B' },
  'Comedy': { bg: '#F39C12', text: '#000000', border: '#E67E22' },
  'Drama': { bg: '#95A5A6', text: '#FFFFFF', border: '#7F8C8D' },
  'Action': { bg: '#E74C3C', text: '#FFFFFF', border: '#C0392B' },
  'Adventure': { bg: '#16A085', text: '#FFFFFF', border: '#138D75' },
  'Romance': { bg: '#E91E63', text: '#FFFFFF', border: '#C2185B' },
  'Mystery': { bg: '#34495E', text: '#FFFFFF', border: '#2C3E50' },
  'Thriller': { bg: '#8E24AA', text: '#FFFFFF', border: '#6A1B9A' },
  'Biography': { bg: '#607D8B', text: '#FFFFFF', border: '#455A64' },
  'Non-Fiction': { bg: '#95A5A6', text: '#FFFFFF', border: '#7F8C8D' },
  'Fiction': { bg: '#4ECDC4', text: '#FFFFFF', border: '#26A69A' },
  
  // Other Attributes
  'Memorabilia': { bg: '#795548', text: '#FFFFFF', border: '#5D4037' },
  'Autographs': { bg: '#3F51B5', text: '#FFFFFF', border: '#303F9F' },
  'Pre-order': { bg: '#00BCD4', text: '#FFFFFF', border: '#0097A7' },
  'Bundle': { bg: '#FF9800', text: '#FFFFFF', border: '#F57C00' },
  'Box Set': { bg: '#9C27B0', text: '#FFFFFF', border: '#7B1FA2' },
  'Deluxe Edition': { bg: '#D4AF37', text: '#000000', border: '#B8941F' },
}

export function parseTags(tagsJson: string): string[] {
  try {
    const parsed = JSON.parse(tagsJson)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function stringifyTags(tags: string[]): string {
  return JSON.stringify(tags)
}

// Generate a color for a tag based on its hash (for custom tags)
function generateTagColor(tag: string): { bg: string; text: string; border: string } {
  // Simple hash function
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  // Generate a color from the hash
  const hue = Math.abs(hash) % 360
  const saturation = 60 + (Math.abs(hash) % 20) // 60-80%
  const lightness = 45 + (Math.abs(hash) % 15) // 45-60%
  
  const bg = `hsl(${hue}, ${saturation}%, ${lightness}%)`
  const text = lightness > 50 ? '#000000' : '#FFFFFF'
  const border = `hsl(${hue}, ${saturation}%, ${lightness - 10}%)`
  
  return { bg, text, border }
}

export function getTagColor(tag: string): { bg: string; text: string; border: string } {
  // Check if it's a predefined tag with a color
  if (TAG_COLORS[tag as Tag]) {
    return TAG_COLORS[tag as Tag]
  }
  
  // Generate a color for custom tags
  return generateTagColor(tag)
}


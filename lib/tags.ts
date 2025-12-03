// Predefined tags for collections (expanded list with ~50 tags)
export const AVAILABLE_TAGS = [
  // Collection Types
  'Comics',
  'Books',
  'Movies',
  'Games',
  'Music',
  'Art',
  'Trading Cards',
  'Sports Cards',
  'Action Figures',
  'Toys',
  'Vinyl Records',
  'CDs',
  'DVDs',
  'Blu-ray',
  'Video Games',
  'Board Games',
  'Coins',
  'Stamps',
  'Posters',
  'Art Prints',
  
  // Pokemon TCG Specific
  'Pokemon',
  'TCG',
  'Base',
  'Neo',
  'EX',
  'Gym',
  'Diamond & Pearl',
  'Platinum',
  'HeartGold & SoulSilver',
  'Black & White',
  'XY',
  'Sun & Moon',
  'Sword & Shield',
  'Scarlet & Violet',
  'Trainer Kits',
  "McDonald's Collection",
  'POP',
  'Legendary Collection',
  'E-Card',
  'Call of Legends',
  
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
  
  // Other Categories
  'Collectibles',
  'Memorabilia',
  'Autographs',
  'Promotional',
  'Special Edition',
  'Exclusive',
  'Pre-order',
  'Bundle',
] as const

export type Tag = typeof AVAILABLE_TAGS[number]

// Color mapping for each tag
export const TAG_COLORS: Record<Tag, { bg: string; text: string; border: string }> = {
  // Collection Types
  'Comics': { bg: '#FF6B6B', text: '#FFFFFF', border: '#FF5252' },
  'Books': { bg: '#4ECDC4', text: '#FFFFFF', border: '#26A69A' },
  'Movies': { bg: '#45B7D1', text: '#FFFFFF', border: '#2196F3' },
  'Games': { bg: '#FFA07A', text: '#FFFFFF', border: '#FF8C69' },
  'Music': { bg: '#9B59B6', text: '#FFFFFF', border: '#8E44AD' },
  'Art': { bg: '#F39C12', text: '#FFFFFF', border: '#E67E22' },
  'Trading Cards': { bg: '#E74C3C', text: '#FFFFFF', border: '#C0392B' },
  'Sports Cards': { bg: '#3498DB', text: '#FFFFFF', border: '#2980B9' },
  'Action Figures': { bg: '#E67E22', text: '#FFFFFF', border: '#D35400' },
  'Toys': { bg: '#F1C40F', text: '#000000', border: '#F39C12' },
  'Vinyl Records': { bg: '#34495E', text: '#FFFFFF', border: '#2C3E50' },
  'CDs': { bg: '#95A5A6', text: '#FFFFFF', border: '#7F8C8D' },
  'DVDs': { bg: '#16A085', text: '#FFFFFF', border: '#138D75' },
  'Blu-ray': { bg: '#3498DB', text: '#FFFFFF', border: '#2980B9' },
  'Video Games': { bg: '#9B59B6', text: '#FFFFFF', border: '#8E44AD' },
  'Board Games': { bg: '#D35400', text: '#FFFFFF', border: '#C0392B' },
  'Coins': { bg: '#D4AF37', text: '#000000', border: '#B8941F' },
  'Stamps': { bg: '#1ABC9C', text: '#FFFFFF', border: '#16A085' },
  'Posters': { bg: '#E91E63', text: '#FFFFFF', border: '#C2185B' },
  'Art Prints': { bg: '#FF9800', text: '#FFFFFF', border: '#F57C00' },
  
  // Pokemon TCG Specific
  'Pokemon': { bg: '#FFD700', text: '#000000', border: '#FFA500' },
  'TCG': { bg: '#FF6B6B', text: '#FFFFFF', border: '#FF5252' },
  'Base': { bg: '#4A90E2', text: '#FFFFFF', border: '#357ABD' },
  'Neo': { bg: '#9B59B6', text: '#FFFFFF', border: '#8E44AD' },
  'EX': { bg: '#E74C3C', text: '#FFFFFF', border: '#C0392B' },
  'Gym': { bg: '#16A085', text: '#FFFFFF', border: '#138D75' },
  'Diamond & Pearl': { bg: '#3498DB', text: '#FFFFFF', border: '#2980B9' },
  'Platinum': { bg: '#95A5A6', text: '#FFFFFF', border: '#7F8C8D' },
  'HeartGold & SoulSilver': { bg: '#F39C12', text: '#FFFFFF', border: '#E67E22' },
  'Black & White': { bg: '#2C3E50', text: '#FFFFFF', border: '#1A252F' },
  'XY': { bg: '#E91E63', text: '#FFFFFF', border: '#C2185B' },
  'Sun & Moon': { bg: '#FF9800', text: '#FFFFFF', border: '#F57C00' },
  'Sword & Shield': { bg: '#9C27B0', text: '#FFFFFF', border: '#7B1FA2' },
  'Scarlet & Violet': { bg: '#E53935', text: '#FFFFFF', border: '#C62828' },
  'Trainer Kits': { bg: '#00ACC1', text: '#FFFFFF', border: '#00838F' },
  "McDonald's Collection": { bg: '#FFC107', text: '#000000', border: '#FFA000' },
  'POP': { bg: '#673AB7', text: '#FFFFFF', border: '#512DA8' },
  'Legendary Collection': { bg: '#D4AF37', text: '#000000', border: '#B8941F' },
  'E-Card': { bg: '#4CAF50', text: '#FFFFFF', border: '#388E3C' },
  'Call of Legends': { bg: '#FF5722', text: '#FFFFFF', border: '#E64A19' },
  
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
  
  // Other Categories
  'Collectibles': { bg: '#607D8B', text: '#FFFFFF', border: '#455A64' },
  'Memorabilia': { bg: '#795548', text: '#FFFFFF', border: '#5D4037' },
  'Autographs': { bg: '#3F51B5', text: '#FFFFFF', border: '#303F9F' },
  'Promotional': { bg: '#FF5722', text: '#FFFFFF', border: '#E64A19' },
  'Special Edition': { bg: '#9C27B0', text: '#FFFFFF', border: '#7B1FA2' },
  'Exclusive': { bg: '#F44336', text: '#FFFFFF', border: '#D32F2F' },
  'Pre-order': { bg: '#00BCD4', text: '#FFFFFF', border: '#0097A7' },
  'Bundle': { bg: '#FF9800', text: '#FFFFFF', border: '#F57C00' },
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


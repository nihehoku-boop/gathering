/**
 * Predefined categories for collections
 * Categories are high-level classifications (ONE per collection)
 */

export const AVAILABLE_CATEGORIES = [
  'Books',
  'Comics',
  'Movies',
  'TV Shows',
  'Music',
  'Video Games',
  'Board Games',
  'Trading Cards',
  'Sports Cards',
  'Toys',
  'Action Figures',
  'Art',
  'Collectibles',
  'Vinyl Records',
  'Coins',
  'Stamps',
  'Posters',
  'Art Prints',
  'Other',
] as const

export type Category = typeof AVAILABLE_CATEGORIES[number]

/**
 * Category metadata (icons, colors, descriptions)
 */
export interface CategoryMetadata {
  icon?: string // Icon name or emoji
  color: { start: string; badge: string } // Colors for cover generation
  description?: string
}

/**
 * Category color mapping for cover generation
 */
export const CATEGORY_COLORS: Record<Category, { start: string; badge: string }> = {
  'Books': { start: '#8B4513', badge: '#CD853F' },
  'Comics': { start: '#FF6B6B', badge: '#FF8787' },
  'Movies': { start: '#4ECDC4', badge: '#6EDCD4' },
  'TV Shows': { start: '#4ECDC4', badge: '#6EDCD4' },
  'Music': { start: '#9B59B6', badge: '#BB8FCE' },
  'Video Games': { start: '#F39C12', badge: '#F5B041' },
  'Board Games': { start: '#D35400', badge: '#E67E22' },
  'Trading Cards': { start: '#3498DB', badge: '#5DADE2' },
  'Sports Cards': { start: '#3498DB', badge: '#5DADE2' },
  'Toys': { start: '#E74C3C', badge: '#EC7063' },
  'Action Figures': { start: '#E67E22', badge: '#F39C12' },
  'Art': { start: '#E91E63', badge: '#F06292' },
  'Collectibles': { start: '#607D8B', badge: '#7F8C8D' },
  'Vinyl Records': { start: '#34495E', badge: '#2C3E50' },
  'Coins': { start: '#D4AF37', badge: '#B8941F' },
  'Stamps': { start: '#1ABC9C', badge: '#16A085' },
  'Posters': { start: '#E91E63', badge: '#C2185B' },
  'Art Prints': { start: '#FF9800', badge: '#F57C00' },
  'Other': { start: '#34C759', badge: '#34C759' },
}

/**
 * Get category color for cover generation
 */
export function getCategoryColor(category: Category | string | null): { start: string; badge: string } {
  if (!category) {
    return CATEGORY_COLORS['Other']
  }

  // Check if it's a valid category
  if (AVAILABLE_CATEGORIES.includes(category as Category)) {
    return CATEGORY_COLORS[category as Category]
  }

  // Fallback: try to match by name (case-insensitive)
  const categoryLower = category.toLowerCase()
  for (const [key, color] of Object.entries(CATEGORY_COLORS)) {
    if (key.toLowerCase() === categoryLower) {
      return color
    }
  }

  // Default fallback
  return CATEGORY_COLORS['Other']
}

/**
 * Validate if a string is a valid category
 */
export function isValidCategory(category: string | null | undefined): category is Category {
  if (!category) return false
  return AVAILABLE_CATEGORIES.includes(category as Category)
}

/**
 * Normalize category name (for migration)
 * Maps common variations to standard category names
 */
export function normalizeCategory(category: string | null | undefined): Category | null {
  if (!category) return null

  const normalized = category.trim()
  const lower = normalized.toLowerCase()

  // Direct matches
  if (isValidCategory(normalized)) {
    return normalized
  }

  // Common variations mapping
  const variations: Record<string, Category> = {
    'comic': 'Comics',
    'comic book': 'Comics',
    'comic books': 'Comics',
    'book': 'Books',
    'movie': 'Movies',
    'film': 'Movies',
    'films': 'Movies',
    'tv show': 'TV Shows',
    'television': 'TV Shows',
    'tv': 'TV Shows',
    'game': 'Video Games',
    'videogame': 'Video Games',
    'videogames': 'Video Games',
    'trading card': 'Trading Cards',
    'tcg': 'Trading Cards',
    'sports card': 'Sports Cards',
    'toy': 'Toys',
    'action figure': 'Action Figures',
    'vinyl': 'Vinyl Records',
    'vinyl record': 'Vinyl Records',
    'coin': 'Coins',
    'stamp': 'Stamps',
    'poster': 'Posters',
    'art print': 'Art Prints',
    'collectible': 'Collectibles',
  }

  if (variations[lower]) {
    return variations[lower]
  }

  // Try partial matching
  for (const [key, value] of Object.entries(variations)) {
    if (lower.includes(key) || key.includes(lower)) {
      return value
    }
  }

  // Check if any category name contains the input or vice versa
  for (const cat of AVAILABLE_CATEGORIES) {
    if (cat.toLowerCase().includes(lower) || lower.includes(cat.toLowerCase())) {
      return cat
    }
  }

  return null
}


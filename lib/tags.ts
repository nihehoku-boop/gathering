// Predefined tags for collections
export const AVAILABLE_TAGS = [
  'Comics',
  'Books',
  'Movies',
  'Games',
  'Music',
  'Art',
  'Vintage',
  'Limited Edition',
  'Signed',
  'Rare',
] as const

export type Tag = typeof AVAILABLE_TAGS[number]

// Color mapping for each tag
export const TAG_COLORS: Record<Tag, { bg: string; text: string; border: string }> = {
  'Comics': { bg: '#FF6B6B', text: '#FFFFFF', border: '#FF5252' },
  'Books': { bg: '#4ECDC4', text: '#FFFFFF', border: '#26A69A' },
  'Movies': { bg: '#45B7D1', text: '#FFFFFF', border: '#2196F3' },
  'Games': { bg: '#FFA07A', text: '#FFFFFF', border: '#FF8C69' },
  'Music': { bg: '#9B59B6', text: '#FFFFFF', border: '#8E44AD' },
  'Art': { bg: '#F39C12', text: '#FFFFFF', border: '#E67E22' },
  'Vintage': { bg: '#95A5A6', text: '#FFFFFF', border: '#7F8C8D' },
  'Limited Edition': { bg: '#E74C3C', text: '#FFFFFF', border: '#C0392B' },
  'Signed': { bg: '#16A085', text: '#FFFFFF', border: '#138D75' },
  'Rare': { bg: '#D4AF37', text: '#000000', border: '#B8941F' },
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

export function getTagColor(tag: string): { bg: string; text: string; border: string } {
  return TAG_COLORS[tag as Tag] || { bg: '#2a2d35', text: '#fafafa', border: '#353842' }
}


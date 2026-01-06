/**
 * Utility functions for generating collection cover images
 */

// Collection cover image dimensions
// Display: h-48 (192px) with w-full (responsive width)
// Optimal format: 2:1 aspect ratio for collection cards
// Generated at 2x for retina displays: 800px x 384px (slightly wider)
const COVER_WIDTH = 800
const COVER_HEIGHT = 384

// Padding from edges
const HORIZONTAL_PADDING = 60
const VERTICAL_PADDING = 40

// Color scheme
const COLORS = {
  background: {
    gradient: {
      start: '#1a1d24',
      end: '#2a2d35',
    },
  },
  text: {
    primary: '#fafafa',
  },
}

export function getCategoryColor(category: string | null): { start: string; badge: string } {
  if (!category) {
    return { start: '#34C759', badge: '#34C759' }
  }

  const categoryLower = category.toLowerCase()
  const colorMap: Record<string, { start: string; badge: string }> = {
    'books': { start: '#8B4513', badge: '#CD853F' },
    'book': { start: '#8B4513', badge: '#CD853F' },
    'comics': { start: '#FF6B6B', badge: '#FF8787' },
    'comic': { start: '#FF6B6B', badge: '#FF8787' },
    'movies': { start: '#4ECDC4', badge: '#6EDCD4' },
    'movie': { start: '#4ECDC4', badge: '#6EDCD4' },
    'films': { start: '#4ECDC4', badge: '#6EDCD4' },
    'music': { start: '#9B59B6', badge: '#BB8FCE' },
    'vinyl': { start: '#9B59B6', badge: '#BB8FCE' },
    'games': { start: '#F39C12', badge: '#F5B041' },
    'game': { start: '#F39C12', badge: '#F5B041' },
    'trading cards': { start: '#3498DB', badge: '#5DADE2' },
    'cards': { start: '#3498DB', badge: '#5DADE2' },
    'toys': { start: '#E74C3C', badge: '#EC7063' },
    'art': { start: '#E91E63', badge: '#F06292' },
  }

  if (colorMap[categoryLower]) return colorMap[categoryLower]
  for (const [key, color] of Object.entries(colorMap)) {
    if (categoryLower.includes(key) || key.includes(categoryLower)) return color
  }
  return { start: '#34C759', badge: '#34C759' }
}

function escapeXml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

export function generateSVGCover(collectionName: string, category: string | null = null): string {
  // Calculate available width (accounting for padding)
  const availableWidth = COVER_WIDTH - (HORIZONTAL_PADDING * 2)
  
  // Start with base font size and adjust based on text length
  let baseFontSize = 48
  const minFontSize = 32
  const maxFontSize = 52
  
  // Estimate text width (rough approximation: average char width is ~0.6 * fontSize)
  const estimatedTextWidth = collectionName.length * (baseFontSize * 0.6)
  
  // If text is too wide, reduce font size
  if (estimatedTextWidth > availableWidth * 0.9) {
    // Calculate optimal font size to fit in available width
    const optimalSize = Math.floor((availableWidth * 0.9) / (collectionName.length * 0.6))
    baseFontSize = Math.max(minFontSize, Math.min(maxFontSize, optimalSize))
  }
  
  // Word wrap with padding consideration
  const words = collectionName.split(' ')
  const lines: string[] = []
  let currentLine = ''
  
  // Calculate max characters per line based on font size and available width
  const avgCharWidth = baseFontSize * 0.6
  const maxCharsPerLine = Math.floor(availableWidth / avgCharWidth)
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
      // If a single word is too long, truncate it
      if (currentLine.length > maxCharsPerLine) {
        currentLine = currentLine.substring(0, maxCharsPerLine - 3) + '...'
      }
    }
  }
  if (currentLine) lines.push(currentLine)

  // Limit to 2 lines for better readability
  if (lines.length > 2) {
    lines.splice(2)
    // Truncate second line if needed
    if (lines[1].length > maxCharsPerLine) {
      lines[1] = lines[1].substring(0, maxCharsPerLine - 3) + '...'
    }
  }

  // Calculate line height based on font size
  const lineHeight = baseFontSize * 1.4
  const startY = COVER_HEIGHT / 2 - ((lines.length - 1) * lineHeight) / 2
  const categoryColors = getCategoryColor(category)

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${COVER_WIDTH}" height="${COVER_HEIGHT}" viewBox="0 0 ${COVER_WIDTH} ${COVER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-gradient" x1="0" y1="0" x2="${COVER_WIDTH}" y2="${COVER_HEIGHT}">
      <stop offset="0%" style="stop-color:${COLORS.background.gradient.start};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${categoryColors.start};stop-opacity:0.15" />
      <stop offset="100%" style="stop-color:${COLORS.background.gradient.end};stop-opacity:1" />
    </linearGradient>
    <pattern id="grid-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <rect width="20" height="20" fill="none"/>
      <line x1="0" y1="0" x2="0" y2="20" stroke="${COLORS.text.primary}" stroke-width="0.5" opacity="0.05"/>
      <line x1="0" y1="0" x2="20" y2="0" stroke="${COLORS.text.primary}" stroke-width="0.5" opacity="0.05"/>
    </pattern>
  </defs>
  <rect width="${COVER_WIDTH}" height="${COVER_HEIGHT}" fill="url(#bg-gradient)"/>
  <rect width="${COVER_WIDTH}" height="${COVER_HEIGHT}" fill="url(#grid-pattern)"/>
  ${lines.map((line, index) => `
  <text x="${COVER_WIDTH / 2}" y="${startY + index * lineHeight}" 
    font-family="system-ui, -apple-system, 'Bricolage Grotesque', sans-serif" 
    font-size="${baseFontSize}" font-weight="700" fill="${COLORS.text.primary}" 
    text-anchor="middle" letter-spacing="-0.5px" dominant-baseline="central">
    ${escapeXml(line)}
  </text>`).join('')}
  ${category ? `
  <rect x="${COVER_WIDTH / 2 - 80}" y="${COVER_HEIGHT * 0.8}" width="160" height="36" rx="18" fill="${categoryColors.badge}" opacity="0.25"/>
  <text x="${COVER_WIDTH / 2}" y="${COVER_HEIGHT * 0.8 + 18}" 
    font-family="system-ui, -apple-system, 'Bricolage Grotesque', sans-serif" 
    font-size="16" font-weight="600" fill="${categoryColors.badge}" 
    text-anchor="middle" dominant-baseline="central">
    ${escapeXml(category)}
  </text>` : ''}
</svg>`
}

/**
 * Generate cover image and return as data URL (for Vercel/serverless compatibility)
 */
export function generateCoverDataURL(collectionName: string, category: string | null = null): string {
  const svg = generateSVGCover(collectionName, category)
  const encoded = Buffer.from(svg).toString('base64')
  return `data:image/svg+xml;base64,${encoded}`
}


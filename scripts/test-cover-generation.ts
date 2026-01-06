/**
 * Quick test script to generate a single cover image for preview
 */

import { prisma } from '../lib/prisma'
import * as fs from 'fs'
import * as path from 'path'

// Collection cover image dimensions
const COVER_WIDTH = 400
const COVER_HEIGHT = 600

// Color scheme
const COLORS = {
  background: {
    dark: '#1a1d24',
    gradient: {
      start: '#1a1d24',
      end: '#2a2d35',
    },
  },
  text: {
    primary: '#fafafa',
    secondary: '#969696',
  },
  accent: {
    default: '#34C759',
    gold: '#FFB800',
  },
}

/**
 * Get category color - maps categories to specific colors
 */
function getCategoryColor(category: string | null): { start: string; end: string; badge: string } {
  if (!category) {
    return {
      start: '#34C759', // Default green
      end: '#28a745',
      badge: '#34C759',
    }
  }

  const categoryLower = category.toLowerCase()
  
  // Color mapping for common categories
  const colorMap: Record<string, { start: string; end: string; badge: string }> = {
    // Books & Reading
    'books': { start: '#8B4513', end: '#A0522D', badge: '#CD853F' }, // Brown
    'book': { start: '#8B4513', end: '#A0522D', badge: '#CD853F' },
    'reading': { start: '#8B4513', end: '#A0522D', badge: '#CD853F' },
    
    // Comics
    'comics': { start: '#FF6B6B', end: '#EE5A6F', badge: '#FF8787' }, // Red
    'comic': { start: '#FF6B6B', end: '#EE5A6F', badge: '#FF8787' },
    
    // Movies & Films
    'movies': { start: '#4ECDC4', end: '#44A08D', badge: '#6EDCD4' }, // Teal
    'movie': { start: '#4ECDC4', end: '#44A08D', badge: '#6EDCD4' },
    'films': { start: '#4ECDC4', end: '#44A08D', badge: '#6EDCD4' },
    'film': { start: '#4ECDC4', end: '#44A08D', badge: '#6EDCD4' },
    
    // Music
    'music': { start: '#9B59B6', end: '#8E44AD', badge: '#BB8FCE' }, // Purple
    'vinyl': { start: '#9B59B6', end: '#8E44AD', badge: '#BB8FCE' },
    'vinyl records': { start: '#9B59B6', end: '#8E44AD', badge: '#BB8FCE' },
    'cds': { start: '#9B59B6', end: '#8E44AD', badge: '#BB8FCE' },
    
    // Games
    'games': { start: '#F39C12', end: '#E67E22', badge: '#F5B041' }, // Orange
    'game': { start: '#F39C12', end: '#E67E22', badge: '#F5B041' },
    'video games': { start: '#F39C12', end: '#E67E22', badge: '#F5B041' },
    
    // Trading Cards
    'trading cards': { start: '#3498DB', end: '#2980B9', badge: '#5DADE2' }, // Blue
    'cards': { start: '#3498DB', end: '#2980B9', badge: '#5DADE2' },
    'card': { start: '#3498DB', end: '#2980B9', badge: '#5DADE2' },
    'sports cards': { start: '#3498DB', end: '#2980B9', badge: '#5DADE2' },
    
    // Toys & Figures
    'toys': { start: '#E74C3C', end: '#C0392B', badge: '#EC7063' }, // Red-orange
    'toy': { start: '#E74C3C', end: '#C0392B', badge: '#EC7063' },
    'action figures': { start: '#E74C3C', end: '#C0392B', badge: '#EC7063' },
    
    // Art
    'art': { start: '#E91E63', end: '#C2185B', badge: '#F06292' }, // Pink
    'artwork': { start: '#E91E63', end: '#C2185B', badge: '#F06292' },
  }

  // Check for exact match first
  if (colorMap[categoryLower]) {
    return colorMap[categoryLower]
  }

  // Check for partial matches
  for (const [key, color] of Object.entries(colorMap)) {
    if (categoryLower.includes(key) || key.includes(categoryLower)) {
      return color
    }
  }

  // Default green
  return {
    start: '#34C759',
    end: '#28a745',
    badge: '#34C759',
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function generateSVGCover(collectionName: string, category: string | null = null): string {
  const maxLength = 30
  const displayName = collectionName.length > maxLength 
    ? collectionName.substring(0, maxLength - 3) + '...'
    : collectionName

  const words = displayName.split(' ')
  const lines: string[] = []
  let currentLine = ''
  
  for (const word of words) {
    if ((currentLine + word).length <= 20) {
      currentLine += (currentLine ? ' ' : '') + word
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  }
  if (currentLine) lines.push(currentLine)

  if (lines.length > 3) {
    lines.splice(3)
    lines[2] = lines[2].substring(0, 17) + '...'
  }

  const lineHeight = 60
  const startY = COVER_HEIGHT / 2 - ((lines.length - 1) * lineHeight) / 2

  // Get category colors
  const categoryColors = getCategoryColor(category)

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${COVER_WIDTH}" height="${COVER_HEIGHT}" viewBox="0 0 ${COVER_WIDTH} ${COVER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background gradient with category color -->
    <linearGradient id="bg-gradient" x1="0" y1="0" x2="${COVER_WIDTH}" y2="${COVER_HEIGHT}">
      <stop offset="0%" style="stop-color:${COLORS.background.gradient.start};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${categoryColors.start};stop-opacity:0.15" />
      <stop offset="100%" style="stop-color:${COLORS.background.gradient.end};stop-opacity:1" />
    </linearGradient>
    <!-- Simple grid pattern -->
    <pattern id="grid-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <rect width="20" height="20" fill="none"/>
      <line x1="0" y1="0" x2="0" y2="20" stroke="${COLORS.text.primary}" stroke-width="0.5" opacity="0.05"/>
      <line x1="0" y1="0" x2="20" y2="0" stroke="${COLORS.text.primary}" stroke-width="0.5" opacity="0.05"/>
    </pattern>
  </defs>
  
  <!-- Background -->
  <rect width="${COVER_WIDTH}" height="${COVER_HEIGHT}" fill="url(#bg-gradient)"/>
  <rect width="${COVER_WIDTH}" height="${COVER_HEIGHT}" fill="url(#grid-pattern)"/>
  
  <!-- Collection name text -->
  ${lines.map((line, index) => `
  <text 
    x="${COVER_WIDTH / 2}" 
    y="${startY + index * lineHeight}" 
    font-family="system-ui, -apple-system, 'Bricolage Grotesque', sans-serif" 
    font-size="48" 
    font-weight="700" 
    fill="${COLORS.text.primary}" 
    text-anchor="middle"
    letter-spacing="-1px"
    dominant-baseline="central">
    ${escapeXml(line)}
  </text>`).join('')}
  
  ${category ? `
  <!-- Category badge -->
  <rect x="${COVER_WIDTH / 2 - 60}" y="${COVER_HEIGHT * 0.75}" width="120" height="32" rx="16" fill="${categoryColors.badge}" opacity="0.25"/>
  <text 
    x="${COVER_WIDTH / 2}" 
    y="${COVER_HEIGHT * 0.75 + 16}" 
    font-family="system-ui, -apple-system, 'Bricolage Grotesque', sans-serif" 
    font-size="14" 
    font-weight="600" 
    fill="${categoryColors.badge}" 
    text-anchor="middle"
    dominant-baseline="central">
    ${escapeXml(category)}
  </text>` : ''}
</svg>`
}

async function main() {
  console.log('🎨 Generating test cover image...\n')

  let collectionName = 'My Test Collection'
  let collectionCategory: string | null = 'Books'
  let collectionId = 'test'

  // Try to find a real collection if database is available
  if (process.env.DATABASE_URL || process.env.PRISMA_DATABASE_URL) {
    try {
      const collection = await prisma.collection.findFirst({
        where: {
          OR: [
            { coverImage: null },
            { coverImage: '' },
          ],
        },
        select: {
          id: true,
          name: true,
          category: true,
        },
      })

      if (collection) {
        collectionName = collection.name
        collectionCategory = collection.category
        collectionId = collection.id
        console.log(`Found collection: "${collectionName}" (${collectionCategory || 'No category'})\n`)
      } else {
        console.log('All collections have covers. Generating test sample...\n')
      }
    } catch (error) {
      console.log('Database not available. Generating test sample...\n')
    }
  } else {
    console.log('Generating test sample (no database connection)...\n')
  }

  // Generate SVG
  const svg = generateSVGCover(collectionName, collectionCategory)
  
  // Save to public folder
  const outputDir = path.join(process.cwd(), 'public', 'collection-covers')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  const fileName = `test-cover.svg`
  const filePath = path.join(outputDir, fileName)
  fs.writeFileSync(filePath, svg, 'utf-8')
  
  console.log(`✅ Generated test cover image:`)
  console.log(`   File: ${filePath}`)
  console.log(`   Collection: "${collectionName}"`)
  console.log(`   Category: ${collectionCategory || 'None'}`)
  console.log(`\n   Preview at: http://localhost:3000/collection-covers/${fileName}`)
  console.log(`   Or open the file directly in your browser: ${filePath}`)

  try {
    await prisma.$disconnect()
  } catch (error) {
    // Ignore disconnect errors if not connected
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })


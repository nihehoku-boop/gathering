import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import * as fs from 'fs'
import * as path from 'path'

// Collection cover image dimensions
const COVER_WIDTH = 400
const COVER_HEIGHT = 600

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

function getCategoryColor(category: string | null): { start: string; badge: string } {
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
    font-size="48" font-weight="700" fill="${COLORS.text.primary}" 
    text-anchor="middle" letter-spacing="-1px" dominant-baseline="central">
    ${escapeXml(line)}
  </text>`).join('')}
  ${category ? `
  <rect x="${COVER_WIDTH / 2 - 60}" y="${COVER_HEIGHT * 0.75}" width="120" height="32" rx="16" fill="${categoryColors.badge}" opacity="0.25"/>
  <text x="${COVER_WIDTH / 2}" y="${COVER_HEIGHT * 0.75 + 16}" 
    font-family="system-ui, -apple-system, 'Bricolage Grotesque', sans-serif" 
    font-size="14" font-weight="600" fill="${categoryColors.badge}" 
    text-anchor="middle" dominant-baseline="central">
    ${escapeXml(category)}
  </text>` : ''}
</svg>`
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { isUserAdmin } = await import('@/lib/user-cache')
    const isAdmin = await isUserAdmin(session.user.id)
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Find collections without cover images
    const collectionsWithoutCovers = await prisma.collection.findMany({
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

    if (collectionsWithoutCovers.length === 0) {
      return NextResponse.json({ 
        message: 'All collections already have cover images',
        generated: 0,
        updated: 0 
      })
    }

    // Create output directory
    const outputDir = path.join(process.cwd(), 'public', 'collection-covers')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    let generated = 0
    let updated = 0
    const errors: string[] = []

    for (const collection of collectionsWithoutCovers) {
      try {
        const fileName = `cover-${collection.id}.svg`
        const filePath = path.join(outputDir, fileName)
        const publicPath = `/collection-covers/${fileName}`

        // Generate SVG
        const svg = generateSVGCover(collection.name, collection.category)
        fs.writeFileSync(filePath, svg, 'utf-8')
        generated++

        // Update database
        await prisma.collection.update({
          where: { id: collection.id },
          data: { coverImage: publicPath },
        })

        updated++
      } catch (error) {
        errors.push(`${collection.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      message: 'Cover generation complete',
      generated,
      updated,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Error generating covers:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}


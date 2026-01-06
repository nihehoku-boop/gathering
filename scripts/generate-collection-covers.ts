/**
 * Script to generate default cover images for collections without cover images
 * Generates SVG images with collection name in Bricolage Grotesque font
 * 
 * Usage:
 *   npm run generate:collection-covers                    # Generate SVG covers
 *   npm run generate:collection-covers -- --dry-run      # Preview without changes
 *   npm run generate:collection-covers -- --format png   # Generate PNG (requires: npm install sharp)
 *   npm run generate:collection-covers -- --upload       # Upload to Cloudinary
 * 
 * Requirements:
 *   - DATABASE_URL environment variable must be set
 *   - For PNG: npm install sharp
 *   - For Cloudinary upload: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 * 
 * Output:
 *   - SVG files saved to: public/collection-covers/
 *   - Database updated with cover image paths
 */

import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables in order of precedence:
// 1. .env.production (if exists, for production runs)
// 2. .env.local (local overrides)
// 3. .env (default)
const envProduction = path.join(process.cwd(), '.env.production')
const envLocal = path.join(process.cwd(), '.env.local')
const envDefault = path.join(process.cwd(), '.env')

if (require('fs').existsSync(envProduction)) {
  dotenv.config({ path: envProduction })
}
if (require('fs').existsSync(envLocal)) {
  dotenv.config({ path: envLocal }) // This will override .env.production values
}
dotenv.config() // This will not override existing values

import { prisma } from '../lib/prisma'
import * as fs from 'fs'
import * as path from 'path'

interface Options {
  dryRun: boolean
  format: 'svg' | 'png'
  upload: boolean
}

// Collection cover image dimensions (standard aspect ratio for collection cards)
const COVER_WIDTH = 400
const COVER_HEIGHT = 600 // 2:3 aspect ratio

// Color scheme matching the app's design
const COLORS = {
  background: {
    dark: '#1a1d24', // --bg-secondary
    gradient: {
      start: '#1a1d24',
      end: '#2a2d35', // --bg-tertiary
    },
  },
  text: {
    primary: '#fafafa', // --text-primary
    secondary: '#969696', // --text-secondary
  },
  accent: {
    default: '#34C759', // Default accent color (green)
    gold: '#FFB800', // Gold accent
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

/**
 * Generate SVG cover image with collection name
 */
function generateSVGCover(collectionName: string, category: string | null = null): string {
  // Truncate long names to fit on cover
  const maxLength = 30
  const displayName = collectionName.length > maxLength 
    ? collectionName.substring(0, maxLength - 3) + '...'
    : collectionName

  // Split name into lines if needed (roughly 20 chars per line)
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

  // If still too long, truncate the last line
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

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Save SVG to file
 */
async function saveSVG(svg: string, filePath: string): Promise<void> {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(filePath, svg, 'utf-8')
}

/**
 * Convert SVG to PNG using sharp (if available)
 */
async function convertToPNG(svgPath: string, pngPath: string): Promise<void> {
  try {
    const sharp = require('sharp')
    await sharp(svgPath)
      .resize(COVER_WIDTH, COVER_HEIGHT, { fit: 'contain', background: COLORS.background.dark })
      .png()
      .toFile(pngPath)
  } catch (error) {
    console.error(`⚠️  Failed to convert ${svgPath} to PNG. Install sharp: npm install sharp`)
    throw error
  }
}

/**
 * Upload image to Cloudinary (if configured)
 */
async function uploadToCloudinary(filePath: string, collectionId: string): Promise<string | null> {
  try {
    const cloudinary = require('cloudinary').v2
    
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.warn('⚠️  Cloudinary credentials not found. Skipping upload.')
      return null
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })

    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'collection-covers',
      public_id: `cover-${collectionId}`,
      overwrite: true,
      resource_type: 'image',
    })

    return result.secure_url
  } catch (error) {
    console.error(`⚠️  Failed to upload to Cloudinary:`, error)
    return null
  }
}

/**
 * Main function
 */
async function main() {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL && !process.env.PRISMA_DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL environment variable is not set')
    console.error('   Please set DATABASE_URL in your .env file or environment')
    process.exit(1)
  }

  const args = process.argv.slice(2)
  const options: Options = {
    dryRun: args.includes('--dry-run'),
    format: args.includes('--format') && args[args.indexOf('--format') + 1] === 'png' ? 'png' : 'svg',
    upload: args.includes('--upload'),
  }

  console.log('🎨 Generating collection cover images...\n')
  console.log(`Options: ${JSON.stringify(options, null, 2)}\n`)

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

  console.log(`Found ${collectionsWithoutCovers.length} collections without cover images\n`)

  if (collectionsWithoutCovers.length === 0) {
    console.log('✅ All collections already have cover images!')
    await prisma.$disconnect()
    return
  }

  // Create output directory
  const outputDir = path.join(process.cwd(), 'public', 'collection-covers')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  let generated = 0
  let updated = 0
  let errors = 0

  for (const collection of collectionsWithoutCovers) {
    try {
      const fileName = `cover-${collection.id}.${options.format}`
      const filePath = path.join(outputDir, fileName)
      const publicPath = `/collection-covers/${fileName}`

      // Generate SVG
      const svg = generateSVGCover(collection.name, collection.category)
      
      if (options.dryRun) {
        console.log(`[DRY RUN] Would generate: ${filePath}`)
        console.log(`[DRY RUN] Would update collection "${collection.name}" with cover: ${publicPath}`)
        generated++
        continue
      }

      // Save SVG
      const svgPath = path.join(outputDir, `cover-${collection.id}.svg`)
      await saveSVG(svg, svgPath)
      generated++

      let finalPath = publicPath
      let finalUrl: string | null = null

      // Convert to PNG if requested
      if (options.format === 'png') {
        await convertToPNG(svgPath, filePath)
        // Optionally remove SVG if PNG is generated
        // fs.unlinkSync(svgPath)
        finalPath = publicPath
      }

      // Upload to Cloudinary if requested
      if (options.upload) {
        const cloudinaryUrl = await uploadToCloudinary(
          options.format === 'png' ? filePath : svgPath,
          collection.id
        )
        if (cloudinaryUrl) {
          finalUrl = cloudinaryUrl
        }
      }

      // Update database
      await prisma.collection.update({
        where: { id: collection.id },
        data: {
          coverImage: finalUrl || finalPath,
        },
      })

      updated++
      console.log(`✅ Generated cover for: "${collection.name}"`)
    } catch (error) {
      errors++
      console.error(`❌ Error generating cover for "${collection.name}":`, error)
    }
  }

  console.log('\n📊 Summary:')
  console.log(`   Generated: ${generated}`)
  console.log(`   Updated: ${updated}`)
  console.log(`   Errors: ${errors}`)

  if (!options.dryRun && generated > 0) {
    console.log(`\n✅ Cover images saved to: ${outputDir}`)
    if (options.format === 'svg') {
      console.log('💡 Tip: Install sharp and use --format png for PNG output')
    }
    if (!options.upload) {
      console.log('💡 Tip: Configure Cloudinary and use --upload to upload images')
    }
  }

  await prisma.$disconnect()
}

main()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })


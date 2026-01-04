/**
 * Script to generate favicon with "C" from Bricolage Grotesque
 * Creates SVG favicon - can be converted to ICO/PNG
 */

const fs = require('fs')
const path = require('path')

// Create SVG favicon with "C" letter
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="favicon-gradient" x1="0" y1="0" x2="32" y2="32">
      <stop offset="0%" style="stop-color:#34C759;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#28a745;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="16" cy="16" r="15" fill="url(#favicon-gradient)"/>
  
  <!-- Letter C - Bricolage Grotesque style (simplified for small size) -->
  <text 
    x="16" 
    y="22" 
    font-family="system-ui, -apple-system, 'Bricolage Grotesque', sans-serif" 
    font-size="20" 
    font-weight="700" 
    fill="#ffffff" 
    text-anchor="middle"
    letter-spacing="-1px"
    dominant-baseline="central">
    C
  </text>
</svg>`

// Create multiple sizes for different use cases
const sizes = [
  { size: 16, filename: 'favicon-16x16.svg' },
  { size: 32, filename: 'favicon-32x32.svg' },
  { size: 192, filename: 'android-chrome-192x192.svg' },
  { size: 512, filename: 'android-chrome-512x512.svg' },
  { size: 180, filename: 'apple-touch-icon.svg' },
]

const publicDir = path.join(process.cwd(), 'public')

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

// Generate SVG for main favicon
const faviconPath = path.join(publicDir, 'favicon.svg')
fs.writeFileSync(faviconPath, svg)
console.log('✅ Created favicon.svg')

// Generate different sizes
sizes.forEach(({ size, filename }) => {
  const sizedSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="favicon-gradient-${size}" x1="0" y1="0" x2="${size}" y2="${size}">
      <stop offset="0%" style="stop-color:#34C759;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#28a745;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 1}" fill="url(#favicon-gradient-${size})"/>
  
  <!-- Letter C -->
  <text 
    x="${size/2}" 
    y="${size/2 + (size * 0.15)}" 
    font-family="system-ui, -apple-system, 'Bricolage Grotesque', sans-serif" 
    font-size="${size * 0.6}" 
    font-weight="700" 
    fill="#ffffff" 
    text-anchor="middle"
    letter-spacing="-${size * 0.03}px"
    dominant-baseline="central">
    C
  </text>
</svg>`
  
  const filePath = path.join(publicDir, filename)
  fs.writeFileSync(filePath, sizedSvg)
  console.log(`✅ Created ${filename}`)
})

console.log('\n⚠️  Note: For best browser support, convert SVGs to PNG/ICO formats')
console.log('You can use online converters or design tools for this.')
console.log('\nRecommended formats to create:')
console.log('- favicon.ico (16x16, 32x32 combined)')
console.log('- favicon-16x16.png')
console.log('- favicon-32x32.png')
console.log('- apple-touch-icon.png (180x180)')
console.log('- android-chrome-192x192.png')
console.log('- android-chrome-512x512.png')


/**
 * Script to generate favicon from logo-icon.png
 * Run with: node scripts/generate-favicon-from-logo.js
 * 
 * Note: This assumes logo-icon.png exists in public folder
 * If you have logo-icon.svg, convert it to PNG first or modify this script
 */

const fs = require('fs')
const path = require('path')

const publicDir = path.join(process.cwd(), 'public')
const logoPath = path.join(publicDir, 'logo-icon.png')

if (!fs.existsSync(logoPath)) {
  console.error('❌ Error: logo-icon.png not found in public folder')
  console.error('Please add your treasure chest image as: public/logo-icon.png')
  process.exit(1)
}

console.log('✅ Found logo-icon.png')
console.log('\n📝 Note: To create favicon files from your logo:')
console.log('1. Use an online tool like: https://favicon.io/favicon-converter/')
console.log('2. Upload logo-icon.png')
console.log('3. Download the generated favicon files')
console.log('4. Replace the current favicon SVG files in public/ folder')
console.log('\nOr use ImageMagick:')
console.log('convert -background none -resize 32x32 public/logo-icon.png public/favicon-32x32.png')
console.log('convert -background none -resize 16x16 public/logo-icon.png public/favicon-16x16.png')
console.log('convert -background none -resize 180x180 public/logo-icon.png public/apple-touch-icon.png')
console.log('convert -background none -resize 192x192 public/logo-icon.png public/android-chrome-192x192.png')
console.log('convert -background none -resize 512x512 public/logo-icon.png public/android-chrome-512x512.png')


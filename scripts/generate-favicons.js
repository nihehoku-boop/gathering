const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const SOURCE = path.join(__dirname, '..', 'public', 'logo-icon.png')
const DEST_DIR = path.join(__dirname, '..', 'public')

async function generateFavicons() {
  try {
    // Check if source file exists
    if (!fs.existsSync(SOURCE)) {
      console.error(`❌ Error: ${SOURCE} not found`)
      console.error('Please add your logo image as: public/logo-icon.png')
      process.exit(1)
    }

    console.log(`✅ Found ${SOURCE}`)
    console.log('Generating favicon files...\n')

    // Generate different sizes
    const sizes = [
      { size: 16, name: 'favicon-16x16.png' },
      { size: 32, name: 'favicon-32x32.png' },
      { size: 180, name: 'apple-touch-icon.png' },
      { size: 192, name: 'android-chrome-192x192.png' },
      { size: 512, name: 'android-chrome-512x512.png' },
    ]

    for (const { size, name } of sizes) {
      const dest = path.join(DEST_DIR, name)
      await sharp(SOURCE)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
        })
        .png()
        .toFile(dest)
      console.log(`  ✅ Generated ${name} (${size}x${size})`)
    }

    // Generate favicon.ico (multi-size ICO file)
    // For favicon.ico, we'll create it from the 32x32 version
    // Note: sharp can't create true ICO files, so we'll just copy the 32x32 PNG
    // Browsers will accept PNG files with .ico extension
    const favicon32 = path.join(DEST_DIR, 'favicon-32x32.png')
    const faviconIco = path.join(DEST_DIR, 'favicon.ico')
    await sharp(favicon32).toFile(faviconIco)
    console.log(`  ✅ Generated favicon.ico`)

    console.log('\n✅ All favicon files generated successfully!')
    console.log('\nGenerated files:')
    console.log('  - favicon.ico')
    sizes.forEach(({ name }) => console.log(`  - ${name}`))
  } catch (error) {
    console.error('❌ Error generating favicons:', error)
    process.exit(1)
  }
}

generateFavicons()


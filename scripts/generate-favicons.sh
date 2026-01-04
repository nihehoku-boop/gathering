#!/bin/bash
# Script to generate favicon files from logo-icon.png
# Requires ImageMagick: brew install imagemagick

SOURCE="public/logo-icon.png"
DEST_DIR="public"

if [ ! -f "$SOURCE" ]; then
    echo "❌ Error: $SOURCE not found"
    echo "Please add your logo image as: $SOURCE"
    exit 1
fi

echo "✅ Found $SOURCE"
echo "Generating favicon files..."

# Generate favicon files
convert -background none -resize 16x16 "$SOURCE" "$DEST_DIR/favicon-16x16.png"
convert -background none -resize 32x32 "$SOURCE" "$DEST_DIR/favicon-32x32.png"
convert -background none -resize 180x180 "$SOURCE" "$DEST_DIR/apple-touch-icon.png"
convert -background none -resize 192x192 "$SOURCE" "$DEST_DIR/android-chrome-192x192.png"
convert -background none -resize 512x512 "$SOURCE" "$DEST_DIR/android-chrome-512x512.png"

# Create favicon.ico (combines 16x16 and 32x32)
convert "$DEST_DIR/favicon-16x16.png" "$DEST_DIR/favicon-32x32.png" "$DEST_DIR/favicon.ico"

echo "✅ Favicon files generated successfully!"
echo ""
echo "Generated files:"
echo "  - favicon.ico"
echo "  - favicon-16x16.png"
echo "  - favicon-32x32.png"
echo "  - apple-touch-icon.png"
echo "  - android-chrome-192x192.png"
echo "  - android-chrome-512x512.png"


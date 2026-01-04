# Logo Icon Setup Instructions

## ✅ Code Changes Complete

All code has been updated to use the new logo icon image. The following components now use `LogoIcon` instead of the SVG `TreasureChest`:

- ✅ Sidebar header
- ✅ Sidebar "Your Collections" section
- ✅ Navbar mobile logo
- ✅ Landing page navigation
- ✅ Empty collections state
- ✅ Onboarding tour

## 📋 Required Steps

### 1. Add Your Logo Image

**Please add your open treasure chest image to the `public` folder:**

**File name:** `logo-icon.png` (or `.svg` if you have SVG version)

**Recommended:**
- PNG format with transparent background
- High resolution (at least 512×512px for best quality)
- The image will be scaled down for display

### 2. Generate Favicon Files

After adding `logo-icon.png`, you need to create favicon files:

#### Option A: Online Tool (Easiest)
1. Go to: https://favicon.io/favicon-converter/
2. Upload your `logo-icon.png`
3. Download the generated favicon package
4. Copy these files to `public/` folder:
   - `favicon.ico`
   - `favicon-16x16.png`
   - `favicon-32x32.png`
   - `apple-touch-icon.png`
   - `android-chrome-192x192.png`
   - `android-chrome-512x512.png`

#### Option B: ImageMagick (Command Line)
```bash
# Install ImageMagick first: brew install imagemagick

# Generate favicon files from logo
convert -background none -resize 16x16 public/logo-icon.png public/favicon-16x16.png
convert -background none -resize 32x32 public/logo-icon.png public/favicon-32x32.png
convert -background none -resize 180x180 public/logo-icon.png public/apple-touch-icon.png
convert -background none -resize 192x192 public/logo-icon.png public/android-chrome-192x192.png
convert -background none -resize 512x512 public/logo-icon.png public/android-chrome-512x512.png

# Create favicon.ico (combines 16x16 and 32x32)
convert public/favicon-16x16.png public/favicon-32x32.png public/favicon.ico
```

#### Option C: Manual Design Tool
- Open `logo-icon.png` in Figma/Sketch/Photoshop
- Export at each required size
- Save to `public/` folder with correct names

### 3. Update LogoIcon Component (if using SVG)

If you have an SVG version instead of PNG, update `components/LogoIcon.tsx`:
- Change `/logo-icon.png` to `/logo-icon.svg`
- The component will work with SVG as well

## 📁 Files That Need the Image

Once you add the image files, they will be used in:
- Browser favicon (tab icon)
- Mobile home screen icon (iOS)
- Android home screen icon
- PWA manifest icons
- All logo displays in the app

## ✅ After Setup

1. ✅ Add `logo-icon.png` to `public/` folder
2. ✅ Generate favicon files (see methods above)
3. ✅ Place favicon files in `public/` folder
4. ✅ Test the favicon appears in browser tab
5. ✅ Verify logo appears correctly throughout the app

## 🔍 Testing

- **Browser Tab**: Check if favicon appears in browser tab
- **Logo Display**: Check sidebar, navbar, landing page for logo
- **Mobile**: Test on iOS/Android for home screen icons
- **Empty State**: Check collections list empty state


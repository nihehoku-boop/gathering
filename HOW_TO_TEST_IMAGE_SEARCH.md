# How to Test Image Search Feature

## ✅ If you added variables to Vercel:

The feature will work automatically in production! Just:
1. Deploy your changes
2. Open a collection in production
3. Click the image icon button
4. Test filling images

## 🧪 For Local Testing:

### Step 1: Add to `.env.local` (not `.env`)

Create or edit `.env.local` in the project root:

```env
GOOGLE_CUSTOM_SEARCH_API_KEY=your_api_key_here
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=40ddb58ac9aa24ae2
```

**Note:** `.env.local` is gitignored, so it won't be committed.

### Step 2: Restart Dev Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### Step 3: Test in Browser

1. Open a collection that has items without images
2. Click the **image icon button** (next to the export button in the header)
3. The dialog will show all items missing images
4. Select items you want to fill
5. Click **"Fill Selected Images"**
6. Watch the progress and results!

### Step 4: Check Results

- ✅ **Success**: Items will have images added automatically
- ❌ **Failed**: Check browser console and server logs for errors

## 🔍 Verify Setup

### Quick Check:
1. Open browser console (F12)
2. Click "Fill Selected Images"
3. Look for logs like:
   - `[Image Search] Searching for: "Tintin #1 cover"`
   - `[Image Search] Found via Google: https://...`

### Common Issues:

**"No image found" for all items:**
- Check API key is correct
- Verify Search Engine ID is correct
- Make sure "Image search" is enabled in Google Custom Search settings
- Make sure "Search the entire web" is enabled

**API errors:**
- Check you haven't exceeded 100 searches/day (free tier)
- Verify API key has Custom Search API enabled
- Check API key restrictions allow Custom Search API

**Environment variables not loading:**
- Make sure file is named `.env.local` (not `.env`)
- Restart dev server after adding variables
- Check variables are in the root directory (same level as `package.json`)

## 🎯 Expected Behavior

When working correctly:
1. Dialog shows items without images
2. Clicking "Fill Selected Images" searches for each item
3. Progress bar shows completion
4. Results show: "X filled, Y failed"
5. Items refresh with new images
6. Images appear in the collection view

## 📊 Testing Different Collection Types

The search query is optimized by collection type:

- **Comics**: `"Collection Name Item Name cover"`
- **Trading Cards**: `"Item Name trading card"`
- **Books**: `"Item Name book cover"`
- **Video Games**: `"Item Name game cover"`
- **Movies**: `"Item Name movie poster"`
- **Vinyl**: `"Item Name vinyl cover"`

Try with different collection types to see the optimized queries!


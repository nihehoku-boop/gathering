# Image Search Setup Guide

The missing images feature uses **Google Custom Search API** to find specific collectible covers, posters, and images.

## Why Google Custom Search?

Unlike Unsplash (stock photos), Google Custom Search is perfect for finding:
- **Comic book covers** (Tintin, Lucky Luke, etc.)
- **Trading card images** (Pokemon, Magic, etc.)
- **Book covers**
- **Video game covers**
- **Movie posters**
- **Vinyl record covers**

## Setup Instructions

### 1. Create Google Custom Search Engine

1. Go to [Google Custom Search](https://programmablesearchengine.google.com/)
2. Click "Add" to create a new search engine
3. **Sites to search**: Leave empty or add specific sites (e.g., `comicvine.com`, `tcgplayer.com`)
4. **Name**: "Colletro Image Search" (or any name)
5. Click "Create"

### 2. Enable Image Search

1. After creating, click on your search engine
2. Go to "Setup" → "Basics"
3. Enable **"Image search"**
4. Enable **"Search the entire web"** (important for finding images across all sites)
5. Click "Save"

### 3. Get API Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **"Custom Search API"**:
   - Go to "APIs & Services" → "Library"
   - Search for "Custom Search API"
   - Click "Enable"
4. Create API Key:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the API key

### 4. Get Search Engine ID

1. Go back to [Google Custom Search](https://programmablesearchengine.google.com/)
2. Click on your search engine
3. Go to "Setup" → "Basics"
4. Copy the **"Search engine ID"** (looks like: `017576662512468239146:omuauf_lfve`)

### 5. Add to Environment Variables

Add to your `.env` file:

```env
GOOGLE_CUSTOM_SEARCH_API_KEY=your_api_key_here
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=40ddb58ac9aa24ae2
```

**Note:** Your Search Engine ID is already: `40ddb58ac9aa24ae2`

### 6. Deploy to Vercel

Add the same environment variables in Vercel:
1. Go to your project settings
2. "Environment Variables"
3. Add both variables for Production, Preview, and Development

## Free Tier Limits

- **100 searches per day** (free tier)
- Perfect for personal use and testing
- For production, consider upgrading to paid tier if needed

## How It Works

The system builds optimized search queries based on collection type:

- **Comics**: `"Tintin #1 cover"`
- **Trading Cards**: `"Pokemon Pikachu trading card"`
- **Books**: `"Book title book cover"`
- **Video Games**: `"Game title game cover"`
- **Movies**: `"Movie title movie poster"`
- **Vinyl**: `"Album title vinyl cover"`

## Alternative Options

If you don't want to use Google Custom Search:

1. **Bing Image Search API** - Similar to Google, requires API key
2. **Collection-specific APIs**:
   - Comic Vine API (for comics)
   - TCGPlayer API (for trading cards)
   - Open Library API (for books)
3. **Manual verification** - Users can review and select images from search results

## Troubleshooting

**No images found?**
- Check API key and Search Engine ID are correct
- Verify "Search the entire web" is enabled
- Check daily quota hasn't been exceeded
- Try searching manually on Google Images to verify query works

**Rate limit errors?**
- Free tier: 100 searches/day
- Add delays between searches (already implemented: 200ms)
- Consider upgrading API quota if needed


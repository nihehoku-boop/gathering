# Quick API Key Setup

You already have your **Search Engine ID**: `40ddb58ac9aa24ae2` ✅

Now you just need the **API Key**:

## Get API Key (5 minutes)

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account

### Step 2: Create or Select Project
1. Click the project dropdown at the top
2. Either:
   - Select an existing project, OR
   - Click "New Project" → Name it "Colletro" → Create

### Step 3: Enable Custom Search API
1. Go to: https://console.cloud.google.com/apis/library
2. Search for: **"Custom Search API"**
3. Click on it
4. Click **"Enable"** button

### Step 4: Create API Key
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **"Create Credentials"** → **"API Key"**
3. Copy the API key (looks like: `AIzaSyAbc123...`)

### Step 5: (Optional) Restrict API Key
For security, you can restrict the key:
1. Click on the API key you just created
2. Under "API restrictions":
   - Select "Restrict key"
   - Check only **"Custom Search API"**
3. Click "Save"

### Step 6: Add to Environment Variables

**Local (.env file):**
```env
GOOGLE_CUSTOM_SEARCH_API_KEY=AIzaSyAbc123...your_key_here
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=40ddb58ac9aa24ae2
```

**Vercel (Production):**
1. Go to your Vercel project
2. Settings → Environment Variables
3. Add:
   - `GOOGLE_CUSTOM_SEARCH_API_KEY` = your API key
   - `GOOGLE_CUSTOM_SEARCH_ENGINE_ID` = `40ddb58ac9aa24ae2`
4. Deploy again

## Verify Setup

After adding the keys, test the missing images feature:
1. Open a collection
2. Click the image icon button (next to export)
3. Select items without images
4. Click "Fill Selected Images"
5. It should find and add images!

## Important: Enable Image Search

Make sure your Google Custom Search Engine is configured for images:

1. Go to: https://programmablesearchengine.google.com/
2. Click on your search engine
3. Go to "Setup" → "Basics"
4. Check:
   - ✅ **"Image search"** is enabled
   - ✅ **"Search the entire web"** is enabled
5. Click "Save"

## Free Tier Limits

- **100 searches per day** (free)
- Perfect for personal use
- If you hit the limit, wait 24 hours or upgrade

That's it! 🎉


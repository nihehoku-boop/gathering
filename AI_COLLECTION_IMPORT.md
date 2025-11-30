# AI-Powered Collection Import

This system uses AI (OpenAI, Anthropic, or similar) to automatically extract collection data from URLs or search queries.

## Setup

1. **Get an AI API Key:**
   - **OpenAI**: Sign up at https://platform.openai.com and get an API key
   - **Anthropic**: Sign up at https://console.anthropic.com and get an API key

2. **Configure Environment Variables:**
   Add to your `.env` file:
   ```bash
   # For OpenAI (recommended)
   OPENAI_API_KEY=sk-your-api-key-here
   
   # OR for Anthropic
   ANTHROPIC_API_KEY=sk-ant-your-api-key-here
   ```

3. **Default Settings:**
   - Provider: OpenAI (can be changed in code)
   - Model: `gpt-4o-mini` (cost-effective) or `gpt-4o` (more accurate)
   - For Anthropic: `claude-3-5-sonnet-20241022`

## Usage

### Method 1: Import from URL

1. Go to Admin Panel → Import Collection
2. Click the **"From URL"** tab
3. Paste a URL to any webpage containing collection information:
   - Product catalog pages
   - Publisher websites
   - Wikipedia articles
   - Online store listings
   - Any page with collection/item information
4. Click the **sparkles icon** to extract data
5. AI will automatically extract:
   - Collection name, description, category
   - All items with titles, numbers, and cover images
   - Tags and metadata
6. Review the extracted data and click **"Import Collection"**

**Example URLs:**
- `https://www.egmont-shop.de/lustiges-taschenbuch`
- `https://en.wikipedia.org/wiki/The_Adventures_of_Tintin`
- Any catalog or product listing page

### Method 2: AI Search

1. Go to Admin Panel → Import Collection
2. Click the **"AI Search"** tab
3. Enter a search query describing the collection:
   - "Lustiges Taschenbuch"
   - "Spider-Man comic series"
   - "Disney comic collection"
4. Click **Search**
5. AI will find relevant collections and extract information
6. Select a result and click **"Import Collection"**

## How It Works

1. **URL Extraction:**
   - Fetches the webpage content
   - Sends it to AI with a structured prompt
   - AI extracts collection metadata and all items
   - Returns structured JSON data

2. **Search:**
   - AI searches its knowledge base for collection information
   - Returns relevant collections with metadata
   - Can then fetch items from associated URLs

## Supported AI Providers

### OpenAI (Default)
- Models: `gpt-4o-mini`, `gpt-4o`, `gpt-4-turbo`
- Cost-effective and fast
- Good for structured data extraction

### Anthropic
- Models: `claude-3-5-sonnet-20241022`, `claude-3-opus`
- Excellent for complex extraction tasks
- Better at understanding context

## Tips for Best Results

1. **URLs:**
   - Use pages with clear item listings
   - Product catalogs work best
   - Wikipedia articles work well for series information

2. **Search Queries:**
   - Be specific: "Lustiges Taschenbuch German Disney comics"
   - Include publisher/author if known
   - Mention the type: "comic series", "book collection", etc.

3. **Large Collections:**
   - AI can extract numbered series (e.g., issues 1-604)
   - If extraction is incomplete, try the URL method with a catalog page

## Troubleshooting

**"AI API key not configured"**
- Make sure `OPENAI_API_KEY` is set in your `.env` file
- Restart the development server after adding the key

**"Failed to extract from URL"**
- The URL might be blocked or require authentication
- Try a different URL or use the search method instead
- Check browser console for detailed error messages

**"No items extracted"**
- The page might not contain clear collection data
- Try a different URL or manually add items
- Some pages require JavaScript to load content (AI can't execute JS)

**Rate Limits:**
- OpenAI has rate limits based on your plan
- If you hit limits, wait a few minutes or upgrade your plan
- Consider using `gpt-4o-mini` for cost efficiency

## Cost Considerations

- **OpenAI gpt-4o-mini**: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- **OpenAI gpt-4o**: ~$2.50 per 1M input tokens, ~$10 per 1M output tokens
- **Anthropic Claude**: Similar pricing

For typical collection extraction:
- URL extraction: ~$0.01-0.05 per collection
- Search: ~$0.005-0.02 per search

## Advanced Configuration

To change the AI provider or model, edit `/lib/data-fetchers/ai-fetcher.ts`:

```typescript
const provider = config?.provider || 'openai' // or 'anthropic'
const model = config?.model || 'gpt-4o-mini' // or 'gpt-4o', 'claude-3-5-sonnet-20241022'
```




# Running Collection Cover Generation in Production

## Option 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Link your project** (if not already linked):
   ```bash
   vercel link
   ```

4. **Pull production environment variables**:
   ```bash
   vercel env pull .env.production
   ```

5. **Run the script with production environment**:
   ```bash
   DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2-) npm run generate:collection-covers
   ```

   Or simply:
   ```bash
   source .env.production
   npm run generate:collection-covers
   ```

## Option 2: Create a One-Time API Route

Alternatively, I can create a temporary API route that you can call once to generate all covers, then delete it.

## Option 3: Run Locally with Production DATABASE_URL

1. Copy your production `DATABASE_URL` from Vercel dashboard
2. Set it in your local environment:
   ```bash
   export DATABASE_URL="your-production-database-url"
   npm run generate:collection-covers
   ```

## What the Script Does

- Finds all collections without cover images
- Generates SVG covers with:
  - Collection name in Bricolage Grotesque font
  - Category-based gradient colors
  - Simple grid pattern background
- Saves to `public/collection-covers/`
- Updates database with cover image paths

## Preview First (Optional)

To see what will be generated without making changes:
```bash
npm run generate:collection-covers -- --dry-run
```


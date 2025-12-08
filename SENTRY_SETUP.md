# Sentry Error Tracking Setup

Sentry is integrated for production error tracking and monitoring.

## Setup Steps

### 1. Create Sentry Account

1. Go to [https://sentry.io](https://sentry.io)
2. Sign up for a free account
3. Create a new project (select "Next.js")

### 2. Get Your DSN

1. In your Sentry project, go to **Settings** → **Client Keys (DSN)**
2. Copy your DSN (starts with `https://`)

### 3. Set Environment Variables

Add these to your Vercel environment variables:

```bash
# Required - Your Sentry DSN
NEXT_PUBLIC_SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"
SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"

# Optional - For source maps upload
SENTRY_ORG="your-org-slug"
SENTRY_PROJECT="your-project-slug"
SENTRY_AUTH_TOKEN="your-auth-token"
```

**Note:** `NEXT_PUBLIC_SENTRY_DSN` is for client-side, `SENTRY_DSN` is for server-side.

### 4. Get Auth Token (Optional, for source maps)

1. Go to Sentry → **Settings** → **Auth Tokens**
2. Create a new token with `project:releases` scope
3. Add to `SENTRY_AUTH_TOKEN` in Vercel

## What Gets Tracked

### Automatic Tracking
- ✅ Unhandled errors in React components
- ✅ API route errors
- ✅ Server-side errors
- ✅ Client-side JavaScript errors
- ✅ Network errors

### Manual Tracking
The logger automatically sends errors and warnings to Sentry:
```typescript
import { logger } from '@/lib/logger'

logger.error('Something went wrong', error)
logger.warn('This is a warning')
```

## Configuration

### Development Mode
- Errors are **NOT** sent to Sentry
- Errors are logged to console with `[Sentry] Would send error:` prefix
- This prevents polluting your Sentry dashboard during development

### Production Mode
- All errors are automatically captured
- Session replay enabled (10% of sessions, 100% of errors)
- Performance monitoring enabled (10% sample rate)

## Viewing Errors

1. Go to your Sentry dashboard
2. Navigate to **Issues** to see all errors
3. Click on an error to see:
   - Stack trace
   - User context
   - Browser/device info
   - Session replay (if available)
   - Breadcrumbs leading to the error

## Features

### Session Replay
- Automatically records user sessions when errors occur
- Helps debug user interactions leading to errors
- Text and media are masked for privacy

### Performance Monitoring
- Tracks API route performance
- Identifies slow endpoints
- Sample rate: 10% in production

### Source Maps
- Automatically uploads source maps during build
- Provides readable stack traces in production
- Requires `SENTRY_AUTH_TOKEN` to be set

## Disabling Sentry

To disable Sentry:
1. Remove or leave empty `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN`
2. Sentry will not initialize and errors won't be sent

## Free Tier Limits

- **5,000 errors/month**
- **10,000 performance units/month**
- **1,000 session replays/month**

## Troubleshooting

### Errors Not Appearing
1. Check that DSN is set correctly
2. Verify environment is `production`
3. Check Sentry project settings
4. Look for errors in browser console

### Too Many Errors
- Adjust `tracesSampleRate` in config files
- Filter errors in Sentry dashboard
- Set up alert rules

### Source Maps Not Working
- Ensure `SENTRY_AUTH_TOKEN` is set
- Check build logs for source map upload
- Verify `SENTRY_ORG` and `SENTRY_PROJECT` are correct

## Security

- DSN is public (safe to expose in client-side code)
- Auth token is server-only (never expose)
- User data is automatically scrubbed
- PII (personally identifiable information) is masked


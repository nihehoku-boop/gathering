# Prisma Operation Logging Guide

## Overview

The Prisma logging system tracks all PostgreSQL operations to help you monitor database usage, identify performance bottlenecks, and optimize queries.

## Features

✅ **Automatic Logging** - All Prisma operations are automatically logged  
✅ **Performance Metrics** - Track operation duration and identify slow queries  
✅ **User Tracking** - See which users are generating the most operations  
✅ **Filtering** - Filter logs by operation type, model, duration, user, etc.  
✅ **Statistics** - View aggregated statistics and slowest operations  
✅ **Export** - Export logs as JSON for analysis  

## Enabling Logging

Logging is **automatically enabled in development mode**. For production:

```bash
# Enable in production
ENABLE_PRISMA_LOGGING=true
```

Or set it in your `.env` file:
```
ENABLE_PRISMA_LOGGING=true
```

## Accessing Logs

### Admin Dashboard

1. Navigate to `/admin` (admin access required)
2. Click on the **"Prisma Logs"** tab
3. View statistics or detailed logs

### API Endpoints

**Get Logs:**
```bash
GET /api/admin/prisma-logs
```

**Query Parameters:**
- `format=stats` - Get statistics instead of logs
- `operation=findMany` - Filter by operation type
- `model=Collection` - Filter by model
- `minDuration=100` - Filter by minimum duration (ms)
- `userId=xxx` - Filter by user ID
- `collectionId=xxx` - Filter by collection ID
- `limit=100` - Limit number of results

**Examples:**
```bash
# Get statistics
GET /api/admin/prisma-logs?format=stats

# Get slow operations (>500ms)
GET /api/admin/prisma-logs?minDuration=500

# Get all Collection operations
GET /api/admin/prisma-logs?model=Collection

# Get operations for a specific user
GET /api/admin/prisma-logs?userId=clx123...
```

**Clear Logs:**
```bash
DELETE /api/admin/prisma-logs
```

**Export Logs:**
```bash
POST /api/admin/prisma-logs/export
Content-Type: application/json

{
  "type": "logs"  // or "stats"
}
```

## Log Viewer Features

### Statistics View

- **Total Operations** - Total number of logged operations
- **Average Duration** - Average operation duration
- **Operations by Type** - Breakdown by operation (findMany, create, update, etc.)
- **Operations by Model** - Breakdown by model (Collection, Item, User, etc.)
- **Slowest Operations** - Top 10 slowest operations with details

### Logs View

- **Real-time Updates** - Auto-refreshes every 5 seconds
- **Filtering** - Filter by operation, model, duration, and limit
- **Color-coded Durations**:
  - 🟢 Green: < 100ms (fast)
  - 🟡 Yellow: 100-500ms (moderate)
  - 🟠 Orange: 500-1000ms (slow)
  - 🔴 Red: > 1000ms (very slow)

## What Gets Logged

Each log entry includes:
- **Timestamp** - When the operation occurred
- **Operation** - Type of operation (findMany, create, update, delete, etc.)
- **Model** - Database model (Collection, Item, User, etc.)
- **Duration** - Execution time in milliseconds
- **User ID** - User who triggered the operation (if available)
- **Collection ID** - Collection involved (if applicable)
- **Item ID** - Item involved (if applicable)

## Performance Impact

- **Minimal Overhead** - Logging adds ~0.1-0.5ms per operation
- **In-Memory Storage** - Logs stored in memory (max 1000 entries)
- **Automatic Cleanup** - Old logs are automatically evicted
- **Production Safe** - Can be disabled in production if needed

## Use Cases

### 1. Identify Slow Queries
View the "Slowest Operations" section to find queries taking >500ms.

### 2. Monitor User Activity
Filter by `userId` to see which users are generating the most operations.

### 3. Optimize High-Traffic Models
Check "Operations by Model" to see which models are queried most frequently.

### 4. Track Operation Types
See which operations (findMany, create, update) are most common.

### 5. Debug Performance Issues
Export logs and analyze patterns to identify bottlenecks.

## Example Workflow

1. **Enable Logging** (if not already enabled in dev)
   ```bash
   ENABLE_PRISMA_LOGGING=true
   ```

2. **Use the Application** - Perform normal operations

3. **View Statistics** - Go to Admin Dashboard → Prisma Logs → Statistics

4. **Identify Issues** - Look for:
   - High average duration
   - Many operations on the same model
   - Slow operations (>500ms)

5. **Filter and Analyze** - Use filters to drill down into specific issues

6. **Export for Analysis** - Export logs as JSON for deeper analysis

## Tips

- **Clear logs regularly** to keep memory usage low
- **Focus on slow operations** (>500ms) for optimization
- **Monitor during peak usage** to see real-world patterns
- **Export logs** before clearing for historical analysis
- **Use filters** to narrow down specific issues

## Security

- **Admin Only** - Logs are only accessible to admin users
- **No Sensitive Data** - Query parameters are not logged (only metadata)
- **User IDs** - Only partial user IDs are shown in the UI

## Troubleshooting

**Logs not appearing?**
- Check if `ENABLE_PRISMA_LOGGING=true` is set
- Verify you're an admin user
- Check browser console for errors

**High memory usage?**
- Reduce `MAX_LOGS` in `lib/prisma-logger.ts`
- Clear logs more frequently
- Disable logging in production

**Missing user/collection IDs?**
- These are extracted from query parameters
- Some operations may not have this metadata
- This is expected for some query types


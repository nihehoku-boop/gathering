# Collection Loading: Local Storage vs Database Usage

## When a Collection Opens

### 📦 **Stored Locally (localStorage) - NO Database Usage**

1. **Visit Count** (`collection_visits_{collectionId}`)
   - **What**: Number of times user has visited this collection
   - **Purpose**: Determines progressive loading (20/30/50 items per page)
   - **Storage**: `localStorage.setItem('collection_visits_{id}', count)`
   - **Database Impact**: ❌ None - purely client-side tracking

### 🔄 **In-Memory Cache (React Refs) - NO Database Usage**

1. **Prefetch Cache** (`prefetchCacheRef`)
   - **What**: Cached API responses for upcoming pages
   - **Purpose**: Instant loading when user scrolls
   - **Storage**: In-memory Map, cleared on page refresh
   - **Database Impact**: ❌ None - just cached responses
   - **Key Format**: `{page}_{sortBy}` (e.g., "2_number-asc")

### 🗄️ **Fetched from Database (Uses Prisma/Database Usage)**

#### **Initial Load (When Collection Opens):**

1. **Collection Metadata** - `/api/collections/[id]`
   - **Prisma Queries**:
     - `prisma.collection.findFirst()` - Get collection data
     - `prisma.item.count()` - Count owned items
   - **Data Fetched**:
     - Collection name, description, category, template
     - Cover image, tags, folder info
     - Total item count (`_count.items`)
     - Owned item count (`ownedCount`)
   - **Database Usage**: ✅ 2 queries

2. **First Page of Items** - `/api/collections/[id]/items?page=1&limit=30`
   - **Prisma Queries**:
     - `prisma.collection.findFirst()` - Verify access
     - `prisma.item.count()` - Get total count
     - `prisma.item.findMany()` - Fetch items (paginated, sorted)
   - **Data Fetched**:
     - 30 items (first visit) / 40 items (second) / 50 items (third+)
     - All item fields: name, number, isOwned, image, notes, etc.
   - **Database Usage**: ✅ 3 queries

#### **Prefetching (Background, No User Wait):**

3. **Next Page Prefetch** - `/api/collections/[id]/items?page=2&limit=30`
   - **When**: After 3 items are displayed
   - **Prisma Queries**: Same as #2 (3 queries)
   - **Database Usage**: ✅ 3 queries (but user doesn't wait)

4. **Page After Next Prefetch** - `/api/collections/[id]/items?page=3&limit=30`
   - **When**: After 10 items are displayed
   - **Prisma Queries**: Same as #2 (3 queries)
   - **Database Usage**: ✅ 3 queries (but user doesn't wait)

#### **Infinite Scroll (When User Scrolls):**

5. **Next Page Load** - `/api/collections/[id]/items?page={next}`
   - **When**: User scrolls near bottom
   - **Prisma Queries**: Same as #2 (3 queries)
   - **Database Usage**: ✅ 3 queries per page
   - **Note**: If prefetched, uses cache (0 queries)

## Summary

### **On Collection Open:**
- **Database Queries**: 5 queries total
  - 2 queries (collection metadata + owned count)
  - 3 queries (first page of items)
- **Prefetch Queries**: 6 additional queries (background)
  - 3 queries (page 2)
  - 3 queries (page 3)
- **Total**: 11 queries, but user only waits for 5

### **What's Stored Locally:**
- ✅ Visit count (localStorage) - determines loading limit
- ✅ Prefetch cache (in-memory) - instant scroll experience
- ❌ No collection data stored locally
- ❌ No item data stored locally

### **What Uses Database:**
- ✅ Collection metadata (always fetched)
- ✅ Item count queries (always fetched)
- ✅ Item data (paginated, fetched as needed)
- ✅ All sorting happens server-side (database)

### **Optimizations:**
1. **Progressive Loading**: Fewer items on first visit (20→30→50)
2. **Prefetching**: Loads pages before user needs them
3. **Caching**: HTTP cache headers (30s) reduce repeat queries
4. **Efficient Queries**: Uses `count()` instead of fetching all items


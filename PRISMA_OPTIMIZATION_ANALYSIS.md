# Prisma Operations Optimization Analysis

## Issues Found

### 1. **Profile Route - Loading All Items** 🔴 HIGH IMPACT
**File:** `app/api/profile/[userId]/route.ts`

**Problem:**
- Loads ALL items for each collection just to count owned items
- For 10 collections with 100 items each = 1000 items loaded
- Then filters in memory to count owned items

**Current:**
```typescript
collections: {
  items: {
    select: { isOwned: true }, // Loads ALL items!
  },
  _count: { select: { items: true } }
}
// Then: collection.items.filter((item) => item.isOwned).length
```

**Optimization:**
- Use `groupBy` to count owned items per collection
- Similar to leaderboard optimization
- **Reduction:** 1000 items loaded → 1 aggregation query

---

### 2. **Collections Route - Missing Cache** 🟡 MEDIUM IMPACT
**File:** `app/api/collections/route.ts`

**Problem:**
- Has serverCache imported but doesn't use it
- Every request hits database even if data hasn't changed

**Current:**
- No cache check before query
- Always hits database

**Optimization:**
- Add cache check (like we did for collection detail)
- Cache for 30-60 seconds
- **Reduction:** 80-90% of requests (cache hits)

---

### 3. **Recommended Items - Transaction Instead of createMany** 🟡 MEDIUM IMPACT
**File:** `app/api/recommended-collections/[id]/items/route.ts`

**Problem:**
- Uses `$transaction` with individual `create` calls
- For 100 items = 100 separate create operations
- Slower than `createMany`

**Current:**
```typescript
await prisma.$transaction(
  items.map(item => prisma.recommendedItem.create({...}))
)
```

**Optimization:**
- Use `createMany` for bulk inserts
- **Reduction:** 100 operations → 1 operation

---

### 4. **Sync Route - Sequential Item Updates** 🟡 MEDIUM IMPACT
**File:** `app/api/collections/[id]/sync/route.ts`

**Problem:**
- Updates items one by one in a loop
- For 50 items = 50 update operations

**Current:**
```typescript
for (const item of itemsToUpdate) {
  await prisma.item.update({...}) // Sequential!
}
```

**Optimization:**
- Batch updates using `updateMany` where possible
- Or use `$transaction` with parallel updates
- **Reduction:** 50 operations → 1-5 operations

---

### 5. **User Profile Route - Separate Count Query** 🟢 LOW IMPACT
**File:** `app/api/user/profile/route.ts`

**Problem:**
- Separate `count` query after `findUnique`
- Could be combined or cached

**Current:**
```typescript
const user = await prisma.user.findUnique({...})
const itemsCount = await prisma.item.count({...}) // Separate query
```

**Optimization:**
- Cache the count result
- Or include in initial query if possible
- **Reduction:** 1 query per request

---

## Summary of Optimizations

| Route | Issue | Current Ops | Optimized Ops | Reduction |
|-------|-------|-------------|---------------|-----------|
| `/api/profile/[userId]` | Loads all items | 1 + (N × M items) | 2 queries | ~95% |
| `/api/collections` | No cache | 2 queries | 0-2 (cached) | ~80% |
| `/api/recommended-collections/[id]/items` | Transaction | N creates | 1 createMany | ~99% |
| `/api/collections/[id]/sync` | Sequential updates | N updates | 1-5 updates | ~90% |
| `/api/user/profile` | Separate count | 2 queries | 1-2 queries | ~50% |

**Total Expected Reduction:** 60-70% fewer operations

---

## Priority Order

1. **Profile route** - Biggest impact (loads thousands of items)
2. **Collections route** - Add caching (high frequency)
3. **Recommended items** - Use createMany (bulk operations)
4. **Sync route** - Batch updates (less frequent but heavy)
5. **User profile** - Minor optimization


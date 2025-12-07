# Cache Invalidation Coverage

This document lists all user actions and confirms cache invalidation is properly handled.

## ✅ Covered Actions

### Item Management
1. **Add Item** (`addItem`)
   - ✅ Cache invalidated when new item is added
   - Location: `components/CollectionDetail.tsx:515`

2. **Delete Item** (`deleteItem`)
   - ✅ Cache invalidated when item is deleted
   - Location: `components/CollectionDetail.tsx:603`

3. **Edit Item** (`saveItem`)
   - ✅ Cache invalidated when item is saved (name, notes, image, etc.)
   - Location: `components/CollectionDetail.tsx:833`
   - Used by: EditItemDialog

4. **Toggle Owned Status** (`toggleItemOwned`)
   - ✅ Cache invalidated when item ownership changes
   - Location: `components/CollectionDetail.tsx:510`

### Bulk Operations
5. **Bulk Delete** (`handleBulkDelete`)
   - ✅ Cache invalidated when items are bulk deleted
   - Location: `components/CollectionDetail.tsx:671`

6. **Bulk Mark Owned** (`handleBulkMarkOwned`)
   - ✅ Cache invalidated when items are bulk marked as owned/not owned
   - Location: `components/CollectionDetail.tsx:729`

7. **Bulk Import** (`BulkImportDialog.onSuccess`)
   - ✅ Cache invalidated when items are bulk imported
   - Location: `components/CollectionDetail.tsx:2143`

### Image Operations
8. **Image Upload** (via EditItemDialog)
   - ✅ Cache invalidated through `saveItem` function
   - Location: `components/CollectionDetail.tsx:833`

9. **Alternative Image Selection** (`onSelectImage`)
   - ✅ Cache invalidated when alternative cover is selected
   - Location: `components/CollectionDetail.tsx:2210`

### Collection Management
10. **Edit Collection** (`EditCollectionDialog.onSuccess`)
    - ✅ Cache invalidated when collection metadata changes
    - Location: `components/CollectionDetail.tsx:2231`

## Cache Behavior

### When Cache is Used
- **Collection metadata**: Cached for 5 minutes
- **Item pages**: Cached for 5 minutes per page/sort combination
- **First visit**: Normal API calls (cache is built)
- **Repeat visits**: Instant from cache, background refresh

### When Cache is Invalidated
- Any item modification (add, edit, delete, toggle owned)
- Any bulk operation
- Collection metadata changes
- Image changes (main or alternative)

### Cache Refresh Strategy
- **Stale-while-revalidate**: Show cached data instantly, fetch fresh data in background
- **Automatic expiry**: Cache expires after 5 minutes
- **Size management**: Auto-evicts oldest entries when limit reached (10MB)

## Testing Checklist

To verify cache works correctly:

- [ ] Add new item → Cache invalidated, fresh data loaded
- [ ] Edit item (name, notes, image) → Cache invalidated, fresh data loaded
- [ ] Delete item → Cache invalidated, fresh data loaded
- [ ] Toggle owned status → Cache invalidated, fresh data loaded
- [ ] Upload image via EditItemDialog → Cache invalidated, fresh data loaded
- [ ] Select alternative cover → Cache invalidated, fresh data loaded
- [ ] Bulk import items → Cache invalidated, fresh data loaded
- [ ] Bulk delete items → Cache invalidated, fresh data loaded
- [ ] Bulk mark owned → Cache invalidated, fresh data loaded
- [ ] Edit collection metadata → Cache invalidated, fresh data loaded
- [ ] Return to collection after 5 minutes → Fresh data fetched (cache expired)
- [ ] Return to collection within 5 minutes → Instant from cache, background refresh


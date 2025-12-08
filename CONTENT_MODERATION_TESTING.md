# Content Moderation System - Testing Guide

## Prerequisites
- At least 2 user accounts (one regular user, one admin)
- At least one community collection created by a regular user

## 1. User Reporting Flow

### Test Case 1.1: Report a Collection
1. **As a regular user:**
   - Navigate to `/community`
   - Find a community collection (not your own)
   - Click the **flag icon** (🚩) on the collection card
   - **Expected:** Report dialog opens

2. **Fill out the report:**
   - Select a reason (Spam, Inappropriate, Copyright, Other)
   - Optionally add a description
   - Click "Submit Report"
   - **Expected:** Success message appears, dialog closes after 2 seconds

### Test Case 1.2: Prevent Duplicate Reports
1. Try to report the same collection again
   - **Expected:** Error message: "You have already reported this collection"

### Test Case 1.3: Prevent Self-Reporting
1. Try to report your own collection
   - **Expected:** Error message: "You cannot report your own content"
   - **Note:** Flag icon should not appear on your own collections

### Test Case 1.4: Validation
1. Try to submit without selecting a reason
   - **Expected:** Error message: "Please select a reason for reporting"

## 2. Admin Moderation Flow

### Test Case 2.1: View Reports
1. **As an admin:**
   - Navigate to Admin Dashboard (`/admin`)
   - Click on **"Content Reports"** tab
   - **Expected:** See list of pending reports

2. **Filter reports:**
   - Click different status filters (Pending, Reviewed, Resolved, Dismissed, All)
   - **Expected:** Reports list updates accordingly

### Test Case 2.2: Review a Report
1. Click **"Review"** button on a pending report
   - **Expected:** Review dialog opens showing:
     - Collection details (name, description, cover image)
     - Reporter information
     - Report reason and description
     - Report timestamp

### Test Case 2.3: Dismiss a Report
1. In the review dialog:
   - Optionally add admin notes
   - Click **"Dismiss"** button
   - Confirm the action
   - **Expected:** 
     - Report status changes to "dismissed"
     - Report moves to "Dismissed" filter
     - Collection remains visible

### Test Case 2.4: Hide a Collection
1. In the review dialog:
   - Optionally add admin notes
   - Click **"Hide Collection"** button
   - Confirm the action (note the warning about hiding)
   - **Expected:**
     - Report status changes to "resolved"
     - Collection is hidden from community view
     - Collection shows "Hidden" badge in admin view
     - Regular users cannot see the collection in `/community`

### Test Case 2.5: Resolve a Report
1. In the review dialog:
   - Optionally add admin notes
   - Click **"Resolve"** button
   - Confirm the action
   - **Expected:**
     - Report status changes to "resolved"
     - Report moves to "Resolved" filter
     - Collection remains visible

## 3. Collection Visibility Testing

### Test Case 3.1: Hidden Collections Filtered
1. **As a regular user:**
   - Navigate to `/community`
   - **Expected:** Hidden collections do NOT appear in the list

2. **As an admin:**
   - Navigate to `/community`
   - **Expected:** Hidden collections still appear (for moderation purposes)

### Test Case 3.2: Search and Filters
1. Try searching for a hidden collection
   - **Expected:** Hidden collections do not appear in search results for regular users

## 4. Edge Cases & Error Handling

### Test Case 4.1: Network Errors
1. Disconnect internet
2. Try to submit a report
   - **Expected:** Error message: "An error occurred. Please try again."

### Test Case 4.2: Rate Limiting
1. Submit multiple reports quickly
   - **Expected:** Rate limiting prevents abuse (if configured)

### Test Case 4.3: Long Descriptions
1. Try to enter more than 1000 characters in description
   - **Expected:** Character counter shows limit, form prevents submission

### Test Case 4.4: Auto-Refresh
1. As admin, keep the reports tab open
   - **Expected:** Reports list auto-refreshes every 30 seconds

## 5. Database Verification

### Check Database Directly (Optional)
```sql
-- View all reports
SELECT * FROM "ContentReport" ORDER BY "createdAt" DESC;

-- View hidden collections
SELECT id, name, "isHidden", "moderationNotes" 
FROM "CommunityCollection" 
WHERE "isHidden" = true;

-- Check report status distribution
SELECT status, COUNT(*) 
FROM "ContentReport" 
GROUP BY status;
```

## 6. UI/UX Testing

### Test Case 6.1: Responsive Design
1. Test on mobile, tablet, and desktop
   - **Expected:** All dialogs and buttons are accessible and properly sized

### Test Case 6.2: Status Badges
1. Check that status badges display correctly:
   - Pending: Yellow
   - Reviewed: Blue
   - Resolved: Green
   - Dismissed: Gray

### Test Case 6.3: Loading States
1. Check loading indicators during:
   - Report submission
   - Report actions (dismiss/hide/resolve)
   - **Expected:** Buttons show loading state, prevent double-clicks

## 7. Security Testing

### Test Case 7.1: Unauthorized Access
1. As a regular user, try to access:
   - `GET /api/admin/reports`
   - `PATCH /api/admin/reports/[id]`
   - **Expected:** 403 Forbidden error

### Test Case 7.2: Input Validation
1. Try to submit invalid data:
   - Invalid reason value
   - XSS attempts in description
   - **Expected:** Validation errors, no XSS execution

## Quick Test Checklist

- [ ] User can report a collection
- [ ] User cannot report their own collection
- [ ] User cannot report the same collection twice
- [ ] Admin can view all reports
- [ ] Admin can filter reports by status
- [ ] Admin can dismiss a report
- [ ] Admin can hide a collection
- [ ] Admin can resolve a report
- [ ] Hidden collections are filtered from community view
- [ ] Admin notes are saved correctly
- [ ] Status badges display correctly
- [ ] Auto-refresh works in admin dashboard
- [ ] Error messages are user-friendly
- [ ] Mobile responsive design works

## Common Issues & Solutions

### Issue: Reports not showing in admin dashboard
- **Solution:** Check that user has `isAdmin: true` in database
- **Solution:** Verify API endpoint `/api/admin/reports` returns data

### Issue: Hidden collections still visible
- **Solution:** Check that `isHidden` field was added to `CommunityCollection` model
- **Solution:** Verify API endpoint filters by `isHidden: false`

### Issue: Report button not appearing
- **Solution:** Check that user is logged in
- **Solution:** Verify collection is not owned by current user

---

**Note:** After testing, you may want to clean up test data:
- Delete test reports from database
- Unhide test collections if needed


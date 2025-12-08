# Testing Guide: Email Verification & Account Deletion

## Email Verification Testing

### Test 1: New User Registration
1. Go to `/auth/signup`
2. Create a new account with a valid email
3. **Expected**: 
   - Success message mentions checking email for verification
   - Redirects to sign-in page
   - Check your email inbox for verification email

### Test 2: Email Verification Link
1. Open the verification email
2. Click the "Verify Email Address" button
3. **Expected**:
   - Redirects to `/auth/verify-email`
   - Shows success message
   - Automatically redirects to home page after 2 seconds
   - Email is now verified in database

### Test 3: Invalid/Expired Token
1. Try accessing verification link with invalid token
2. **Expected**:
   - Shows error message
   - Option to resend verification email

### Test 4: Resend Verification Email
1. If email not verified, go to settings or use resend endpoint
2. Call `/api/auth/verify-email/send` (POST, requires auth)
3. **Expected**:
   - New verification email sent
   - New token generated (old one invalidated)

### Test 5: Already Verified
1. Try verifying an already verified email
2. **Expected**:
   - Shows "Email is already verified" message
   - No error, graceful handling

## Account Deletion Testing

### Test 1: Access Delete Account UI
1. Go to `/settings`
2. Scroll to "Delete Account" section
3. **Expected**:
   - Red warning card visible
   - Lists what will be deleted
   - "Delete My Account" button present

### Test 2: Delete Account Dialog
1. Click "Delete My Account" button
2. **Expected**:
   - Modal dialog appears
   - Requires email confirmation
   - Requires password
   - Shows warning about permanent deletion

### Test 3: Invalid Email Confirmation
1. Enter wrong email in delete dialog
2. **Expected**:
   - Error: "Email does not match"
   - Account not deleted

### Test 4: Invalid Password
1. Enter correct email but wrong password
2. **Expected**:
   - Error: "Invalid password"
   - Account not deleted

### Test 5: Successful Deletion
1. Enter correct email and password
2. Click "Delete Account"
3. **Expected**:
   - Account deleted from database
   - All related data deleted (collections, items, etc.)
   - User signed out automatically
   - Redirected to home page
   - Cannot sign in with deleted account

### Test 6: Data Cleanup Verification
1. Before deletion, note:
   - Number of collections
   - Number of items
   - Community collections created
   - Wishlists
2. Delete account
3. Check database (via Prisma Studio or admin):
   - User record deleted
   - All collections deleted
   - All items deleted
   - All related data deleted
   - Verification tokens cleaned up

## Edge Cases to Test

### Email Verification
- [ ] Token expires after 24 hours
- [ ] Multiple verification attempts with same token
- [ ] Verification email sent to non-existent user
- [ ] Network error during verification

### Account Deletion
- [ ] Delete account with no collections
- [ ] Delete account with many collections (100+)
- [ ] Delete account with community collections
- [ ] Delete account with shared collections
- [ ] Attempt to delete without being logged in
- [ ] Attempt to delete another user's account (should fail)

## Development Testing

### Email Service Not Configured
If `RESEND_API_KEY` is not set:
- Verification email link logged to console in dev mode
- Registration still succeeds
- User can manually verify via API

### Database Verification
Use Prisma Studio to verify:
```bash
npm run db:studio
```

Check:
- `User.emailVerified` field updates correctly
- `VerificationToken` records created/deleted properly
- User deletion cascades correctly

## API Endpoints to Test

### Email Verification
```bash
# Send verification email (requires auth)
POST /api/auth/verify-email/send
Headers: { Cookie: session cookie }

# Verify email
POST /api/auth/verify-email/verify
Body: { token: "...", email: "..." }
```

### Account Deletion
```bash
# Delete account (requires auth)
POST /api/user/delete-account
Headers: { Cookie: session cookie }
Body: { confirmEmail: "...", password: "..." }
```

## Production Checklist

Before deploying to production:
- [ ] Test with real email addresses
- [ ] Verify email templates render correctly
- [ ] Test on mobile devices
- [ ] Verify rate limiting works
- [ ] Test error handling
- [ ] Verify GDPR compliance (all data deleted)
- [ ] Test with large datasets (1000+ items)

## Known Issues / Notes

- Email verification is optional (users can still use app without verifying)
- Account deletion is permanent and irreversible
- All related data is deleted via Prisma cascades
- Verification tokens expire after 24 hours
- Rate limiting prevents abuse


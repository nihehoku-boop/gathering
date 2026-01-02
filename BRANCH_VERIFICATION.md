# Branch Verification Guide

## Current Branch Setup

### Branches:
- **`main`**: Development branch (should create preview deployments)
- **`production`**: Production branch (should deploy to main domain)

## How to Verify Branches Are Working:

### Test 1: Check Current Branch Status
```bash
git branch -a
```
Should show both `main` and `production` branches.

### Test 2: Make a Test Change to Main Branch
1. Make a small change (like updating a comment)
2. Commit and push to `main`
3. Check Vercel dashboard → Deployments
4. Should see a **Preview** deployment (not Production)

### Test 3: Merge to Production
1. Merge main into production
2. Push to production
3. Check Vercel dashboard → Deployments
4. Should see a **Production** deployment
5. This should deploy to your main domain

### Test 4: Verify in Vercel Dashboard
- Go to Vercel → Your Project → Deployments
- Check the branch column - should show which branch triggered each deployment
- Production deployments should show "Production" badge
- Preview deployments should show "Preview" badge

## Expected Behavior:

✅ **Pushing to `main`**:
- Creates preview deployment
- Gets a preview URL (like `gathering-git-main-username.vercel.app`)
- Does NOT deploy to main domain

✅ **Pushing to `production`**:
- Creates production deployment
- Deploys to your main domain
- Shows "Production" status in Vercel

## Quick Test:

Let's make a small test change to verify:

1. On `main` branch: Make a small change → push → should create preview
2. Merge to `production` → push → should deploy to main domain


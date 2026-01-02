# Configuring Domains for Main and Production Branches

## Current Setup:
- **Production Branch**: `production` → Deploys to your custom domain
- **Main Branch**: `main` → Gets preview URLs (like `gathering-git-main-username.vercel.app`)

## What You Want:
- **`gathering-jade.vercel.app`** → Point to `main` branch (test)
- **Your custom domain** → Point to `production` branch (production)

## Important Note:
In Vercel, the default `.vercel.app` domain (like `gathering-jade.vercel.app`) **always points to whatever branch is set as "Production Branch"** in settings. You can't make it point to a different branch.

## Options:

### Option 1: Keep Current Setup (Recommended)
- **Production Branch**: `production` → Your custom domain + `gathering-jade.vercel.app`
- **Main Branch**: `main` → Preview URLs (automatic)

**Pros**: Clean separation, production stays stable
**Cons**: Default domain points to production, not main

### Option 2: Switch Production Branch Back to Main
If you want `gathering-jade.vercel.app` to point to `main`:

1. Go to Vercel → Settings → Environments
2. Change Production Branch from `production` back to `main`
3. Your custom domain will also point to `main` (unless configured differently)

**Note**: This means your custom domain will also deploy from `main`, which might not be ideal.

### Option 3: Use Preview URLs (Recommended for Testing)
- Keep production branch as `production`
- Use the automatic preview URLs for `main` branch deployments
- Each `main` deployment gets its own preview URL
- Your custom domain stays on `production` branch

## Recommendation:
I recommend **Option 3** - use the preview URLs for testing `main` branch. This keeps your production stable while giving you test URLs for development.

But if you really want the default domain on `main`, we can switch it back.


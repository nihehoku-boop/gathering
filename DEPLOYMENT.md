# Deployment Guide

## Branch Strategy

- **`main`**: Development branch (auto-deploys to preview/staging)
- **`production`**: Production branch (deploys to main domain)

## Connecting to Main Domain in Vercel

### Step 1: Push the Production Branch
The production branch has been created and pushed to GitHub.

### Step 2: Configure Vercel Project

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Select your project

2. **Configure Production Branch**
   - Go to **Settings** → **Git**
   - Under **Production Branch**, select `production` instead of `main`
   - Save changes

3. **Add Custom Domain**
   - Go to **Settings** → **Domains**
   - Click **Add Domain**
   - Enter your main domain (e.g., `yourdomain.com` and `www.yourdomain.com`)
   - Follow Vercel's DNS configuration instructions

### Step 3: DNS Configuration

For your main domain, you'll need to add DNS records:

**Option A: Using Vercel's Nameservers (Recommended)**
- Change your domain's nameservers to Vercel's nameservers
- Vercel will provide these in the domain settings

**Option B: Using A/CNAME Records**
- Add a CNAME record pointing to `cname.vercel-dns.com`
- Or add an A record pointing to Vercel's IP addresses (provided in dashboard)

### Step 4: Environment Variables

Make sure all production environment variables are set in Vercel:

1. Go to **Settings** → **Environment Variables**
2. Ensure these are set for **Production**:
   - `DATABASE_URL` - Production database connection
   - `NEXTAUTH_URL` - Your main domain URL (e.g., `https://yourdomain.com`)
   - `NEXTAUTH_SECRET` - Secret key for NextAuth
   - `CLOUDINARY_*` - Image hosting credentials
   - `RESEND_API_KEY` - Email service API key
   - `SENTRY_*` - Error tracking (if using)
   - Any other required environment variables

### Step 5: Deploy Production Branch

Once configured:
- Every push to `production` branch will automatically deploy to your main domain
- You can also manually trigger deployments from the Vercel dashboard

## Workflow

### Development
```bash
# Work on main branch
git checkout main
git pull
# Make changes, commit, push
git push origin main
# This deploys to preview URL
```

### Production Deployment
```bash
# Merge main into production
git checkout production
git pull
git merge main
git push origin production
# This deploys to main domain
```

### Quick Production Update
```bash
# If you just want to update production with latest main
git checkout production
git merge main
git push origin production
```

## SSL Certificate

Vercel automatically provisions SSL certificates for your custom domain. This usually happens within a few minutes after adding the domain.

## Monitoring

- Check deployment status in Vercel dashboard
- Monitor errors in Sentry (if configured)
- Check Vercel Analytics for performance metrics

## Rollback

If something goes wrong:
1. Go to Vercel dashboard → **Deployments**
2. Find the previous working deployment
3. Click **⋯** → **Promote to Production**

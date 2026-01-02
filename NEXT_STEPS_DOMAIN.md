# Next Steps After Setting Production Branch

## Step 3: Add Your Custom Domain

### If you have a domain ready:

1. **Go to Settings → Domains**
   - In your Vercel project, click **Settings**
   - Click **Domains** in the left sidebar

2. **Add Your Domain**
   - Click **"Add Domain"** or **"Add"** button
   - Enter your domain (e.g., `yourdomain.com`)
   - Also add `www.yourdomain.com` if you want www support
   - Click **"Add"**

3. **Configure DNS**
   - Vercel will show you DNS records to add
   - You'll need to add these in your domain registrar (where you bought the domain)
   - Usually it's a CNAME record pointing to `cname.vercel-dns.com`
   - Or A records pointing to Vercel's IP addresses

### If you DON'T have a domain yet:

You can skip this step for now and use Vercel's default domain. You can add a custom domain later.

---

## Step 4: Update Environment Variables

**This is important!** You need to update `NEXTAUTH_URL` to match your domain.

1. **Go to Settings → Environment Variables**
   - Click **Settings** in your project
   - Click **Environment Variables** in the left sidebar

2. **Find NEXTAUTH_URL**
   - Look for `NEXTAUTH_URL` in the list
   - If it exists, click **Edit**
   - If it doesn't exist, click **Add New**

3. **Update the Value**
   - **If you added a custom domain**: Set it to `https://yourdomain.com` (or `https://www.yourdomain.com`)
   - **If using Vercel default domain**: Set it to your Vercel deployment URL (e.g., `https://gathering-jade.vercel.app`)

4. **Make sure it's set for Production**
   - Check the **Production** checkbox
   - Click **Save**

5. **Verify Other Variables**
   - Make sure all these are set for **Production**:
     - `DATABASE_URL` ✅
     - `NEXTAUTH_SECRET` ✅
     - `CLOUDINARY_*` (if using) ✅
     - `RESEND_API_KEY` ✅
     - `SENTRY_*` (if using) ✅

---

## Step 5: Deploy to Production

Now that everything is configured, deploy your production branch:

### Option A: Merge main into production (Recommended)

```bash
git checkout production
git merge main
git push origin production
```

This will trigger a deployment to your main domain.

### Option B: Make a small change and push

```bash
git checkout production
# Make a small change (or just touch a file)
echo "# Production deployment" >> .vercel-deployment-trigger
git add .vercel-deployment-trigger
git commit -m "Trigger production deployment"
git push origin production
```

---

## Verify Deployment

1. Go to **Deployments** tab in Vercel
2. You should see a new deployment from the `production` branch
3. It should show "Production" status
4. Click on it to see the URL
5. Visit the URL to verify it works

---

## Quick Checklist

- [x] Production branch set to `production`
- [ ] Custom domain added (if you have one)
- [ ] `NEXTAUTH_URL` updated in environment variables
- [ ] All environment variables set for Production
- [ ] Merged main into production branch
- [ ] Pushed to production branch
- [ ] Verified deployment works


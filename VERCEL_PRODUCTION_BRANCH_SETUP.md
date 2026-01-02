# How to Set Production Branch in Vercel - Step by Step

## Step 2: Configure Production Branch in Vercel

### Detailed Instructions:

1. **Log into Vercel**
   - Go to https://vercel.com
   - Sign in with your account

2. **Navigate to Your Project**
   - Click on your project name in the dashboard
   - Or go directly to: https://vercel.com/dashboard
   - Find and click on your "gathering" project

3. **Open Settings**
   - Look at the top navigation bar in your project
   - Click on **"Settings"** (it's usually the rightmost tab)

4. **Go to Git Settings**
   - In the left sidebar menu, look for **"Git"** section
   - Click on **"Git"** (it should be under the "General" section)

5. **Find Production Branch Setting**
   - Scroll down in the Git settings page
   - Look for a section called **"Production Branch"** or **"Deployment Settings"**
   - You'll see a dropdown or input field that currently says `main`

6. **Change to Production Branch**
   - Click on the dropdown/field next to "Production Branch"
   - Select `production` from the list of available branches
   - If `production` doesn't appear, make sure you've pushed it to GitHub first (which we already did)

7. **Save Changes**
   - Click the **"Save"** button (usually at the bottom of the settings)
   - Vercel will confirm the change

### Alternative Path (if Git section is not visible):

If you don't see a "Git" section in Settings:

1. Go to **Settings** → **General**
2. Look for **"Git Repository"** section
3. Click **"Edit"** or **"Configure"**
4. You should see branch settings there

### Visual Guide:

```
Vercel Dashboard
  └── Your Project (gathering)
      └── Settings (top navigation)
          └── Git (left sidebar)
              └── Production Branch (dropdown)
                  └── Select: production
                      └── Save
```

### What This Does:

- **Before**: Pushes to `main` branch deploy to your main domain
- **After**: Only pushes to `production` branch deploy to your main domain
- **Result**: `main` branch will create preview deployments, `production` branch will deploy to your custom domain

### Verification:

After saving, you can verify by:
1. Making a small change to `main` branch and pushing
2. It should create a preview deployment (not production)
3. Then merge to `production` branch and push
4. That should deploy to your main domain

### Troubleshooting:

**If you don't see `production` in the dropdown:**
- Make sure the branch exists on GitHub
- Try refreshing the page
- Check that Vercel has access to your GitHub repository

**If the option is grayed out:**
- You might need to disconnect and reconnect the Git repository
- Or check your Vercel plan permissions


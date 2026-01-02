# Finding Production Branch Setting in Vercel - Alternative Methods

## Method 1: Through Project Settings → General

1. Go to your project in Vercel dashboard
2. Click **Settings** (top navigation)
3. Click **General** (left sidebar - should be the first option)
4. Scroll down to find **"Build & Development Settings"** section
5. Look for **"Production Branch"** or **"Git Branch"** setting
6. It might be under a subsection like "Git" or "Deployment"

## Method 2: Through Deployments Tab

1. Go to your project
2. Click **Deployments** tab (top navigation)
3. Look for a gear icon ⚙️ or settings icon next to deployments
4. Or click on a deployment → look for branch settings

## Method 3: Through Git Integration Settings

1. Go to **Settings** → **Git**
2. If you see "Connected Git Repository" section
3. Click **"Edit"** or **"Configure"** button
4. The production branch setting might be in the configuration modal

## Method 4: Check Vercel CLI Configuration

If you have Vercel CLI installed, you can check/update it via command line:

```bash
# Check current configuration
vercel inspect

# Or check project settings
vercel project ls
```

## Method 5: Direct URL (if available)

Try going directly to:
- `https://vercel.com/[your-username]/[project-name]/settings/git`
- Or `https://vercel.com/[your-username]/[project-name]/settings/general`

## Method 6: What to Look For

The setting might be labeled as:
- "Production Branch"
- "Git Branch"
- "Deployment Branch"
- "Default Branch"
- "Build Branch"

## Method 7: Check Project Overview

1. Go to your project main page (not settings)
2. Look at the top right corner
3. There might be a branch selector or settings icon
4. Or check the "Deployments" section for branch configuration

## Still Can't Find It?

**Tell me what you see:**
1. What sections do you see in Settings? (list them)
2. What's in the "General" section?
3. What's in the "Git" section?
4. Are you on a free plan or paid plan?

**Alternative Solution:**
We can configure this via Vercel CLI or API if the UI doesn't show it.


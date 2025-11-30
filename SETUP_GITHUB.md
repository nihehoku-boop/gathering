# Setting Up GitHub Repository

Follow these steps to push your code to GitHub and deploy to Vercel:

## Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **+** icon in the top right → **New repository**
3. Name it (e.g., `gathering` or `collection-manager`)
4. Choose **Private** or **Public**
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **Create repository**

## Step 2: Push Your Code

After creating the repository, GitHub will show you commands. Use these:

```bash
# Make sure you're in the project directory
cd /Users/nicohennecke/Documents/gathering

# Add all files (already done, but just in case)
git add -A

# Commit everything
git commit -m "Initial commit: Collection management app ready for deployment"

# Add GitHub remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Or if you prefer SSH:
# git remote add origin git@github.com:YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Verify

1. Go to your GitHub repository page
2. You should see all your files
3. Check that `.env` and database files are NOT there (they're in .gitignore)

## Step 4: Deploy to Vercel

Now follow the steps in [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy to Vercel!

## Troubleshooting

### "Repository not found"
- Check that the repository name is correct
- Make sure you have access to the repository
- Verify your GitHub credentials

### "Permission denied"
- If using SSH, make sure your SSH key is added to GitHub
- Or use HTTPS instead

### "Large files" warning
- The `public/ltbcover/` folder has many images
- This is fine for GitHub, but if you want to reduce size, consider:
  - Using Git LFS for images
  - Or removing some test images


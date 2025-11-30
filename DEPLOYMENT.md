# Deployment Guide - Vercel

## Production URL
**Live Site**: https://gathering-jade.vercel.app
**Sign In**: https://gathering-jade.vercel.app/auth/signin
**Sign Up**: https://gathering-jade.vercel.app/auth/signup

This guide will help you deploy Gathering to Vercel for staging/production.

## Prerequisites

1. A GitHub, GitLab, or Bitbucket account
2. A Vercel account (free tier works fine) - sign up at [vercel.com](https://vercel.com)
3. A PostgreSQL database (Vercel Postgres recommended)

## Step 1: Prepare Your Repository

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub/GitLab/Bitbucket**:
   - Create a new repository on your Git provider
   - Push your code:
     ```bash
     git remote add origin <your-repo-url>
     git branch -M main
     git push -u origin main
     ```

## Step 2: Set Up Vercel Postgres

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new project or go to your project
3. Go to the **Storage** tab
4. Click **Create Database** → **Postgres**
5. Choose a name and region (e.g., `gathering-db`, region closest to you)
6. Copy the **Connection String** (you'll need this in Step 5)

## Step 3: Update Prisma Schema for PostgreSQL

The schema is currently set to SQLite. For production, you need PostgreSQL:

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. The models are already compatible with PostgreSQL (no changes needed)

3. **Important**: Keep your local SQLite for development. You can:
   - Use environment-specific schemas, OR
   - Just change it when deploying (Vercel will use the PostgreSQL URL)

## Step 4: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New Project**
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default - includes prisma generate)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

## Step 5: Configure Environment Variables

In Vercel project settings → **Environment Variables**, add:

### Required Variables:

```
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your-secret-key-here
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### How to get values:

1. **DATABASE_URL**: From Vercel Postgres (Step 2) - copy the connection string
2. **NEXTAUTH_URL**: Your Vercel deployment URL (e.g., `https://gathering-staging.vercel.app`)
   - You'll get this after first deployment, then update the env var
3. **NEXTAUTH_SECRET**: Generate with:
   ```bash
   openssl rand -base64 32
   ```
   Or use: https://generate-secret.vercel.app/32
4. **CLOUDINARY_***: From your Cloudinary dashboard at [cloudinary.com](https://cloudinary.com)

### Set for all environments:
- Check "Production", "Preview", and "Development" when adding each variable

## Step 6: First Deployment

1. Click **Deploy** in Vercel
2. Wait for the build to complete
3. If build fails, check the logs and fix any issues
4. Once deployed, note your URL (e.g., `https://gathering-abc123.vercel.app`)

## Step 7: Update NEXTAUTH_URL

1. Go back to Environment Variables
2. Update `NEXTAUTH_URL` to your actual Vercel URL: `https://gathering-jade.vercel.app`
3. Redeploy (or it will auto-redeploy)

## Step 8: Run Database Migrations

After first deployment, you need to set up the database schema:

### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to your project
vercel link

# Pull environment variables
vercel env pull .env.local

# Update Prisma schema to PostgreSQL (temporarily)
# Edit prisma/schema.prisma and change provider to "postgresql"

# Push schema
npx prisma db push

# Or generate migration
npx prisma migrate dev --name init
npx prisma migrate deploy
```

### Option B: Using Prisma Studio (via Vercel CLI)

```bash
vercel env pull .env.local
# Update schema.prisma to postgresql
npx prisma studio
# Manually create tables or use db push
```

## Step 9: Set Up Admin User

After deployment, set an admin user:

```bash
# Pull env vars
vercel env pull .env.local

# Update schema to postgresql temporarily
# Then run:
npm run set-admin your-email@example.com
npm run set-admin-password your-email@example.com
```

Or manually update via Prisma Studio or Vercel Postgres dashboard.

## Step 10: Verify Deployment

1. Visit your Vercel URL
2. Sign up/Sign in
3. Test creating collections
4. Check that images upload correctly
5. Test on mobile device

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify Prisma schema is compatible with PostgreSQL
- Make sure `prisma generate` runs (it's in the build script)

### Database Connection Issues
- Verify DATABASE_URL is correct (from Vercel Postgres)
- Check that Vercel Postgres is active
- Ensure database migrations have run
- Try `npx prisma db push` locally with production DATABASE_URL

### Image Upload Fails
- Verify Cloudinary credentials are correct
- Check Cloudinary dashboard for errors
- Ensure CORS is configured in Cloudinary (usually not needed)

### Module Not Found Errors
- Make sure all dependencies are in `package.json`
- Check that `prisma generate` runs before build
- Verify import paths are correct

## Quick Deploy Checklist

- [ ] Git repository created and pushed
- [ ] Vercel account created
- [ ] Vercel Postgres database created
- [ ] Prisma schema updated to PostgreSQL (or use env-specific)
- [ ] Environment variables set in Vercel
- [ ] First deployment successful
- [ ] Database migrations run
- [ ] Admin user created
- [ ] Tested on staging URL
- [ ] Mobile testing done

## Next Steps

- Set up custom domain (optional)
- Configure production environment variables separately
- Set up monitoring/analytics
- Configure database backups
- Set up CI/CD for automatic deployments

## Notes

- **Local Development**: Keep using SQLite locally (`file:./dev.db`)
- **Production**: Use PostgreSQL from Vercel Postgres
- **Environment Variables**: Vercel automatically injects them at build/runtime
- **Database Migrations**: Run manually after first deploy, or set up a migration script

# Database Connection Fix for Vercel

## Problem
The error `Can't reach database server at db.prisma.io:5432` indicates that your `DATABASE_URL` is set to a Prisma Accelerate URL instead of the direct PostgreSQL connection string.

## Solution

### Step 1: Get the Direct PostgreSQL Connection String

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`gathering`)
3. Go to **Storage** tab
4. Click on your Postgres database
5. Go to the **.env.local** tab or **Connection String** section
6. Look for the **Direct Connection** string (NOT the Prisma Accelerate URL)
7. It should look like:
   ```
   postgres://user:password@host.aws.neon.tech:5432/database?sslmode=require
   ```
   OR
   ```
   postgresql://user:password@host.aws.neon.tech:5432/database?sslmode=require
   ```

### Step 2: Update DATABASE_URL in Vercel

1. In Vercel Dashboard, go to your project
2. Go to **Settings** → **Environment Variables**
3. Find `DATABASE_URL`
4. Click **Edit**
5. **Replace** the value with the **Direct Connection** string from Step 1
6. Make sure it starts with `postgres://` or `postgresql://` (NOT `prisma://`)
7. Save the changes
8. **Redeploy** your application (or wait for auto-redeploy)

### Step 3: Verify

After redeploying, check the logs:
- The errors should stop
- API calls should work normally
- Database queries should succeed

## Important Notes

- **Prisma Accelerate URLs** start with `prisma://` - these don't work with direct Prisma Client
- **Direct PostgreSQL URLs** start with `postgres://` or `postgresql://` - these are what you need
- If you want to use Prisma Accelerate, you need to configure it differently (not recommended for this setup)

## Quick Check

Your `DATABASE_URL` should:
- ✅ Start with `postgres://` or `postgresql://`
- ✅ Contain a host (like `host.aws.neon.tech` or similar)
- ✅ Contain port `5432`
- ✅ Contain database name
- ✅ Have `?sslmode=require` at the end

Your `DATABASE_URL` should NOT:
- ❌ Start with `prisma://`
- ❌ Point to `db.prisma.io`
- ❌ Be a Prisma Accelerate URL



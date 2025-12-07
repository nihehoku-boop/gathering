#!/bin/bash

# Quick Migration Script
# This script helps you migrate from Vercel Postgres to Neon

set -e

echo "🚀 Database Migration Quick Start"
echo "=================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!"
    echo "   Please create it and add:"
    echo "   - OLD_DATABASE_URL (your current Vercel Postgres)"
    echo "   - NEW_DATABASE_URL (your Neon connection string)"
    exit 1
fi

# Check if OLD_DATABASE_URL is set
if ! grep -q "OLD_DATABASE_URL" .env.local; then
    echo "❌ OLD_DATABASE_URL not found in .env.local"
    exit 1
fi

# Check if NEW_DATABASE_URL is set
if ! grep -q "NEW_DATABASE_URL" .env.local; then
    echo "❌ NEW_DATABASE_URL not found in .env.local"
    echo ""
    echo "Please add your Neon connection string to .env.local:"
    echo "NEW_DATABASE_URL=\"postgres://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require\""
    exit 1
fi

echo "✅ Environment variables found"
echo ""

# Step 1: Run migrations on Neon
echo "📦 Step 1: Running Prisma migrations on Neon..."
echo "   (This creates the database schema)"
echo ""

# Temporarily set DATABASE_URL to Neon for migrations
export $(grep NEW_DATABASE_URL .env.local | xargs)
export DATABASE_URL=$NEW_DATABASE_URL

npx prisma migrate deploy

echo ""
echo "✅ Migrations applied to Neon"
echo ""

# Step 2: Run data migration
echo "📦 Step 2: Migrating data from old to new database..."
echo "   (This may take a few minutes)"
echo ""

npm run migrate-database

echo ""
echo "🎉 Migration complete!"
echo ""
echo "Next steps:"
echo "1. Test locally by updating DATABASE_URL in .env.local to Neon"
echo "2. Verify all data is present (especially community collections)"
echo "3. Update DATABASE_URL in Vercel environment variables"
echo "4. Redeploy your application"
echo ""


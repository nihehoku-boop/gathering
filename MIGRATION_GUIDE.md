# Database Migration Guide: Vercel Postgres → Neon

This guide will help you safely migrate your database from Vercel Postgres (Prisma Accelerate) to Neon PostgreSQL without losing any data, especially your community collections.

## ⚠️ Important Notes

- **DO NOT** delete the old database until you've verified everything works
- **DO NOT** update Vercel environment variables until migration is complete
- Keep both databases accessible during the migration process
- Community collections and all votes will be preserved

## Step 1: Create Neon Database

1. Go to [neon.tech](https://neon.tech) and sign up/login
2. Click "Create Project"
3. Choose:
   - **Project Name**: `gathering` (or your preferred name)
   - **Region**: Choose closest to your Vercel deployment
   - **PostgreSQL Version**: 15 or 16 (both work)
   - **Plan**: Free tier is fine to start
4. Click "Create Project"
5. Once created, you'll see a connection string like:
   ```
   postgres://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```
6. **Copy this connection string** - you'll need it in Step 3

## Step 2: Access Your Old Database

If your database is suspended, you have a few options:

### Option A: Contact Prisma Support
- If the database is suspended due to plan limits, contact Prisma support
- They may be able to temporarily restore access for migration
- Explain you need to migrate to a new provider

### Option B: Use Existing Connection
- If you still have the `DATABASE_URL` from Vercel, we can try to use it
- Even if suspended, sometimes read access is still available

### Option C: Export from Vercel Dashboard
- Check Vercel dashboard → Storage → Your database
- See if there's an export option

## Step 3: Set Up Environment Variables

1. Open your `.env.local` file (create it if it doesn't exist)
2. Add these variables:

```env
# Old database (your current Vercel Postgres)
OLD_DATABASE_URL="postgres://50ce8dca46f42154642482945ee41ebbb0bc90303263a3b7223d2fde066793bf:sk_NrgIFXCcEBhrPM8VytEyh@db.prisma.io:5432/postgres?sslmode=require"

# New database (your Neon connection string)
NEW_DATABASE_URL="postgres://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require"
```

**Replace `NEW_DATABASE_URL` with your actual Neon connection string from Step 1.**

## Step 4: Run Prisma Migrations on Neon

Before migrating data, we need to create the schema structure in Neon:

```bash
# Set DATABASE_URL to Neon temporarily
export DATABASE_URL="your-neon-connection-string"

# Run migrations
npx prisma migrate deploy

# Or if you want to create a fresh migration
npx prisma migrate dev --name init
```

This creates all the tables in your Neon database.

## Step 5: Run the Migration Script

```bash
npx tsx scripts/migrate-database.ts
```

The script will:
1. ✅ Test connections to both databases
2. ✅ Migrate all users
3. ✅ Migrate all folders
4. ✅ Migrate all collections
5. ✅ Migrate all items
6. ✅ Migrate all recommended collections and items
7. ✅ **Migrate all community collections** (preserved!)
8. ✅ **Migrate all community items** (preserved!)
9. ✅ **Migrate all community collection votes** (preserved!)
10. ✅ Migrate all wishlists and wishlist items
11. ✅ Migrate NextAuth accounts, sessions, and tokens
12. ✅ Verify all data counts match

## Step 6: Verify Migration

The script automatically verifies data counts, but you should also:

1. **Check Community Collections**:
   - Count should match exactly
   - All votes should be preserved
   - All items should be present

2. **Test Locally**:
   ```bash
   # Update .env.local to use Neon
   DATABASE_URL="your-neon-connection-string"
   
   # Start dev server
   npm run dev
   ```

3. **Verify**:
   - Login works
   - Collections load
   - Community collections are visible
   - Votes are preserved
   - All data looks correct

## Step 7: Update Vercel Environment Variables

**ONLY after verifying everything works locally:**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `DATABASE_URL` to your Neon connection string
3. **DO NOT** delete `PRISMA_DATABASE_URL` yet (keep as backup)
4. Redeploy your application

## Step 8: Final Verification

After deployment:
1. ✅ Test login
2. ✅ Check collections load
3. ✅ Verify community collections are present
4. ✅ Check votes are preserved
5. ✅ Test creating new collections/items
6. ✅ Verify everything works as expected

## Step 9: Clean Up (Optional)

Once everything is confirmed working for a few days:
1. You can remove `PRISMA_DATABASE_URL` from Vercel
2. You can remove `OLD_DATABASE_URL` from `.env.local`
3. Consider exporting a final backup from Neon

## Troubleshooting

### "Can't reach database server"
- Check if old database is accessible
- Try the connection string in a PostgreSQL client
- Contact Prisma support if suspended

### "Migration failed"
- Check error message
- Verify both connection strings are correct
- Ensure Neon database has migrations applied
- Try migrating in smaller batches (modify script)

### "Data count mismatch"
- Review which tables have mismatches
- Check if some data failed to migrate
- Re-run migration (it uses upsert, so safe to re-run)

### "Connection timeout"
- Check Neon connection string
- Verify network access
- Try using connection pooling string from Neon dashboard

## Support

If you encounter issues:
1. Check the error messages carefully
2. Verify connection strings
3. Ensure migrations are applied to Neon
4. Check Neon dashboard for connection issues

## Success Criteria

✅ All users migrated
✅ All collections migrated
✅ All items migrated
✅ **All community collections migrated**
✅ **All community collection votes preserved**
✅ All recommended collections migrated
✅ All wishlists migrated
✅ Application works with new database
✅ No data loss

Good luck! 🚀


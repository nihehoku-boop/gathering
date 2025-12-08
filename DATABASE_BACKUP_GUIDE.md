# Database Backup Strategy for Vercel Postgres

## Important: Operation Usage

**Good News:** Database backup operations (`pg_dump` and `pg_restore`) do **NOT** count as Prisma operations. They are direct PostgreSQL operations that bypass Prisma entirely.

- ✅ `pg_dump` = Direct PostgreSQL read (0 Prisma operations)
- ✅ `pg_restore` = Direct PostgreSQL write (0 Prisma operations)
- ✅ Automated backups = No impact on your Prisma operation limits

## Current Setup

### 1. Manual Backup Script
Located at: `scripts/backup-database.ts`

**Usage:**
```bash
npm run backup:db
```

**What it does:**
- Creates a compressed backup file using `pg_dump`
- Saves to `backups/` directory
- Includes timestamp in filename
- Does NOT use Prisma operations

### 2. Manual Restore Script
Located at: `scripts/restore-database.ts`

**Usage:**
```bash
npm run restore:db <backup-file-path>
```

**Warning:** This will overwrite existing data!

### 3. Automated Backups (Vercel Cron)
Located at: `app/api/cron/backup/route.ts`

**Schedule:** Daily at 2 AM UTC (configured in `vercel.json`)

**Current Status:** Framework is set up, but needs cloud storage integration.

## Recommended Production Setup

### Option 1: Harborix (Recommended - Easiest)
Harborix provides automated backups for Vercel Postgres:
- ✅ Automated daily backups
- ✅ Encrypted storage
- ✅ One-click restoration
- ✅ Backup retention management
- ✅ No Prisma operations used

**Setup:**
1. Visit https://www.harborix.com
2. Connect your Vercel Postgres database
3. Configure backup schedule and retention
4. Done!

### Option 2: Custom S3 Backup Solution

If you prefer to build your own solution:

1. **Install AWS SDK:**
```bash
npm install @aws-sdk/client-s3
```

2. **Update `app/api/cron/backup/route.ts`:**
   - Execute `pg_dump` (requires PostgreSQL client in serverless)
   - Upload backup file to S3
   - Implement retention policy (delete backups older than 30 days)
   - Send notifications on success/failure

3. **Environment Variables:**
```env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=your-backup-bucket
CRON_SECRET=your-secret-for-cron-auth
```

### Option 3: Manual Backups (Current)

For now, you can manually run backups:
```bash
npm run backup:db
```

Then manually upload to cloud storage or download locally.

## Backup Best Practices

1. **Frequency:**
   - Daily backups (minimum)
   - Consider hourly for critical data

2. **Retention:**
   - Keep last 30 days of daily backups
   - Keep weekly backups for 3 months
   - Keep monthly backups for 1 year

3. **Storage:**
   - Store backups in separate region/account
   - Encrypt backups at rest
   - Test restore process regularly

4. **Monitoring:**
   - Set up alerts for backup failures
   - Monitor backup sizes
   - Verify backups are actually being created

## Testing Backups

1. **Create a test backup:**
```bash
npm run backup:db
```

2. **Verify backup file exists:**
```bash
ls -lh backups/
```

3. **Test restore (on a test database):**
```bash
npm run restore:db backups/backup-2024-01-01T00-00-00-000Z.dump
```

## Vercel Cron Setup

The cron job is configured in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/backup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**To enable:**
1. Add `CRON_SECRET` to your Vercel environment variables
2. Deploy to Vercel
3. Vercel will automatically run the cron job

## Cost Considerations

- **pg_dump operations:** FREE (no Prisma operations)
- **Storage:** Depends on backup size and retention
  - Harborix: ~$5-10/month
  - S3: ~$0.023/GB/month
- **Bandwidth:** Minimal (backups are compressed)

## Next Steps

1. ✅ Manual backup scripts created
2. ✅ Cron job framework set up
3. ⏳ Choose backup solution (Harborix recommended)
4. ⏳ Configure automated backups
5. ⏳ Test restore process
6. ⏳ Set up monitoring/alerts

## Troubleshooting

### "pg_dump: command not found"
Install PostgreSQL client tools:
```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql-client
```

### "Permission denied"
Ensure your database user has read permissions.

### "Backup file too large"
- Use compressed format (`.dump` instead of `.sql`)
- Consider incremental backups
- Implement backup compression

---

**Remember:** Backups are only useful if you can restore them. Test your restore process regularly!


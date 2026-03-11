# Community page LCP optimization – deploy steps

After deploying the community LCP changes, run these once against your **production** database (e.g. from your laptop with `DATABASE_URL` pointing at prod, or in a one-off deploy step):

1. **Apply schema (add `upvotesCount` column)**  
   ```bash
   npx prisma db push
   ```

2. **Backfill existing vote counts**  
   ```bash
   npm run backfill:community-upvotes
   ```

After that, the Community page will use the cached count for “popular” sort and stay fast.

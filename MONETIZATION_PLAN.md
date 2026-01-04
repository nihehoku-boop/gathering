# Colletro Monetization Plan
## Aligned with Vercel Infrastructure Costs

### Current Infrastructure Analysis

**Vercel Free Tier Limits:**
- Bandwidth: 100GB/month
- Serverless Function Execution: 100GB-hours/month
- Edge Network: Unlimited
- Builds: 6000/month
- Storage: Limited (via Vercel Blob or external services)

**Estimated Current Costs:**
- Database (Vercel Postgres/Neon): Based on operations
- Image Storage: Likely Cloudinary or Vercel Blob
- Bandwidth: Scaling with users

### Tier Structure (Cost-Aligned)

#### **FREE TIER** (Current Features)
**Infrastructure Impact:** Low
- Unlimited collections & items
- Basic statistics
- Community collections access
- Public profiles
- Basic image uploads (10MB per image, 500MB total storage)
- Standard API rate limits
- CSV export only

**Rationale:** Core functionality that scales efficiently with current infrastructure.

---

#### **PREMIUM TIER** ($5/month or $50/year - ~40% savings)
**Infrastructure Impact:** Medium

**Features:**
1. **Enhanced Image Storage**
   - 25MB per image (vs 10MB free)
   - 5GB total storage (vs 500MB free)
   - Priority image processing
   
2. **Advanced Exports**
   - PDF reports with custom templates
   - JSON exports with full metadata
   - Bulk export (multiple collections at once)
   - Scheduled exports (email delivery)

3. **Enhanced Analytics**
   - Collection value tracking
   - Spending/earning analytics
   - Advanced charts and graphs
   - Export analytics data

4. **Premium Features**
   - Custom collection templates (create & share)
   - Priority support (24-48h response)
   - Ad-free experience
   - API access (500 requests/day)
   - Cloud backup & restore

5. **Sharing Enhancements**
   - Password-protected collections
   - Expiring share links
   - Advanced privacy controls

**Cost Justification:** 
- Increased storage = ~$2-3/month per user
- Enhanced exports = bandwidth costs
- Priority support = manageable with scale
- API access = controlled rate limits

---

#### **PRO TIER** ($10/month or $100/year - ~17% savings)
**Infrastructure Impact:** High

**Everything in Premium, plus:**

1. **Unlimited Image Storage**
   - 50MB per image limit
   - 20GB total storage
   - No storage limits (soft cap with monitoring)
   
2. **Advanced Collaboration**
   - Shared collections (multiple users)
   - Collection comments & notes
   - Activity feed/history

3. **Professional Tools**
   - Bulk import/export (10K+ items)
   - Advanced search & filtering
   - Custom fields in all collections
   - Collection templates marketplace access

4. **Enterprise Features**
   - White-label sharing (custom branding)
   - Advanced API access (5000 requests/day)
   - Webhooks for integrations
   - Data export in all formats

5. **Value Tracking**
   - Automatic price tracking (via APIs)
   - Insurance documentation tools
   - Investment/collection ROI tracking

**Cost Justification:**
- Unlimited storage = $5-8/month per heavy user
- Advanced features = development/maintenance costs
- API/webhooks = scalable infrastructure

---

### Implementation Roadmap

#### Phase 1: Database Schema (Priority: HIGH)
```prisma
model User {
  // ... existing fields
  subscriptionTier     String      @default("free") // "free" | "premium" | "pro"
  subscriptionStatus   String      @default("active") // "active" | "canceled" | "past_due"
  subscriptionId       String?     // Stripe subscription ID
  subscriptionEndsAt   DateTime?   // For canceled subscriptions
  stripeCustomerId     String?
  storageUsed          Int         @default(0) // bytes
  storageLimit         Int         @default(524288000) // 500MB for free
  apiRequestsToday     Int         @default(0)
  apiRequestsResetAt   DateTime?   @default(now())
}

enum SubscriptionTier {
  FREE
  PREMIUM
  PRO
}
```

#### Phase 2: Payment Integration (Stripe)
- Stripe Checkout for subscriptions
- Webhook handling for subscription events
- Customer portal for management

#### Phase 3: Feature Gating
- Middleware for API routes
- Frontend feature flags
- Storage quota checks
- Rate limiting per tier

#### Phase 4: Premium Features
1. Enhanced exports (PDF, JSON)
2. Advanced analytics
3. Custom templates
4. API access

#### Phase 5: Pro Features
1. Unlimited storage
2. Collaboration tools
3. Advanced integrations

---

### Storage Quota System

**Free:** 500MB (524,288,000 bytes)
**Premium:** 5GB (5,368,709,120 bytes)
**Pro:** 20GB (21,474,836,480 bytes)

**Implementation:**
- Track `storageUsed` on User model
- Calculate on image upload
- Check quota before upload
- Show usage in settings/profile
- Upgrade prompts when approaching limit

---

### API Rate Limits

**Free:** 100 requests/day
**Premium:** 500 requests/day
**Pro:** 5000 requests/day

**Implementation:**
- Track `apiRequestsToday` + reset daily
- Rate limit middleware
- Return 429 when exceeded
- Show usage in API docs

---

### Recommended Pricing Strategy

**Why these prices:**
- **$5/month Premium:** Competitive with Notion ($4-8), Obsidian Sync ($8)
- **$10/month Pro:** Similar to advanced tools, justifiable for power users
- **Annual discounts:** Industry standard, improves cash flow

**Conversion targets:**
- 2-5% free → premium conversion (industry average)
- 10-20% premium → pro conversion
- Focus on value, not restrictions

---

### Cost Monitoring

**Key Metrics to Track:**
1. Storage costs per user tier
2. Bandwidth usage per tier
3. API request costs
4. Support ticket volume
5. Conversion rates

**Break-even Analysis:**
- Free tier: Break-even or slight loss (acquisition cost)
- Premium: $5/month - ~$2-3 costs = $2-3 profit
- Pro: $10/month - ~$5-8 costs = $2-5 profit

---

### Migration Strategy

1. **Grandfather existing users:** All current users start as "premium" for 3-6 months
2. **Soft launch:** Enable premium features, announce upcoming changes
3. **Phased rollout:** Premium features first, then subscriptions
4. **Transparent communication:** Clear upgrade paths, no surprises

---

### Next Steps

1. ✅ Design tier structure (this document)
2. ⬜ Update database schema
3. ⬜ Implement Stripe integration
4. ⬜ Create subscription management UI
5. ⬜ Add feature gating middleware
6. ⬜ Implement storage quota system
7. ⬜ Build premium features
8. ⬜ Add analytics/usage tracking
9. ⬜ Create upgrade flows
10. ⬜ Launch & monitor


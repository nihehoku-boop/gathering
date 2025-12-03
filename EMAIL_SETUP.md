# Email Service Setup Guide

Gathering uses [Resend](https://resend.com) for sending transactional emails. This guide will help you set up email functionality.

## Why Resend?

- Developer-friendly API
- Great deliverability
- Free tier: 3,000 emails/month
- Easy integration with Next.js
- No credit card required for free tier

## Setup Steps

### 1. Create a Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key

1. Go to the [API Keys](https://resend.com/api-keys) page
2. Click "Create API Key"
3. Give it a name (e.g., "Gathering Production")
4. Copy the API key (starts with `re_`)

### 3. Verify Your Domain (Optional but Recommended)

For production, you should verify your domain:

1. Go to [Domains](https://resend.com/domains)
2. Click "Add Domain"
3. Follow the DNS setup instructions
4. Once verified, you can use emails like `noreply@yourdomain.com`

**Note:** For testing, you can use the default `onboarding@resend.dev` email, but it's limited and not recommended for production.

### 4. Set Environment Variables

Add these to your `.env` file (local) and Vercel environment variables (production):

```bash
# Resend API Key (required)
RESEND_API_KEY="re_your-api-key-here"

# From Email (optional, defaults to onboarding@resend.dev)
# Use your verified domain for production
RESEND_FROM_EMAIL="Gathering <noreply@yourdomain.com>"
```

### 5. Vercel Environment Variables

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add:
   - `RESEND_API_KEY` = your Resend API key
   - `RESEND_FROM_EMAIL` = your verified email (optional)

## Email Templates

The following emails are automatically sent:

### Password Reset Email
- Sent when user requests password reset
- Contains secure reset link (expires in 1 hour)
- HTML and plain text versions

### Welcome Email
- Sent when new user registers
- Includes getting started tips
- Links to help documentation

## Testing

### Development Mode

If `RESEND_API_KEY` is not set:
- Password reset links are logged to console (development only)
- Welcome emails are skipped (non-blocking)

### Production Mode

Once `RESEND_API_KEY` is configured:
- All emails are sent automatically
- Check Resend dashboard for delivery status
- Monitor bounce/spam rates

## Email Limits

**Free Tier:**
- 3,000 emails/month
- 100 emails/day

**Paid Plans:**
- Start at $20/month
- 50,000 emails/month
- Higher daily limits

## Troubleshooting

### Emails Not Sending

1. Check that `RESEND_API_KEY` is set correctly
2. Verify the API key is active in Resend dashboard
3. Check Resend logs for error messages
4. Ensure domain is verified (if using custom domain)

### Emails Going to Spam

1. Verify your domain with Resend
2. Set up SPF, DKIM, and DMARC records
3. Use a proper "From" email address
4. Avoid spam trigger words in subject/content

### Rate Limiting

If you hit rate limits:
- Free tier: 100 emails/day
- Upgrade to paid plan for higher limits
- Implement email queue for high volume

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all secrets
3. **Rotate API keys** periodically
4. **Monitor email activity** in Resend dashboard
5. **Set up alerts** for unusual activity

## Alternative Email Services

If you prefer a different service, you can modify `lib/email.ts` to use:
- SendGrid
- Mailgun
- AWS SES
- Postmark
- Nodemailer (with SMTP)

## Support

- Resend Documentation: https://resend.com/docs
- Resend Support: support@resend.com
- Gathering Issues: Check project repository


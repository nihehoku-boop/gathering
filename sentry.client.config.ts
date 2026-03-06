import * as Sentry from '@sentry/nextjs'

// Client-side Sentry is initialized only after cookie consent ("Accept all") in GatedSentry.
// This avoids sending data before the user has consented (EU ePrivacy/GDPR).
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    enabled: false, // Only enabled after consent in GatedSentry
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    debug: false,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    environment: process.env.NODE_ENV,
    beforeSend(event) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Sentry] Would send error:', event)
        return null
      }
      return event
    },
  })
}


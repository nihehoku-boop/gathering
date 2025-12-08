import * as Sentry from '@sentry/nextjs'

// Only initialize if DSN is provided
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    debug: false,
    environment: process.env.NODE_ENV,
    beforeSend(event, hint) {
      // Don't send errors in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Sentry] Would send error:', event)
        return null
      }
      return event
    },
  })
}


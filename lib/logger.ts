/**
 * Simple logger utility that respects environment
 * In production, only logs errors. In development, logs everything.
 * Also sends errors to Sentry in production.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

function shouldLog(level: LogLevel): boolean {
  if (process.env.NODE_ENV === 'production') {
    // In production, only log errors and warnings
    return level === 'error' || level === 'warn'
  }
  // In development, log everything
  return true
}

function formatMessage(level: LogLevel, message: string, ...args: any[]): string {
  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`
  return `${prefix} ${message}`
}

async function captureToSentry(level: LogLevel, message: string, ...args: any[]) {
  // Only capture errors and warnings to Sentry
  if (level !== 'error' && level !== 'warn') {
    return
  }

  // Only in production and if Sentry is available
  if (process.env.NODE_ENV !== 'production') {
    return
  }

  try {
    // Dynamic import to avoid bundling Sentry in development
    const Sentry = await import('@sentry/nextjs')
    
    if (level === 'error') {
      if (args[0] instanceof Error) {
        Sentry.captureException(args[0], {
          tags: { logger: true },
          extra: { message, additionalArgs: args.slice(1) },
        })
      } else {
        Sentry.captureMessage(message, {
          level: 'error',
          tags: { logger: true },
          extra: { args },
        })
      }
    } else if (level === 'warn') {
      Sentry.captureMessage(message, {
        level: 'warning',
        tags: { logger: true },
        extra: { args },
      })
    }
  } catch (error) {
    // Silently fail if Sentry is not available
    // Don't log to avoid infinite loops
  }
}

export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (shouldLog('debug')) {
      console.debug(formatMessage('debug', message), ...args)
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (shouldLog('info')) {
      console.info(formatMessage('info', message), ...args)
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message), ...args)
    }
    // Capture warnings to Sentry (non-blocking)
    captureToSentry('warn', message, ...args).catch(() => {})
  },
  
  error: (message: string, ...args: any[]) => {
    // Always log errors, even in production
    console.error(formatMessage('error', message), ...args)
    // Capture errors to Sentry (non-blocking)
    captureToSentry('error', message, ...args).catch(() => {})
  },
}


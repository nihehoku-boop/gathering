/**
 * Simple logger utility that respects environment
 * In production, only logs errors. In development, logs everything.
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
  },
  
  error: (message: string, ...args: any[]) => {
    // Always log errors, even in production
    console.error(formatMessage('error', message), ...args)
  },
}


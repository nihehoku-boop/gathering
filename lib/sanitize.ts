/**
 * Input sanitization utilities
 * Prevents XSS and injection attacks
 */

/**
 * Sanitize HTML string by removing potentially dangerous content
 * For user-generated content that needs to be displayed
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return ''
  }

  // Remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .trim()
}

/**
 * Sanitize plain text by removing control characters and limiting length
 */
export function sanitizeText(text: string, maxLength: number = 10000): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  return text
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .trim()
    .slice(0, maxLength)
}

/**
 * Sanitize URL to prevent javascript: and data: URLs
 */
export function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') {
    return null
  }

  const trimmed = url.trim()
  
  // Block javascript: and data: URLs
  if (trimmed.toLowerCase().startsWith('javascript:') || 
      trimmed.toLowerCase().startsWith('data:') ||
      trimmed.toLowerCase().startsWith('vbscript:')) {
    return null
  }

  // Only allow http:// and https://
  if (!trimmed.match(/^https?:\/\//i)) {
    return null
  }

  return trimmed
}

/**
 * Sanitize file name to prevent path traversal
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName || typeof fileName !== 'string') {
    return 'file'
  }

  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace invalid chars with underscore
    .replace(/\.\./g, '') // Remove path traversal attempts
    .replace(/^\.+/, '') // Remove leading dots
    .slice(0, 255) // Limit length
    || 'file'
}

/**
 * Sanitize JSON string to prevent injection
 */
export function sanitizeJson(jsonString: string): string | null {
  if (!jsonString || typeof jsonString !== 'string') {
    return null
  }

  try {
    // Parse and re-stringify to ensure valid JSON
    const parsed = JSON.parse(jsonString)
    return JSON.stringify(parsed)
  } catch {
    return null
  }
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }

  return text.replace(/[&<>"']/g, (m) => map[m])
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string | null {
  if (!email || typeof email !== 'string') {
    return null
  }

  const trimmed = email.trim().toLowerCase()
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmed)) {
    return null
  }

  // Limit length
  if (trimmed.length > 254) {
    return null
  }

  return trimmed
}

/**
 * Sanitize number input
 */
export function sanitizeNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null
  }

  if (typeof value === 'number') {
    return isNaN(value) || !isFinite(value) ? null : value
  }

  if (typeof value !== 'string') {
    return null
  }

  const num = parseFloat(value.trim())
  return isNaN(num) || !isFinite(num) ? null : num
}

/**
 * Sanitize integer input
 */
export function sanitizeInteger(value: string | number | null | undefined): number | null {
  const num = sanitizeNumber(value)
  return num !== null ? Math.floor(num) : null
}


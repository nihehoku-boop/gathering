/**
 * Disposable / temporary email domains blocked at registration.
 * Reduces bot and throwaway accounts. Add more as needed.
 */
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  '10minutemail.com',
  '10minutemail.net',
  'guerrillamail.com',
  'guerrillamail.org',
  'mailinator.com',
  'tempmail.com',
  'tempmail.net',
  'throwaway.email',
  'yopmail.com',
  'fakeinbox.com',
  'trashmail.com',
  'getnada.com',
  'maildrop.cc',
  'temp-mail.org',
  'sharklasers.com',
  'grr.la',
  'guerrillamail.biz',
  'guerrillamailblock.com',
  'spam4.me',
  'dispostable.com',
  'mailnesia.com',
  'mohmal.com',
  'emailondeck.com',
  '33mail.com',
  'inboxkitten.com',
  'tmpeml.com',
  'minuteinbox.com',
  'disposable.com',
  'tempail.com',
  'mintemail.com',
  'emailfake.com',
  'mytemp.email',
  'tempr.email',
  'anonymousemail.me',
])

export function isBlockedEmailDomain(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return false
  return DISPOSABLE_EMAIL_DOMAINS.has(domain)
}

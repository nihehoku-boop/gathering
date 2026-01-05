import { Resend } from 'resend'

// Initialize Resend client lazily
let resend: Resend | null = null

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('[Email] RESEND_API_KEY not configured')
    return null
  }
  if (!resend) {
    resend = new Resend(apiKey)
    console.log('[Email] Resend client initialized', {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey.length,
      apiKeyPrefix: apiKey.substring(0, 3),
    })
  }
  return resend
}

/**
 * Validates and normalizes the from email address
 * Resend requires format: "email@example.com" or "Name <email@example.com>"
 */
function normalizeFromEmail(fromEmail: string | undefined): string {
  if (!fromEmail) {
    return 'Colletro <onboarding@resend.dev>'
  }

  // Remove any extra whitespace
  const trimmed = fromEmail.trim()

  // Check if it's already in the correct format
  // Format: "Name <email@example.com>" or "email@example.com"
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const nameEmailRegex = /^[^<]+<[^\s@]+@[^\s@]+\.[^\s@]+>$/

  if (emailRegex.test(trimmed)) {
    // It's just an email, return as is
    return trimmed
  }

  if (nameEmailRegex.test(trimmed)) {
    // It's in "Name <email>" format, return as is
    return trimmed
  }

  // Try to parse if it has a name but wrong format
  // If it contains an email, extract it and format correctly
  const emailMatch = trimmed.match(/[^\s@]+@[^\s@]+\.[^\s@]+/)
  if (emailMatch) {
    const email = emailMatch[0]
    // If there's text before the email, use it as name
    const nameMatch = trimmed.substring(0, trimmed.indexOf(email)).trim()
    if (nameMatch) {
      return `${nameMatch} <${email}>`
    }
    return email
  }

  // If we can't parse it, use default
  console.warn('[Email] Invalid from email format, using default:', trimmed)
  return 'Colletro <onboarding@resend.dev>'
}

// Helper to get logo URL
function getLogoUrl(): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://gathering-jade.vercel.app'
  // Remove trailing slash if present
  const cleanUrl = baseUrl.replace(/\/$/, '')
  return `${cleanUrl}/logo-icon.png`
}

// Email templates
export async function sendPasswordResetEmail(email: string, resetLink: string, userName?: string) {
  try {
    const client = getResendClient()
    if (!client) {
      console.error('RESEND_API_KEY not configured. Email not sent.')
      console.log('Password reset link (DEV):', resetLink)
      return { success: false, error: 'Email service not configured' }
    }

    const fromEmail = normalizeFromEmail(process.env.RESEND_FROM_EMAIL)
    const logoUrl = getLogoUrl()
    const appUrl = process.env.NEXTAUTH_URL || 'https://gathering-jade.vercel.app'
    
    console.log('[Email] Using from email:', fromEmail)
    
    const { data, error } = await client.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Reset Your Colletro Password',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #fafafa; margin: 0; padding: 0; background-color: #0f1114;">
            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0f1114;">
              <tr>
                <td style="padding: 40px 20px; text-align: center;">
                  <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #1a1d24; border-radius: 12px; overflow: hidden; border: 1px solid #2a2d35;">
                    <!-- Header with Logo -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #0f1114 0%, #1a1d24 100%); padding: 40px 30px; text-align: center; border-bottom: 1px solid #2a2d35;">
                        <img src="${logoUrl}" alt="Colletro" style="height: 48px; width: auto; margin-bottom: 12px;" />
                        <h1 style="color: #fafafa; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Colletro</h1>
                        <p style="color: #969696; margin: 8px 0 0 0; font-size: 14px;">Your Collection Trove</p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="color: #fafafa; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
                        
                        <p style="color: #969696; margin: 0 0 20px 0; font-size: 16px;">${userName ? `Hi ${userName},` : 'Hi,'}</p>
                        
                        <p style="color: #969696; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
                          We received a request to reset your password for your Colletro account. Click the button below to reset your password:
                        </p>
                        
                        <div style="text-align: center; margin: 35px 0;">
                          <a href="${resetLink}" 
                             style="display: inline-block; background-color: #34C759; color: #0f1114; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: background-color 0.2s;">
                            Reset Password
                          </a>
                        </div>
                        
                        <p style="color: #666; font-size: 14px; margin: 30px 0 15px 0;">
                          Or copy and paste this link into your browser:
                        </p>
                        <p style="color: #969696; font-size: 12px; word-break: break-all; background-color: #0f1114; padding: 12px; border-radius: 6px; font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace; border: 1px solid #2a2d35; margin: 0;">
                          ${resetLink}
                        </p>
                        
                        <p style="color: #666; font-size: 14px; margin-top: 30px; line-height: 1.6;">
                          This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #0f1114; padding: 30px; text-align: center; border-top: 1px solid #2a2d35;">
                        <p style="color: #666; font-size: 12px; margin: 0 0 15px 0;">© ${new Date().getFullYear()} Colletro. All rights reserved.</p>
                        <p style="margin: 0;">
                          <a href="${appUrl}/privacy" style="color: #969696; text-decoration: none; font-size: 12px; margin: 0 8px;">Privacy Policy</a>
                          <span style="color: #666;">|</span>
                          <a href="${appUrl}/terms" style="color: #969696; text-decoration: none; font-size: 12px; margin: 0 8px;">Terms of Service</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
      text: `
Reset Your Colletro Password

${userName ? `Hi ${userName},` : 'Hi,'}

We received a request to reset your password for your Colletro account.

Click this link to reset your password:
${resetLink}

This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.

© ${new Date().getFullYear()} Colletro. All rights reserved.
      `.trim(),
    })

    if (error) {
      console.error('Error sending password reset email:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function sendWelcomeEmail(email: string, userName?: string) {
  try {
    const client = getResendClient()
    if (!client) {
      console.log('RESEND_API_KEY not configured. Welcome email not sent.')
      return { success: false, error: 'Email service not configured' }
    }

    const fromEmail = normalizeFromEmail(process.env.RESEND_FROM_EMAIL)
    const appUrl = process.env.NEXTAUTH_URL || 'https://gathering-jade.vercel.app'
    const logoUrl = getLogoUrl()
    
    console.log('[Email] Using from email:', fromEmail)
    
    const { data, error } = await client.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Welcome to Colletro!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #fafafa; margin: 0; padding: 0; background-color: #0f1114;">
            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0f1114;">
              <tr>
                <td style="padding: 40px 20px; text-align: center;">
                  <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #1a1d24; border-radius: 12px; overflow: hidden; border: 1px solid #2a2d35;">
                    <!-- Header with Logo -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #0f1114 0%, #1a1d24 100%); padding: 40px 30px; text-align: center; border-bottom: 1px solid #2a2d35;">
                        <img src="${logoUrl}" alt="Colletro" style="height: 48px; width: auto; margin-bottom: 12px;" />
                        <h1 style="color: #fafafa; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Colletro</h1>
                        <p style="color: #969696; margin: 8px 0 0 0; font-size: 14px;">Your Collection Trove</p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="color: #fafafa; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Welcome to Colletro! 🎉</h2>
                        
                        <p style="color: #969696; margin: 0 0 20px 0; font-size: 16px;">${userName ? `Hi ${userName},` : 'Hi,'}</p>
                        
                        <p style="color: #969696; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
                          Thank you for joining Colletro! We're excited to help you organize and track your collections.
                        </p>
                        
                        <div style="background-color: #0f1114; border-radius: 8px; padding: 24px; margin: 30px 0; border: 1px solid #2a2d35;">
                          <h3 style="color: #fafafa; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Get Started:</h3>
                          <ul style="color: #969696; padding-left: 20px; margin: 0; line-height: 1.8;">
                            <li>Create your first collection</li>
                            <li>Add items and track your progress</li>
                            <li>Explore community collections</li>
                            <li>Customize your profile</li>
                          </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 35px 0;">
                          <a href="${appUrl}" 
                             style="display: inline-block; background-color: #34C759; color: #0f1114; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            Get Started
                          </a>
                        </div>
                        
                        <p style="color: #969696; font-size: 14px; margin: 0; line-height: 1.6;">
                          If you have any questions, check out our <a href="${appUrl}/help" style="color: #34C759; text-decoration: none;">Help & FAQ</a> page.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #0f1114; padding: 30px; text-align: center; border-top: 1px solid #2a2d35;">
                        <p style="color: #666; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Colletro. All rights reserved.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
      text: `
Welcome to Colletro! 🎉

${userName ? `Hi ${userName},` : 'Hi,'}

Thank you for joining Colletro! We're excited to help you organize and track your collections.

Get Started:
- Create your first collection
- Add items and track your progress
- Explore community collections
- Customize your profile

Visit ${appUrl} to get started.

If you have any questions, check out our Help & FAQ page: ${appUrl}/help

© ${new Date().getFullYear()} Colletro. All rights reserved.
      `.trim(),
    })

    if (error) {
      console.error('Error sending welcome email:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function sendVerificationEmail(email: string, verificationLink: string, userName?: string) {
  try {
    const client = getResendClient()
    if (!client) {
      console.error('RESEND_API_KEY not configured. Email not sent.')
      console.log('Verification link (DEV):', verificationLink)
      return { success: false, error: 'Email service not configured' }
    }

    const fromEmail = normalizeFromEmail(process.env.RESEND_FROM_EMAIL)
    const logoUrl = getLogoUrl()
    const appUrl = process.env.NEXTAUTH_URL || 'https://gathering-jade.vercel.app'
    
    console.log('[Email] Sending verification email', {
      to: email,
      from: fromEmail,
      hasClient: !!client,
    })

    const { data, error } = await client.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #fafafa; margin: 0; padding: 0; background-color: #0f1114;">
            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0f1114;">
              <tr>
                <td style="padding: 40px 20px; text-align: center;">
                  <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #1a1d24; border-radius: 12px; overflow: hidden; border: 1px solid #2a2d35;">
                    <!-- Header with Logo -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #0f1114 0%, #1a1d24 100%); padding: 40px 30px; text-align: center; border-bottom: 1px solid #2a2d35;">
                        <img src="${logoUrl}" alt="Colletro" style="height: 48px; width: auto; margin-bottom: 12px;" />
                        <h1 style="color: #fafafa; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Colletro</h1>
                        <p style="color: #969696; margin: 8px 0 0 0; font-size: 14px;">Your Collection Trove</p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="color: #fafafa; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Verify Your Email Address</h2>
                        
                        <p style="color: #969696; margin: 0 0 20px 0; font-size: 16px;">${userName ? `Hi ${userName},` : 'Hi,'}</p>
                        
                        <p style="color: #969696; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
                          Thank you for signing up! Please verify your email address to complete your account setup and unlock all features.
                        </p>
                        
                        <div style="text-align: center; margin: 35px 0;">
                          <a href="${verificationLink}" 
                             style="display: inline-block; background-color: #34C759; color: #0f1114; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            Verify Email Address
                          </a>
                        </div>
                        
                        <p style="color: #666; font-size: 14px; margin: 30px 0 15px 0;">
                          Or copy and paste this link into your browser:
                        </p>
                        <p style="color: #969696; font-size: 12px; word-break: break-all; background-color: #0f1114; padding: 12px; border-radius: 6px; font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace; border: 1px solid #2a2d35; margin: 0;">
                          ${verificationLink}
                        </p>
                        
                        <p style="color: #666; font-size: 14px; margin-top: 30px; line-height: 1.6;">
                          This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #0f1114; padding: 30px; text-align: center; border-top: 1px solid #2a2d35;">
                        <p style="color: #666; font-size: 12px; margin: 0 0 15px 0;">© ${new Date().getFullYear()} Colletro. All rights reserved.</p>
                        <p style="margin: 0;">
                          <a href="${appUrl}/privacy" style="color: #969696; text-decoration: none; font-size: 12px; margin: 0 8px;">Privacy Policy</a>
                          <span style="color: #666;">|</span>
                          <a href="${appUrl}/terms" style="color: #969696; text-decoration: none; font-size: 12px; margin: 0 8px;">Terms of Service</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
      text: `
Verify Your Email Address

${userName ? `Hi ${userName},` : 'Hi,'}

Thank you for signing up! Please verify your email address to complete your account setup and unlock all features.

Click this link to verify your email:
${verificationLink}

This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.

© ${new Date().getFullYear()} Colletro. All rights reserved.
      `.trim(),
    })

    if (error) {
      console.error('[Email] Error sending verification email:', {
        error,
        errorMessage: error.message,
        errorName: error.name,
        to: email,
        from: fromEmail,
      })
      return { success: false, error: error.message || 'Unknown error' }
    }

    console.log('[Email] Verification email sent successfully', {
      emailId: data?.id,
      to: email,
    })

    return { success: true, data }
  } catch (error) {
    console.error('Error sending verification email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}


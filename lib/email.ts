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
    return 'Gathering <onboarding@resend.dev>'
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
  return 'Gathering <onboarding@resend.dev>'
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
    
    console.log('[Email] Using from email:', fromEmail)
    
    const { data, error } = await client.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Reset Your Gathering Password',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: #0f1114; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
              <h1 style="color: #FFD60A; margin: 0 0 10px 0; font-size: 24px;">Gathering</h1>
              <p style="color: #fafafa; margin: 0; font-size: 14px;">Your Collection Manager</p>
            </div>
            
            <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #0f1114; margin-top: 0;">Reset Your Password</h2>
              
              <p style="color: #666;">${userName ? `Hi ${userName},` : 'Hi,'}</p>
              
              <p style="color: #666;">
                We received a request to reset your password for your Gathering account. Click the button below to reset your password:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" 
                   style="display: inline-block; background-color: #FFD60A; color: #0f1114; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                Or copy and paste this link into your browser:
              </p>
              <p style="color: #666; font-size: 12px; word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace;">
                ${resetLink}
              </p>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              
              <p style="color: #999; font-size: 12px; margin: 0;">
                If you're having trouble clicking the button, copy and paste the URL above into your web browser.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Gathering. All rights reserved.</p>
              <p style="margin: 5px 0;">
                <a href="${process.env.NEXTAUTH_URL || 'https://gathering-jade.vercel.app'}/privacy" style="color: #999; text-decoration: none;">Privacy Policy</a> | 
                <a href="${process.env.NEXTAUTH_URL || 'https://gathering-jade.vercel.app'}/terms" style="color: #999; text-decoration: none;">Terms of Service</a>
              </p>
            </div>
          </body>
        </html>
      `,
      text: `
Reset Your Gathering Password

${userName ? `Hi ${userName},` : 'Hi,'}

We received a request to reset your password for your Gathering account.

Click this link to reset your password:
${resetLink}

This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.

© ${new Date().getFullYear()} Gathering. All rights reserved.
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
    
    console.log('[Email] Using from email:', fromEmail)
    
    const { data, error } = await client.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Welcome to Gathering!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: #0f1114; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
              <h1 style="color: #FFD60A; margin: 0 0 10px 0; font-size: 24px;">Gathering</h1>
              <p style="color: #fafafa; margin: 0; font-size: 14px;">Your Collection Manager</p>
            </div>
            
            <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #0f1114; margin-top: 0;">Welcome to Gathering! 🎉</h2>
              
              <p style="color: #666;">${userName ? `Hi ${userName},` : 'Hi,'}</p>
              
              <p style="color: #666;">
                Thank you for joining Gathering! We're excited to help you organize and track your collections.
              </p>
              
              <div style="background-color: #f5f5f5; border-radius: 6px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #0f1114; margin-top: 0;">Get Started:</h3>
                <ul style="color: #666; padding-left: 20px;">
                  <li>Create your first collection</li>
                  <li>Add items and track your progress</li>
                  <li>Explore community collections</li>
                  <li>Customize your profile</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${appUrl}" 
                   style="display: inline-block; background-color: #FFD60A; color: #0f1114; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Get Started
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                If you have any questions, check out our <a href="${appUrl}/help" style="color: #FFD60A;">Help & FAQ</a> page.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Gathering. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
      text: `
Welcome to Gathering! 🎉

${userName ? `Hi ${userName},` : 'Hi,'}

Thank you for joining Gathering! We're excited to help you organize and track your collections.

Get Started:
- Create your first collection
- Add items and track your progress
- Explore community collections
- Customize your profile

Visit ${appUrl} to get started.

If you have any questions, check out our Help & FAQ page: ${appUrl}/help

© ${new Date().getFullYear()} Gathering. All rights reserved.
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
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: #0f1114; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
              <h1 style="color: #FFD60A; margin: 0 0 10px 0; font-size: 24px;">Gathering</h1>
              <p style="color: #fafafa; margin: 0; font-size: 14px;">Your Collection Manager</p>
            </div>
            
            <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #0f1114; margin-top: 0;">Verify Your Email Address</h2>
              
              <p style="color: #666;">${userName ? `Hi ${userName},` : 'Hi,'}</p>
              
              <p style="color: #666;">
                Thank you for signing up! Please verify your email address to complete your account setup and unlock all features.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" 
                   style="display: inline-block; background-color: #FFD60A; color: #0f1114; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Verify Email Address
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                Or copy and paste this link into your browser:
              </p>
              <p style="color: #666; font-size: 12px; word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace;">
                ${verificationLink}
              </p>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              
              <p style="color: #999; font-size: 12px; margin: 0;">
                If you're having trouble clicking the button, copy and paste the URL above into your web browser.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Gathering. All rights reserved.</p>
              <p style="margin: 5px 0;">
                <a href="${process.env.NEXTAUTH_URL || 'https://gathering-jade.vercel.app'}/privacy" style="color: #999; text-decoration: none;">Privacy Policy</a> | 
                <a href="${process.env.NEXTAUTH_URL || 'https://gathering-jade.vercel.app'}/terms" style="color: #999; text-decoration: none;">Terms of Service</a>
              </p>
            </div>
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

© ${new Date().getFullYear()} Gathering. All rights reserved.
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


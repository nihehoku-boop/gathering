import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const prisma = new PrismaClient()

function generatePassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*'
  const all = uppercase + lowercase + numbers + symbols
  
  let password = ''
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length < 1) {
    console.log('Usage: npm run set-admin-password <email> [password]')
    console.log('Example: npm run set-admin-password admin@example.com')
    console.log('Example: npm run set-admin-password admin@example.com mypassword123')
    console.log('')
    console.log('If no password is provided, a secure random password will be generated.')
    process.exit(1)
  }

  const email = args[0]
  const providedPassword = args[1]
  
  // Generate password if not provided
  const password = providedPassword || generatePassword(16)

  if (password.length < 6) {
    console.error('Error: Password must be at least 6 characters long')
    process.exit(1)
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.error(`Error: User with email ${email} not found`)
      process.exit(1)
    }

    if (!user.isAdmin) {
      console.warn(`⚠️  Warning: User ${email} is not an admin.`)
      console.warn('   Setting password anyway. Use "npm run set-admin" to make them an admin.')
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user with password
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    })

    console.log('')
    console.log('✅ Password set successfully!')
    console.log('')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('  Account Details:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`  Email:    ${email}`)
    console.log(`  Name:     ${user.name || 'N/A'}`)
    console.log(`  Admin:    ${user.isAdmin ? '✅ Yes' : '❌ No'}`)
    console.log('')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('  Login Credentials:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`  Email:    ${email}`)
    console.log(`  Password: ${password}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('')
    console.log('⚠️  IMPORTANT: Save this password securely!')
    console.log('   You will need it to sign in at /auth/signin')
    console.log('')
  } catch (error) {
    console.error('Error setting password:', error)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })




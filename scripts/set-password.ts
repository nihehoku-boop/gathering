import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length < 2) {
    console.log('Usage: npm run set-password <email> <password>')
    console.log('Example: npm run set-password admin@example.com mypassword123')
    process.exit(1)
  }

  const email = args[0]
  const password = args[1]

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

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user with password
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    })

    console.log(`✅ Password set successfully for ${email}`)
    console.log(`   Email: ${email}`)
    console.log(`   Name: ${user.name || 'N/A'}`)
    console.log(`   Admin: ${user.isAdmin ? 'Yes' : 'No'}`)
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




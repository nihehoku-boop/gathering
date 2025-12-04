import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load environment variables
try {
  const envPath = resolve(process.cwd(), '.env.local')
  const envFile = readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach(line => {
    const trimmedLine = line.trim()
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '')
        process.env[key.trim()] = value.trim()
      }
    }
  })
} catch (error) {
  // Ignore
}

const prisma = new PrismaClient()

async function checkStatus() {
  try {
    const collection = await prisma.communityCollection.findFirst({
      where: { name: '1001 Books You Must Read Before You Die' },
      include: { 
        _count: {
          select: { items: true }
        }
      }
    })
    
    if (collection) {
      const count = collection._count.items
      const progress = Math.round((count / 1001) * 100)
      const remaining = 1001 - count
      
      console.log(`\n📊 Update: ${count}/1001 books (${progress}%) - ${remaining} remaining`)
      
      // Check log for recent activity
      try {
        const logContent = readFileSync('/tmp/1001-books-import-full.log', 'utf-8')
        const lines = logContent.split('\n')
        const recentLines = lines.slice(-5).filter(l => l.trim())
        if (recentLines.length > 0) {
          console.log(`   Recent activity:`)
          recentLines.forEach(line => {
            if (line.includes('Saving batch') || line.includes('Progress:')) {
              console.log(`   ${line.trim()}`)
            }
          })
        }
      } catch (e) {
        // Log file not available yet
      }
      
      if (count >= 1001) {
        console.log(`\n✅ Import complete!`)
        return false // Stop monitoring
      }
      return true // Continue monitoring
    } else {
      console.log('❌ Collection not found')
      return false
    }
  } catch (error: any) {
    console.error('Error:', error.message)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

async function main() {
  console.log('📊 Monitoring 1001 Books import progress...\n')
  console.log('Will check every 30 seconds and report every 50 books\n')
  
  let lastCount = 0
  let checkCount = 0
  
  while (true) {
    const shouldContinue = await checkStatus()
    if (!shouldContinue) break
    
    // Check if we've added 50 more books
    const currentCount = await prisma.communityCollection.findFirst({
      where: { name: '1001 Books You Must Read Before You Die' },
      include: { _count: { select: { items: true } } }
    }).then(c => c?._count.items || 0).catch(() => 0)
    
    if (currentCount >= lastCount + 50) {
      console.log(`\n🎉 Milestone: ${currentCount} books imported!`)
      lastCount = currentCount
    }
    
    checkCount++
    if (checkCount % 10 === 0) {
      console.log(`\n⏱️  Still running... (checked ${checkCount} times)`)
    }
    
    await new Promise(resolve => setTimeout(resolve, 30000)) // Wait 30 seconds
    await prisma.$connect() // Reconnect for next check
  }
}

main().catch(console.error)


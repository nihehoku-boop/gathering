import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ isAdmin: false })
    }

    // Check session first (faster), then database as fallback
    const isAdmin = session.user.isAdmin ?? false
    
    if (isAdmin) {
      return NextResponse.json({ isAdmin: true })
    }

    // Fallback to database check
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    })

    return NextResponse.json({ isAdmin: user?.isAdmin || false })
  } catch (error) {
    console.error('Error checking admin status:', error)
    return NextResponse.json({ isAdmin: false })
  }
}


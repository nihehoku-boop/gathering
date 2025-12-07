import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { isUserAdmin } from '@/lib/user-cache'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ isAdmin: false })
    }

    // Check session first (faster), then cached database lookup as fallback
    const isAdmin = session.user.isAdmin ?? false
    
    if (isAdmin) {
      return NextResponse.json({ isAdmin: true })
    }

    // Fallback to cached database check (5 min TTL)
    const adminStatus = await isUserAdmin(session.user.id)

    return NextResponse.json({ isAdmin: adminStatus })
  } catch (error) {
    console.error('Error checking admin status:', error)
    return NextResponse.json({ isAdmin: false })
  }
}


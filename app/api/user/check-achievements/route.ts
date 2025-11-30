import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"'
import { checkAllAchievements } from '@/lib/achievement-checker'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`[API] Manually checking achievements for user ${session.user.id}`)
    const newlyUnlocked = await checkAllAchievements(session.user.id)
    console.log(`[API] Newly unlocked achievements:`, newlyUnlocked)

    return NextResponse.json({ 
      success: true,
      newlyUnlockedAchievements: newlyUnlocked,
      count: newlyUnlocked.length,
    })
  } catch (error) {
    console.error('Error checking achievements:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}




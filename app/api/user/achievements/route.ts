import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"'
import { prisma } from '@/lib/prisma'
import { parseAchievements, stringifyAchievements } from '@/lib/achievements'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        achievements: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const achievements = parseAchievements(user.achievements || '[]')

    return NextResponse.json({ achievements })
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { achievementId } = body

    if (!achievementId) {
      return NextResponse.json(
        { error: 'Achievement ID is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        achievements: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const currentAchievements = parseAchievements(user.achievements || '[]')

    // Check if already unlocked
    if (currentAchievements.includes(achievementId)) {
      return NextResponse.json({ 
        success: true, 
        message: 'Achievement already unlocked',
        newlyUnlocked: false 
      })
    }

    // Add new achievement
    const updatedAchievements = [...currentAchievements, achievementId]
    
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        achievements: stringifyAchievements(updatedAchievements),
      },
    })

    return NextResponse.json({ 
      success: true, 
      newlyUnlocked: true,
      achievements: updatedAchievements 
    })
  } catch (error) {
    console.error('Error unlocking achievement:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}




import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'
import { serverCache, cacheKeys } from '@/lib/server-cache'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try cache first
    const cacheKey = cacheKeys.userProfile(session.user.id)
    const cached = serverCache.get(cacheKey)
    if (cached) {
      const response = NextResponse.json(cached)
      response.headers.set('Cache-Control', 'private, s-maxage=60, stale-while-revalidate=120')
      return response
    }

    // Fetch user and items count in parallel (2 queries → 2 parallel queries)
    const [user, itemsCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          isPrivate: true,
          badge: true,
          accentColor: true,
          themeMode: true,
          bio: true,
          bannerImage: true,
          profileTheme: true,
          _count: {
            select: {
              collections: true,
            },
          },
        },
      }),
      prisma.item.count({
        where: {
          collection: {
            userId: session.user.id,
          },
        },
      }),
    ])

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const result = {
      ...user,
      collectionsCount: user._count.collections,
      itemsCount,
    }

    // Cache for 60 seconds
    serverCache.set(cacheKey, result, 60 * 1000)

    const response = NextResponse.json(result)
    response.headers.set('Cache-Control', 'private, s-maxage=60, stale-while-revalidate=120')
    return response
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, isPrivate, badge, accentColor, themeMode, bio, bannerImage, profileImage, profileTheme } = body

    const updateData: any = {}
    if (name !== undefined) {
      updateData.name = name || null
    }
    if (isPrivate !== undefined) {
      updateData.isPrivate = Boolean(isPrivate)
    }
    if (badge !== undefined) {
      updateData.badge = badge || null
    }
    if (accentColor !== undefined) {
      updateData.accentColor = accentColor || '#34C759'
    }
    if (themeMode !== undefined) {
      updateData.themeMode = themeMode === 'light' ? 'light' : 'dark'
    }
    if (bio !== undefined) {
      updateData.bio = bio || null
    }
    if (bannerImage !== undefined) {
      updateData.bannerImage = bannerImage || null
    }
    if (profileImage !== undefined) {
      updateData.image = profileImage || null
    }
    if (profileTheme !== undefined) {
      // Validate that profileTheme is valid JSON
      try {
        if (typeof profileTheme === 'string') {
          JSON.parse(profileTheme)
          updateData.profileTheme = profileTheme
        } else {
          updateData.profileTheme = JSON.stringify(profileTheme)
        }
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid profileTheme format. Must be valid JSON.' },
          { status: 400 }
        )
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isPrivate: true,
        badge: true,
        accentColor: true,
        themeMode: true,
        bio: true,
        bannerImage: true,
        profileTheme: true,
      },
    })

    // Invalidate user cache and profile cache when user data changes
    const { invalidateUserCache } = await import('@/lib/user-cache')
    invalidateUserCache(session.user.id)
    serverCache.delete(cacheKeys.userProfile(session.user.id))

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


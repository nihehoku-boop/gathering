import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'
import { withRateLimit } from '@/lib/rate-limit-middleware'
import { rateLimitConfigs } from '@/lib/rate-limit'

// GET - Get all folders for user
async function getFoldersHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const folders = await prisma.folder.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { collections: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(folders)
  } catch (error) {
    console.error('Error fetching folders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new folder
async function createFolderHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, parentId } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      )
    }

    const folder = await prisma.folder.create({
      data: {
        name: name.trim(),
        userId: session.user.id,
        parentId: parentId || null,
      },
      include: {
        _count: {
          select: { collections: true },
        },
      },
    })

    return NextResponse.json(folder, { status: 201 })
  } catch (error) {
    console.error('Error creating folder:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = withRateLimit(
  getFoldersHandler,
  rateLimitConfigs.read,
  async (request) => {
    const session = await getServerSession(authOptions)
    return session?.user?.id
  }
)

export const POST = withRateLimit(
  createFolderHandler,
  rateLimitConfigs.write,
  async (request) => {
    const session = await getServerSession(authOptions)
    return session?.user?.id
  }
)




import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

// GET - Get collection sharing settings
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)
    const collectionId = resolvedParams.id

    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        isPublic: true,
        shareToken: true,
      },
    })

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }

    return NextResponse.json(collection)
  } catch (error) {
    console.error('Error fetching collection share settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Update collection sharing settings
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)
    const collectionId = resolvedParams.id

    const body = await request.json()
    const { isPublic } = body

    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: session.user.id,
      },
    })

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }

    const updateData: any = {
      isPublic: isPublic !== undefined ? Boolean(isPublic) : collection.isPublic,
    }

    // Generate shareToken if making public and token doesn't exist
    if (updateData.isPublic && !collection.shareToken) {
      updateData.shareToken = randomBytes(16).toString('hex')
    } else if (!updateData.isPublic) {
      // Optionally remove share token if making private (or keep it for future use)
      // We'll keep it so users can easily toggle back to public
    }

    const updatedCollection = await prisma.collection.update({
      where: { id: collectionId },
      data: updateData,
      select: {
        id: true,
        name: true,
        isPublic: true,
        shareToken: true,
      },
    })

    return NextResponse.json(updatedCollection)
  } catch (error) {
    console.error('Error updating collection share settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}




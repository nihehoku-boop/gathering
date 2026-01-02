import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'

/**
 * Unshare a collection from the community
 * DELETE /api/collections/[id]/unshare-from-community
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Resolve params (handle both sync and async)
    const resolvedParams = await Promise.resolve(params)
    const collectionId = resolvedParams.id

    // Get the user's collection
    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: session.user.id,
      },
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    // Check if collection is shared
    if (!collection.sharedToCommunityId) {
      return NextResponse.json(
        { error: 'Collection is not shared to the community' },
        { status: 400 }
      )
    }

    const communityCollectionId = collection.sharedToCommunityId

    // Verify the user owns the community collection
    const communityCollection = await prisma.communityCollection.findFirst({
      where: {
        id: communityCollectionId,
        userId: session.user.id,
      },
    })

    if (!communityCollection) {
      return NextResponse.json(
        { error: 'Community collection not found or you do not have permission to unshare it' },
        { status: 403 }
      )
    }

    // Delete the community collection (this will cascade delete items, votes, etc.)
    await prisma.communityCollection.delete({
      where: { id: communityCollectionId },
    })

    // Clear the sharedToCommunityId from the collection
    await prisma.collection.update({
      where: { id: collectionId },
      data: { sharedToCommunityId: null },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error unsharing collection from community:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}


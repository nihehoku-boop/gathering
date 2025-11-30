import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const item = await prisma.communityItem.findUnique({
      where: { id: params.id },
      include: {
        communityCollection: {
          select: { userId: true },
        },
      },
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    // Only the collection owner can edit items
    if (item.communityCollection.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only edit items in your own collections' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, number, notes, image } = body

    const updateData: any = {}

    if (name !== undefined) {
      const trimmedName = String(name).trim()
      if (!trimmedName) {
        return NextResponse.json(
          { error: 'Item name cannot be empty' },
          { status: 400 }
        )
      }
      updateData.name = trimmedName
    }

    if (number !== undefined) {
      updateData.number = number ? parseInt(String(number)) : null
    }

    if (notes !== undefined) {
      updateData.notes = notes ? String(notes).trim() : null
    }

    if (image !== undefined) {
      updateData.image = image ? String(image).trim() : null
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    const updatedItem = await prisma.communityItem.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Error updating community item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const item = await prisma.communityItem.findUnique({
      where: { id: params.id },
      include: {
        communityCollection: {
          select: { userId: true },
        },
      },
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    // Only the collection owner can delete items
    if (item.communityCollection.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only delete items from your own collections' },
        { status: 403 }
      )
    }

    await prisma.communityItem.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting community item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}




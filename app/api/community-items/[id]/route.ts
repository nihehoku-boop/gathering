import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'
import { isUserAdmin } from '@/lib/user-cache'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const item = await prisma.communityItem.findUnique({
      where: { id: resolvedParams.id },
      include: {
        communityCollection: {
          select: {
            id: true,
            name: true,
            template: true,
            customFieldDefinitions: true,
          },
        },
      },
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Community item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error fetching community item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Resolve params
    const resolvedParams = await Promise.resolve(params)
    const itemId = resolvedParams.id

    // Get the item and its collection
    const item = await prisma.communityItem.findUnique({
      where: { id: itemId },
      include: {
        communityCollection: true,
      },
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Community item not found' },
        { status: 404 }
      )
    }

    // Check if user is admin OR the collection creator
    const isAdmin = await isUserAdmin(session.user.id)
    const isCreator = item.communityCollection.userId === session.user.id

    if (!isAdmin && !isCreator) {
      return NextResponse.json(
        { error: 'Forbidden - Only admins or collection creators can edit items' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, number, notes, image, customFields } = body

    const updateData: any = {}
    
    if (name !== undefined) {
      updateData.name = name
    }
    if (number !== undefined) {
      updateData.number = number ? parseInt(String(number)) : null
    }
    if (notes !== undefined) {
      updateData.notes = notes || null
    }
    if (image !== undefined) {
      updateData.image = image || null
    }
    if (customFields !== undefined) {
      updateData.customFields = customFields ? JSON.stringify(customFields) : '{}'
    }

    const updatedItem = await prisma.communityItem.update({
      where: { id: itemId },
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
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Resolve params
    const resolvedParams = await Promise.resolve(params)
    const itemId = resolvedParams.id

    // Get the item and its collection
    const item = await prisma.communityItem.findUnique({
      where: { id: itemId },
      include: {
        communityCollection: true,
      },
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Community item not found' },
        { status: 404 }
      )
    }

    // Check if user is admin OR the collection creator
    const isAdmin = await isUserAdmin(session.user.id)
    const isCreator = item.communityCollection.userId === session.user.id

    if (!isAdmin && !isCreator) {
      return NextResponse.json(
        { error: 'Forbidden - Only admins or collection creators can delete items' },
        { status: 403 }
      )
    }

    await prisma.communityItem.delete({
      where: { id: itemId },
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

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Resolve params
    const resolvedParams = await Promise.resolve(params)
    const itemId = resolvedParams.id

    const body = await request.json()
    const { name, number, notes, image } = body

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

    const item = await prisma.recommendedItem.update({
      where: { id: itemId },
      data: updateData,
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating recommended item:', error)
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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Resolve params
    const resolvedParams = await Promise.resolve(params)
    const itemId = resolvedParams.id

    await prisma.recommendedItem.delete({
      where: { id: itemId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting recommended item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


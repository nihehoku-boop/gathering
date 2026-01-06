import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { description } = body

    if (!description || typeof description !== 'string' || !description.trim()) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      )
    }

    // Create bug report in database
    // We'll store it in a new table or use the existing reports table
    // For now, let's create a ContentReport with type 'bug' or 'feature'
    const report = await prisma.contentReport.create({
      data: {
        type: 'bug', // or 'feature' based on user selection, but for now just 'bug'
        reason: 'Bug Report / Feature Request',
        description: description.trim(),
        reporterId: session.user.id,
        // No collectionId or itemId for bug reports
        status: 'pending',
      },
    })

    return NextResponse.json({ success: true, id: report.id }, { status: 201 })
  } catch (error) {
    console.error('Error creating bug report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


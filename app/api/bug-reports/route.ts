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

    // Create bug report - store in a special system collection
    // First, find or create a system collection for bug reports
    // Get the first admin user to use as the "owner" of the system collection
    const adminUser = await prisma.user.findFirst({
      where: { isAdmin: true },
      select: { id: true },
    })

    if (!adminUser) {
      return NextResponse.json(
        { error: 'System error: No admin user found' },
        { status: 500 }
      )
    }

    let bugReportCollection = await prisma.communityCollection.findFirst({
      where: {
        name: 'System: Bug Reports',
        userId: adminUser.id,
      },
    })

    // If no system collection exists, create a placeholder one
    if (!bugReportCollection) {
      bugReportCollection = await prisma.communityCollection.create({
        data: {
          name: 'System: Bug Reports',
          description: 'Internal collection for storing bug reports and feature requests',
          userId: adminUser.id,
          isHidden: true, // Hide from public view
        },
      })
    }

    // Create bug report as a ContentReport linked to the system collection
    // Note: The unique constraint on (communityCollectionId, reporterId) prevents
    // multiple reports from the same user for the same collection.
    // For bug reports, we want to allow multiple reports, so we'll delete any existing
    // pending bug report from this user first, or we can create multiple system collections.
    // Actually, let's just try to create it and handle the unique constraint error.
    try {
      const report = await prisma.contentReport.create({
        data: {
          reason: 'Bug Report / Feature Request',
          description: description.trim(),
          reporterId: session.user.id,
          communityCollectionId: bugReportCollection.id,
          status: 'pending',
        },
      })

      return NextResponse.json({ success: true, id: report.id }, { status: 201 })
    } catch (error: any) {
      // If unique constraint violation, delete the old pending report and create a new one
      if (error.code === 'P2002') {
        // Delete any existing pending bug report from this user
        await prisma.contentReport.deleteMany({
          where: {
            communityCollectionId: bugReportCollection.id,
            reporterId: session.user.id,
            status: 'pending',
          },
        })
        
        // Create the new report
        const report = await prisma.contentReport.create({
          data: {
            reason: 'Bug Report / Feature Request',
            description: description.trim(),
            reporterId: session.user.id,
            communityCollectionId: bugReportCollection.id,
            status: 'pending',
          },
        })

        return NextResponse.json({ success: true, id: report.id }, { status: 201 })
      }
      throw error
    }

    return NextResponse.json({ success: true, id: report.id }, { status: 201 })
  } catch (error) {
    console.error('Error creating bug report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


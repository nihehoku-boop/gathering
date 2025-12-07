import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'

export async function POST(
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
    const collectionId = resolvedParams.id

    // Get the user's collection
    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: session.user.id,
      },
      include: {
        items: true,
      },
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    if (!collection.recommendedCollectionId) {
      return NextResponse.json(
        { error: 'This collection is not from a recommended collection' },
        { status: 400 }
      )
    }

    // Get the recommended collection
    const recommendedCollection = await prisma.recommendedCollection.findUnique({
      where: { id: collection.recommendedCollectionId },
      include: {
        items: {
          orderBy: [
            { number: 'asc' },
            { name: 'asc' },
          ],
        },
      },
    })

    if (!recommendedCollection) {
      return NextResponse.json(
        { error: 'Recommended collection not found' },
        { status: 404 }
      )
    }

    // Get the request body to check if user wants to preserve customizations
    const body = await request.json().catch(() => ({}))
    const preserveCustomizations = body.preserveCustomizations === true

    // Create a map of existing items by their key (number-name)
    const existingItemsMap = new Map<string, { id: string; image: string | null; notes: string | null }>(
      collection.items.map((item: { number: number | null; name: string; id: string; image: string | null; notes: string | null }) => [`${item.number || ''}-${item.name}`, {
        id: item.id,
        image: item.image,
        notes: item.notes,
      }])
    )

    // Update collection metadata
    const updateData: any = {
      name: recommendedCollection.name,
      description: recommendedCollection.description,
      category: recommendedCollection.category,
      coverImage: recommendedCollection.coverImage,
      coverImageAspectRatio: (recommendedCollection as any).coverImageAspectRatio || null,
      tags: recommendedCollection.tags,
      lastSyncedAt: new Date(),
    }

    // If preserving customizations, only update fields that weren't customized
    if (preserveCustomizations) {
      if (collection.name === recommendedCollection.name) {
        // Name wasn't customized, can update
      } else {
        updateData.name = collection.name // Keep customized name
      }
      if (collection.description === recommendedCollection.description) {
        // Description wasn't customized
      } else {
        updateData.description = collection.description // Keep customized description
      }
      if (collection.category === recommendedCollection.category) {
        // Category wasn't customized
      } else {
        updateData.category = collection.category // Keep customized category
      }
      if (collection.coverImage === recommendedCollection.coverImage) {
        // Cover image wasn't customized
      } else {
        updateData.coverImage = collection.coverImage // Keep customized cover image
      }
      const userAspectRatio = (collection as any).coverImageAspectRatio || null
      const recommendedAspectRatio = (recommendedCollection as any).coverImageAspectRatio || null
      if (userAspectRatio === recommendedAspectRatio) {
        // Aspect ratio wasn't customized
      } else {
        updateData.coverImageAspectRatio = userAspectRatio // Keep customized aspect ratio
      }
      if (collection.tags === recommendedCollection.tags) {
        // Tags weren't customized
      } else {
        updateData.tags = collection.tags // Keep customized tags
      }
    }

    // Update the collection
    const updatedCollection = await prisma.collection.update({
      where: { id: collectionId },
      data: updateData,
    })

    // Handle items - add new items and update existing items' images/notes
    // We'll keep existing items and their isOwned status, but add any new items and update images
    const recommendedItemKeys = new Set(
      recommendedCollection.items.map((item: { number: number | null; name: string }) => `${item.number || ''}-${item.name}`)
    )

    // Find items that need to be added
    const itemsToAdd = recommendedCollection.items.filter(
      (item: { number: number | null; name: string }) => !existingItemsMap.has(`${item.number || ''}-${item.name}`)
    )

    if (itemsToAdd.length > 0) {
      await prisma.item.createMany({
        data: itemsToAdd.map((item: { name: string; number: number | null; notes: string | null; image: string | null }) => ({
          collectionId: collectionId,
          name: item.name,
          number: item.number,
          notes: item.notes,
          image: item.image,
          isOwned: false,
        })),
      })
    }

    // Update existing items' images and notes if they changed in the recommended collection
    // Only update if preserveCustomizations is false, or if the item wasn't customized
    const itemsToUpdate: Array<{ id: string; image: string | null; notes: string | null }> = []
    for (const recommendedItem of recommendedCollection.items) {
      const key = `${recommendedItem.number || ''}-${recommendedItem.name}`
      const existingItem = existingItemsMap.get(key)
      if (existingItem) {
        // Check if image or notes changed
        const imageChanged = (existingItem.image || null) !== (recommendedItem.image || null)
        const notesChanged = (existingItem.notes || null) !== (recommendedItem.notes || null)
        
        if (imageChanged || notesChanged) {
          itemsToUpdate.push({
            id: existingItem.id,
            image: recommendedItem.image || null,
            notes: recommendedItem.notes || null,
          })
        }
      }
    }

    // Update items in parallel
    if (itemsToUpdate.length > 0) {
      await Promise.all(
        itemsToUpdate.map((item: { id: string; image: string | null; notes: string | null }) =>
          prisma.item.update({
            where: { id: item.id },
            data: {
              image: item.image,
              notes: item.notes,
            },
          })
        )
      )
    }

    // Fetch the updated collection with items
    const finalCollection = await prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        items: {
          orderBy: [
            { number: 'asc' },
            { name: 'asc' },
          ],
        },
      },
    })

    return NextResponse.json(finalCollection)
  } catch (error) {
    console.error('Error syncing collection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


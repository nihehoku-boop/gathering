import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'
import { checkAllAchievements } from '@/lib/achievement-checker'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const format = formData.get('format') as string || 'json'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const fileContent = await file.text()
    let collections: any[] = []

    if (format === 'json' || file.name.endsWith('.json')) {
      // Parse JSON
      try {
        const data = JSON.parse(fileContent)
        console.log('Parsed JSON data structure:', {
          hasCollections: !!data.collections,
          hasCollection: !!data.collection,
          hasItems: !!data.items,
          isArray: Array.isArray(data),
          collectionsType: Array.isArray(data.collections),
          collectionsLength: data.collections?.length,
          keys: Object.keys(data),
          dataType: typeof data,
        })
        
        // Handle different export formats:
        // 1. All collections export: { exportedAt: "...", collections: [...] }
        // 2. Single collection export: { collection: {...}, items: [...] }
        // 3. Array of collections: [...]
        
        if (data.collections && Array.isArray(data.collections)) {
          // Format: All collections export
          collections = data.collections
          console.log(`Found ${collections.length} collections in data.collections`)
        } else if (data.collection && data.items) {
          // Format: Single collection export - convert to collections array format
          collections = [{
            name: data.collection.name,
            description: data.collection.description,
            category: data.collection.category,
            coverImage: data.collection.coverImage,
            coverImageAspectRatio: data.collection.coverImageAspectRatio,
            tags: data.collection.tags || [],
            items: data.items || [],
          }]
          console.log(`Found single collection export: ${collections[0].name} with ${collections[0].items.length} items`)
        } else if (Array.isArray(data)) {
          // Format: Array of collections
          collections = data
          console.log(`Found ${collections.length} collections in root array`)
        } else {
          console.error('Invalid JSON structure. Data:', JSON.stringify(data, null, 2).substring(0, 500))
          return NextResponse.json({ 
            error: 'Invalid JSON format', 
            details: `Expected one of: (1) object with "collections" array, (2) object with "collection" and "items", or (3) array of collections. Found: ${typeof data}. Keys: ${Object.keys(data).join(', ')}` 
          }, { status: 400 })
        }
        
        // Validate collections array
        if (collections.length === 0) {
          console.error('Collections array is empty after parsing')
          return NextResponse.json({ 
            error: 'No collections found in file', 
            details: 'The file was parsed successfully but contains no collections. Please check that the file was exported from Sammlerei.' 
          }, { status: 400 })
        }
        
        // Validate collection structure
        const invalidCollections = collections.filter((c: any) => !c || typeof c !== 'object' || !c.name)
        if (invalidCollections.length > 0) {
          console.warn(`Found ${invalidCollections.length} invalid collections in the array`)
        }
      } catch (error) {
        console.error('JSON parse error:', error)
        console.error('File content preview:', fileContent.substring(0, 200))
        return NextResponse.json({ 
          error: 'Invalid JSON file', 
          details: error instanceof Error ? error.message : 'Parse error' 
        }, { status: 400 })
      }
    } else if (format === 'csv' || file.name.endsWith('.csv')) {
      // Parse CSV - basic CSV parser for exported format
      const lines = fileContent.split('\n')
      let currentCollection: any = null
      let inItems = false
      let headers: string[] = []

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line || line === '---') {
          if (currentCollection) {
            collections.push(currentCollection)
            currentCollection = null
            inItems = false
          }
          continue
        }

        if (line.startsWith('Collection:')) {
          if (currentCollection) {
            collections.push(currentCollection)
          }
          currentCollection = {
            name: line.replace('Collection:', '').trim(),
            description: '',
            category: '',
            items: [],
          }
          inItems = false
        } else if (line.startsWith('Description:')) {
          if (currentCollection) {
            currentCollection.description = line.replace('Description:', '').trim()
          }
        } else if (line.startsWith('Category:')) {
          if (currentCollection) {
            currentCollection.category = line.replace('Category:', '').trim()
          }
        } else if (line.includes('Number,Name,Owned')) {
          headers = line.split(',').map(h => h.trim())
          inItems = true
        } else if (inItems && currentCollection && line) {
          // Parse CSV row
          const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
          if (values.length >= 2) {
            const item: any = {
              name: values[1] || '',
              number: values[0] ? parseInt(values[0]) || null : null,
              isOwned: values[2]?.toLowerCase() === 'yes' || values[2] === 'true',
              image: values[3] || null,
              notes: values[5] || null,
              wear: values[6] || null,
              personalRating: values[7] ? parseInt(values[7]) || null : null,
              logDate: values[8] ? new Date(values[8]).toISOString() : null,
            }
            
            // Parse alternative images
            if (values[4]) {
              try {
                item.alternativeImages = values[4].split(';').map((img: string) => img.trim()).filter(Boolean)
              } catch {
                item.alternativeImages = []
              }
            } else {
              item.alternativeImages = []
            }
            
            currentCollection.items.push(item)
          }
        }
      }

      if (currentCollection) {
        collections.push(currentCollection)
      }
    } else {
      return NextResponse.json({ error: 'Unsupported file format. Please use JSON or CSV.' }, { status: 400 })
    }

    // This check is now done earlier in JSON parsing, but keep it as a safety check
    if (collections.length === 0) {
      console.error('No collections found after parsing. File format may be incorrect.')
      return NextResponse.json({ 
        error: 'No collections found in file', 
        details: 'The file was parsed but contains no valid collections. Please ensure you are importing a file exported from Sammlerei.' 
      }, { status: 400 })
    }
    
    console.log(`Processing ${collections.length} collections for import`)

    // Create collections
    const createdCollections = []
    const errors: string[] = []
    
    for (const collectionData of collections) {
      try {
        // Handle tags - can be array or already stringified
        let tagsString = '[]'
        if (collectionData.tags) {
          if (Array.isArray(collectionData.tags)) {
            tagsString = JSON.stringify(collectionData.tags)
          } else if (typeof collectionData.tags === 'string') {
            // Try to parse if it's a JSON string
            try {
              const parsed = JSON.parse(collectionData.tags)
              tagsString = Array.isArray(parsed) ? collectionData.tags : '[]'
            } catch {
              tagsString = '[]'
            }
          }
        }

        // Handle alternativeImages - can be array or already stringified
        const processAlternativeImages = (altImages: any): string => {
          if (!altImages) return '[]'
          if (Array.isArray(altImages)) {
            return JSON.stringify(altImages)
          }
          if (typeof altImages === 'string') {
            try {
              const parsed = JSON.parse(altImages)
              return Array.isArray(parsed) ? altImages : '[]'
            } catch {
              return '[]'
            }
          }
          return '[]'
        }

        const newCollection = await prisma.collection.create({
          data: {
            name: collectionData.name || 'Imported Collection',
            description: collectionData.description || null,
            category: collectionData.category || null,
            coverImage: collectionData.coverImage || null,
            coverImageAspectRatio: collectionData.coverImageAspectRatio || null,
            tags: tagsString,
            userId: session.user.id,
            items: {
              create: (collectionData.items || []).map((item: any) => ({
                name: item.name || 'Unnamed Item',
                number: item.number !== undefined && item.number !== null ? (typeof item.number === 'number' ? item.number : parseInt(String(item.number))) : null,
                isOwned: item.isOwned === true || item.isOwned === 'true' || item.isOwned === 'Yes',
                image: item.image || null,
                alternativeImages: processAlternativeImages(item.alternativeImages),
                notes: item.notes || null,
                wear: item.wear || null,
                personalRating: item.personalRating !== undefined && item.personalRating !== null ? (typeof item.personalRating === 'number' ? item.personalRating : parseInt(String(item.personalRating))) : null,
                logDate: item.logDate ? (item.logDate instanceof Date ? item.logDate : new Date(item.logDate)) : null,
              })),
            },
          },
          include: {
            items: true,
          },
        })
        createdCollections.push(newCollection)
        console.log(`Successfully imported collection: ${newCollection.name} with ${newCollection.items.length} items`)
      } catch (error) {
        const errorMsg = `Failed to import collection "${collectionData.name}": ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error('Error creating collection:', collectionData.name, error)
        errors.push(errorMsg)
        // Continue with other collections even if one fails
      }
    }

    if (createdCollections.length === 0) {
      return NextResponse.json({ 
        error: 'No collections were imported', 
        details: errors.length > 0 ? errors.join('; ') : 'All collections failed to import. Please check the file format and try again.' 
      }, { status: 400 })
    }

    // If some succeeded but some failed, return success with warnings
    if (errors.length > 0) {
      console.warn('Some collections failed to import:', errors)
    }

    // Check and unlock achievements
    const newlyUnlocked = await checkAllAchievements(session.user.id)

    return NextResponse.json({
      success: true,
      collections: createdCollections,
      count: createdCollections.length,
      totalItems: createdCollections.reduce((sum, c) => sum + c.items.length, 0),
      newlyUnlockedAchievements: newlyUnlocked,
    }, { status: 201 })
  } catch (error) {
    console.error('Error importing collections:', error)
    return NextResponse.json(
      { error: 'Failed to import collections', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}


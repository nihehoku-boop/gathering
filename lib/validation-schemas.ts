import { z } from 'zod'

// Collection schemas
export const createCollectionSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  description: z.string().max(2000).trim().nullable().optional(),
  category: z.string().max(100).trim().nullable().optional(),
  folderId: z.string().uuid().nullable().optional(),
  template: z.string().max(50).optional(),
  customFieldDefinitions: z.union([z.string(), z.array(z.any())]).optional(),
  coverImage: z.string().url().nullable().optional(),
  coverImageAspectRatio: z.string().max(20).nullable().optional(),
  coverImageFit: z.enum(['cover', 'contain']).optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  items: z.array(z.any()).optional(),
})

export const updateCollectionSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(2000).trim().nullable().optional(),
  category: z.string().max(100).trim().nullable().optional(),
  folderId: z.string().uuid().nullable().optional(),
  template: z.string().max(50).optional(),
  customFieldDefinitions: z.union([z.string(), z.array(z.any())]).optional(),
  coverImage: z.string().url().nullable().optional(),
  coverImageAspectRatio: z.string().max(20).nullable().optional(),
  coverImageFit: z.enum(['cover', 'contain']).optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
})

// Item schemas
export const createItemSchema = z.object({
  collectionId: z.string().uuid(),
  name: z.string().min(1).max(500).trim(),
  number: z.number().int().positive().nullable().optional(),
  image: z.string().url().nullable().optional(),
})

export const updateItemSchema = z.object({
  isOwned: z.boolean().optional(),
  name: z.string().min(1).max(500).trim().optional(),
  notes: z.string().max(5000).trim().nullable().optional(),
  image: z.string().url().nullable().optional(),
  alternativeImages: z.array(z.string().url()).optional(),
  wear: z.string().max(50).trim().nullable().optional(),
  personalRating: z.number().int().min(1).max(10).nullable().optional(),
  logDate: z.string().nullable().optional(),
  customFields: z.record(z.string(), z.any()).optional(),
})

export const bulkItemsSchema = z.object({
  itemIds: z.array(z.string().uuid()).min(1).max(1000),
  updates: z.object({
    isOwned: z.boolean().optional(),
  }).optional(),
})

export const createBulkItemsSchema = z.object({
  collectionId: z.string().uuid(),
  items: z.array(z.object({
    name: z.string().min(1).max(500).trim(),
    number: z.number().int().positive().nullable().optional(),
    customFields: z.record(z.string(), z.any()).optional(),
  })).min(1).max(1000),
})

// Wishlist schemas
export const updateWishlistSchema = z.object({
  name: z.string().max(200).trim().optional(),
  description: z.string().max(2000).trim().nullable().optional(),
  isPublic: z.boolean().optional(),
})

export const addWishlistItemsSchema = z.object({
  items: z.array(z.object({
    itemId: z.string().uuid().nullable().optional(),
    collectionId: z.string().uuid().nullable().optional(),
    itemName: z.string().min(1).max(500).trim(),
    itemNumber: z.number().int().positive().nullable().optional(),
    itemImage: z.string().url().nullable().optional(),
    collectionName: z.string().max(200).trim().nullable().optional(),
    notes: z.string().max(5000).trim().nullable().optional(),
  })).min(1).max(100),
})

// Folder schemas
export const createFolderSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  parentId: z.string().uuid().nullable().optional(),
})

export const updateFolderSchema = z.object({
  name: z.string().min(1).max(200).trim(),
})

// Search schema
export const searchQuerySchema = z.object({
  q: z.string().min(2).max(200).trim(),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  page: z.coerce.number().int().min(1).default(1).optional(),
})

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
  name: z.string().max(200).trim().optional(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email().max(255),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
})

// Admin schemas
export const extractFromUrlSchema = z.object({
  url: z.string().url().max(2000),
})

// Collection sync schema
export const syncCollectionSchema = z.object({
  preserveCustomizations: z.boolean().optional(),
})

// Collection share schema
export const updateCollectionShareSchema = z.object({
  isPublic: z.boolean().optional(),
})

// Collection move schema
export const moveCollectionSchema = z.object({
  folderId: z.string().uuid().nullable(),
})

// Helper function to validate request body
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string; status: number }> {
  try {
    const body = await request.json()
    const data = schema.parse(body)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
        status: 400,
      }
    }
    return {
      success: false,
      error: 'Invalid request body',
      status: 400,
    }
  }
}

// Helper function to validate query parameters
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string; status: number } {
  try {
    const params = Object.fromEntries(searchParams.entries())
    const data = schema.parse(params)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
        status: 400,
      }
    }
    return {
      success: false,
      error: 'Invalid query parameters',
      status: 400,
    }
  }
}


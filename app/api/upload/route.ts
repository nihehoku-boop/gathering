import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary (only if credentials exist)
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
    api_key: process.env.CLOUDINARY_API_KEY.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
  })
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary not configured:', {
        hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
        hasApiKey: !!process.env.CLOUDINARY_API_KEY,
        hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
      })
      return NextResponse.json(
        { error: 'Image upload is not configured. Please set up Cloudinary environment variables.' },
        { status: 500 }
      )
    }
    
    console.log('Cloudinary config check passed, cloud_name:', process.env.CLOUDINARY_CLOUD_NAME)

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary with optimization
    console.log('Starting Cloudinary upload, file size:', buffer.length, 'bytes')
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'gathering', // Organize uploads in a folder
            resource_type: 'image',
            transformation: [
              {
                quality: 'auto', // Automatic quality optimization
                fetch_format: 'auto', // Auto WebP/AVIF when supported
              },
            ],
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error)
              reject(error)
            } else {
              console.log('Cloudinary upload success:', result?.public_id)
              resolve(result)
            }
          }
        )
        .end(buffer)
    })

    const result = uploadResult as any

    return NextResponse.json({
      url: result.secure_url, // Use HTTPS URL
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = error instanceof Error ? error.stack : String(error)
    console.error('Error details:', errorDetails)
    
    // Check if it's a Cloudinary authentication error
    if (errorMessage.includes('Invalid API Key') || errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('Invalid signature')) {
      return NextResponse.json(
        { 
          error: 'Cloudinary authentication failed', 
          details: 'Please check your Cloudinary API credentials in the .env file. Make sure the cloud name, API key, and API secret are correct.' 
        },
        { status: 401 }
      )
    }
    
    // Check for other common Cloudinary errors
    if (errorMessage.includes('Invalid cloud_name') || errorMessage.includes('Cloud name')) {
      return NextResponse.json(
        { 
          error: 'Invalid Cloudinary cloud name', 
          details: 'Please check your CLOUDINARY_CLOUD_NAME in the .env file. Cloud names are usually lowercase and cannot contain spaces.' 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to upload image', details: errorMessage },
      { status: 500 }
    )
  }
}


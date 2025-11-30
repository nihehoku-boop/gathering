# Cloudinary Image Upload Setup

This guide explains how to set up Cloudinary for image uploads in the Gathering app.

## Why Cloudinary?

- **Free Tier**: 25GB storage, 25GB bandwidth/month (generous for most users)
- **Automatic Optimization**: Images are automatically compressed and optimized
- **CDN Included**: Fast global delivery
- **Format Conversion**: Automatically serves WebP/AVIF when supported by browsers
- **Easy Integration**: Simple API and Next.js integration

## Setup Steps

### 1. Create a Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email

### 2. Get Your API Credentials

1. After logging in, go to your [Dashboard](https://console.cloudinary.com/console)
2. You'll see your credentials:
   - **Cloud Name** (e.g., `your-cloud-name`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz`)

### 3. Add Environment Variables

Add these to your `.env` file (or `.env.local`):

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Important**: Never commit your `.env` file to git! The `.env` file should already be in `.gitignore`.

### 4. Restart Your Development Server

After adding the environment variables, restart your Next.js server:

```bash
npm run dev
```

## How It Works

1. **Upload**: When users upload an image, it's sent to `/api/upload`
2. **Processing**: Cloudinary automatically optimizes the image (compression, format conversion)
3. **Storage**: Image is stored in Cloudinary's cloud storage
4. **CDN**: Image is served via Cloudinary's global CDN for fast loading
5. **URL**: The optimized image URL is returned and saved to your database

## Features

- **Automatic Optimization**: Images are compressed without visible quality loss
- **Format Conversion**: Served as WebP/AVIF when supported (smaller file sizes)
- **Responsive Images**: Can be resized on-the-fly for different screen sizes
- **Max File Size**: 10MB per upload (configurable in `ImageUpload.tsx`)
- **File Type Validation**: Only image files are accepted

## Cost

- **Free Tier**: 25GB storage, 25GB bandwidth/month
- **Paid Plans**: Start at $89/month for 100GB storage, 100GB bandwidth
- **Pay-as-you-go**: $0.10/GB for storage, $0.40/GB for bandwidth (after free tier)

For most personal/small projects, the free tier is more than enough!

## Troubleshooting

### "Image upload is not configured"
- Make sure all three environment variables are set
- Restart your server after adding environment variables

### Upload fails
- Check that your API credentials are correct
- Verify your Cloudinary account is active
- Check the browser console for error messages

### Images not loading
- Check that the returned URL is valid
- Verify Cloudinary is serving the image (try opening the URL directly)

## Alternative: Local Storage (Development Only)

If you want to test without Cloudinary, you can modify `/app/api/upload/route.ts` to save files locally. However, this is **not recommended for production** as:
- Files are lost on redeploy
- No CDN (slower loading)
- No automatic optimization
- Not scalable

For production, always use a cloud storage service like Cloudinary.




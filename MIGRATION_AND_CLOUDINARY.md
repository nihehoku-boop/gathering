# Migration & Cloudinary Setup Guide

## ✅ Collections Migration - COMPLETE!

Your local collections have been successfully migrated to production:
- **6 collections** migrated
- **728 items** total migrated
- Collections include: Astérix & Obélix FR, Lucky Luke, Lustiges Taschenbuch, and more

You can now see all your collections at: https://gathering-jade.vercel.app

---

## 📸 Cloudinary Setup

Cloudinary is already integrated in the code. You just need to add your credentials.

### Step 1: Create Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Click "Sign Up for Free"
3. Sign up with your email
4. Verify your email address

### Step 2: Get Your API Credentials

1. After logging in, you'll be taken to your [Dashboard](https://console.cloudinary.com/console)
2. On the dashboard, you'll see:
   - **Cloud Name** (e.g., `dxyz123abc`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

### Step 3: Add to Vercel Environment Variables

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your `gathering` project
3. Go to **Settings** → **Environment Variables**
4. Add these three variables (for all environments: Production, Preview, Development):

   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name-here
   CLOUDINARY_API_KEY=your-api-key-here
   CLOUDINARY_API_SECRET=your-api-secret-here
   ```

5. Click **Save** for each variable

### Step 4: Redeploy

After adding the environment variables:

1. Go to **Deployments** tab
2. Click the three dots (⋯) on the latest deployment
3. Select **Redeploy**
4. Wait for the deployment to complete

### Step 5: Test Image Upload

1. Go to https://gathering-jade.vercel.app
2. Sign in to your account
3. Edit a collection or item
4. Try uploading an image
5. It should now work! 🎉

---

## Cloudinary Free Tier Benefits

- **25GB storage** - Plenty for thousands of images
- **25GB bandwidth/month** - Good for moderate traffic
- **Automatic optimization** - Images are compressed automatically
- **CDN included** - Fast global delivery
- **Format conversion** - Automatically serves WebP/AVIF when supported

---

## Troubleshooting

### "Image upload is not configured"
- Make sure all three Cloudinary environment variables are set in Vercel
- Make sure you redeployed after adding the variables
- Check that the values are correct (no extra spaces)

### Upload fails
- Verify your Cloudinary account is active
- Check that your API credentials are correct
- Check the browser console (F12) for error messages

### Images not loading
- Check that the returned URL is valid
- Try opening the Cloudinary URL directly in a browser
- Verify your Cloudinary account hasn't exceeded limits

---

## Next Steps

1. ✅ Collections migrated - **DONE**
2. ⏳ Set up Cloudinary (follow steps above)
3. 🎉 Start using your production app!

Your app is live at: https://gathering-jade.vercel.app



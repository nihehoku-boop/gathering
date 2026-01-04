# Logo Image Setup Instructions

## Image File Required

Please add your open treasure chest image to the `public` folder with the name:
**`logo-icon.png`**

The image should be:
- PNG format (or we can use SVG if you have it)
- Transparent background preferred
- High quality (will be scaled down for display)

## After Adding the Image

The following files are already set up to use the new logo:
- `components/LogoIcon.tsx` - Component that loads the image
- All icon usages have been updated to use LogoIcon instead of TreasureChest SVG
- Favicon will be updated to use this image

## Alternative: If You Have SVG Version

If you have an SVG version of the treasure chest, you can:
1. Save it as `logo-icon.svg` in the `public` folder
2. Update `components/LogoIcon.tsx` to use `.svg` extension instead of `.png`

## File Locations Where Logo Is Used

Once the image is added, it will appear in:
- Sidebar header (logo)
- Navbar mobile logo
- Landing page navigation
- Empty state (collections list)
- Onboarding tour
- "Your Collections" section in sidebar


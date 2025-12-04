/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure cheerio and other server-only packages are not bundled on client
  serverExternalPackages: ['cheerio', 'undici'],
  // Configure Turbopack (Next.js 16 default)
  turbopack: {
    // Empty config to silence the error - webpack config will be used as fallback
  },
  // Use webpack for builds (fallback for compatibility)
  webpack: (config, { isServer }) => {
    // Exclude undici from bundling (it's a Node.js internal package)
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push('undici')
    }
    return config
  },
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'weltbild.scene7.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.tcgdx.net',
      },
      {
        protocol: 'https',
        hostname: 'assets.tcgdex.net',
      },
      {
        protocol: 'https',
        hostname: 'cards.scryfall.io',
      },
      {
        protocol: 'https',
        hostname: 'api.scryfall.com',
      },
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org', // Added for book cover images
      },
      {
        protocol: 'https',
        hostname: 'image.tmdb.org', // Added for TMDB movie poster images
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Compression
  compress: true,
  // Performance optimizations
  experimental: {
    optimizeCss: true,
  },
}

module.exports = nextConfig


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
        protocol: 'https',
        hostname: 'www.themoviedb.org', // Added for TMDB logo attribution
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
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel.app",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://*.vercel.app https://*.cloudinary.com https://*.resend.com https://*.tcgdx.net https://*.tcgdex.net https://api.scryfall.com https://image.tmdb.org https://covers.openlibrary.org",
              "frame-src 'self' https://vercel.live",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join('; ')
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig


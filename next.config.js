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
}

module.exports = nextConfig


/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure cheerio and other server-only packages are not bundled on client
  serverExternalPackages: ['cheerio', 'undici'],
  // Use webpack for builds to avoid Turbopack issues
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


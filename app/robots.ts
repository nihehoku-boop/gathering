import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://gathering-jade.vercel.app'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/auth/',
          '/profile/',
          '/collections/',
          '/wishlist/',
          '/statistics/',
          '/settings/',
        ],
      },
      // Allow AI crawlers (ChatGPT, Claude, etc.) to access more content
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'CCBot', 'anthropic-ai', 'Claude-Web', 'Google-Extended'],
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/auth/',
          '/settings/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}


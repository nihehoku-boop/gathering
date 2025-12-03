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
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}


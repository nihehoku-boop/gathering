import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { getAllCollectSlugs } from '@/lib/collect-pages'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://colletro.com'

  // Only include URLs that are crawlable without login (no redirect to signin).
  // community, recommended, leaderboard require auth and redirect — listing them
  // caused Google to waste crawl budget and see only one real page.
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/auth/signin`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  const collectUrls: MetadataRoute.Sitemap = getAllCollectSlugs().map((slug) => ({
    url: `${baseUrl}/collect/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  let blogUrls: MetadataRoute.Sitemap = []
  try {
    const blogPosts = await prisma.blogPost.findMany({
      where: {
        published: true,
        publishedAt: { not: null },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })
    blogUrls = blogPosts.map((post: { slug: string; updatedAt: Date }) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch {
    // If DB unavailable at build/crawl time, still return static URLs
  }

  return [...staticUrls, ...collectUrls, ...blogUrls]
}


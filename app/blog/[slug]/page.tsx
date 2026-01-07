import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Calendar, User, ArrowLeft, Tag } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface BlogPostPageProps {
  params: Promise<{ slug: string }> | { slug: string }
}

export async function generateMetadata(
  { params }: BlogPostPageProps
): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params)
  const post = await prisma.blogPost.findUnique({
    where: { slug: resolvedParams.slug },
    include: { author: { select: { name: true } } },
  })

  if (!post || !post.published || !post.publishedAt) {
    return {
      title: 'Post Not Found - Colletro Blog',
    }
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'https://gathering-jade.vercel.app'
  const title = post.metaTitle || post.title
  const description = post.metaDescription || post.excerpt || 'Read more on Colletro Blog'

  return {
    title: `${title} - Colletro Blog`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.publishedAt.toISOString(),
      authors: post.author.name ? [post.author.name] : undefined,
      images: post.featuredImage ? [post.featuredImage] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.featuredImage ? [post.featuredImage] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await Promise.resolve(params)
  const post = await prisma.blogPost.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  })

  if (!post || !post.published || !post.publishedAt) {
    notFound()
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'https://gathering-jade.vercel.app'

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.metaDescription,
    image: post.featuredImage || `${baseUrl}/og-image.png`,
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author.name || 'Colletro Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Colletro',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo-icon.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${post.slug}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Sidebar />
      <Navbar />
      <main className="min-h-screen bg-[var(--bg-primary)] lg:ml-64">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12 max-w-4xl">
          <Link href="/blog">
            <Button
              variant="ghost"
              className="mb-6 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>

          <article className="space-y-6">
            {post.featuredImage && (
              <div className="aspect-video w-full overflow-hidden rounded-lg">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <header className="space-y-4">
              {post.category && (
                <span className="inline-block px-3 py-1 bg-[var(--bg-tertiary)] rounded text-sm text-[var(--accent-color)]">
                  {post.category}
                </span>
              )}
              <h1 className="text-4xl sm:text-5xl font-semibold text-[var(--text-primary)] tracking-tight">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="text-xl text-[var(--text-secondary)]">
                  {post.excerpt}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                {post.publishedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={post.publishedAt.toISOString()}>
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  </div>
                )}
                {post.author.name && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{post.author.name}</span>
                  </div>
                )}
              </div>
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {post.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded flex items-center gap-1"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
              <CardContent className="pt-6 prose prose-invert max-w-none">
                <div
                  className="blog-content text-[var(--text-primary)]"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                  style={{
                    lineHeight: '1.75',
                  }}
                />
              </CardContent>
            </Card>
          </article>
        </div>
      </main>
    </>
  )
}


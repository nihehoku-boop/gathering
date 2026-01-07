import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Calendar, User, Tag } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Blog - Colletro',
  description: 'Collection management tips, guides, and updates from Colletro',
  openGraph: {
    title: 'Blog - Colletro',
    description: 'Collection management tips, guides, and updates from Colletro',
    type: 'website',
  },
}

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: {
      published: true,
      publishedAt: { not: null },
    },
    include: {
      author: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      publishedAt: 'desc',
    },
  })

  const categories = Array.from(new Set(posts.map(p => p.category).filter(Boolean)))

  return (
    <>
      <Sidebar />
      <Navbar />
      <main className="min-h-screen bg-[var(--bg-primary)] lg:ml-64">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-semibold text-[var(--text-primary)] mb-3 tracking-tight">
              Blog
            </h1>
            <p className="text-[var(--text-secondary)] text-lg">
              Collection management tips, guides, and updates
            </p>
          </div>

          {posts.length === 0 ? (
            <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
              <CardContent className="pt-6">
                <p className="text-[var(--text-secondary)] text-center">
                  No blog posts yet. Check back soon!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="block hover:opacity-90 smooth-transition"
                >
                  <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)] h-full hover:border-[var(--accent-color)] smooth-transition">
                    {post.featuredImage && (
                      <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-2">
                        {post.category && (
                          <span className="px-2 py-1 bg-[var(--bg-tertiary)] rounded text-[var(--accent-color)]">
                            {post.category}
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-[var(--text-primary)] line-clamp-2">
                        {post.title}
                      </CardTitle>
                      {post.excerpt && (
                        <CardDescription className="text-[var(--text-secondary)] line-clamp-3">
                          {post.excerpt}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                        {post.publishedAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
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
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{post.author.name}</span>
                          </div>
                        )}
                      </div>
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}


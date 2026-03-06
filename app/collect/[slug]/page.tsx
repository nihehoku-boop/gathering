import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCollectPageBySlug, getAllCollectSlugs } from '@/lib/collect-pages'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'

interface Props {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getAllCollectSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const config = getCollectPageBySlug(slug)
  if (!config) return { title: 'Collect – Colletro' }
  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    openGraph: {
      title: config.title,
      description: config.description,
    },
  }
}

export default async function CollectPage({ params }: Props) {
  const { slug } = await params
  const config = getCollectPageBySlug(slug)
  if (!config) notFound()

  return (
    <>
      <Sidebar />
      <Navbar />
      <div className="min-h-screen bg-[var(--bg-primary)] lg:ml-64">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-color)] smooth-transition mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
            <h1 className="text-4xl sm:text-5xl font-semibold text-[var(--text-primary)] tracking-tight mb-2">
              {config.heading}
            </h1>
            <p className="text-[var(--text-secondary)] text-lg max-w-2xl">
              {config.subheading}
            </p>
          </div>

          <div className="max-w-3xl space-y-6">
            <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
              <CardContent className="pt-6 space-y-4">
                {config.body.map((paragraph, i) => (
                  <p key={i} className="text-[var(--text-secondary)] leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)] border-[var(--accent-color)]/30">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">Start tracking for free</CardTitle>
                <CardDescription className="text-[var(--text-secondary)]">
                  Create an account to build your collection, track progress, and discover recommended sets.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/auth/signup">
                  <Button className="accent-button text-white smooth-transition">
                    Get started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <p className="text-sm text-[var(--text-muted)]">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-[var(--accent-color)] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

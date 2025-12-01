'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Info } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

export default function AboutPage() {
  const router = useRouter()

  return (
    <>
      <Sidebar />
      <Navbar />
      <div className="min-h-screen bg-[#0f1114] lg:ml-64">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] smooth-transition"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <Info className="h-8 w-8 text-[#fafafa]" />
              <h1 className="text-5xl font-semibold text-[#fafafa] tracking-tight">About Gathering</h1>
            </div>
            <p className="text-[#969696] text-lg mb-10">
              Learn more about this collection management platform
            </p>
          </div>

          <div className="max-w-4xl space-y-6">
            <Card className="bg-[#1a1d24] border-[#2a2d35]">
              <CardHeader>
                <CardTitle className="text-[#fafafa]">What is Gathering?</CardTitle>
                <CardDescription className="text-[#969696]">
                  A modern platform for managing your collections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-[#969696]">
                <p>
                  Gathering is a comprehensive collection management platform designed to help you track, organize, and manage your various collections. Whether you collect comics, books, movies, games, or any other items, Gathering provides the tools you need to stay organized.
                </p>
                <p>
                  With features like progress tracking, tagging, recommended collections, and more, Gathering makes it easy to keep track of what you have and what you're still looking for.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1d24] border-[#2a2d35]">
              <CardHeader>
                <CardTitle className="text-[#fafafa]">Features</CardTitle>
                <CardDescription className="text-[#969696]">
                  What you can do with Gathering
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-[#969696]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent-color)] mt-1">•</span>
                    <span><strong className="text-[#fafafa]">Create Collections:</strong> Organize your items into custom collections with tags, descriptions, and cover images</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent-color)] mt-1">•</span>
                    <span><strong className="text-[#fafafa]">Track Progress:</strong> Mark items as owned and see your collection progress with visual progress bars</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent-color)] mt-1">•</span>
                    <span><strong className="text-[#fafafa]">Recommended Collections:</strong> Discover curated collections recommended by admins and add them to your account</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent-color)] mt-1">•</span>
                    <span><strong className="text-[#fafafa]">Auto-Updates:</strong> Get notified when recommended collections are updated and sync changes to your collections</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent-color)] mt-1">•</span>
                    <span><strong className="text-[#fafafa]">Customizable:</strong> Personalize your experience with accent colors and display preferences</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent-color)] mt-1">•</span>
                    <span><strong className="text-[#fafafa]">Bulk Import:</strong> Quickly add multiple items using numbered series, CSV, or manual lists</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1d24] border-[#2a2d35]">
              <CardHeader>
                <CardTitle className="text-[#fafafa]">Technology</CardTitle>
                <CardDescription className="text-[#969696]">
                  Built with modern web technologies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-[#969696]">
                <p>
                  Gathering is built using Next.js 14, React, TypeScript, Prisma, and SQLite. The platform features a modern, responsive design with a dark theme optimized for extended use.
                </p>
                <p>
                  Your data is stored securely and locally, giving you full control over your collections and privacy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}




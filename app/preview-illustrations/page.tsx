'use client'

import EmptyTroveIllustration from '@/components/illustrations/EmptyTroveIllustration'
import EmptyCollectionIllustration from '@/components/illustrations/EmptyCollectionIllustration'
import NoResultsIllustration from '@/components/illustrations/NoResultsIllustration'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function PreviewIllustrationsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">
            Empty State Illustrations Preview
          </h1>
          <p className="text-[var(--text-secondary)]">
            Preview of the new enhanced empty state illustrations
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Empty Trove Illustration */}
          <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)]">Empty Trove</CardTitle>
              <CardDescription>
                For: "Your trove is empty" (no collections)
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <EmptyTroveIllustration className="h-48 w-48" />
              <p className="text-sm text-[var(--text-muted)] mt-4 text-center">
                Closed treasure chest with lock and sparkles
              </p>
            </CardContent>
          </Card>

          {/* Empty Collection Illustration */}
          <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)]">Empty Collection</CardTitle>
              <CardDescription>
                For: "This collection is empty" (no items)
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <EmptyCollectionIllustration className="h-48 w-48" />
              <p className="text-sm text-[var(--text-muted)] mt-4 text-center">
                Open treasure chest with floating items
              </p>
            </CardContent>
          </Card>

          {/* No Results Illustration */}
          <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)]">No Results</CardTitle>
              <CardDescription>
                For: "No collections found" (search/filter)
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <NoResultsIllustration className="h-48 w-48" />
              <p className="text-sm text-[var(--text-muted)] mt-4 text-center">
                Magnifying glass with treasure map inside
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Size Variations */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6">
            Size Variations
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)] text-lg">Small (h-32 w-32)</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6">
                <EmptyTroveIllustration className="h-32 w-32" />
              </CardContent>
            </Card>

            <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)] text-lg">Medium (h-48 w-48)</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6">
                <EmptyTroveIllustration className="h-48 w-48" />
              </CardContent>
            </Card>

            <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)] text-lg">Large (h-64 w-64)</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6">
                <EmptyTroveIllustration className="h-64 w-64" />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Comparison Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6">
            All Three Together
          </h2>
          <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
            <CardContent className="flex flex-col md:flex-row items-center justify-around py-12 gap-8">
              <div className="flex flex-col items-center">
                <EmptyTroveIllustration className="h-40 w-40" />
                <p className="text-sm text-[var(--text-muted)] mt-4">Empty Trove</p>
              </div>
              <div className="flex flex-col items-center">
                <EmptyCollectionIllustration className="h-40 w-40" />
                <p className="text-sm text-[var(--text-muted)] mt-4">Empty Collection</p>
              </div>
              <div className="flex flex-col items-center">
                <NoResultsIllustration className="h-40 w-40" />
                <p className="text-sm text-[var(--text-muted)] mt-4">No Results</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 bg-[var(--bg-tertiary)] rounded-lg">
          <p className="text-sm text-[var(--text-secondary)]">
            <strong>Note:</strong> These illustrations use CSS variables and will adapt to your theme colors (accent color, gold color, etc.)
          </p>
        </div>
      </div>
    </div>
  )
}


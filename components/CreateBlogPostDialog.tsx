'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { X } from 'lucide-react'
import { useToast } from '@/components/Toaster'

interface CreateBlogPostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function CreateBlogPostDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateBlogPostDialogProps) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [tags, setTags] = useState('')
  const [category, setCategory] = useState('')
  const [published, setPublished] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !slug || !content) {
      toast.error('Title, slug, and content are required')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          excerpt: excerpt || null,
          content,
          featuredImage: featuredImage || null,
          metaTitle: metaTitle || null,
          metaDescription: metaDescription || null,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          category: category || null,
          published,
        }),
      })

      if (res.ok) {
        toast.success('Blog post created successfully')
        // Reset form
        setTitle('')
        setSlug('')
        setExcerpt('')
        setContent('')
        setFeaturedImage('')
        setMetaTitle('')
        setMetaDescription('')
        setTags('')
        setCategory('')
        setPublished(false)
        onOpenChange(false)
        onSuccess()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to create blog post')
      }
    } catch (error) {
      console.error('Error creating blog post:', error)
      toast.error('Failed to create blog post. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[var(--bg-secondary)] border-[var(--border-color)]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-[var(--text-primary)]">Create Blog Post</CardTitle>
            <CardDescription className="text-[var(--text-secondary)]">
              Create a new blog post for SEO and content marketing
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[var(--text-primary)]">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-primary)]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-[var(--text-primary)]">Slug *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(generateSlug(e.target.value))}
                  className="bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-primary)]"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt" className="text-[var(--text-primary)]">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-primary)]"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content" className="text-[var(--text-primary)]">Content * (HTML)</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-primary)] font-mono text-sm"
                rows={15}
                required
              />
              <p className="text-xs text-[var(--text-secondary)]">
                Enter HTML content. Use &lt;p&gt; for paragraphs, &lt;h2&gt; for headings, etc.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="featuredImage" className="text-[var(--text-primary)]">Featured Image URL</Label>
                <Input
                  id="featuredImage"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  className="bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-primary)]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-[var(--text-primary)]">Category</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-primary)]"
                  placeholder="e.g., Guides, Updates, Tips"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-[var(--text-primary)]">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-primary)]"
                placeholder="collection, organization, tips"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle" className="text-[var(--text-primary)]">SEO Title</Label>
                <Input
                  id="metaTitle"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-primary)]"
                  placeholder="Leave empty to use title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription" className="text-[var(--text-primary)]">SEO Description</Label>
                <Input
                  id="metaDescription"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-primary)]"
                  placeholder="Leave empty to use excerpt"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="published" className="text-[var(--text-primary)]">
                Publish immediately
              </Label>
            </div>
            <CardFooter className="flex justify-end gap-2 pt-4 px-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="accent-button text-white"
              >
                {submitting ? 'Creating...' : 'Create Post'}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
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
import { parseTags, stringifyTags } from '@/lib/tags'
import TagSelector from '@/components/TagSelector'
import { ITEM_TEMPLATES } from '@/lib/item-templates'
import { X, Maximize2, Minimize2 } from 'lucide-react'

interface CommunityCollection {
  id: string
  name: string
  description: string | null
  category: string | null
  template?: string | null
  coverImage: string | null
  coverImageFit?: string | null
  tags: string
}

interface EditCommunityCollectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collection: CommunityCollection | null
  onSuccess: () => void
}

export default function EditCommunityCollectionDialog({
  open,
  onOpenChange,
  collection,
  onSuccess,
}: EditCommunityCollectionDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [template, setTemplate] = useState<string>('custom')
  const [coverImage, setCoverImage] = useState('')
  const [coverImageFit, setCoverImageFit] = useState<string>('cover')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (collection) {
      setName(collection.name)
      setDescription(collection.description || '')
      setCategory(collection.category || '')
      setTemplate(collection.template || 'custom')
      setCoverImage(collection.coverImage || '')
      setCoverImageFit((collection as any).coverImageFit || 'cover')
      setSelectedTags(parseTags(collection.tags || '[]'))
    }
  }, [collection])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!collection) return

    setLoading(true)

    try {
      const res = await fetch(`/api/community-collections/${collection.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          description: description ? description.trim() : null, 
          category: category ? category.trim() : null,
          template: template || 'custom',
          coverImage: coverImage ? coverImage.trim() : null,
          coverImageFit: coverImageFit || 'cover',
          tags: stringifyTags(selectedTags),
        }),
      })

      if (res.ok) {
        onOpenChange(false)
        // Dispatch event to notify other components to refresh
        window.dispatchEvent(new CustomEvent('communityCollectionsUpdated'))
        onSuccess()
      } else {
        const error = await res.json()
        alert(`Error: ${error.error || 'Failed to update collection'}`)
      }
    } catch (error) {
      console.error('Error updating collection:', error)
      alert('Failed to update collection')
    } finally {
      setLoading(false)
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  if (!open || !collection) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] bg-[var(--bg-secondary)] border-[var(--border-color)] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-[var(--text-primary)]">Edit Community Collection</CardTitle>
          <CardDescription className="text-[var(--text-secondary)]">
            Update your community collection details
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <CardContent className="space-y-4 overflow-y-auto flex-1">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[var(--text-primary)]">Collection Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] smooth-transition"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-[var(--text-primary)]">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] smooth-transition"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template" className="text-[var(--text-primary)]">Item Template</Label>
              <select
                id="template"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full px-3 py-2 bg-[#2a2d35] border border-[#353842] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
              >
                {ITEM_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.icon} {t.name} - {t.description}
                  </option>
                ))}
              </select>
              <p className="text-xs text-[var(--text-muted)]">
                Choose a template to customize the fields available when editing items in this collection.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="coverImage" className="text-[var(--text-primary)]">Cover Image URL</Label>
              <Input
                id="coverImage"
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] smooth-transition"
              />
              {coverImage && (
                <div className="mt-2 relative group">
                  <div className="w-full h-48 overflow-hidden bg-[#2a2d35] rounded border border-[#2a2d35] relative">
                    <img
                      src={coverImage}
                      alt="Cover preview"
                      className={`w-full h-full ${coverImageFit === 'contain' ? 'object-contain' : 'object-cover'} rounded`}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setCoverImageFit(coverImageFit === 'cover' ? 'contain' : 'cover')}
                      className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full smooth-transition opacity-0 group-hover:opacity-100"
                      title={coverImageFit === 'cover' ? 'Switch to Fit (Contain)' : 'Switch to Fill (Cover)'}
                    >
                      {coverImageFit === 'cover' ? (
                        <Minimize2 className="h-4 w-4" />
                      ) : (
                        <Maximize2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-1 text-center">
                    {coverImageFit === 'cover' ? 'Fill (Cover) - Image fills box, may crop' : 'Fit (Contain) - Image fits in box, may have empty space'}
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-[var(--text-primary)]">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] smooth-transition"
              />
            </div>
            <TagSelector
              selectedTags={selectedTags}
              onChange={setSelectedTags}
              label="Tags"
              allowCustom={true}
            />
          </CardContent>
          <CardFooter className="flex justify-end gap-2 flex-shrink-0 border-t border-[var(--border-color)] pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#353842] text-[var(--text-primary)] hover:bg-[#2a2d35] smooth-transition"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="accent-button text-white smooth-transition"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}




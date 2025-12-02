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
import { AVAILABLE_TAGS, stringifyTags, getTagColor } from '@/lib/tags'
import { ITEM_TEMPLATES } from '@/lib/item-templates'
import { X } from 'lucide-react'

interface CreateRecommendedCollectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function CreateRecommendedCollectionDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateRecommendedCollectionDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [template, setTemplate] = useState<string>('custom')
  const [coverImage, setCoverImage] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/recommended-collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          description: description ? description.trim() : null, 
          category: category ? category.trim() : null,
          template: template || 'custom',
          coverImage: coverImage ? coverImage.trim() : null,
          tags: stringifyTags(selectedTags),
          isPublic,
        }),
      })

      if (res.ok) {
        setName('')
        setDescription('')
        setCategory('')
        setTemplate('custom')
        setCoverImage('')
        setSelectedTags([])
        onOpenChange(false)
        onSuccess()
      } else {
        const error = await res.json()
        alert(`Error: ${error.error || 'Failed to create collection'}`)
      }
    } catch (error) {
      console.error('Error creating collection:', error)
      alert('Failed to create collection')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-[#1a1d24] border-[#2a2d35]">
        <CardHeader>
          <CardTitle className="text-[#fafafa]">Create Recommended Collection</CardTitle>
          <CardDescription className="text-[#969696]">
            Add a new recommended collection that users can add to their account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#fafafa]">Collection Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Tintin, Lucky Luke"
                required
                className="bg-[#2a2d35] border-[#353842] text-[#fafafa] placeholder:text-[#666] focus:border-[#007AFF] smooth-transition"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-[#fafafa]">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Comics, Books"
                className="bg-[#2a2d35] border-[#353842] text-[#fafafa] placeholder:text-[#666] focus:border-[#007AFF] smooth-transition"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-[#fafafa]">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                rows={3}
                className="bg-[#2a2d35] border-[#353842] text-[#fafafa] placeholder:text-[#666] focus:border-[#007AFF] smooth-transition"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template" className="text-[#fafafa]">Item Template</Label>
              <select
                id="template"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full px-3 py-2 bg-[#2a2d35] border border-[#353842] rounded-md text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
              >
                {ITEM_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.icon} {t.name} - {t.description}
                  </option>
                ))}
              </select>
              <p className="text-xs text-[#666]">
                Choose a template to customize the fields available when editing items in this collection.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="coverImage" className="text-[#fafafa]">Cover Image URL</Label>
              <Input
                id="coverImage"
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="bg-[#2a2d35] border-[#353842] text-[#fafafa] placeholder:text-[#666] focus:border-[#007AFF] smooth-transition"
              />
              <p className="text-xs text-[#969696]">
                Optional: Add a URL to a cover image for this collection
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-[#fafafa]">Tags</Label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.map((tag) => {
                  const colors = getTagColor(tag)
                  const isSelected = selectedTags.includes(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (selectedTags.includes(tag)) {
                          setSelectedTags(selectedTags.filter(t => t !== tag))
                        } else {
                          setSelectedTags([...selectedTags, tag])
                        }
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm smooth-transition border ${
                        isSelected
                          ? 'opacity-100'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: isSelected ? colors.bg : '#2a2d35',
                        color: isSelected ? colors.text : '#fafafa',
                        borderColor: isSelected ? colors.border : '#353842',
                      }}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTags.map((tag) => {
                    const colors = getTagColor(tag)
                    return (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border"
                        style={{
                          backgroundColor: colors.bg,
                          color: colors.text,
                          borderColor: colors.border,
                        }}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                          className="hover:opacity-70 smooth-transition"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 rounded border-[#353842] bg-[#2a2d35] text-[var(--accent-color)] focus:ring-[var(--accent-color)]"
              />
              <Label htmlFor="isPublic" className="text-[#fafafa] cursor-pointer">
                Make this collection visible to all users
              </Label>
            </div>
            <p className="text-xs text-[#969696]">
              Leave unchecked to keep it hidden until you're ready to publish
            </p>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] smooth-transition"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="accent-button text-white smooth-transition"
            >
              {loading ? 'Creating...' : 'Create Collection'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}


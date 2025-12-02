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
import { X } from 'lucide-react'

interface CreateCommunityCollectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function CreateCommunityCollectionDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateCommunityCollectionDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/community-collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          description: description ? description.trim() : null, 
          category: category ? category.trim() : null, 
          coverImage: coverImage ? coverImage.trim() : null,
          tags: stringifyTags(selectedTags),
        }),
      })

      if (res.ok) {
        setName('')
        setDescription('')
        setCategory('')
        setCoverImage('')
        setSelectedTags([])
        onOpenChange(false)
        // Dispatch event to notify other components to refresh
        window.dispatchEvent(new CustomEvent('communityCollectionsUpdated'))
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

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] bg-[#1a1d24] border-[#2a2d35] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-[#fafafa]">Create Community Collection</CardTitle>
          <CardDescription className="text-[#969696]">
            Share a collection with the community
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <CardContent className="space-y-4 overflow-y-auto flex-1">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#fafafa]">Collection Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., My Favorite Comics"
                required
                className="bg-[#2a2d35] border-[#353842] text-[#fafafa] placeholder:text-[#666] focus:border-[var(--accent-color)] smooth-transition"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-[#fafafa]">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Comics, Books, Movies"
                className="bg-[#2a2d35] border-[#353842] text-[#fafafa] placeholder:text-[#666] focus:border-[var(--accent-color)] smooth-transition"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coverImage" className="text-[#fafafa]">Cover Image URL</Label>
              <Input
                id="coverImage"
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://example.com/cover.jpg"
                className="bg-[#2a2d35] border-[#353842] text-[#fafafa] placeholder:text-[#666] focus:border-[var(--accent-color)] smooth-transition"
              />
              {coverImage && (
                <div className="mt-2">
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="w-full h-48 object-cover rounded border border-[#2a2d35]"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-[#fafafa]">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your collection..."
                rows={3}
                className="bg-[#2a2d35] border-[#353842] text-[#fafafa] placeholder:text-[#666] focus:border-[var(--accent-color)] smooth-transition"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#fafafa]">Tags</Label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag)
                  const colors = getTagColor(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-sm smooth-transition border ${
                        isSelected ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: isSelected ? colors.bg : '#2a2d35',
                        color: isSelected ? colors.text : '#fafafa',
                        borderColor: isSelected ? colors.border : '#353842',
                      }}
                    >
                      {tag}
                      {isSelected && (
                        <X className="inline-block ml-1 h-3 w-3" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 flex-shrink-0 border-t border-[#2a2d35] pt-4">
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




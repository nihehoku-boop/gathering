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
import { stringifyTags } from '@/lib/tags'
import TagSelector from '@/components/TagSelector'
import { ITEM_TEMPLATES, type ItemTemplate } from '@/lib/item-templates'
import ImageUpload from './ImageUpload'
import { useToast } from '@/components/Toaster'
import { ChevronDown, ChevronUp, Info } from 'lucide-react'
import { AVAILABLE_CATEGORIES, normalizeCategory } from '@/lib/categories'

interface CreateCollectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function CreateCollectionDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateCollectionDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [folderId, setFolderId] = useState<string>('')
  const [folders, setFolders] = useState<Array<{ id: string; name: string }>>([])
  const [template, setTemplate] = useState<string>('custom')
  const [coverImage, setCoverImage] = useState('')
  const [coverImageFit, setCoverImageFit] = useState<string>('cover')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [showTemplatePreview, setShowTemplatePreview] = useState(false)
  const [showCoverImageUrl, setShowCoverImageUrl] = useState(false)
  const toast = useToast()

  useEffect(() => {
    fetchFolders()
  }, [])

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName('')
      setDescription('')
      setCategory('')
      setFolderId('')
      setTemplate('custom')
      setCoverImage('')
      setCoverImageFit('cover')
      setSelectedTags([])
      setShowTemplatePreview(false)
      setShowCoverImageUrl(false)
    }
  }, [open])

  const getSelectedTemplate = (): ItemTemplate | undefined => {
    return ITEM_TEMPLATES.find(t => t.id === template)
  }

  const fetchFolders = async () => {
    try {
      const res = await fetch('/api/folders')
      if (res.ok) {
        const data = await res.json()
        setFolders(data)
      }
    } catch (error) {
      console.error('Error fetching folders:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = { 
        name, 
        description, 
        category,
          folderId: folderId && folderId.trim() !== '' ? folderId.trim() : null,
          template: template || 'custom',
          coverImage: coverImage || null,
          coverImageFit: coverImageFit || 'cover',
          tags: stringifyTags(selectedTags),
      }
      
      console.log('Creating collection with payload:', payload)

      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success('Collection created successfully!')
        // Form reset is handled by useEffect when dialog closes
        onOpenChange(false)
        onSuccess()
      } else {
        const errorData = await res.json()
        toast.error(errorData.error || 'Failed to create collection')
      }
    } catch (error) {
      console.error('Error creating collection:', error)
      toast.error('An error occurred while creating the collection')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <Card className="w-full max-w-md max-h-[90vh] bg-[var(--bg-secondary)] border-[var(--border-color)] animate-scale-in flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-[var(--text-primary)]">Create New Collection</CardTitle>
          <CardDescription className="text-[var(--text-secondary)]">
            Add a new collection to track your items
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <CardContent className="space-y-4 overflow-y-auto flex-1 min-h-0">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[var(--text-primary)]">Collection Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Marvel Comics, Vintage Toys"
                required
                className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[#007AFF] smooth-transition"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-[var(--text-primary)]">Category</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-hover)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] smooth-transition"
                >
                  <option value="">Select a category</option>
                  {AVAILABLE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-[var(--text-muted)]">
                  Choose the main category for this collection
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="folder" className="text-[var(--text-primary)]">Folder</Label>
                <select
                  id="folder"
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2a2d35] border border-[#353842] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                >
                  <option value="">No Folder</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>
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
              <div className="flex items-center justify-between">
                <p className="text-xs text-[var(--text-muted)]">
                  Choose a template to customize the fields available when editing items.
                </p>
                <button
                  type="button"
                  onClick={() => setShowTemplatePreview(!showTemplatePreview)}
                  className="flex items-center gap-1 text-xs text-[var(--accent-color)] hover:text-[var(--accent-color-hover)] smooth-transition"
                >
                  <Info className="h-3 w-3" />
                  {showTemplatePreview ? 'Hide' : 'Preview'} Fields
                  {showTemplatePreview ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
              </div>
              {showTemplatePreview && getSelectedTemplate() && (
                <div className="mt-2 p-3 bg-[var(--bg-tertiary)] rounded-md border border-[var(--border-color)]">
                  <p className="text-sm font-medium text-[var(--text-primary)] mb-2">
                    {getSelectedTemplate()?.icon} {getSelectedTemplate()?.name} includes:
                  </p>
                  <ul className="space-y-1">
                    {getSelectedTemplate()?.fields.map((field) => (
                      <li key={field.id} className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)]"></span>
                        {field.label} {field.required && <span className="text-red-400">*</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-[var(--text-primary)]">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description of your collection"
                rows={3}
                className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[#007AFF] smooth-transition"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="coverImage" className="text-[var(--text-primary)]">Cover Image</Label>
                <button
                  type="button"
                  onClick={() => setShowCoverImageUrl(!showCoverImageUrl)}
                  className="text-xs text-[var(--accent-color)] hover:text-[var(--accent-color-hover)] smooth-transition"
                >
                  {showCoverImageUrl ? 'Use Upload' : 'Or enter URL'}
                </button>
              </div>
              {!showCoverImageUrl ? (
                <ImageUpload
                  value={coverImage || null}
                  onChange={(url) => setCoverImage(url || '')}
                  label=""
                  aspectRatio="2/3"
                  maxSize={10}
                />
              ) : (
                <Input
                  id="coverImage-url"
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[#007AFF] smooth-transition"
                />
              )}
              <div className="mt-2">
                <Label htmlFor="coverImageFit" className="text-sm text-[var(--text-primary)]">Image Fit</Label>
                <select
                  id="coverImageFit"
                  value={coverImageFit}
                  onChange={(e) => setCoverImageFit(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2a2d35] border border-[#353842] rounded-md text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] mt-1"
                >
                  <option value="cover">Fill (Cover) - Image fills the entire box, may be cropped</option>
                  <option value="contain">Fit (Contain) - Image fits within box, may have empty space</option>
                </select>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Choose how the cover image should be displayed in collection cards.
                </p>
              </div>
            </div>
            <TagSelector
              selectedTags={selectedTags}
              onChange={setSelectedTags}
              label="Tags"
              allowCustom={true}
            />
          </CardContent>
          <CardFooter className="flex justify-end gap-2 flex-shrink-0 border-t border-[var(--border-color)]">
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
              {loading ? 'Creating...' : 'Create Collection'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}


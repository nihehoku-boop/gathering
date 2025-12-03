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
import { stringifyTags, parseTags } from '@/lib/tags'
import TagSelector from '@/components/TagSelector'
import { ITEM_TEMPLATES, TemplateField } from '@/lib/item-templates'
import { X, Plus, Trash2, GripVertical } from 'lucide-react'
import ImageUpload from './ImageUpload'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface EditRecommendedCollectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collection: {
    id: string
    name: string
    description: string | null
    category: string | null
    template?: string | null
    customFieldDefinitions?: string | null
    coverImage: string | null
    coverImageFit?: string | null
    tags: string
  } | null
  onSuccess: () => void
}

export default function EditRecommendedCollectionDialog({
  open,
  onOpenChange,
  collection,
  onSuccess,
}: EditRecommendedCollectionDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [template, setTemplate] = useState<string>('custom')
  const [customFieldDefinitions, setCustomFieldDefinitions] = useState<TemplateField[]>([])
  const [coverImage, setCoverImage] = useState('')
  const [coverImageFit, setCoverImageFit] = useState<string>('cover')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null)
  const [newField, setNewField] = useState<Partial<TemplateField>>({
    id: '',
    label: '',
    type: 'text',
    placeholder: '',
    required: false,
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setCustomFieldDefinitions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  useEffect(() => {
    if (collection) {
      setName(collection.name)
      setDescription(collection.description || '')
      setCategory(collection.category || '')
      setTemplate(collection.template || 'custom')
      
      // Load custom field definitions
      if (collection.customFieldDefinitions) {
        try {
          const parsed = typeof collection.customFieldDefinitions === 'string'
            ? JSON.parse(collection.customFieldDefinitions)
            : collection.customFieldDefinitions
          setCustomFieldDefinitions(Array.isArray(parsed) ? parsed : [])
        } catch {
          setCustomFieldDefinitions([])
        }
      } else {
        setCustomFieldDefinitions([])
      }
      
      setCoverImage(collection.coverImage || '')
      setCoverImageFit((collection as any).coverImageFit || 'cover')
      setSelectedTags(parseTags(collection.tags || '[]'))
      setIsPublic((collection as any).isPublic || false)
    }
  }, [collection])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!collection) return

    setLoading(true)
    try {
      const res = await fetch(`/api/recommended-collections/${collection.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          description: description ? description.trim() : null, 
          category: category ? category.trim() : null,
          template: template || 'custom',
          customFieldDefinitions: JSON.stringify(customFieldDefinitions),
          coverImage: coverImage ? coverImage.trim() : null,
          coverImageFit: coverImageFit || 'cover',
          tags: stringifyTags(selectedTags),
          isPublic,
        }),
      })

      if (res.ok) {
        onOpenChange(false)
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

  // Sortable field item component
  function SortableFieldItem({ field, index }: { field: TemplateField; index: number }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: field.id })
    
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    }
    
    return (
      <div ref={setNodeRef} style={style} className="p-4 bg-[#2a2d35] rounded-md border border-[#353842] space-y-3">
        {editingFieldIndex === index ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-[#fafafa] text-sm">Field Label *</Label>
                <Input
                  value={newField.label || ''}
                  onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                  placeholder="e.g., Publisher, Author"
                  className="bg-[#1a1d24] border-[#353842] text-[#fafafa] text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#fafafa] text-sm">Field Type *</Label>
                <select
                  value={newField.type || 'text'}
                  onChange={(e) => setNewField({ ...newField, type: e.target.value as TemplateField['type'] })}
                  className="w-full px-3 py-2 bg-[#1a1d24] border border-[#353842] rounded-md text-[#fafafa] text-sm"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="select">Select (Dropdown)</option>
                  <option value="textarea">Textarea</option>
                </select>
              </div>
            </div>
            {newField.type === 'select' && (
              <div className="space-y-2">
                <Label className="text-[#fafafa] text-sm">Options (comma-separated) *</Label>
                <Input
                  value={newField.options?.join(', ') || ''}
                  onChange={(e) => setNewField({ ...newField, options: e.target.value.split(',').map(o => o.trim()).filter(Boolean) })}
                  placeholder="e.g., Option 1, Option 2, Option 3"
                  className="bg-[#1a1d24] border-[#353842] text-[#fafafa] text-sm"
                />
              </div>
            )}
            {(newField.type === 'number') && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-[#fafafa] text-sm">Min Value</Label>
                  <Input
                    type="number"
                    value={newField.min || ''}
                    onChange={(e) => setNewField({ ...newField, min: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="bg-[#1a1d24] border-[#353842] text-[#fafafa] text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#fafafa] text-sm">Max Value</Label>
                  <Input
                    type="number"
                    value={newField.max || ''}
                    onChange={(e) => setNewField({ ...newField, max: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="bg-[#1a1d24] border-[#353842] text-[#fafafa] text-sm"
                  />
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`required-${index}`}
                checked={newField.required || false}
                onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                className="w-4 h-4 rounded border-[#353842] bg-[#1a1d24] text-[var(--accent-color)]"
              />
              <Label htmlFor={`required-${index}`} className="text-[#fafafa] text-sm cursor-pointer">
                Required field
              </Label>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const updated = [...customFieldDefinitions]
                  updated[index] = {
                    id: field.id,
                    label: newField.label || '',
                    type: newField.type || 'text',
                    placeholder: newField.placeholder,
                    required: newField.required || false,
                    options: newField.type === 'select' ? newField.options : undefined,
                    min: newField.type === 'number' ? newField.min : undefined,
                    max: newField.type === 'number' ? newField.max : undefined,
                  }
                  setCustomFieldDefinitions(updated)
                  setEditingFieldIndex(null)
                  setNewField({ id: '', label: '', type: 'text' })
                }}
                disabled={!newField.label || !newField.type}
                className="border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] text-sm"
              >
                Save
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingFieldIndex(null)
                  setNewField({ id: '', label: '', type: 'text' })
                }}
                className="border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] text-sm"
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-[#666] hover:text-[#fafafa] p-1"
                title="Drag to reorder"
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <div className="flex-1">
                <div className="text-[#fafafa] font-medium">{field.label}</div>
                <div className="text-xs text-[#666]">
                  {field.type}
                  {field.required && ' • Required'}
                  {field.options && ` • ${field.options.length} options`}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingFieldIndex(index)
                  setNewField(field)
                }}
                className="text-[#666] hover:text-[#fafafa] hover:bg-[#1a1d24]"
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCustomFieldDefinitions(customFieldDefinitions.filter((_, i) => i !== index))
                }}
                className="text-[#FF3B30] hover:text-[#C0392B] hover:bg-[#1a1d24]"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!open || !collection) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] bg-[#1a1d24] border-[#2a2d35] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-[#fafafa]">Edit Recommended Collection</CardTitle>
          <CardDescription className="text-[#969696]">
            Update collection details, cover image, and tags
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
            
            {/* Custom Field Builder - only show for "custom" template */}
            {template === 'custom' && (
              <div className="space-y-4 pt-4 border-t border-[#2a2d35]">
                <div className="flex items-center justify-between">
                  <Label className="text-[#fafafa]">Custom Fields</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const fieldId = `field_${Date.now()}`
                      const newFieldDef: TemplateField = {
                        id: fieldId,
                        label: '',
                        type: 'text',
                        placeholder: '',
                        required: false,
                      }
                      setCustomFieldDefinitions([...customFieldDefinitions, newFieldDef])
                      setEditingFieldIndex(customFieldDefinitions.length)
                      setNewField(newFieldDef)
                    }}
                    className="border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] smooth-transition"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Field
                  </Button>
                </div>
                
                {customFieldDefinitions.length === 0 && (
                  <p className="text-sm text-[#666] italic">
                    No custom fields defined. Click "Add Field" to create custom fields for items in this collection.
                  </p>
                )}
                
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={customFieldDefinitions.map(f => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {customFieldDefinitions.map((field, index) => (
                        <SortableFieldItem key={field.id} field={field} index={index} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}
            
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
              <ImageUpload
                value={coverImage || null}
                onChange={(url) => setCoverImage(url || '')}
                label="Cover Image"
                aspectRatio="2/3"
                maxSize={10}
              />
              <div className="mt-2">
                <Label htmlFor="coverImage-url" className="text-sm text-[#969696]">Or enter URL manually</Label>
                <Input
                  id="coverImage-url"
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="bg-[#2a2d35] border-[#353842] text-[#fafafa] placeholder:text-[#666] focus:border-[#007AFF] smooth-transition mt-1"
                />
              </div>
              <div className="mt-2">
                <Label htmlFor="coverImageFit" className="text-sm text-[#fafafa]">Cover Image Fit</Label>
                <select
                  id="coverImageFit"
                  value={coverImageFit}
                  onChange={(e) => setCoverImageFit(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2a2d35] border border-[#353842] rounded-md text-[#fafafa] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] mt-1"
                >
                  <option value="cover">Fill (Cover) - Image fills the entire box, may be cropped</option>
                  <option value="contain">Fit (Contain) - Image fits within box, may have empty space</option>
                </select>
                <p className="text-xs text-[#666] mt-1">
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
              Uncheck to hide from public view
            </p>
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
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}


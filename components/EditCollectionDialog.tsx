'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import AlertDialog from './ui/alert-dialog'
import { useAlert } from '@/hooks/useAlert'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AVAILABLE_TAGS, stringifyTags, parseTags, getTagColor } from '@/lib/tags'
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

  interface EditCollectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collection: {
    id: string
    name: string
    description: string | null
    category: string | null
    folderId?: string | null
    folder?: {
      id: string
      name: string
    } | null
    template?: string | null
    customFieldDefinitions?: string | null
    coverImage: string | null
    coverImageAspectRatio?: string | null
    tags: string
  } | null
  onSuccess: () => void
}

export default function EditCollectionDialog({
  open,
  onOpenChange,
  collection,
  onSuccess,
}: EditCollectionDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [folderId, setFolderId] = useState<string>('')
  const [folders, setFolders] = useState<Array<{ id: string; name: string }>>([])
  const [template, setTemplate] = useState<string>('custom')
  const [customFieldDefinitions, setCustomFieldDefinitions] = useState<TemplateField[]>([])
  const [coverImage, setCoverImage] = useState('')
  const [coverImageAspectRatio, setCoverImageAspectRatio] = useState<string>('2:3')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
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
                <Label className="text-[#fafafa] text-sm">Options (comma-separated)</Label>
                <Input
                  value={newField.options?.join(', ') || ''}
                  onChange={(e) => {
                    const options = e.target.value.split(',').map(s => s.trim()).filter(s => s)
                    setNewField({ ...newField, options })
                  }}
                  placeholder="e.g., Option 1, Option 2, Option 3"
                  className="bg-[#1a1d24] border-[#353842] text-[#fafafa] text-sm"
                />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-[#fafafa] text-sm">Placeholder</Label>
                <Input
                  value={newField.placeholder || ''}
                  onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                  placeholder="Optional placeholder text"
                  className="bg-[#1a1d24] border-[#353842] text-[#fafafa] text-sm"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id={`required-${index}`}
                  checked={newField.required || false}
                  onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor={`required-${index}`} className="text-[#fafafa] text-sm cursor-pointer">
                  Required
                </Label>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (newField.label && newField.type) {
                    const updated = [...customFieldDefinitions]
                    updated[index] = {
                      id: field.id,
                      label: newField.label,
                      type: newField.type,
                      placeholder: newField.placeholder,
                      required: newField.required || false,
                      options: newField.type === 'select' ? newField.options : undefined,
                      min: newField.type === 'number' ? newField.min : undefined,
                      max: newField.type === 'number' ? newField.max : undefined,
                    }
                    setCustomFieldDefinitions(updated)
                    setEditingFieldIndex(null)
                    setNewField({ id: '', label: '', type: 'text' })
                  }
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
  const { alertDialog, showAlert, closeAlert } = useAlert()

  const aspectRatios = [
    { value: '1:1', label: '1:1 (Square)' },
    { value: '3:4', label: '3:4 (Portrait)' },
    { value: '2:3', label: '2:3 (Portrait)' },
    { value: '9:16', label: '9:16 (Tall)' },
    { value: '16:9', label: '16:9 (Wide)' },
    { value: '4:3', label: '4:3 (Landscape)' },
  ]

  useEffect(() => {
    fetchFolders()
  }, [])

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

  useEffect(() => {
    if (collection) {
      setName(collection.name)
      setDescription(collection.description || '')
      setCategory(collection.category || '')
      setFolderId(collection.folderId || collection.folder?.id || '')
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
      setCoverImageAspectRatio((collection as any).coverImageAspectRatio || '2:3')
      setSelectedTags(parseTags(collection.tags))
    }
  }, [collection])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!collection) return

    setLoading(true)
    try {
      const requestBody = { 
        name: name.trim(),
        description: description ? description.trim() : null,
        category: category ? category.trim() : null,
        folderId: folderId && folderId.trim() !== '' ? folderId.trim() : null,
        template: template || 'custom',
        customFieldDefinitions: template === 'custom' && customFieldDefinitions.length > 0
          ? JSON.stringify(customFieldDefinitions)
          : '[]',
        coverImage: coverImage ? coverImage.trim() : null,
        coverImageAspectRatio: coverImageAspectRatio || null,
        tags: stringifyTags(selectedTags),
      }
      
      console.log('Sending update request:', JSON.stringify(requestBody, null, 2))
      
      const res = await fetch(`/api/collections/${collection.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      const responseData = await res.json().catch(() => ({ error: 'Failed to parse response' }))
      
      if (res.ok) {
        onOpenChange(false)
        onSuccess()
      } else {
        console.error('Update error response:', responseData)
        console.error('Error status:', res.status)
        console.error('Full error object:', JSON.stringify(responseData, null, 2))
        console.error('Request body was:', JSON.stringify(requestBody, null, 2))
        const errorMessage = responseData.error || responseData.details || responseData.message || 'Failed to update collection'
        showAlert({
          title: 'Error',
          message: `${errorMessage}\n\nCheck console for details.`,
          type: 'error',
        })
      }
    } catch (error) {
      console.error('Error updating collection:', error)
      showAlert({
        title: 'Error',
        message: 'Failed to update collection. Check console for details.',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!open || !collection) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in">
      <Card className="w-full max-w-md bg-[#1a1d24] border-[#2a2d35] my-8 max-h-[90vh] flex flex-col animate-scale-in">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-[#fafafa]">Edit Collection</CardTitle>
          <CardDescription className="text-[#969696]">
            Update collection details and tags
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
                placeholder="e.g., Marvel Comics, Vintage Toys"
                required
                className="bg-[#2a2d35] border-[#353842] text-[#fafafa] placeholder:text-[#666] focus:border-[#007AFF] smooth-transition"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-[#fafafa]">Category</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Comics, Books, Cards"
                  className="bg-[#2a2d35] border-[#353842] text-[#fafafa] placeholder:text-[#666] focus:border-[#007AFF] smooth-transition"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="folder" className="text-[#fafafa]">Folder</Label>
                <select
                  id="folder"
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2a2d35] border border-[#353842] rounded-md text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
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
                placeholder="Optional description of your collection"
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
            </div>
            <div className="space-y-2">
              <Label className="text-[#fafafa]">Item Image Aspect Ratio (Cover View)</Label>
              <div className="flex flex-wrap gap-2">
                {aspectRatios.map((ratio) => (
                  <button
                    key={ratio.value}
                    type="button"
                    onClick={() => setCoverImageAspectRatio(ratio.value)}
                    className={`px-3 py-1.5 rounded-full text-sm smooth-transition border ${
                      coverImageAspectRatio === ratio.value
                        ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)]'
                        : 'bg-[#2a2d35] text-[#fafafa] border-[#353842] hover:border-[#666]'
                    }`}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#969696]">
                Select the aspect ratio for item images in cover view (does not affect collection cover image)
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
          </CardContent>
          <CardFooter className="flex justify-end gap-2 flex-shrink-0 border-t border-[#2a2d35] pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] smooth-transition rounded-full"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="accent-button text-white smooth-transition rounded-full"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <AlertDialog
        open={alertDialog.open}
        onOpenChange={(open) => !open && closeAlert()}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
        confirmText={alertDialog.confirmText}
        cancelText={alertDialog.cancelText}
        showCancel={alertDialog.showCancel}
        onConfirm={alertDialog.onConfirm}
        onCancel={alertDialog.onCancel}
      />
    </div>
  )
}


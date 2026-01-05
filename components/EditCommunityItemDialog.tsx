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
import { getTemplateFields, type TemplateField } from '@/lib/item-templates'
import { useToast } from '@/components/Toaster'
import ImageUpload from './ImageUpload'

interface CommunityItem {
  id: string
  name: string
  number: number | null
  notes: string | null
  image: string | null
  customFields?: string | Record<string, any>
}

interface EditCommunityItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: CommunityItem | null
  collectionTemplate?: string | null
  customFieldDefinitions?: string | null
  onSave: (itemId: string, data: { name: string; number: number | null; notes: string | null; image: string | null; customFields?: Record<string, any> }) => Promise<void>
}

export default function EditCommunityItemDialog({
  open,
  onOpenChange,
  item,
  collectionTemplate,
  customFieldDefinitions,
  onSave,
}: EditCommunityItemDialogProps) {
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [image, setImage] = useState('')
  const [customFields, setCustomFields] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  // Get template fields - either from predefined template or custom field definitions
  const templateFields = collectionTemplate === 'custom' && customFieldDefinitions
    ? (() => {
        try {
          const parsed = typeof customFieldDefinitions === 'string'
            ? JSON.parse(customFieldDefinitions)
            : customFieldDefinitions
          return Array.isArray(parsed) ? parsed : []
        } catch {
          return []
        }
      })()
    : getTemplateFields(collectionTemplate)

  useEffect(() => {
    if (item) {
      setName(item.name)
      setNumber(item.number?.toString() || '')
      setNotes(item.notes || '')
      setImage(item.image || '')
      
      // Load customFields
      if (item.customFields) {
        try {
          const parsed = typeof item.customFields === 'string'
            ? JSON.parse(item.customFields)
            : item.customFields
          setCustomFields(parsed || {})
        } catch {
          setCustomFields({})
        }
      } else {
        setCustomFields({})
      }
    }
  }, [item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item) return

    setLoading(true)
    try {
      await onSave(item.id, {
        name: name.trim(),
        number: number.trim() ? parseInt(number.trim()) : null,
        notes: notes.trim() || null,
        image: image.trim() || null,
        customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
      })
      toast.success('Item updated successfully!')
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving item:', error)
      toast.error('Failed to save item')
    } finally {
      setLoading(false)
    }
  }

  const handleCustomFieldChange = (fieldId: string, value: any) => {
    setCustomFields(prev => ({
      ...prev,
      [fieldId]: value,
    }))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] bg-[var(--bg-secondary)] border-[var(--border-color)] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-[var(--text-primary)]">Edit Item</CardTitle>
          <CardDescription className="text-[var(--text-secondary)]">
            Update item details
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <CardContent className="space-y-4 overflow-y-auto flex-1 min-h-0">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[var(--text-primary)]">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Item name"
                required
                className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] smooth-transition"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="number" className="text-[var(--text-primary)]">Number</Label>
              <Input
                id="number"
                type="number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="Item number (optional)"
                className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] smooth-transition"
              />
            </div>

            <div className="space-y-2">
              <ImageUpload
                value={image || null}
                onChange={(url) => setImage(url || '')}
                label="Image"
                maxSize={10}
              />
              <div className="mt-2">
                <Label htmlFor="image-url" className="text-sm text-[var(--text-secondary)]">Or enter URL manually</Label>
                <Input
                  id="image-url"
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] smooth-transition mt-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-[var(--text-primary)]">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about this item"
                rows={3}
                className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] smooth-transition"
              />
            </div>

            {templateFields.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
                <Label className="text-[var(--text-primary)]">Template Fields</Label>
                {templateFields.map((field) => {
                  const fieldValue = customFields[field.id] || ''

                  if (field.type === 'select' && field.options) {
                    return (
                      <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.id} className="text-[var(--text-primary)]">
                          {field.label}
                          {field.required && <span className="text-red-400 ml-1">*</span>}
                        </Label>
                        <select
                          id={field.id}
                          value={fieldValue}
                          onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                          required={field.required}
                          className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-hover)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                        >
                          <option value="">Select {field.label}</option>
                          {field.options.map((option: string) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    )
                  }

                  if (field.type === 'number') {
                    return (
                      <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.id} className="text-[var(--text-primary)]">
                          {field.label}
                          {field.required && <span className="text-red-400 ml-1">*</span>}
                        </Label>
                        <Input
                          id={field.id}
                          type="number"
                          value={fieldValue}
                          onChange={(e) => handleCustomFieldChange(field.id, e.target.value ? parseFloat(e.target.value) : '')}
                          placeholder={field.placeholder}
                          required={field.required}
                          min={field.min}
                          max={field.max}
                          className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] smooth-transition"
                        />
                      </div>
                    )
                  }

                  if (field.type === 'date') {
                    return (
                      <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.id} className="text-[var(--text-primary)]">
                          {field.label}
                          {field.required && <span className="text-red-400 ml-1">*</span>}
                        </Label>
                        <Input
                          id={field.id}
                          type="date"
                          value={fieldValue}
                          onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                          required={field.required}
                          className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] smooth-transition"
                        />
                      </div>
                    )
                  }

                  if (field.type === 'textarea') {
                    return (
                      <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.id} className="text-[var(--text-primary)]">
                          {field.label}
                          {field.required && <span className="text-red-400 ml-1">*</span>}
                        </Label>
                        <Textarea
                          id={field.id}
                          value={fieldValue}
                          onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                          placeholder={field.placeholder}
                          required={field.required}
                          rows={3}
                          className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] smooth-transition"
                        />
                      </div>
                    )
                  }

                  return (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={field.id} className="text-[var(--text-primary)]">
                        {field.label}
                        {field.required && <span className="text-red-400 ml-1">*</span>}
                      </Label>
                      <Input
                        id={field.id}
                        type="text"
                        value={fieldValue}
                        onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] smooth-transition"
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2 flex-shrink-0 border-t border-[var(--border-color)]">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition"
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


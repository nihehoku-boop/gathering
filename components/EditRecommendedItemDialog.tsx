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
import ImageUpload from './ImageUpload'
import { getTemplateFields } from '@/lib/item-templates'
import { useAlert } from '@/hooks/useAlert'
import AlertDialog from './ui/alert-dialog'

interface EditRecommendedItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: {
    id: string
    name: string
    number: number | null
    notes: string | null
    image: string | null
    customFields?: string | Record<string, any>
  } | null
  collectionTemplate?: string | null
  customFieldDefinitions?: string | null
  onSave: (itemId: string, data: { name: string; number: number | null; notes: string | null; image: string | null; customFields?: Record<string, any> }) => Promise<void>
}

export default function EditRecommendedItemDialog({
  open,
  onOpenChange,
  item,
  collectionTemplate,
  customFieldDefinitions,
  onSave,
}: EditRecommendedItemDialogProps) {
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [image, setImage] = useState('')
  const [customFields, setCustomFields] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const { alertDialog, showAlert, closeAlert } = useAlert()

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

    const trimmedName = name.trim()
    if (!trimmedName) {
      showAlert({
        title: 'Validation Error',
        message: 'Item name is required',
        type: 'error',
      })
      return
    }

    setLoading(true)
    try {
      // Validate required custom fields
      for (const field of templateFields) {
        if (field.required) {
          const value = customFields[field.id]
          if (value === undefined || value === null || value === '') {
            showAlert({
              title: 'Validation Error',
              message: `"${field.label}" is required`,
              type: 'error',
            })
            setLoading(false)
            return
          }
        }
      }
      
      // Clean customFields - only include non-empty values
      const cleanedCustomFields: Record<string, any> = {}
      templateFields.forEach(field => {
        const value = customFields[field.id]
        if (value !== undefined && value !== null && value !== '') {
          // Convert number fields
          if (field.type === 'number' && typeof value === 'string') {
            const numValue = parseInt(value)
            if (!isNaN(numValue)) {
              cleanedCustomFields[field.id] = numValue
            }
          } else {
            cleanedCustomFields[field.id] = value
          }
        }
      })
      
      await onSave(item.id, {
        name: trimmedName,
        number: number ? parseInt(number) : null,
        notes: notes || null,
        image: image || null,
        customFields: cleanedCustomFields,
      })
      onOpenChange(false)
    } catch (error: any) {
      console.error('Error saving item:', error)
      const errorMessage = error?.message || 'Failed to save item'
      showAlert({
        title: 'Error',
        message: errorMessage,
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!open || !item) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] bg-[var(--bg-secondary)] border-[var(--border-color)] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-[var(--text-primary)]">Edit Item</CardTitle>
          <CardDescription className="text-[var(--text-secondary)]">
            Update item details and image
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <CardContent className="space-y-4 overflow-y-auto flex-1">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[var(--text-primary)]">Item Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[#007AFF] smooth-transition"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="number" className="text-[var(--text-primary)]">Number</Label>
              <Input
                id="number"
                type="number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[#007AFF] smooth-transition"
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
                  className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[#007AFF] smooth-transition mt-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-[var(--text-primary)]">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[#007AFF] smooth-transition"
              />
            </div>
            
            {/* Template-specific fields */}
            {templateFields.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
                <div className="text-sm font-medium text-[var(--text-primary)]">Template Fields</div>
                {templateFields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={`custom-${field.id}`} className="text-[var(--text-primary)]">
                      {field.label}
                      {field.required && <span className="text-[#FF3B30] ml-1">*</span>}
                    </Label>
                    {field.type === 'text' && (
                      <Input
                        id={`custom-${field.id}`}
                        value={customFields[field.id] || ''}
                        onChange={(e) => setCustomFields({ ...customFields, [field.id]: e.target.value })}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] smooth-transition"
                      />
                    )}
                    {field.type === 'number' && (
                      <Input
                        id={`custom-${field.id}`}
                        type="number"
                        min={field.min}
                        max={field.max}
                        value={customFields[field.id] || ''}
                        onChange={(e) => setCustomFields({ ...customFields, [field.id]: e.target.value })}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] smooth-transition"
                      />
                    )}
                    {field.type === 'date' && (
                      <Input
                        id={`custom-${field.id}`}
                        type="date"
                        value={customFields[field.id] || ''}
                        onChange={(e) => setCustomFields({ ...customFields, [field.id]: e.target.value })}
                        required={field.required}
                        className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] smooth-transition"
                      />
                    )}
                    {field.type === 'select' && field.options && (
                      <select
                        id={`custom-${field.id}`}
                        value={customFields[field.id] || ''}
                        onChange={(e) => setCustomFields({ ...customFields, [field.id]: e.target.value })}
                        required={field.required}
                        className="w-full px-3 py-2 bg-[#2a2d35] border border-[#353842] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                      >
                        <option value="">Select {field.label}</option>
                        {field.options.map((option: string) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                    {field.type === 'textarea' && (
                      <Textarea
                        id={`custom-${field.id}`}
                        value={customFields[field.id] || ''}
                        onChange={(e) => setCustomFields({ ...customFields, [field.id]: e.target.value })}
                        placeholder={field.placeholder}
                        required={field.required}
                        rows={3}
                        className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] smooth-transition"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2 flex-shrink-0 border-t border-[var(--border-color)] pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="border-[#353842] text-[var(--text-primary)] hover:bg-[#2a2d35] smooth-transition"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="accent-button text-white smooth-transition"
            >
              {loading ? 'Saving...' : 'Save'}
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


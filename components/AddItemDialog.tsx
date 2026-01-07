'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, X } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import AlertDialog from './ui/alert-dialog'
import { useAlert } from '@/hooks/useAlert'
import ImageUpload from './ImageUpload'
import { getTemplateFields, ITEM_TEMPLATES } from '@/lib/item-templates'

interface AddItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collectionId: string
  collectionTemplate?: string | null
  customFieldDefinitions?: string | null
  onSuccess: (newItem: any) => void
}

export default function AddItemDialog({
  open,
  onOpenChange,
  collectionId,
  collectionTemplate,
  customFieldDefinitions,
  onSuccess,
}: AddItemDialogProps) {
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [image, setImage] = useState('')
  const [alternativeImages, setAlternativeImages] = useState<string[]>([])
  const [newAltImage, setNewAltImage] = useState('')
  const [wear, setWear] = useState('')
  const [personalRating, setPersonalRating] = useState('')
  const [logDate, setLogDate] = useState('')
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

  // Get template info for display
  const currentTemplate = ITEM_TEMPLATES.find(t => t.id === collectionTemplate)

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName('')
      setNumber('')
      setNotes('')
      setImage('')
      setAlternativeImages([])
      setNewAltImage('')
      setWear('')
      setPersonalRating('')
      setLogDate('')
      // Initialize custom fields with empty values
      const initialFields: Record<string, any> = {}
      templateFields.forEach(field => {
        initialFields[field.id] = ''
      })
      setCustomFields(initialFields)
    }
  }, [open, collectionTemplate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
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

      // Parse number
      let parsedNumber: number | null = null
      if (number && number.trim()) {
        const num = parseInt(number.trim(), 10)
        if (!isNaN(num) && num > 0) {
          parsedNumber = num
        }
      }
      
      // Build request body, only including non-empty values
      const requestBody: Record<string, any> = {
        collectionId: collectionId.trim(),
        name: trimmedName,
      }
      
      if (parsedNumber !== null) {
        requestBody.number = parsedNumber
      }
      if (notes.trim()) {
        requestBody.notes = notes.trim()
      }
      if (image.trim()) {
        requestBody.image = image.trim()
      }
      const filteredAltImages = alternativeImages.filter(img => img && img.trim())
      if (filteredAltImages.length > 0) {
        requestBody.alternativeImages = filteredAltImages
      }
      if (wear.trim()) {
        requestBody.wear = wear.trim()
      }
      if (personalRating) {
        const rating = parseInt(personalRating)
        if (!isNaN(rating) && rating >= 1 && rating <= 10) {
          requestBody.personalRating = rating
        }
      }
      if (logDate) {
        requestBody.logDate = logDate
      }
      if (Object.keys(cleanedCustomFields).length > 0) {
        requestBody.customFields = cleanedCustomFields
      }

      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (res.ok) {
        const newItem = await res.json()
        onSuccess(newItem)
        onOpenChange(false)
      } else {
        let errorData
        try {
          const text = await res.text()
          errorData = JSON.parse(text)
        } catch {
          errorData = { error: `Failed to add item (Status: ${res.status})` }
        }
        
        // Log full error details for debugging
        console.error('[AddItemDialog] Error response:', {
          status: res.status,
          statusText: res.statusText,
          error: errorData,
          requestBody: requestBody,
        })
        
        showAlert({
          title: 'Error',
          message: errorData.error || errorData.message || `Failed to add item (${res.status})`,
          type: 'error',
        })
      }
    } catch (error: any) {
      console.error('Error adding item:', error)
      showAlert({
        title: 'Error',
        message: error?.message || 'An error occurred while adding the item',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <Card className="w-full max-w-md max-h-[90vh] bg-[var(--bg-secondary)] border-[var(--border-color)] flex flex-col animate-scale-in">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-[var(--text-primary)]">Add New Item</CardTitle>
          <CardDescription className="text-[var(--text-secondary)]">
            {currentTemplate ? (
              <>Using <span className="font-medium">{currentTemplate.icon} {currentTemplate.name}</span> template</>
            ) : (
              'Add a new item to your collection'
            )}
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
                placeholder="e.g., Book #1, Issue #42"
                required
                autoFocus
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
                placeholder="e.g., 1, 42, 100"
                className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] smooth-transition"
              />
            </div>
            <div className="space-y-2">
              <ImageUpload
                value={image}
                onChange={(value) => setImage(value || '')}
                label="Image"
                aspectRatio="2/3"
                maxSize={10}
              />
              <div className="mt-2">
                <Label htmlFor="image-url" className="text-sm text-[var(--text-secondary)]">Or enter URL manually</Label>
                <Input
                  id="image-url"
                  type="text"
                  value={image || ''}
                  onChange={(e) => setImage(e.target.value || '')}
                  placeholder="https://example.com/image.jpg"
                  className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] smooth-transition mt-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--text-primary)]">Alternative Covers</Label>
              <p className="text-xs text-[var(--text-secondary)] mb-2">
                Add alternative cover images (variant covers, different editions, etc.)
              </p>
              <div className="space-y-2">
                {alternativeImages.map((altImg, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-[var(--bg-tertiary)] rounded border border-[var(--border-hover)]">
                    <img
                      src={altImg}
                      alt={`Alternative ${index + 1}`}
                      className="w-12 h-16 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[var(--text-secondary)] truncate">{altImg}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newAlts = [...alternativeImages]
                        newAlts.splice(index, 1)
                        setAlternativeImages(newAlts)
                      }}
                      className="text-[#FF3B30] hover:text-[#C0392B] hover:bg-[var(--bg-tertiary)] rounded-full h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    {image && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAlternativeImages([...alternativeImages.filter((_, i) => i !== index), image])
                          setImage(altImg)
                        }}
                        className="text-xs border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-full"
                      >
                        Set as Main
                      </Button>
                    )}
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={newAltImage}
                    onChange={(e) => setNewAltImage(e.target.value)}
                    placeholder="https://example.com/cover.jpg"
                    className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] smooth-transition"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newAltImage.trim()) {
                        e.preventDefault()
                        setAlternativeImages([...alternativeImages, newAltImage.trim()])
                        setNewAltImage('')
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (newAltImage.trim()) {
                        setAlternativeImages([...alternativeImages, newAltImage.trim()])
                        setNewAltImage('')
                      }
                    }}
                    disabled={!newAltImage.trim()}
                    className="border-[#353842] text-[var(--text-primary)] hover:bg-[#2a2d35] rounded-full"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-[var(--text-primary)]">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes about this item..."
                rows={3}
                className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] smooth-transition"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wear" className="text-[var(--text-primary)]">Wear/Condition</Label>
              <Input
                id="wear"
                value={wear}
                onChange={(e) => setWear(e.target.value)}
                placeholder="e.g., New, Like New, Good, Fair, Poor"
                className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] smooth-transition"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="personalRating" className="text-[var(--text-primary)]">Personal Rating (1-10)</Label>
              <Input
                id="personalRating"
                type="number"
                min="1"
                max="10"
                value={personalRating}
                onChange={(e) => setPersonalRating(e.target.value)}
                placeholder="1-10"
                className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] smooth-transition"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logDate" className="text-[var(--text-primary)]">Log Date</Label>
              <Input
                id="logDate"
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] smooth-transition"
              />
              <p className="text-xs text-[var(--text-secondary)]">
                Date when item was bought, read, etc.
              </p>
            </div>
            
            {/* Template-specific fields */}
            {templateFields.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
                <div className="text-sm font-medium text-[var(--text-primary)]">
                  {currentTemplate?.name || 'Template'} Fields
                </div>
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
              className="border-[#353842] text-[var(--text-primary)] hover:bg-[#2a2d35] smooth-transition"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !name.trim()}
              className="accent-button text-white smooth-transition"
            >
              {loading ? 'Adding...' : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </>
              )}
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


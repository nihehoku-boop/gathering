'use client'

import { useState, useEffect, useRef } from 'react'
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
import { Upload, X, Image as ImageIcon, ChevronRight, ChevronLeft, Plus, Loader2, Trash2 } from 'lucide-react'
import { useToast } from '@/components/Toaster'
import { getTemplateFields, ITEM_TEMPLATES } from '@/lib/item-templates'
import { useAlert } from '@/hooks/useAlert'
import AlertDialog from './ui/alert-dialog'

interface BulkImageImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collectionId: string
  collectionTemplate?: string | null
  customFieldDefinitions?: string | null
  onSuccess: (count: number) => void
}

interface ItemData {
  image: string
  name: string
  number: string
  notes: string
  wear: string
  personalRating: string
  logDate: string
  customFields: Record<string, any>
  alternativeImages: string[]
}

export default function BulkImageImportDialog({
  open,
  onOpenChange,
  collectionId,
  collectionTemplate,
  customFieldDefinitions,
  onSuccess,
}: BulkImageImportDialogProps) {
  const [step, setStep] = useState<'upload' | 'details'>('upload')
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [items, setItems] = useState<ItemData[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const toast = useToast()
  const { alertDialog, showAlert, closeAlert } = useAlert()

  // Get template fields
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

  const currentTemplate = ITEM_TEMPLATES.find(t => t.id === collectionTemplate)

  // Reset when dialog opens/closes
  useEffect(() => {
    if (open) {
      setStep('upload')
      setUploadedImages([])
      setItems([])
      setLoading(false)
      setUploading(false)
    }
  }, [open])

  // Initialize items when images are uploaded
  useEffect(() => {
    if (uploadedImages.length > 0 && items.length === 0) {
      const newItems: ItemData[] = uploadedImages.map((image) => ({
        image,
        name: '',
        number: '',
        notes: '',
        wear: '',
        personalRating: '',
        logDate: '',
        customFields: templateFields.reduce((acc, field) => {
          acc[field.id] = ''
          return acc
        }, {} as Record<string, any>),
        alternativeImages: [],
      }))
      setItems(newItems)
    }
  }, [uploadedImages, templateFields])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type.startsWith('image/')
    )

    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFiles = async (files: File[]) => {
    setUploading(true)
    const newImages: string[] = []

    try {
      for (const file of files) {
        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`Image ${file.name} is too large (max 10MB)`)
          continue
        }

        // Convert to base64 data URL for preview
        const reader = new FileReader()
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        newImages.push(dataUrl)
      }

      setUploadedImages((prev) => [...prev, ...newImages])
      toast.success(`Uploaded ${newImages.length} image${newImages.length > 1 ? 's' : ''}`)
    } catch (error) {
      console.error('Error uploading images:', error)
      toast.error('Failed to upload some images')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, updates: Partial<ItemData>) => {
    setItems((prev) => {
      const newItems = [...prev]
      newItems[index] = { ...newItems[index], ...updates }
      return newItems
    })
  }

  const bulkUpdateNames = (pattern: string) => {
    // Pattern like "Book #{number}" or "Item {index}"
    setItems((prev) =>
      prev.map((item, index) => {
        let name = pattern
        name = name.replace(/\{number\}/g, item.number || String(index + 1))
        name = name.replace(/\{index\}/g, String(index + 1))
        name = name.replace(/\{index\+1\}/g, String(index + 1))
        return { ...item, name }
      })
    )
  }

  const handleNext = () => {
    if (uploadedImages.length === 0) {
      showAlert({
        title: 'No Images',
        message: 'Please upload at least one image before continuing.',
        type: 'error',
      })
      return
    }
    setStep('details')
  }

  const handleBack = () => {
    setStep('upload')
  }

  const handleSubmit = async () => {
    // Validate all items have names
    const invalidItems = items.filter((item) => !item.name.trim())
    if (invalidItems.length > 0) {
      showAlert({
        title: 'Validation Error',
        message: `Please provide names for all ${invalidItems.length} item${invalidItems.length > 1 ? 's' : ''}.`,
        type: 'error',
      })
      return
    }

    setLoading(true)
    try {
      const itemsToCreate = items.map((item) => {
        const cleanedCustomFields: Record<string, any> = {}
        templateFields.forEach((field) => {
          const value = item.customFields[field.id]
          if (value !== undefined && value !== null && value !== '') {
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

        return {
          collectionId: collectionId.trim(),
          name: item.name.trim(),
          number: item.number ? parseInt(item.number) : null,
          image: item.image || null,
          notes: item.notes.trim() || null,
          alternativeImages: item.alternativeImages.filter(img => img && img.trim()),
          wear: item.wear.trim() || null,
          personalRating: item.personalRating ? parseInt(item.personalRating) : null,
          logDate: item.logDate || null,
          customFields: Object.keys(cleanedCustomFields).length > 0 ? cleanedCustomFields : null,
        }
      })

      // Create items one by one (or we could batch them if API supports it)
      let successCount = 0
      for (const itemData of itemsToCreate) {
        try {
          const res = await fetch('/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemData),
          })

          if (res.ok) {
            successCount++
          } else {
            const error = await res.json().catch(() => ({ error: 'Failed to create item' }))
            console.error('Failed to create item:', error)
          }
        } catch (error) {
          console.error('Error creating item:', error)
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully created ${successCount} item${successCount > 1 ? 's' : ''}!`)
        onSuccess(successCount)
        onOpenChange(false)
      } else {
        showAlert({
          title: 'Error',
          message: 'Failed to create items. Please try again.',
          type: 'error',
        })
      }
    } catch (error) {
      console.error('Error submitting items:', error)
      showAlert({
        title: 'Error',
        message: 'An error occurred while creating items.',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <Card className="w-full max-w-4xl max-h-[90vh] bg-[var(--bg-secondary)] border-[var(--border-color)] flex flex-col animate-scale-in">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-[var(--text-primary)]">
            Bulk Add Items {step === 'details' && `(${items.length} items)`}
          </CardTitle>
          <CardDescription className="text-[var(--text-secondary)]">
            {step === 'upload' 
              ? 'Step 1: Upload images for your items'
              : 'Step 2: Fill out details for each item'}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-4">
          {step === 'upload' ? (
            <div className="space-y-4">
              {/* Upload Area */}
              <div
                ref={dropZoneRef}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10'
                    : 'border-[var(--border-color)] hover:border-[var(--border-hover)]'
                }`}
              >
                <Upload className="mx-auto h-12 w-12 text-[var(--text-muted)] mb-4" />
                <p className="text-lg font-medium text-[var(--text-primary)] mb-2">
                  Drag & drop images here
                </p>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  or click to browse files
                </p>
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="accent-button text-white"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Select Images
                    </>
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <p className="text-xs text-[var(--text-muted)] mt-4">
                  Supported: JPG, PNG, GIF, WebP (max 10MB each)
                </p>
              </div>

              {/* Uploaded Images Preview */}
              {uploadedImages.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[var(--text-primary)]">
                      Uploaded Images ({uploadedImages.length})
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="border-[var(--border-hover)] text-[var(--text-primary)]"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add More
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full aspect-[2/3] object-cover rounded border border-[var(--border-color)]"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-1 py-0.5 text-center rounded-b">
                          #{index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Bulk Name Pattern */}
              {items.length > 1 && (
                <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-color)]">
                  <Label className="text-[var(--text-primary)] mb-2 block">
                    Quick Name Fill (optional)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Book #{number} or Item {index}"
                      className="flex-1 bg-[var(--bg-secondary)] border-[var(--border-hover)] text-[var(--text-primary)]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const pattern = e.currentTarget.value
                          if (pattern) {
                            bulkUpdateNames(pattern)
                            e.currentTarget.value = ''
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement
                        if (input?.value) {
                          bulkUpdateNames(input.value)
                          input.value = ''
                        }
                      }}
                      className="border-[var(--border-hover)] text-[var(--text-primary)]"
                    >
                      Apply to All
                    </Button>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-2">
                    Use {'{number}'} for item number, {'{index}'} for position (starts at 1)
                  </p>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-4">
                {items.map((item, index) => (
                  <Card key={index} className="bg-[var(--bg-tertiary)] border-[var(--border-color)]">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-[100px_1fr] gap-4">
                        {/* Image Preview */}
                        <div className="relative">
                          <img
                            src={item.image}
                            alt={`Item ${index + 1}`}
                            className="w-full aspect-[2/3] object-cover rounded border border-[var(--border-color)]"
                          />
                          <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                            #{index + 1}
                          </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-3">
                          <div className="grid grid-cols-[1fr_80px] gap-2">
                            <div>
                              <Label className="text-xs text-[var(--text-secondary)]">Name *</Label>
                              <Input
                                value={item.name}
                                onChange={(e) => updateItem(index, { name: e.target.value })}
                                placeholder="Item name"
                                className="bg-[var(--bg-secondary)] border-[var(--border-hover)] text-[var(--text-primary)] text-sm"
                                required
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-[var(--text-secondary)]">Number</Label>
                              <Input
                                type="number"
                                value={item.number}
                                onChange={(e) => updateItem(index, { number: e.target.value })}
                                placeholder="#"
                                className="bg-[var(--bg-secondary)] border-[var(--border-hover)] text-[var(--text-primary)] text-sm"
                              />
                            </div>
                          </div>

                          {/* Template Fields */}
                          {templateFields.length > 0 && (
                            <div className="grid grid-cols-2 gap-2">
                              {templateFields.slice(0, 4).map((field) => (
                                <div key={field.id}>
                                  <Label className="text-xs text-[var(--text-secondary)]">
                                    {field.label}
                                    {field.required && <span className="text-red-400 ml-1">*</span>}
                                  </Label>
                                  {field.type === 'text' && (
                                    <Input
                                      value={item.customFields[field.id] || ''}
                                      onChange={(e) =>
                                        updateItem(index, {
                                          customFields: {
                                            ...item.customFields,
                                            [field.id]: e.target.value,
                                          },
                                        })
                                      }
                                      placeholder={field.placeholder}
                                      className="bg-[var(--bg-secondary)] border-[var(--border-hover)] text-[var(--text-primary)] text-sm"
                                      required={field.required}
                                    />
                                  )}
                                  {field.type === 'number' && (
                                    <Input
                                      type="number"
                                      value={item.customFields[field.id] || ''}
                                      onChange={(e) =>
                                        updateItem(index, {
                                          customFields: {
                                            ...item.customFields,
                                            [field.id]: e.target.value,
                                          },
                                        })
                                      }
                                      min={field.min}
                                      max={field.max}
                                      placeholder={field.placeholder}
                                      className="bg-[var(--bg-secondary)] border-[var(--border-hover)] text-[var(--text-primary)] text-sm"
                                      required={field.required}
                                    />
                                  )}
                                  {field.type === 'select' && field.options && (
                                    <select
                                      value={item.customFields[field.id] || ''}
                                      onChange={(e) =>
                                        updateItem(index, {
                                          customFields: {
                                            ...item.customFields,
                                            [field.id]: e.target.value,
                                          },
                                        })
                                      }
                                      className="w-full px-2 py-1 text-sm bg-[var(--bg-secondary)] border border-[var(--border-hover)] rounded text-[var(--text-primary)]"
                                      required={field.required}
                                    >
                                      <option value="">Select...</option>
                                      {field.options.map((opt) => (
                                        <option key={opt} value={opt}>
                                          {opt}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Optional Fields (collapsible or shown if template has few fields) */}
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <Label className="text-xs text-[var(--text-secondary)]">Condition</Label>
                              <Input
                                value={item.wear}
                                onChange={(e) => updateItem(index, { wear: e.target.value })}
                                placeholder="e.g., New"
                                className="bg-[var(--bg-secondary)] border-[var(--border-hover)] text-[var(--text-primary)] text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-[var(--text-secondary)]">Rating</Label>
                              <Input
                                type="number"
                                min="1"
                                max="10"
                                value={item.personalRating}
                                onChange={(e) => updateItem(index, { personalRating: e.target.value })}
                                placeholder="1-10"
                                className="bg-[var(--bg-secondary)] border-[var(--border-hover)] text-[var(--text-primary)] text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-[var(--text-secondary)]">Date</Label>
                              <Input
                                type="date"
                                value={item.logDate}
                                onChange={(e) => updateItem(index, { logDate: e.target.value })}
                                className="bg-[var(--bg-secondary)] border-[var(--border-hover)] text-[var(--text-primary)] text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between gap-2 flex-shrink-0 border-t border-[var(--border-color)]">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (step === 'details') {
                handleBack()
              } else {
                onOpenChange(false)
              }
            }}
            className="border-[#353842] text-[var(--text-primary)] hover:bg-[#2a2d35]"
          >
            {step === 'details' ? (
              <>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </>
            ) : (
              'Cancel'
            )}
          </Button>
          <div className="flex gap-2">
            {step === 'upload' ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={uploadedImages.length === 0 || uploading}
                className="accent-button text-white"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading || items.some((item) => !item.name.trim())}
                className="accent-button text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  `Create ${items.length} Item${items.length > 1 ? 's' : ''}`
                )}
              </Button>
            )}
          </div>
        </CardFooter>
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


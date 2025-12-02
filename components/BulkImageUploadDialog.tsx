'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface BulkImageUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collectionId: string
  items: Array<{ id: string; name: string; number: number | null }>
  onSuccess: () => void
}

interface UploadProgress {
  filename: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  itemNumber: number | null
  itemName: string | null
  error?: string
}

export default function BulkImageUploadDialog({
  open,
  onOpenChange,
  collectionId,
  items,
  onSuccess,
}: BulkImageUploadDialogProps) {
  const [prefix, setPrefix] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Extract number from filename based on prefix
  const extractNumberFromFilename = (filename: string, prefix: string): number | null => {
    // Remove file extension
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
    
    // Try different patterns:
    // 1. PREFIX_001, PREFIX_002, etc.
    // 2. PREFIX001, PREFIX002, etc.
    // 3. PREFIX-001, PREFIX-002, etc.
    // 4. PREFIX.001, PREFIX.002, etc.
    
    const patterns = [
      new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}_?(\\d+)$`, 'i'),
      new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[-._]?(\\d+)$`, 'i'),
      new RegExp(`(\\d+)$`), // Fallback: just get the last number sequence
    ]
    
    for (const pattern of patterns) {
      const match = nameWithoutExt.match(pattern)
      if (match && match[1]) {
        const num = parseInt(match[1], 10)
        if (!isNaN(num)) {
          return num
        }
      }
    }
    
    return null
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Validate all files are images
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'))
    if (invalidFiles.length > 0) {
      alert(`Some files are not images: ${invalidFiles.map(f => f.name).join(', ')}`)
      return
    }

    setSelectedFiles(files)
    
    // Initialize upload progress
    const progress: UploadProgress[] = files.map(file => {
      const number = prefix ? extractNumberFromFilename(file.name, prefix) : null
      const matchedItem = number ? items.find(item => item.number === number) : null
      
      return {
        filename: file.name,
        status: 'pending',
        itemNumber: number,
        itemName: matchedItem?.name || null,
      }
    })
    
    setUploadProgress(progress)
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one image file')
      return
    }

    if (!prefix.trim()) {
      alert('Please enter a prefix to match images to items')
      return
    }

    setUploading(true)

    try {
      // Upload all images and match them to items
      const uploadResults: Array<{ itemId: string; imageUrl: string; filename: string }> = []
      const errors: Array<{ filename: string; error: string }> = []

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const number = extractNumberFromFilename(file.name, prefix)
        
        // Update progress to uploading
        setUploadProgress(prev => {
          const updated = [...prev]
          updated[i] = { ...updated[i], status: 'uploading' }
          return updated
        })

        try {
          // Find matching item by number
          const matchedItem = number ? items.find(item => item.number === number) : null
          
          if (!matchedItem) {
            throw new Error(`No item found with number ${number}`)
          }

          // Upload image to Cloudinary
          const formData = new FormData()
          formData.append('file', file)

          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          if (!uploadRes.ok) {
            const errorData = await uploadRes.json().catch(() => ({ error: 'Upload failed' }))
            throw new Error(errorData.error || 'Upload failed')
          }

          const uploadData = await uploadRes.json()
          
          if (!uploadData.url) {
            throw new Error('No URL returned from upload')
          }

          uploadResults.push({
            itemId: matchedItem.id,
            imageUrl: uploadData.url,
            filename: file.name,
          })

          // Update progress to success
          setUploadProgress(prev => {
            const updated = [...prev]
            updated[i] = {
              ...updated[i],
              status: 'success',
              itemName: matchedItem.name,
            }
            return updated
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          errors.push({ filename: file.name, error: errorMessage })
          
          // Update progress to error
          setUploadProgress(prev => {
            const updated = [...prev]
            updated[i] = {
              ...updated[i],
              status: 'error',
              error: errorMessage,
            }
            return updated
          })
        }
      }

      // If we have successful uploads, update items in bulk
      if (uploadResults.length > 0) {
        const res = await fetch(`/api/recommended-collections/${collectionId}/items/bulk-images`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            updates: uploadResults.map(r => ({
              itemId: r.itemId,
              image: r.imageUrl,
            })),
          }),
        })

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Failed to update items' }))
          throw new Error(errorData.error || 'Failed to update items')
        }
      }

      // Show results
      const successCount = uploadResults.length
      const errorCount = errors.length
      
      if (errorCount === 0) {
        alert(`Successfully uploaded and assigned ${successCount} image(s)!`)
        handleClose()
        onSuccess()
      } else {
        alert(
          `Uploaded ${successCount} image(s) successfully.\n` +
          `${errorCount} image(s) failed:\n` +
          errors.map(e => `- ${e.filename}: ${e.error}`).join('\n')
        )
        if (successCount > 0) {
          handleClose()
          onSuccess()
        }
      }
    } catch (error) {
      console.error('Error during bulk upload:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to upload images'}`)
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    if (uploading) return // Don't close while uploading
    
    setSelectedFiles([])
    setUploadProgress([])
    setPrefix('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onOpenChange(false)
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setUploadProgress(prev => prev.filter((_, i) => i !== index))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-[#1a1d24] border-[#2a2d35] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-[#fafafa]">Bulk Image Upload</CardTitle>
              <CardDescription className="text-[#969696]">
                Upload multiple images and automatically assign them to items based on filename pattern
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              disabled={uploading}
              className="text-[#969696] hover:text-[#fafafa]"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prefix" className="text-[#fafafa]">
              Image Prefix
            </Label>
            <Input
              id="prefix"
              value={prefix}
              onChange={(e) => {
                setPrefix(e.target.value)
                // Recalculate matches when prefix changes
                if (selectedFiles.length > 0) {
                  const progress: UploadProgress[] = selectedFiles.map(file => {
                    const number = e.target.value ? extractNumberFromFilename(file.name, e.target.value) : null
                    const matchedItem = number ? items.find(item => item.number === number) : null
                    
                    return {
                      filename: file.name,
                      status: 'pending',
                      itemNumber: number,
                      itemName: matchedItem?.name || null,
                    }
                  })
                  setUploadProgress(progress)
                }
              }}
              placeholder="e.g., XXX (for files like XXX_001.jpg, XXX_002.png)"
              className="bg-[#2a2d35] border-[#353842] text-[#fafafa] placeholder:text-[#666] focus:border-[#007AFF] smooth-transition"
              disabled={uploading}
            />
            <p className="text-xs text-[#969696]">
              Enter the prefix used in your image filenames. The system will extract numbers from filenames like PREFIX_001, PREFIX_002, etc.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="files" className="text-[#fafafa]">
              Select Images
            </Label>
            <input
              ref={fileInputRef}
              id="files"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] smooth-transition"
            >
              <Upload className="mr-2 h-4 w-4" />
              {selectedFiles.length > 0 ? `Change Files (${selectedFiles.length} selected)` : 'Select Images'}
            </Button>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <Label className="text-[#fafafa]">Selected Files & Matches</Label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedFiles.map((file, index) => {
                  const progress = uploadProgress[index]
                  const matched = progress?.itemNumber !== null && progress?.itemName !== null
                  
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        matched
                          ? 'bg-[#1e3a1e] border-[#2d5a2d]'
                          : 'bg-[#2a2d35] border-[#353842]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-[#fafafa] truncate">
                            {file.name}
                          </div>
                          {progress?.itemNumber !== null ? (
                            <div className="text-xs text-[#969696] mt-1">
                              → Matches item #{progress.itemNumber}
                              {progress?.itemName && `: ${progress.itemName}`}
                            </div>
                          ) : (
                            <div className="text-xs text-[#FF3B30] mt-1">
                              ⚠ No matching item found
                            </div>
                          )}
                          {progress?.status === 'uploading' && (
                            <div className="text-xs text-[#007AFF] mt-1 flex items-center gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Uploading...
                            </div>
                          )}
                          {progress?.status === 'success' && (
                            <div className="text-xs text-[#34C759] mt-1 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Uploaded successfully
                            </div>
                          )}
                          {progress?.status === 'error' && (
                            <div className="text-xs text-[#FF3B30] mt-1 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {progress.error}
                            </div>
                          )}
                        </div>
                        {!uploading && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFile(index)}
                            className="text-[#969696] hover:text-[#FF3B30] flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t border-[#2a2d35] pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={uploading}
            className="border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] smooth-transition"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0 || !prefix.trim()}
            className="accent-button text-white smooth-transition"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload & Assign Images
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}


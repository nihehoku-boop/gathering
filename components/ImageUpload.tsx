'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, Loader2 } from 'lucide-react'
import { useAlert } from '@/hooks/useAlert'

interface ImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  label?: string
  aspectRatio?: string // e.g., "2/3", "1/1", "16/9"
  maxSize?: number // in MB
  className?: string
}

export default function ImageUpload({
  value,
  onChange,
  label = 'Image',
  aspectRatio,
  maxSize = 10,
  className = '',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showAlert } = useAlert()

  // Sync preview with value prop when it changes externally
  useEffect(() => {
    setPreview(value || null)
  }, [value])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showAlert({
        title: 'Invalid File',
        message: 'Please select an image file.',
        type: 'error',
      })
      return
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      showAlert({
        title: 'File Too Large',
        message: `File size must be less than ${maxSize}MB.`,
        type: 'error',
      })
      return
    }

    // Upload file (don't show FileReader preview, wait for Cloudinary URL)
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        let errorMessage = `Upload failed with status ${res.status}`
        try {
          const text = await res.text()
          console.error('Upload API error response (raw):', text)
          if (text) {
            try {
              const errorData = JSON.parse(text)
              errorMessage = errorData.error || errorData.details || errorMessage
              console.error('Upload API error (parsed):', errorData)
            } catch (parseError) {
              errorMessage = text || errorMessage
            }
          }
        } catch (e) {
          console.error('Failed to read error response:', e)
        }
        throw new Error(errorMessage)
      }

      const data = await res.json()
      console.log('Upload successful, received URL:', data.url)
      
      if (!data.url) {
        throw new Error('No URL returned from upload')
      }
      
      // Update parent component state first
      onChange(data.url)
      // Then update preview to show the Cloudinary URL
      setPreview(data.url)
      
      showAlert({
        title: 'Success',
        message: 'Image uploaded successfully!',
        type: 'success',
      })
    } catch (error) {
      console.error('Upload error:', error)
      showAlert({
        title: 'Upload Failed',
        message: error instanceof Error ? error.message : 'Failed to upload image. Please try again.',
        type: 'error',
      })
      // Reset preview to previous value on error
      setPreview(value || null)
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = () => {
    onChange(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-[var(--text-primary)]">{label}</label>
      
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={uploading}
          className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {value ? 'Change Image' : 'Upload Image'}
            </>
          )}
        </Button>

        {value && (
          <Button
            type="button"
            variant="outline"
            onClick={handleRemove}
            disabled={uploading}
            className="border-[var(--border-hover)] text-[#FF3B30] hover:bg-[var(--bg-tertiary)] hover:text-[#C0392B] smooth-transition"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {preview && (
        <div
          className="relative border border-[#2a2d35] rounded-lg overflow-hidden bg-[var(--bg-tertiary)]"
          style={aspectRatio ? { aspectRatio } : undefined}
        >
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      )}

      <p className="text-xs text-[var(--text-secondary)]">
        {value
          ? 'Image uploaded. You can also paste a URL below.'
          : `Upload an image (max ${maxSize}MB) or enter a URL below.`}
      </p>
    </div>
  )
}


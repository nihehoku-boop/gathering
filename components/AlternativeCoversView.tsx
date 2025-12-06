'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AlternativeCoversViewProps {
  mainImage: string | null
  alternativeImages: string[]
  onSelectImage: (imageUrl: string) => void
  onClose: () => void
}

export default function AlternativeCoversView({
  mainImage,
  alternativeImages,
  onSelectImage,
  onClose,
}: AlternativeCoversViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Combine main image with alternatives
  const allImages = mainImage ? [mainImage, ...alternativeImages] : alternativeImages
  
  if (allImages.length === 0) return null

  const currentImage = allImages[currentIndex]
  const isMainImage = currentIndex === 0 && mainImage

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))
  }

  const handleSelect = () => {
    if (currentIndex === 0 && mainImage) {
      // Already the main image
      onClose()
      return
    }
    onSelectImage(currentImage)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="relative bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] flex-shrink-0">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-[var(--text-primary)]" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Alternative Covers ({currentIndex + 1} / {allImages.length})
            </h3>
            {isMainImage && (
              <span className="text-xs bg-[var(--accent-color)] text-white px-2 py-0.5 rounded-full">
                Main
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative flex-1 flex items-center justify-center p-8 bg-[var(--bg-primary)]">
          {allImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                className="absolute left-4 bg-[var(--bg-secondary)]/80 hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-full z-10"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="absolute right-4 bg-[var(--bg-secondary)]/80 hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-full z-10"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          <div className="w-full h-full flex items-center justify-center">
            <img
              src={currentImage}
              alt={`Cover ${currentIndex + 1}`}
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-image.png'
              }}
            />
          </div>
        </div>

        {/* Thumbnail strip */}
        {allImages.length > 1 && (
          <div className="p-4 border-t border-[var(--border-color)] overflow-x-auto flex-shrink-0">
            <div className="flex gap-2 justify-center">
              {allImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`relative flex-shrink-0 w-16 h-20 rounded overflow-hidden border-2 transition-all ${
                    index === currentIndex
                      ? 'border-[var(--accent-color)] ring-2 ring-[var(--accent-color)]/50'
                      : 'border-[var(--border-hover)] hover:border-[#666]'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === 0 && mainImage && (
                    <div className="absolute top-0 right-0 bg-[var(--accent-color)] text-white text-[8px] px-1 rounded-bl">
                      Main
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 border-t border-[var(--border-color)] flex justify-end gap-2 flex-shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-full"
          >
            Cancel
          </Button>
          {!isMainImage && (
            <Button
              onClick={handleSelect}
              className="accent-button text-white rounded-full"
            >
              Set as Main Cover
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}




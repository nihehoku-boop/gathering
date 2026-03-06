'use client'

import Image from 'next/image'

const BLUR_DATA_URL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='

export interface CollectionCoverImageProps {
  src: string
  alt: string
  coverImageFit?: string | null
  containerClassName?: string
  imageClassName?: string
  unoptimized?: boolean
}

export default function CollectionCoverImage({
  src,
  alt,
  coverImageFit = 'cover',
  containerClassName = '',
  imageClassName = '',
  unoptimized = false,
}: CollectionCoverImageProps) {
  const fitContain = coverImageFit === 'contain'

  return (
    <div className={`relative w-full h-48 overflow-hidden bg-[var(--bg-tertiary)] ${containerClassName}`}>
      {/* Blurred, scaled background */}
      <div className="absolute inset-0">
        <Image
          src={src}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover scale-150 blur-lg opacity-50 select-none pointer-events-none"
          aria-hidden
          unoptimized={unoptimized}
        />
      </div>
      {/* Sharp logo/image on top */}
      <div className="relative z-10 flex items-center justify-center w-full h-full p-2">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`${fitContain ? 'object-contain' : 'object-cover'} smooth-transition ${imageClassName}`}
          loading="lazy"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          unoptimized={unoptimized}
        />
      </div>
    </div>
  )
}

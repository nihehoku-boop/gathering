'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1114] px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-semibold text-[#fafafa] mb-4 tracking-tight">Something went wrong!</h1>
        <p className="text-[#969696] mb-8 text-lg">
          {error.message || 'An unexpected error occurred'}
        </p>
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={reset}
            className="bg-[#007AFF] hover:bg-[#0051D5] text-white smooth-transition"
          >
            Try again
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] smooth-transition"
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  )
}


'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0f1114]">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-semibold text-[#fafafa] mb-4 tracking-tight">Something went wrong!</h1>
            <p className="text-[#969696] mb-8 text-lg">
              {error.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-[var(--accent-color)] text-white rounded-lg hover:bg-[var(--accent-color-hover)] smooth-transition font-medium"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}


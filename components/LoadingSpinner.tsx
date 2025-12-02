'use client'

export default function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-[#0f1114] lg:ml-64 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 border-4 border-[#2a2d35] rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-[var(--accent-color)] rounded-full animate-spin"></div>
          
          {/* Inner pulsing circle */}
          <div className="absolute inset-4 border-4 border-[#2a2d35] rounded-full"></div>
          <div className="absolute inset-4 border-4 border-transparent border-r-[var(--accent-color)] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
          
          {/* Center dot */}
          <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[var(--accent-color)] rounded-full animate-pulse"></div>
        </div>
        
        <div className="space-y-2">
          <p className="text-[#fafafa] text-lg font-medium">{message}</p>
          <div className="flex items-center justify-center gap-1">
            <span className="w-2 h-2 bg-[var(--accent-color)] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
            <span className="w-2 h-2 bg-[var(--accent-color)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-2 h-2 bg-[var(--accent-color)] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
          </div>
        </div>
      </div>
    </div>
  )
}


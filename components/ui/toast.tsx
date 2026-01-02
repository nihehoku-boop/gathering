'use client'

import { useEffect } from 'react'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { Button } from './button'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastProps {
  toast: Toast
  onClose: (id: string) => void
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

const colors = {
  success: 'bg-green-500/10 border-green-500/50 text-green-500',
  error: 'bg-red-500/10 border-red-500/50 text-red-500',
  info: 'bg-blue-500/10 border-blue-500/50 text-blue-500',
  warning: 'bg-amber-500/10 border-amber-500/50 text-amber-500',
}

export function ToastComponent({ toast, onClose }: ToastProps) {
  const Icon = icons[toast.type]
  const colorClass = colors[toast.type]

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onClose(toast.id)
      }, toast.duration)

      return () => clearTimeout(timer)
    }
  }, [toast.id, toast.duration, onClose])

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${colorClass} shadow-lg min-w-[300px] max-w-[500px] animate-slide-in-right`}
      role="alert"
    >
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 text-sm">
        <p className="font-medium">{toast.message}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onClose(toast.id)}
        className="h-6 w-6 p-0 hover:bg-transparent opacity-70 hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}


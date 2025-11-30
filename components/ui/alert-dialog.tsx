'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'

interface AlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
  showCancel?: boolean
}

export default function AlertDialog({
  open,
  onOpenChange,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  showCancel = false,
}: AlertDialogProps) {
  if (!open) return null

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onOpenChange(false)
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
    onOpenChange(false)
  }

  const icons = {
    info: <Info className="h-5 w-5 text-[#007AFF]" />,
    success: <CheckCircle className="h-5 w-5 text-[#34C759]" />,
    warning: <AlertTriangle className="h-5 w-5 text-[#FF9500]" />,
    error: <AlertCircle className="h-5 w-5 text-[#FF3B30]" />,
  }

  const iconColors = {
    info: 'bg-[#007AFF]/10',
    success: 'bg-[#34C759]/10',
    warning: 'bg-[#FF9500]/10',
    error: 'bg-[#FF3B30]/10',
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <Card className="w-full max-w-md bg-[#1a1d24] border-[#2a2d35] animate-scale-in">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${iconColors[type]}`}>
              {icons[type]}
            </div>
            <CardTitle className="text-[#fafafa]">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-[#969696]">{message}</p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          {showCancel && (
            <Button
              variant="outline"
              onClick={handleCancel}
              className="border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] smooth-transition rounded-full"
            >
              {cancelText}
            </Button>
          )}
          <Button
            onClick={handleConfirm}
            className={`smooth-transition rounded-full ${
              type === 'error'
                ? 'bg-[#FF3B30] hover:bg-[#C0392B] text-white'
                : type === 'warning'
                ? 'bg-[#FF9500] hover:bg-[#E68900] text-white'
                : type === 'success'
                ? 'bg-[#34C759] hover:bg-[#30D158] text-white'
                : 'accent-button text-white'
            }`}
          >
            {confirmText}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}




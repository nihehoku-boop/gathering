'use client'

import { useState, useCallback } from 'react'

interface AlertOptions {
  title: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
  showCancel?: boolean
}

export function useAlert() {
  const [alertDialog, setAlertDialog] = useState<AlertOptions & { open: boolean }>({
    open: false,
    title: '',
    message: '',
    type: 'info',
  })

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertDialog({
      ...options,
      open: true,
    })
  }, [])

  const showConfirm = useCallback((options: AlertOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setAlertDialog({
        ...options,
        open: true,
        showCancel: true,
        onConfirm: () => {
          if (options.onConfirm) {
            options.onConfirm()
          }
          resolve(true)
        },
        onCancel: () => {
          if (options.onCancel) {
            options.onCancel()
          }
          resolve(false)
        },
      })
    })
  }, [])

  const closeAlert = useCallback(() => {
    setAlertDialog((prev) => ({ ...prev, open: false }))
  }, [])

  return {
    alertDialog,
    showAlert,
    showConfirm,
    closeAlert,
  }
}




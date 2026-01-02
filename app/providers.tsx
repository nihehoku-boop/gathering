'use client'

import { SessionProvider } from 'next-auth/react'
import { MobileMenuProvider } from '@/contexts/MobileMenuContext'
import { ThemeProvider } from '@/components/ThemeProvider'
import AccentColorLoader from '@/components/AccentColorLoader'
import { ToastProvider } from '@/components/Toaster'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <MobileMenuProvider>
          <ToastProvider>
            <AccentColorLoader />
            {children}
          </ToastProvider>
        </MobileMenuProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}




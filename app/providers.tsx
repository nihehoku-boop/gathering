'use client'

import { SessionProvider } from 'next-auth/react'
import { MobileMenuProvider } from '@/contexts/MobileMenuContext'
import { ThemeProvider } from '@/components/ThemeProvider'
import AccentColorLoader from '@/components/AccentColorLoader'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <MobileMenuProvider>
          <AccentColorLoader />
          {children}
        </MobileMenuProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}




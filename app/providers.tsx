'use client'

import { SessionProvider } from 'next-auth/react'
import { MobileMenuProvider } from '@/contexts/MobileMenuContext'
import AccentColorLoader from '@/components/AccentColorLoader'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MobileMenuProvider>
        <AccentColorLoader />
        {children}
      </MobileMenuProvider>
    </SessionProvider>
  )
}




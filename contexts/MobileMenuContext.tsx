'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface MobileMenuContextType {
  isSidebarOpen: boolean
  setIsSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

const MobileMenuContext = createContext<MobileMenuContextType | undefined>(undefined)

export function MobileMenuProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev)
  }

  return (
    <MobileMenuContext.Provider value={{ isSidebarOpen, setIsSidebarOpen, toggleSidebar }}>
      {children}
    </MobileMenuContext.Provider>
  )
}

export function useMobileMenu() {
  const context = useContext(MobileMenuContext)
  if (context === undefined) {
    throw new Error('useMobileMenu must be used within a MobileMenuProvider')
  }
  return context
}



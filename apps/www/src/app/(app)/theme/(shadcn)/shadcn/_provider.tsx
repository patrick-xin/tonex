'use client'

import type React from 'react'
import { createContext, useContext, useRef } from 'react'
import { Toaster } from '@/components/shadcn/sonner'

type ShadcnContextType = React.RefObject<HTMLDivElement | null>

const ShadcnContext = createContext<ShadcnContextType | null>(null)

export const useShadcn = () => {
  const context = useContext(ShadcnContext)
  if (!context) {
    throw new Error('useShadcn must be used within a ShadcnProvider')
  }
  return context
}

export const ShadcnProvider = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement | null>(null)

  return (
    <ShadcnContext.Provider value={ref}>
      <div
        ref={ref}
        className="shadcn bg-background text-foreground size-full overflow-auto border-border outline-ring/50 p-2"
      >
        {children}
        <Toaster />
      </div>
    </ShadcnContext.Provider>
  )
}

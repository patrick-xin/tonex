'use client'

import { applyDom } from '@tonex/core'
import { ThemeProvider } from 'next-themes'
import { useEffect } from 'react'

// why: client-only provider shell. ThemeProvider owns the `dark` class on
// <html> (shadcn convention, ADR-0017). applyDom subscribes to the source
// store and writes the four scope blocks into a single <style> in <head>.
// The cleanup return ensures we unsubscribe on unmount in dev/HMR.
export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => applyDom(), [])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  )
}

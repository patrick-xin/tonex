'use client'

import { useHotkey } from '@tanstack/react-hotkeys'
import { applyDom } from '@tonex/core'
import { ThemeProvider, useTheme } from 'next-themes'
import { useEffect } from 'react'

// why: client-only provider shell. ThemeProvider owns the `dark` class on
// <html> (shadcn convention, ADR-0017). applyDom subscribes to the source
// store and writes the four scope blocks into a single <style> in <head>.
// The cleanup return ensures we unsubscribe on unmount in dev/HMR.
export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => applyDom(), [])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeHotkey />
      {children}
    </ThemeProvider>
  )
}

function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()

  useHotkey(
    'D',
    () => {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    },
    {
      ignoreInputs: true,
      requireReset: false,
      meta: { name: 'Toggle Theme', description: 'Press D to switch themes' },
    },
  )

  return null
}

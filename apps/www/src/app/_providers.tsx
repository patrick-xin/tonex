'use client'

import { applyDom } from '@tonex/core-react'
import { useEffect } from 'react'
import { ThemeModeProvider } from '@/features/theme-mode'

// why: client-only provider shell. ThemeModeProvider mounts next-themes
// (owns the `dark` class on <html>, ADR-0017) and the D-key hotkey. applyDom
// subscribes to the source store and writes the four scope blocks into a
// single <style> in <head>. The cleanup return ensures we unsubscribe on
// unmount in dev/HMR.
export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => applyDom(), [])

  return <ThemeModeProvider>{children}</ThemeModeProvider>
}

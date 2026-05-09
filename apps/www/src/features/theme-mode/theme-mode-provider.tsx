'use client'

import { useHotkey } from '@tanstack/react-hotkeys'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { useThemeToggle } from './use-theme-toggle'

// why: app-wide mount of next-themes plus the D-key hotkey. The hotkey is
// rendered inside the provider so consumers only mount one component, and
// next-themes stays an internal dependency of this folder only — per ADR-0022
// rule 5/6, "switch dark/light" is a workflow with a single home.
export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeHotkey />
      {children}
    </NextThemesProvider>
  )
}

function ThemeHotkey() {
  const { toggle } = useThemeToggle()
  useHotkey('D', toggle, {
    ignoreInputs: true,
    requireReset: false,
    meta: { name: 'Toggle Theme', description: 'Press D to switch themes' },
  })
  return null
}

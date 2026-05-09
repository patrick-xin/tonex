'use client'

import { useTheme } from 'next-themes'

// why: workflow primitive for "switch dark/light". Returns a stable shape
// (`isDark` + `toggle`) so callers don't depend on next-themes internals or
// recompute the dark/light comparison at every site. This is the only file
// outside ThemeModeProvider that imports `next-themes` directly.
export function useThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  return {
    isDark,
    toggle: () => setTheme(isDark ? 'light' : 'dark'),
  }
}

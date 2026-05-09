'use client'

import { useActiveMode, useSetMode } from './use-active-mode'

// why: workflow primitive for "switch dark/light". Reads mode through the
// allowlisted useActiveMode (ADR-0015 commitment 4) and writes through
// useSetMode — no direct next-themes dep here.
export function useThemeToggle() {
  const mode = useActiveMode()
  const setMode = useSetMode()
  const isDark = mode === 'dark'
  return {
    isDark,
    toggle: () => setMode(isDark ? 'light' : 'dark'),
  }
}

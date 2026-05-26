'use client'

import { themeToggleState } from './theme-toggle'
import { useActiveMode, useSetMode } from './use-active-mode'

// why: workflow primitive for "switch dark/light". Reads mode through the
// allowlisted useActiveMode (ADR-0015 commitment 4) and writes through
// useSetMode — no direct next-themes dep here. `mode` is surfaced (null until
// next-themes reconciles) so a persistent on-screen toggle can render an
// SSR-safe placeholder rather than flashing the wrong mode's icon (issue #124).
// `isDark`/`toggle` keep their pre-#124 shape so existing callers are untouched.
export function useThemeToggle() {
  const mode = useActiveMode()
  const setMode = useSetMode()
  const state = mode ? themeToggleState(mode) : null
  return {
    mode,
    isDark: state?.isDark ?? false,
    label: state?.label ?? 'Toggle theme',
    toggle: () => {
      if (state) setMode(state.nextMode)
    },
  }
}

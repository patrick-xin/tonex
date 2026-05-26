import type { Mode } from '@tonex/core'

export type ThemeToggleState = {
  isDark: boolean
  /** The mode the toggle switches to — the *other* mode. */
  nextMode: Mode
  /** Action label for aria-label / command-menu copy. Describes the target. */
  label: string
}

// why: the mode→UI derivation for the visible toggle (issue #124), pulled out of
// the React hook so the dark/light semantics are testable without next-themes.
// `label` describes the *action* (where the toggle takes you), matching the
// command-menu's "Switch to light/dark" phrasing so both surfaces read alike.
export function themeToggleState(mode: Mode): ThemeToggleState {
  const isDark = mode === 'dark'
  return {
    isDark,
    nextMode: isDark ? 'light' : 'dark',
    label: isDark ? 'Switch to light mode' : 'Switch to dark mode',
  }
}

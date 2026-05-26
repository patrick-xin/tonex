import { describe, expect, it } from 'vitest'
import { themeToggleState } from './theme-toggle'

// why: the pure mode→UI derivation behind the visible toggle (issue #124).
// Tested in isolation from next-themes — the hook composes this with the
// allowlisted useActiveMode/useSetMode, but the dark/light semantics live here.
describe('themeToggleState', () => {
  it('dark mode flips to light and labels the light action', () => {
    expect(themeToggleState('dark')).toEqual({
      isDark: true,
      nextMode: 'light',
      label: 'Switch to light mode',
    })
  })

  it('light mode flips to dark and labels the dark action', () => {
    expect(themeToggleState('light')).toEqual({
      isDark: false,
      nextMode: 'dark',
      label: 'Switch to dark mode',
    })
  })
})

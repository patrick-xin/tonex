// why: the theme slot. Slice 1 fills it with Shiki built-ins so highlighting
// ships everywhere without waiting on the custom theme; slice 2 (the V1 brand
// theme derived from the default palette) swaps these two imports for one
// generated dual-theme object and nothing else changes — call sites address the
// theme by name. The 'light'/'dark' keys are the dual-theme contract Shiki
// emits as `--shiki-light` / `--shiki-dark` vars, toggled by `.dark` on <html>
// (next-themes, see globals.css) so a single render serves both modes.
import githubDark from '@shikijs/themes/github-dark'
import githubLight from '@shikijs/themes/github-light'

export const HIGHLIGHT_THEMES = [githubLight, githubDark]

export const HIGHLIGHT_DUAL_THEME = {
  light: githubLight.name ?? 'github-light',
  dark: githubDark.name ?? 'github-dark',
} as const

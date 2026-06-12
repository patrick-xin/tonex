// why: the theme slot. Slice 1 fills it with Shiki built-ins so highlighting
// ships everywhere without waiting on the custom theme; slice 2 (the V1 brand
// theme derived from the default palette) swaps these two imports for one
// generated dual-theme object and nothing else changes — call sites address the
// theme by name. The 'light'/'dark' keys are the dual-theme contract Shiki
// emits as `--shiki-light` / `--shiki-dark` vars, toggled by `.dark` on <html>
// (next-themes, see globals.css) so a single render serves both modes.
import catppuccinFrappe from '@shikijs/themes/catppuccin-frappe'
import catppuccinLatte from '@shikijs/themes/catppuccin-latte'

export const HIGHLIGHT_THEMES = [catppuccinFrappe, catppuccinLatte]

export const HIGHLIGHT_DUAL_THEME = {
  light: catppuccinLatte.name ?? 'catppuccin-latte',
  dark: catppuccinFrappe.name ?? 'catppuccin-frappe',
} as const

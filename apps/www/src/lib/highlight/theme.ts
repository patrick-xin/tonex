// why: the 'light'/'dark' keys are the dual-theme contract Shiki emits as
// `--shiki-light` / `--shiki-dark` vars, toggled by `.dark` on <html>
// (next-themes, see globals.css) so a single render serves both modes.
import catppuccinFrappe from '@shikijs/themes/catppuccin-frappe'
import catppuccinLatte from '@shikijs/themes/catppuccin-latte'

export const HIGHLIGHT_THEMES = [catppuccinFrappe, catppuccinLatte]

export const HIGHLIGHT_DUAL_THEME = {
  light: catppuccinLatte.name ?? 'catppuccin-latte',
  dark: catppuccinFrappe.name ?? 'catppuccin-frappe',
} as const

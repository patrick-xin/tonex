'use client'

import { evaluateThemeContrast, type Mode, useResolvedTokens, useSource } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import type { ShadcnRoleName } from '@tonex/core/schema'
import { type ContrastWarning, toContrastWarning } from '@/features/contrast-checker/warning'

export function useRoleEditorData(role: ShadcnRoleName, mode: Mode) {
  const theme = useResolvedTokens()
  const overrides = useSource((s) => s.shadcnRoleOverrides[mode])

  const argb = theme?.shadcn[mode][role]
  // why: '#000000' fallback fires only if theme is null (popover re-render
  // pre-hydration) or the role somehow drops out of the closed enum — visual
  // sentinel, not a state the user reaches.
  const currentHex = argb !== undefined ? hexString(argb) : '#000000'

  // why: same ContrastReport the parent list reads — single memoized walk per
  // theme reference (ADR-0025 c.8). Find the shadcn pair that mentions this
  // role; the partner is the other slot. May be undefined for roles outside
  // CONTRAST_PAIRS (edges, sidebar utilities).
  const result =
    theme !== null
      ? evaluateThemeContrast(theme)[mode].find(
          (r) => r.pair.layer === 'shadcn' && (r.pair.fg === role || r.pair.bg === role),
        )
      : undefined

  const contrast: ContrastWarning | null =
    result === undefined ? null : toContrastWarning(result, role)

  return {
    currentHex,
    overridden: role in overrides,
    contrast,
  }
}

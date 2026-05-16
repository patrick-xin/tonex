'use client'

import { evaluateThemeContrast, type Mode, useResolvedTokens, useSource } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import type { MdTokenName } from '@tonex/core/schema'
import type { ContrastBadgeData } from '@/components/shared/contrast-badge'
import { isDecorative } from '@/features/contrast-checker/decorative'

export function useTokenEditorData(role: MdTokenName, mode: Mode) {
  const theme = useResolvedTokens()
  const overrides = useSource((s) => s.md3TokenOverrides[mode])

  // why: merge core + extended sub-maps — theme.md[mode] holds only the 28
  // core tokens, extended tokens live in lightExtended/darkExtended. Editor
  // accepts any MdTokenName, so it must read from both. theme is non-null
  // here: Popover only opens after mount, parent gated on hydration.
  const mdLayer = theme !== null ? { ...theme.md[mode], ...theme.md[`${mode}Extended`] } : null
  const argb = mdLayer?.[role]
  // why: '#000000' fallback fires only if mdLayer is null (theme not yet
  // hydrated when popover renders) or the token slips out of schema rotation —
  // both are visual-sentinel paths, not states the user should reach.
  const currentHex = argb !== undefined ? hexString(argb) : '#000000'

  // why: same ContrastReport the parent list reads — single memoized walk per
  // theme reference. Find the md pair that mentions this role in either slot;
  // the partner is the other slot.
  const result =
    theme !== null
      ? evaluateThemeContrast(theme)[mode].find(
          (r) => r.pair.layer === 'md' && (r.pair.fg === role || r.pair.bg === role),
        )
      : undefined
  const contrast: ContrastBadgeData | null =
    result === undefined
      ? null
      : {
          ratio: result.ratio,
          passes: result.passes,
          partner: result.pair.fg === role ? result.pair.bg : result.pair.fg,
          threshold: result.pair.threshold,
          decorative: isDecorative(result.pair),
        }

  return { currentHex, overridden: role in overrides, contrast }
}

'use client'

import { evaluateThemeContrast, useResolvedTokens, useSource } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import { MD_CORE_TOKEN_NAMES, MD_EXTENDED_TOKEN_NAMES, type MdTokenName } from '@tonex/core/schema'
import { isDecorative } from '@/features/contrast-checker/decorative'
import { type ContrastWarning, toContrastWarning } from '@/features/contrast-checker/warning'
import { useActiveMode } from '@/features/theme-mode'
import { useUiPrefs } from '@/lib/stores/ui-prefs'
import { ROLE_GROUPS } from './role-groups'

const ALL_TOKENS: ReadonlyArray<MdTokenName> = [...MD_CORE_TOKEN_NAMES, ...MD_EXTENDED_TOKEN_NAMES]

// why: Array.includes on the narrow MD_CORE_TOKEN_NAMES tuple infers its
// searchElement as MdCoreTokenName, which rejects the wider MdTokenName values
// in ROLE_GROUPS (e.g. '--color-primary-fixed'). A widened Set sidesteps the
// inference AND gives O(1) membership over the per-render filter loop.
const CORE_TOKEN_SET: ReadonlySet<MdTokenName> = new Set(MD_CORE_TOKEN_NAMES)

export function useTokens() {
  const theme = useResolvedTokens()
  const mode = useActiveMode()
  const allOverrides = useSource((s) => s.md3TokenOverrides)
  const showExtended = useUiPrefs((s) => s.showExtended)

  if (theme === null || mode === null) return null

  // why: theme.md[mode] holds only the 28 core tokens (+ custom-color slugs);
  // extended tokens live in lightExtended/darkExtended per derive.ts. Inspect
  // UIs merge the two for a flat 50-token view.
  const mdLayer = { ...theme.md[mode], ...theme.md[`${mode}Extended`] }
  const overrides = allOverrides[mode]
  const hexByRole: Partial<Record<MdTokenName, string>> = {}
  for (const name of ALL_TOKENS) {
    hexByRole[name] = hexString(mdLayer[name])
  }

  // why: ContrastReport is keyed off the DerivedTheme reference (issue #20
  // cache), so this hits the same memoized result that role-editor reads — no
  // duplicate contrastRatio walk per render.
  const report = evaluateThemeContrast(theme)
  const warnings = new Map<MdTokenName, ContrastWarning>()
  for (const result of report[mode]) {
    if (result.pair.layer !== 'md' || result.passes) continue
    if (isDecorative(result.pair)) continue
    warnings.set(result.pair.fg as MdTokenName, toContrastWarning(result))
  }

  // why: visibility filter for inspect surface; ADR-0023 commitment 1 —
  // deliberately decoupled from export's includeExtended job parameter because
  // they answer different questions (display pref vs job parameter). Families
  // with zero core roles (inverse, utility) drop entirely when showExtended is
  // false; mixed families (primary/secondary/tertiary/error/surface) lose their
  // fixed/dim members; outline is core-only so it passes through unchanged.
  const filteredGroups = showExtended
    ? ROLE_GROUPS
    : ROLE_GROUPS.flatMap((group) => {
        const coreRoles = group.roles.filter((r) => CORE_TOKEN_SET.has(r))
        return coreRoles.length > 0 ? [{ ...group, roles: coreRoles }] : []
      })

  return { mode, hexByRole, warnings, overrides, filteredGroups }
}

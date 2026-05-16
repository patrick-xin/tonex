'use client'

import { evaluateThemeContrast, useResolvedTokens, useSource } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import {
  DEFAULT_SHADCN_ROLE_BINDINGS,
  type MdTokenName,
  type ShadcnRoleName,
} from '@tonex/core/schema'
import type { ContrastBadgeData } from '@/components/shared/contrast-badge'
import { MD_TOKEN_ITEM_GROUPS } from '@/features/color-picker'
import { useActiveMode } from '@/features/theme-mode'

export interface TokenItem {
  token: MdTokenName
  label: string
  hex: string
}

export interface TokenItemGroup {
  label: string
  items: ReadonlyArray<TokenItem>
}

// why: MD3 splits Primary/Secondary/Tertiary into Fixed siblings; for the
// binding picker that just doubles headers. Merged into the parent group
// here — md-snapshot-picker keeps the original split.
function collapseFixedGroups(groups: ReadonlyArray<TokenItemGroup>): ReadonlyArray<TokenItemGroup> {
  const merged = new Map<string, TokenItem[]>()
  const order: string[] = []
  for (const g of groups) {
    const parent = g.label.replace(/ Fixed$/, '')
    if (!merged.has(parent)) {
      merged.set(parent, [])
      order.push(parent)
    }
    const bucket = merged.get(parent)
    if (bucket !== undefined) bucket.push(...g.items)
  }
  return order.map((label) => ({ label, items: merged.get(label) ?? [] }))
}

// why: rail-local hook, parallel to `useOverrideData`. Preps the picker's
// token domain once per render and binds the store setter to the active mode
// so the content file stays layout-focused.
export function useBindingData() {
  const theme = useResolvedTokens()
  const mode = useActiveMode()
  const allBindings = useSource((s) => s.shadcnRoleBindings)
  const setShadcnRoleBinding = useSource((s) => s.actions.setShadcnRoleBinding)

  if (theme === null || mode === null) return null

  // why: merge core md tokens with extended so the picker covers the full
  // 49-name domain. Same trick as MdSnapshotPicker.
  const mdLayer = { ...theme.md[mode], ...theme.md[`${mode}Extended`] }
  const tokenItemGroups: ReadonlyArray<TokenItemGroup> = collapseFixedGroups(
    MD_TOKEN_ITEM_GROUPS.map((g) => ({
      label: g.label,
      items: g.items.map((it) => ({
        token: it.token,
        label: it.label,
        hex: mdLayer[it.token] !== undefined ? hexString(mdLayer[it.token]) : '#000000',
      })),
    })),
  )
  const tokenItems: ReadonlyArray<TokenItem> = tokenItemGroups.flatMap((g) => g.items)

  const report = evaluateThemeContrast(theme)
  const roleContrastByRole = new Map<ShadcnRoleName, ContrastBadgeData>()
  for (const r of report[mode]) {
    if (r.pair.layer !== 'shadcn') continue
    roleContrastByRole.set(r.pair.fg as ShadcnRoleName, {
      ratio: r.ratio,
      passes: r.passes,
      partner: r.pair.bg,
      threshold: r.pair.threshold,
    })
  }

  return {
    mode,
    bindings: allBindings[mode],
    defaults: DEFAULT_SHADCN_ROLE_BINDINGS[mode],
    setBinding: (role: ShadcnRoleName, token: MdTokenName) =>
      setShadcnRoleBinding(mode, role, token),
    roleLayer: theme.shadcn[mode],
    roleContrastByRole,
    tokenItems,
    tokenItemGroups,
  }
}

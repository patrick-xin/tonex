'use client'

import { evaluateThemeContrast, useResolvedTokens, useSource } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import {
  DEFAULT_SHADCN_ROLE_BINDINGS,
  type MdTokenName,
  type ShadcnRoleName,
} from '@tonex/core/schema'
import { MD_TOKEN_ITEM_GROUPS } from '@/features/color-picker'
import { type ContrastWarning, toContrastWarning } from '@/features/contrast-checker/warning'
import { useActiveMode } from '@/features/theme-mode'
import { collapseFixedGroups, type TokenItem, type TokenItemGroup } from './collapse-fixed-groups'

export type { TokenItem, TokenItemGroup }

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
  const roleContrastByRole = new Map<ShadcnRoleName, ContrastWarning>()
  for (const r of report[mode]) {
    if (r.pair.layer !== 'shadcn') continue
    roleContrastByRole.set(r.pair.fg as ShadcnRoleName, toContrastWarning(r))
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

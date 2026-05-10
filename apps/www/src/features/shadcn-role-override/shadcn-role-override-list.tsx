'use client'

import { evaluateThemeContrast, useResolvedTokens, useSource } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import { SHADCN_ROLE_NAMES, type ShadcnRoleName } from '@tonex/core/schema'
import { Popover, PopoverContent } from '@/components/ui/popover'
import { useActiveMode } from '@/features/theme-mode'
import { RoleEditor } from './role-editor'
import { ROLE_GROUPS } from './role-groups'
import { popoverHandle, RoleSwatch } from './role-swatch'

const ALL_ROLES: ReadonlyArray<ShadcnRoleName> = SHADCN_ROLE_NAMES

// why: ADR-0026 c.6 — the shadcn override editor surface. Mirrors
// color-roles-list/ structure: grouped swatches, click → popover with the
// per-role editor. Reads `theme.shadcn[mode]` (post-override) so swatches
// reflect the literal pin instantly when the user hits "set hex" — derive
// resolves overrides inside the spine (ADR-0017), no separate UI projection.
export function ShadcnRoleOverrideList() {
  const theme = useResolvedTokens()
  const mode = useActiveMode()
  const allOverrides = useSource((s) => s.shadcnRoleOverrides)

  // why: two-flag null gate (theme = source._hydrated, mode = next-themes
  // mounted). Mirrors color-roles-list's hydration handling.
  if (theme === null || mode === null) return null

  const shadcnLayer = theme.shadcn[mode]
  const overrides = allOverrides[mode]
  const hexByRole: Partial<Record<ShadcnRoleName, string>> = {}
  for (const name of ALL_ROLES) {
    const argb = shadcnLayer[name]
    if (argb !== undefined) hexByRole[name] = hexString(argb)
  }

  // why: same memoized ContrastReport reference the editor reads — one
  // contrastRatio walk per derive (ADR-0025 c.8). Filter to shadcn-layer
  // failures so warnings only fire on roles that have a defined pair.
  const report = evaluateThemeContrast(theme)
  const warnings = new Map<ShadcnRoleName, { partner: ShadcnRoleName; ratio: number }>()
  for (const result of report[mode]) {
    if (result.pair.layer !== 'shadcn' || result.passes) continue
    warnings.set(result.pair.fg as ShadcnRoleName, {
      partner: result.pair.bg as ShadcnRoleName,
      ratio: result.ratio,
    })
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {ROLE_GROUPS.map((group) => (
        <section key={group.label}>
          <p className="text-sm font-semibold uppercase tracking-wider mb-2">{group.label}</p>
          <div className="flex flex-wrap gap-2">
            {group.roles.map((role) => {
              const hex = hexByRole[role] ?? '#000000'
              return (
                <RoleSwatch
                  key={role}
                  role={role}
                  hex={hex}
                  warning={warnings.get(role)}
                  overridden={role in overrides}
                />
              )
            })}
          </div>
        </section>
      ))}

      <Popover handle={popoverHandle}>
        {({ payload: role }) =>
          role !== undefined ? (
            <PopoverContent sideOffset={8} align="start" className="sm:min-w-72">
              <RoleEditor key={role} role={role} mode={mode} />
            </PopoverContent>
          ) : null
        }
      </Popover>
    </div>
  )
}

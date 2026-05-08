'use client'

import { useResolvedTokens, useSource } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import { MD_CORE_TOKEN_NAMES, MD_EXTENDED_TOKEN_NAMES, type MdTokenName } from '@tonex/core/schema'
import { Popover, PopoverContent } from '@/components/ui/popover'
import { useActiveMode } from '@/lib/hooks/use-active-mode'
import { useUiPrefs } from '@/lib/stores/ui-prefs'
import { AA_THRESHOLD, contrastRatio, ROLE_CONTRAST_PAIRS } from './contrast-utils'
import { RoleEditor } from './role-editor'
import { ROLE_GROUPS } from './role-groups'
import { popoverHandle, RoleSwatch } from './role-swatch'

const ALL_TOKENS: ReadonlyArray<MdTokenName> = [...MD_CORE_TOKEN_NAMES, ...MD_EXTENDED_TOKEN_NAMES]

export function ColorRolesList() {
  const theme = useResolvedTokens()
  const mode = useActiveMode()
  const allOverrides = useSource((s) => s.md3TokenOverrides)
  const showExtended = useUiPrefs((s) => s.showExtended)

  // why: two-flag null gate (theme = source._hydrated, mode = next-themes
  // mounted). Same contract as useResolvedTokens / useActiveMode docs.
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

  const warnings = new Map<MdTokenName, { partner: MdTokenName; ratio: number }>()
  for (const [fg, bg] of ROLE_CONTRAST_PAIRS) {
    const fgHex = hexByRole[fg]
    const bgHex = hexByRole[bg]
    if (fgHex === undefined || bgHex === undefined) continue
    const ratio = contrastRatio(fgHex, bgHex)
    if (ratio < AA_THRESHOLD) warnings.set(fg, { partner: bg, ratio })
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
        const coreRoles = group.roles.filter((r) => MD_CORE_TOKEN_NAMES.includes(r))
        return coreRoles.length > 0 ? [{ ...group, roles: coreRoles }] : []
      })

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {filteredGroups.map((group) => (
        <section key={group.label}>
          <p className="text-sm font-semibold uppercase tracking-wider mb-2">{group.label}</p>
          <div className="flex flex-wrap gap-2">
            {group.roles.map((role) => {
              // why: hexByRole is Partial<Record<MdTokenName, ...>> because the
              // mdLayer merge above is typed-but-complete — '#000000' fires only
              // if a token slips out of MD_CORE/EXTENDED_TOKEN_NAMES rotation
              // (visual sentinel, not a runtime guard).
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

      {/* placeholder: custom-color role swatches.
       * customColors live in source; deriveTheme emits 4 md tokens per entry
       * (--color-{slug}, --color-on-{slug}, --color-{slug}-container,
       * --color-on-{slug}-container) merged into md.{light,dark}. Per-role
       * override is NOT supported today — applyMd3TokenOverrides runs BEFORE
       * custom colors merge in derive.ts, and MdTokenName is a closed enum
       * that doesn't include slug-keyed tokens. Whole-entry edit lives in
       * features/custom-colors/. Adding per-role override would require a
       * core-side primitive (extend setMd3TokenOverride to accept slug tokens
       * AND apply post-custom-color merge in derive). See
       * code-conventions.md "primitive-shape diff".
       */}

      <Popover handle={popoverHandle}>
        {({ payload: role }) =>
          role !== undefined ? (
            <PopoverContent sideOffset={8} align="start" className="sm:min-w-56">
              <RoleEditor key={role} role={role} mode={mode} />
            </PopoverContent>
          ) : null
        }
      </Popover>
    </div>
  )
}

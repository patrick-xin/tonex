import { SHADCN_PRESETS, type ShadcnPresetName } from '@tonex/core/schema'

// why: on the shadcn layer the CMF second source only has a visible effect when
// the active preset actually binds a shadcn role to a --color-tertiary* token.
// Most presets (default/grove/enterprise/sage, etc.) never reference tertiary,
// so the second source silently does nothing there (Finding 2). Derived from the
// binding values rather than a name list so it can't drift from the presets.
// null preset ("custom"/drifted) → unknown, treat as not-wired (conservative).
export function presetUsesTertiary(preset: ShadcnPresetName | null): boolean {
  if (preset === null) return false
  const { shadcnRoleBindings } = SHADCN_PRESETS[preset]
  return [shadcnRoleBindings.light, shadcnRoleBindings.dark].some((mode) =>
    Object.values(mode).some((token) => token.includes('--color-tertiary')),
  )
}

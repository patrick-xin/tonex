import type { ShadcnRoleName } from '@tonex/core/schema'

// why: shadcn role names already read as the user-facing string (`--ring`,
// `--card-foreground`); we strip the leading `--` for the editor label so the
// swatch/popover doesn't repeat the prefix in every line. The trade-off is
// the picker is shadcn-only — the md-side helper in color-roles-list strips
// `--color-` for the same reason.
export function shadcnRoleDisplayName(role: ShadcnRoleName): string {
  return role.slice('--'.length)
}

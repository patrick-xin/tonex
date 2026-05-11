import type { ShadcnChartTokenName } from '@tonex/core/schema'

// why: chart token names already read as the user-facing string (`--chart-1`
// … `--chart-5`); strip the leading `--` for the editor label so the swatch
// /popover doesn't repeat the prefix in every line. Mirrors the role-side
// `shadcnRoleDisplayName` convention.
export function shadcnChartDisplayName(token: ShadcnChartTokenName): string {
  return token.slice('--'.length)
}

import type { ContrastPair } from '@tonex/core/schema'
import { MD_FAMILY_ORDER, mdFamilyLabel } from '@/features/color-roles-list'
import type { Layer } from '@/lib/layer-context'

// why: shadcn pairs group by pair.bg (the surface family signal). Order
// matters — `--sidebar*` must claim its members before the non-prefixed
// sidebar siblings (e.g. `--sidebar-primary`) would catch on `primary`.
// Same trick as shadcn-role-override/role-groups.ts.
const SHADCN_FAMILY: ReadonlyArray<readonly [RegExp, string]> = [
  [/^--sidebar/, 'Sidebar'],
  [/^--background$|^--foreground$/, 'Surface'],
  [/^--card/, 'Card'],
  [/^--popover/, 'Popover'],
  [/^--primary/, 'Primary'],
  [/^--secondary/, 'Secondary'],
  [/^--muted/, 'Muted'],
  [/^--accent/, 'Accent'],
  [/^--destructive/, 'Destructive'],
]

// why: chart fg's (`--color-chart-N`, `--chart-N`) read against surface
// backgrounds. Short-circuit on layer so chart pairs cohere as their own
// family chip instead of folding into a role family. ADR-0027 c.5. Custom-
// color pairs (md-custom / shadcn-custom) short-circuit the same way — their
// slugs are runtime, so no role-family rule would match them. md non-chart
// pairs classify by pair.fg through the color-roles-list family rules so the
// contrast table and the inspect role list agree; shadcn classifies by pair.bg.
export function familyOf(pair: ContrastPair): string {
  if (pair.layer === 'md-chart' || pair.layer === 'shadcn-chart') return 'Chart'
  if (pair.layer === 'md-custom' || pair.layer === 'shadcn-custom') return 'Custom'
  if (pair.layer === 'shadcn') {
    for (const [re, label] of SHADCN_FAMILY) if (re.test(pair.bg)) return label
    return 'Other'
  }
  return mdFamilyLabel(pair.fg)
}

// why: explicit display order so the family chip placement doesn't drift
// when CONTRAST_PAIRS is reordered upstream. md mirrors color-roles-list's
// MD_FAMILY_ORDER; Custom + Chart trail as separate cohorts (user-extension
// surfaces) and 'Other' is a safety bucket. shadcn: Sidebar trails the core
// token families (scoped surface), then Custom + Chart.
const FAMILY_ORDER_MD: readonly string[] = [...MD_FAMILY_ORDER, 'Custom', 'Chart', 'Other']

const FAMILY_ORDER_SHADCN = [
  'Surface',
  'Card',
  'Popover',
  'Primary',
  'Secondary',
  'Muted',
  'Accent',
  'Destructive',
  'Sidebar',
  'Custom',
  'Chart',
  'Other',
] as const

export function familyOrder(layer: Layer): readonly string[] {
  return layer === 'shadcn' ? FAMILY_ORDER_SHADCN : FAMILY_ORDER_MD
}

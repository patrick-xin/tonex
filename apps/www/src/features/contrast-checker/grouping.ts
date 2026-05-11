import type { ContrastPair } from '@tonex/core/schema'
import type { Layer } from './types'

// why: pair.bg is the surface family signal. Order matters — `--sidebar*`
// must claim its members before the non-prefixed sidebar siblings (e.g.
// `--sidebar-primary`) would catch on `primary`. Same trick as
// shadcn-role-override/role-groups.ts. md side mirrors the perceptual
// families that show up in the existing 18 md text pairs.
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

const MD_FAMILY: ReadonlyArray<readonly [RegExp, string]> = [
  [/inverse/, 'Inverse'],
  [/-fixed/, 'Fixed'],
  [/primary/, 'Primary'],
  [/secondary/, 'Secondary'],
  [/tertiary/, 'Tertiary'],
  [/error/, 'Error'],
  [/surface/, 'Surface'],
]

// why: chart fg's (`--color-chart-N`, `--chart-N`) read against surface
// backgrounds — the same bg patterns that drive Surface/Card families for
// non-chart pairs. Short-circuit on layer so chart pairs cohere as their
// own family chip instead of folding into Surface/Card and masking the
// chart character (multiple fg's hitting the same bg). ADR-0027 c.5.
export function familyOf(pair: ContrastPair): string {
  if (pair.layer === 'md-chart' || pair.layer === 'shadcn-chart') return 'Chart'
  const table = pair.layer === 'shadcn' ? SHADCN_FAMILY : MD_FAMILY
  for (const [re, label] of table) if (re.test(pair.bg)) return label
  return 'Other'
}

// why: explicit display order so the family chip placement doesn't drift
// when CONTRAST_PAIRS is reordered upstream. Chart lands last in each
// layer (separate cohort, larger group, non-text only). 'Other' is a
// safety bucket and always trails.
const FAMILY_ORDER_MD = [
  'Inverse',
  'Fixed',
  'Primary',
  'Secondary',
  'Tertiary',
  'Error',
  'Surface',
  'Chart',
  'Other',
] as const

const FAMILY_ORDER_SHADCN = [
  'Sidebar',
  'Surface',
  'Card',
  'Popover',
  'Primary',
  'Secondary',
  'Muted',
  'Accent',
  'Destructive',
  'Chart',
  'Other',
] as const

export function familyOrder(layer: Layer): readonly string[] {
  return layer === 'shadcn' ? FAMILY_ORDER_SHADCN : FAMILY_ORDER_MD
}

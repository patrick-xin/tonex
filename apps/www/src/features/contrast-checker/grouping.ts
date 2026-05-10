import type { ContrastPair } from '@tonex/core/schema'

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

export function familyOf(pair: ContrastPair): string {
  const table = pair.layer === 'shadcn' ? SHADCN_FAMILY : MD_FAMILY
  for (const [re, label] of table) if (re.test(pair.bg)) return label
  return 'Other'
}

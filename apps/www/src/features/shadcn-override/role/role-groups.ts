import { SHADCN_ROLE_NAMES, type ShadcnRoleName } from '@tonex/core/schema'

// why: shadcn roles fall into perceptual families that match the panes a user
// thinks in (background+foreground, card surface, popover surface, primary
// button family, secondary, muted, accent, destructive, edge family, sidebar
// surface). Sidebar collapses into one trailing group because all six sidebar
// roles share one perceptual surface.
type FamilyKey =
  | 'surface'
  | 'card'
  | 'popover'
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'accent'
  | 'destructive'
  | 'edge'
  | 'sidebar'

const FAMILY_LABEL: Record<FamilyKey, string> = {
  surface: 'Surface',
  card: 'Card',
  popover: 'Popover',
  primary: 'Primary',
  secondary: 'Secondary',
  muted: 'Muted',
  accent: 'Accent',
  destructive: 'Destructive',
  edge: 'Edge',
  sidebar: 'Sidebar',
}

const FAMILY_ORDER: ReadonlyArray<FamilyKey> = [
  'surface',
  'card',
  'popover',
  'primary',
  'secondary',
  'muted',
  'accent',
  'destructive',
  'edge',
  'sidebar',
]

// why: branch order matters — sidebar-* must claim its members before the
// non-prefixed sidebar siblings would catch them via substring rules below.
function familyOf(role: ShadcnRoleName): FamilyKey {
  if (role.startsWith('--sidebar')) return 'sidebar'
  if (role === '--background' || role === '--foreground') return 'surface'
  if (role === '--card' || role === '--card-foreground') return 'card'
  if (role === '--popover' || role === '--popover-foreground') return 'popover'
  if (role === '--primary' || role === '--primary-foreground') return 'primary'
  if (role === '--secondary' || role === '--secondary-foreground') return 'secondary'
  if (role === '--muted' || role === '--muted-foreground') return 'muted'
  if (role === '--accent' || role === '--accent-foreground') return 'accent'
  if (role === '--destructive') return 'destructive'
  return 'edge'
}

export interface RoleGroup {
  label: string
  roles: readonly ShadcnRoleName[]
}

export const ROLE_GROUPS: ReadonlyArray<RoleGroup> = (() => {
  const buckets = new Map<FamilyKey, ShadcnRoleName[]>()
  for (const name of SHADCN_ROLE_NAMES) {
    const key = familyOf(name)
    const arr = buckets.get(key) ?? []
    arr.push(name)
    buckets.set(key, arr)
  }
  return FAMILY_ORDER.flatMap<RoleGroup>((key) => {
    const roles = buckets.get(key)
    return roles && roles.length > 0 ? [{ label: FAMILY_LABEL[key], roles }] : []
  })
})()

// why: hand-curated layout grouping for the page-level override surface where
// two-column pair sections (background+foreground beside primary+pfg) let
// users compare related role pairs side-by-side. Distinct from ROLE_GROUPS
// because that's a family classifier (uniform single-column, used by the
// rail) — same role set, different rendering intent.
export type PaletteGroup =
  | {
      kind: 'pair'
      label: string
      columns: readonly [readonly ShadcnRoleName[], readonly ShadcnRoleName[]]
    }
  | { kind: 'flat'; label: string; roles: readonly ShadcnRoleName[] }

export const PALETTE_GROUPS: ReadonlyArray<PaletteGroup> = [
  {
    kind: 'pair',
    label: 'Background & Primary',
    columns: [
      ['--background', '--foreground'],
      ['--primary', '--primary-foreground'],
    ],
  },
  {
    kind: 'pair',
    label: 'Secondary & Accent',
    columns: [
      ['--secondary', '--secondary-foreground'],
      ['--accent', '--accent-foreground'],
    ],
  },
  {
    kind: 'pair',
    label: 'Card & Popover',
    columns: [
      ['--card', '--card-foreground'],
      ['--popover', '--popover-foreground'],
    ],
  },
  {
    kind: 'flat',
    label: 'Muted',
    roles: ['--muted', '--muted-foreground'],
  },
  {
    kind: 'flat',
    label: 'Border & Input',
    roles: ['--border', '--input'],
  },
  {
    kind: 'flat',
    label: 'Ring & Destructive',
    roles: ['--ring', '--destructive'],
  },
  {
    kind: 'flat',
    label: 'Sidebar',
    roles: [
      '--sidebar',
      '--sidebar-foreground',
      '--sidebar-primary',
      '--sidebar-primary-foreground',
      '--sidebar-accent',
      '--sidebar-accent-foreground',
      '--sidebar-border',
      '--sidebar-ring',
    ],
  },
]

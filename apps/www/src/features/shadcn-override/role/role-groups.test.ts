import { SHADCN_ROLE_NAMES, type ShadcnRoleName } from '@tonex/core/schema'
import { describe, expect, it } from 'vitest'
import { PALETTE_GROUPS, ROLE_GROUPS } from './role-groups'

// why: two distinct grouping surfaces for the shadcn role set.
//   - ROLE_GROUPS is a derived family classifier (used by the rail). The
//     branch-order trap (`--sidebar` family must claim its members before
//     the substring matches catch them) is the bug the source comment warns
//     against — pin it.
//   - PALETTE_GROUPS is hand-curated two-column layout data (used by the
//     override page). Per the data-curation convention we don't pin which
//     column a role lives in, only the structural contracts: discriminated
//     union by `kind`, full partition of SHADCN_ROLE_NAMES, no duplicates.

describe('ROLE_GROUPS', () => {
  it('partitions SHADCN_ROLE_NAMES — every role appears in exactly one group', () => {
    const all = ROLE_GROUPS.flatMap((g) => g.roles)
    const allSet = new Set<ShadcnRoleName>(all)
    expect(allSet.size).toBe(all.length) // no duplicates
    expect(allSet.size).toBe(SHADCN_ROLE_NAMES.length)
    for (const role of SHADCN_ROLE_NAMES) {
      expect(allSet.has(role)).toBe(true)
    }
  })

  it('omits empty families (every group has at least one role)', () => {
    for (const group of ROLE_GROUPS) {
      expect(group.roles.length).toBeGreaterThan(0)
    }
  })

  it('has unique non-empty labels', () => {
    const labels = ROLE_GROUPS.map((g) => g.label)
    expect(new Set(labels).size).toBe(labels.length)
    for (const label of labels) {
      expect(label.length).toBeGreaterThan(0)
    }
  })

  it('routes every --sidebar-* role to the Sidebar group (branch-order trap)', () => {
    // `--sidebar-primary` contains 'primary'; if the sidebar branch didn't
    // run first the substring rules would fold these into Primary/Accent.
    const sidebar = ROLE_GROUPS.find((g) => g.label === 'Sidebar')
    expect(sidebar).toBeDefined()
    if (!sidebar) return
    const sidebarRoles = SHADCN_ROLE_NAMES.filter((r) => r.startsWith('--sidebar'))
    expect(sidebar.roles.length).toBe(sidebarRoles.length)
    for (const role of sidebarRoles) {
      expect(sidebar.roles).toContain(role)
    }
  })
})

describe('PALETTE_GROUPS', () => {
  it('discriminates the union by `kind` — every entry is `pair` or `flat`', () => {
    for (const group of PALETTE_GROUPS) {
      expect(['pair', 'flat']).toContain(group.kind)
      if (group.kind === 'pair') {
        expect(group.columns).toHaveLength(2)
      } else {
        expect(group.roles.length).toBeGreaterThan(0)
      }
    }
  })

  it('partitions SHADCN_ROLE_NAMES — every role appears in exactly one slot, no extras', () => {
    const flat = PALETTE_GROUPS.flatMap((g) =>
      g.kind === 'pair' ? [...g.columns[0], ...g.columns[1]] : [...g.roles],
    )
    const set = new Set<ShadcnRoleName>(flat)
    expect(set.size).toBe(flat.length) // no duplicates
    expect(set.size).toBe(SHADCN_ROLE_NAMES.length)
    for (const role of SHADCN_ROLE_NAMES) {
      expect(set.has(role)).toBe(true)
    }
  })

  it('has unique non-empty labels', () => {
    const labels = PALETTE_GROUPS.map((g) => g.label)
    expect(new Set(labels).size).toBe(labels.length)
    for (const label of labels) {
      expect(label.length).toBeGreaterThan(0)
    }
  })
})

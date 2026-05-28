import { MD_CORE_TOKEN_NAMES, MD_EXTENDED_TOKEN_NAMES } from '@tonex/core/schema'
import { describe, expect, it } from 'vitest'
import { MD_FAMILY_ORDER, mdFamilyLabel, ROLE_GROUPS } from './role-groups'

// why: this helper is the shared md-family classifier — both the inspect role
// list and the contrast-checker md grouping read from it, so the families
// must stay in lockstep. The branch-order trap (`inverse` must beat `primary`
// because `--color-inverse-primary` contains both) is the bug the comments
// flag; pin it explicitly.

describe('mdFamilyLabel', () => {
  it('classifies the primary family by `includes`, not `startsWith`', () => {
    expect(mdFamilyLabel('--color-primary')).toBe('Primary')
    expect(mdFamilyLabel('--color-on-primary')).toBe('Primary')
    expect(mdFamilyLabel('--color-primary-container')).toBe('Primary')
    expect(mdFamilyLabel('--color-on-primary-container')).toBe('Primary')
    expect(mdFamilyLabel('--color-primary-fixed')).toBe('Primary')
  })

  it('classifies secondary / tertiary / error / outline / surface families', () => {
    expect(mdFamilyLabel('--color-secondary')).toBe('Secondary')
    expect(mdFamilyLabel('--color-on-secondary-container')).toBe('Secondary')
    expect(mdFamilyLabel('--color-tertiary-fixed-dim')).toBe('Tertiary')
    expect(mdFamilyLabel('--color-error')).toBe('Error')
    expect(mdFamilyLabel('--color-error-container')).toBe('Error')
    expect(mdFamilyLabel('--color-outline')).toBe('Outline')
    expect(mdFamilyLabel('--color-outline-variant')).toBe('Outline')
    expect(mdFamilyLabel('--color-surface')).toBe('Surface')
    expect(mdFamilyLabel('--color-surface-container-high')).toBe('Surface')
    expect(mdFamilyLabel('--color-on-surface-variant')).toBe('Surface')
  })

  it('routes --color-inverse-* to Inverse, beating the primary `includes` branch', () => {
    // The branch-order trap: `--color-inverse-primary` contains 'primary'.
    // If inverse weren't checked first it would fold into Primary, which is
    // the bug the source comment warns about.
    expect(mdFamilyLabel('--color-inverse-primary')).toBe('Inverse')
    expect(mdFamilyLabel('--color-inverse-surface')).toBe('Inverse')
    expect(mdFamilyLabel('--color-inverse-on-surface')).toBe('Inverse')
  })

  it('treats --color-shadow and --color-scrim as Utility (exact match, not includes)', () => {
    expect(mdFamilyLabel('--color-shadow')).toBe('Utility')
    expect(mdFamilyLabel('--color-scrim')).toBe('Utility')
  })

  it('falls back to Utility for any token that does not match a family', () => {
    expect(mdFamilyLabel('--unknown-token')).toBe('Utility')
    expect(mdFamilyLabel('--color-zzz')).toBe('Utility')
  })
})

describe('MD_FAMILY_ORDER', () => {
  it('lists every family exactly once, in canonical order', () => {
    expect(MD_FAMILY_ORDER).toEqual([
      'Primary',
      'Secondary',
      'Tertiary',
      'Error',
      'Surface',
      'Outline',
      'Inverse',
      'Utility',
    ])
  })
})

describe('ROLE_GROUPS', () => {
  it('preserves canonical MD_FAMILY_ORDER for the families that appear', () => {
    const labels = ROLE_GROUPS.map((g) => g.label)
    // Each label must appear in MD_FAMILY_ORDER and be in the same relative order.
    const expectedOrder = MD_FAMILY_ORDER.filter((l) => labels.includes(l))
    expect(labels).toEqual(expectedOrder)
  })

  it('omits families that have no tokens (no empty groups)', () => {
    for (const group of ROLE_GROUPS) {
      expect(group.roles.length).toBeGreaterThan(0)
    }
  })

  it('partitions MD_CORE + MD_EXTENDED tokens — every token appears in exactly one group', () => {
    const allTokens = [...MD_CORE_TOKEN_NAMES, ...MD_EXTENDED_TOKEN_NAMES]
    const grouped = ROLE_GROUPS.flatMap((g) => g.roles)
    expect(grouped.length).toBe(allTokens.length)
    expect(new Set(grouped).size).toBe(allTokens.length)
    for (const token of allTokens) {
      expect(grouped).toContain(token)
    }
  })

  it('places each role in the family mdFamilyLabel would assign it (single source of truth)', () => {
    for (const group of ROLE_GROUPS) {
      for (const role of group.roles) {
        expect(mdFamilyLabel(role)).toBe(group.label)
      }
    }
  })
})

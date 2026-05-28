import { MD_TOKEN_NAMES, type MdTokenName } from '@tonex/core/schema'
import { describe, expect, it } from 'vitest'
import { MD_TOKEN_GROUPS, MD_TOKEN_ITEM_GROUPS } from './md-token-groups'

// why: this is curated grouping data driving the md color picker. Per the
// data-curation testing convention we don't pin which group a token lives
// in (that's a curation choice that may shift) — but the *structural*
// contracts are real: every MdTokenName must appear in some group (else it
// silently vanishes from the picker), no duplicates, and the derived
// MD_TOKEN_ITEM_GROUPS must mirror MD_TOKEN_GROUPS so the rendering layer
// can trust one or the other interchangeably.

describe('MD_TOKEN_GROUPS', () => {
  it('partitions MD_TOKEN_NAMES — every md token appears in exactly one group', () => {
    const all = MD_TOKEN_GROUPS.flatMap((g) => g.tokens)
    const allSet = new Set<MdTokenName>(all)
    expect(allSet.size).toBe(all.length) // no duplicates
    expect(allSet.size).toBe(MD_TOKEN_NAMES.length)
    for (const token of MD_TOKEN_NAMES) {
      expect(allSet.has(token)).toBe(true)
    }
  })

  it('has a unique non-empty label per group', () => {
    const labels = MD_TOKEN_GROUPS.map((g) => g.label)
    expect(new Set(labels).size).toBe(labels.length)
    for (const label of labels) {
      expect(label.length).toBeGreaterThan(0)
    }
  })

  it('has at least one token per group (no empty groups)', () => {
    for (const group of MD_TOKEN_GROUPS) {
      expect(group.tokens.length).toBeGreaterThan(0)
    }
  })
})

describe('MD_TOKEN_ITEM_GROUPS', () => {
  it('mirrors MD_TOKEN_GROUPS — same labels in the same order', () => {
    expect(MD_TOKEN_ITEM_GROUPS.map((g) => g.label)).toEqual(MD_TOKEN_GROUPS.map((g) => g.label))
  })

  it('mirrors each group — same token order, one item per token', () => {
    expect(MD_TOKEN_ITEM_GROUPS.length).toBe(MD_TOKEN_GROUPS.length)
    for (let i = 0; i < MD_TOKEN_ITEM_GROUPS.length; i++) {
      const items = MD_TOKEN_ITEM_GROUPS[i]
      const source = MD_TOKEN_GROUPS[i]
      if (!items || !source) throw new Error('group index out of range')
      expect(items.items.map((it) => it.token)).toEqual([...source.tokens])
    }
  })

  it('strips the `--color-` prefix to derive each item label', () => {
    for (const group of MD_TOKEN_ITEM_GROUPS) {
      for (const item of group.items) {
        expect(item.label).toBe(item.token.slice('--color-'.length))
        expect(item.label.startsWith('--color-')).toBe(false)
      }
    }
  })
})

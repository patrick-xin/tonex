import { describe, expect, it } from 'vitest'
import { collapseFixedGroups, type TokenItem, type TokenItemGroup } from './collapse-fixed-groups'

// why: MD3 splits Primary into "Primary" + "Primary Fixed" siblings. For the
// binding picker this just doubles headers, so the rail merges them under the
// parent label. Three contracts worth pinning:
//   - only a TRAILING ' Fixed' is stripped (not e.g. 'Fixed Layer')
//   - first-appearance order of the parent label is preserved
//   - items from sibling groups concatenate in source order

function item(token: string): TokenItem {
  return { token: token as TokenItem['token'], label: token, hex: '#000000' }
}
function group(label: string, tokens: string[]): TokenItemGroup {
  return { label, items: tokens.map(item) }
}

describe('collapseFixedGroups', () => {
  it('returns an empty array for empty input', () => {
    expect(collapseFixedGroups([])).toEqual([])
  })

  it('passes through a group whose label has no trailing " Fixed"', () => {
    const out = collapseFixedGroups([group('Primary', ['--color-primary'])])
    expect(out).toHaveLength(1)
    expect(out[0]?.label).toBe('Primary')
    expect(out[0]?.items.map((i) => i.token)).toEqual(['--color-primary'])
  })

  it('strips the trailing " Fixed" suffix and merges into the parent label', () => {
    const out = collapseFixedGroups([group('Primary Fixed', ['--color-primary-fixed'])])
    expect(out).toHaveLength(1)
    expect(out[0]?.label).toBe('Primary')
  })

  it('concatenates items from sibling groups under one parent label, in source order', () => {
    const out = collapseFixedGroups([
      group('Primary', ['--color-primary', '--color-on-primary']),
      group('Primary Fixed', ['--color-primary-fixed', '--color-primary-fixed-dim']),
    ])
    expect(out).toHaveLength(1)
    expect(out[0]?.label).toBe('Primary')
    expect(out[0]?.items.map((i) => i.token)).toEqual([
      '--color-primary',
      '--color-on-primary',
      '--color-primary-fixed',
      '--color-primary-fixed-dim',
    ])
  })

  it('preserves first-appearance order of the parent labels', () => {
    const out = collapseFixedGroups([
      group('Tertiary', ['--color-tertiary']),
      group('Primary', ['--color-primary']),
      group('Primary Fixed', ['--color-primary-fixed']),
      group('Secondary', ['--color-secondary']),
    ])
    expect(out.map((g) => g.label)).toEqual(['Tertiary', 'Primary', 'Secondary'])
  })

  it('only matches a TRAILING " Fixed" — embedded "Fixed" stays intact', () => {
    // Defensive: regex is /\s Fixed$/, not /Fixed/g — labels like
    // "Fixed Layer" must not collapse into "Layer".
    const out = collapseFixedGroups([group('Fixed Layer', ['--color-x'])])
    expect(out).toHaveLength(1)
    expect(out[0]?.label).toBe('Fixed Layer')
  })
})

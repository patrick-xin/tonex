import { SHADCN_ROLE_NAMES } from '@tonex/core/schema'
import { describe, expect, it } from 'vitest'
import { DEFAULT_BUNDLE } from './bundle-snapshot'
import {
  formatBindingPresetCopyOutput,
  formatBindingPresetEntry,
  formatCopyOutput,
  formatPresetEntry,
} from './format-ts'

// why: format-ts emits a pasteable SHADCN_PRESETS / SHADCN_BINDING_PRESETS
// entry whose own header promises "byte-stable and diff cleanly". Rather than
// a golden snapshot (no snapshot precedent in this repo, and it would pin the
// DEFAULT_INPUTS binding values, not the format), these assertions decompose
// that promise into the invariants that actually define it: determinism,
// canonical role ordering, indentation, key quoting, and escaping. Each can
// fail independently and points at the specific format rule that broke.

const SEED = '#6750a4'
const BINDINGS = DEFAULT_BUNDLE.shadcnRoleBindings

// why: pull the quoted role keys out of an emitted block. Binding lines are
// the only ones with a '--'-prefixed quoted key (`  '--background': '...',`);
// preset fields (seed:, variant:) use bare keys, so this isolates bindings.
function emittedRoleOrder(block: string): string[] {
  return [...block.matchAll(/'(--[\w-]+)':/g)].map((m) => m[1] as string)
}

describe('formatPresetEntry', () => {
  it('is deterministic — identical inputs emit byte-identical output', () => {
    const a = formatPresetEntry('warm', SEED, { light: 0, dark: 0 }, DEFAULT_BUNDLE)
    const b = formatPresetEntry('warm', SEED, { light: 0, dark: 0 }, DEFAULT_BUNDLE)
    expect(a).toBe(b)
  })

  it('emits bindings in canonical SHADCN_ROLE_NAMES order, twice (light then dark)', () => {
    const block = formatPresetEntry('warm', SEED, { light: 0, dark: 0 }, DEFAULT_BUNDLE)
    const expected = [...SHADCN_ROLE_NAMES]
    expect(emittedRoleOrder(block)).toEqual([...expected, ...expected])
  })

  it('wraps the seed in seedOf() and leads with the curated source inputs', () => {
    const block = formatPresetEntry('warm', SEED, { light: 0.3, dark: 0.3 }, DEFAULT_BUNDLE)
    const lines = block.split('\n')
    expect(lines[0]).toBe('  warm: {')
    expect(lines[1]).toBe(`    seed: seedOf('${SEED}'),`)
    expect(lines[2]).toBe('    contrastLevel: { light: 0.3, dark: 0.3 },')
    expect(lines[3]).toBe(`    variant: '${DEFAULT_BUNDLE.variant}',`)
  })

  it('nests at the core file indentation (key @2 spaces, fields @4 spaces)', () => {
    const block = formatPresetEntry('warm', SEED, { light: 0, dark: 0 }, DEFAULT_BUNDLE)
    const fieldLines = block
      .split('\n')
      .filter((l) => /^\s+(seed|contrastLevel|variant|surfaceAlgo):/.test(l))
    expect(fieldLines.length).toBeGreaterThan(0)
    for (const line of fieldLines) {
      expect(line).toMatch(/^ {4}\S/)
    }
  })
})

describe('formatKey (via emitted record key)', () => {
  it('emits a bare key for a valid JS identifier', () => {
    expect(
      formatPresetEntry('warm', SEED, { light: 0, dark: 0 }, DEFAULT_BUNDLE).split('\n')[0],
    ).toBe('  warm: {')
  })

  it('single-quotes a key that would not parse as an identifier', () => {
    expect(
      formatPresetEntry('my preset', SEED, { light: 0, dark: 0 }, DEFAULT_BUNDLE).split('\n')[0],
    ).toBe("  'my preset': {")
    expect(
      formatPresetEntry('123', SEED, { light: 0, dark: 0 }, DEFAULT_BUNDLE).split('\n')[0],
    ).toBe("  '123': {")
  })

  it('falls back to "unnamed" for an empty/whitespace name', () => {
    expect(
      formatPresetEntry('   ', SEED, { light: 0, dark: 0 }, DEFAULT_BUNDLE).split('\n')[0],
    ).toBe('  unnamed: {')
  })
})

describe('formatBindingPresetEntry', () => {
  it('is deterministic and emits bindings in canonical order (light then dark)', () => {
    const a = formatBindingPresetEntry('crisp', 'desc', BINDINGS)
    const b = formatBindingPresetEntry('crisp', 'desc', BINDINGS)
    expect(a).toBe(b)
    const expected = [...SHADCN_ROLE_NAMES]
    expect(emittedRoleOrder(a)).toEqual([...expected, ...expected])
  })

  it('escapes single quotes in the description so the entry stays valid TS', () => {
    const block = formatBindingPresetEntry('x', "it's bright", BINDINGS)
    expect(block).toContain("description: 'it\\'s bright',")
  })

  it('omits seed/contrast/variant fields (binding preset is pure routing)', () => {
    const block = formatBindingPresetEntry('x', 'desc', BINDINGS)
    expect(block).not.toContain('seed:')
    expect(block).not.toContain('variant:')
    expect(block).toContain('description:')
  })
})

describe('copy-output wrappers', () => {
  it('prefixes a paste-target header and ends with a trailing newline', () => {
    const out = formatCopyOutput('warm', SEED, { light: 0, dark: 0 }, DEFAULT_BUNDLE)
    expect(out.startsWith('// Preset: warm')).toBe(true)
    expect(out).toContain('SHADCN_PRESETS')
    expect(out.endsWith('\n')).toBe(true)
  })

  it('binding copy-output names the binding-presets paste target', () => {
    const out = formatBindingPresetCopyOutput('crisp', 'desc', BINDINGS)
    expect(out.startsWith('// Binding preset: crisp')).toBe(true)
    expect(out).toContain('SHADCN_BINDING_PRESETS')
    expect(out.endsWith('\n')).toBe(true)
  })
})

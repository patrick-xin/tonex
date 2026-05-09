import { afterEach, describe, expect, it } from 'vitest'
import { deriveTheme } from './derive'
import { __resetDeriveCache, getDerivedTheme } from './derive-cache'
import { DEFAULT_INPUTS, type PortableTheme } from './schema'

describe('getDerivedTheme', () => {
  afterEach(() => {
    __resetDeriveCache()
  })

  // why: structural test for the (N+1)→1 derive collapse. If two calls with
  // the same source reference return DIFFERENT object references, deriveTheme
  // ran twice — the cache is broken. Same reference = single computation
  // shared across consumers. Issue #9 — this is the load-bearing assertion.
  it('returns same reference for identical source — no re-derive on identity hit', () => {
    const a = getDerivedTheme(DEFAULT_INPUTS)
    const b = getDerivedTheme(DEFAULT_INPUTS)
    expect(b).toBe(a)
  })

  // why: applyDom calls selectPortable(s) inside its subscribe callback,
  // producing a fresh object each tick that is structurally equal to the
  // useShallow reference consumers see. Without the shallow-equal fallback
  // applyDom would always miss the cache, defeating half the win.
  it('returns same reference for shallow-equal source — no re-derive on shallow hit', () => {
    const source1: PortableTheme = { ...DEFAULT_INPUTS }
    const source2: PortableTheme = { ...DEFAULT_INPUTS }
    expect(source1).not.toBe(source2)

    const a = getDerivedTheme(source1)
    const b = getDerivedTheme(source2)
    expect(b).toBe(a)
  })

  it('recomputes when seedHex changes', () => {
    const a = getDerivedTheme(DEFAULT_INPUTS)
    const b = getDerivedTheme({ ...DEFAULT_INPUTS, seedHex: '#ff0000' })
    expect(b).not.toBe(a)
  })

  it('recomputes when nested override map changes reference', () => {
    const a = getDerivedTheme(DEFAULT_INPUTS)
    const b = getDerivedTheme({
      ...DEFAULT_INPUTS,
      md3TokenOverrides: {
        light: { '--color-primary': '#abcdef' },
        dark: {},
      },
    })
    expect(b).not.toBe(a)
  })

  // why: drift-guard at the cache seam. The cached object MUST equal what
  // deriveTheme would return uncached for the same source — otherwise applyDom
  // and exporters could diverge from the in-memory cached snapshot. ADR-0017
  // depends on this equivalence.
  it('cached output equals fresh deriveTheme output (preview === export)', () => {
    const cached = getDerivedTheme(DEFAULT_INPUTS)
    __resetDeriveCache()
    const fresh = deriveTheme(DEFAULT_INPUTS)
    expect(cached.md.light).toEqual(fresh.md.light)
    expect(cached.md.dark).toEqual(fresh.md.dark)
    expect(cached.shadcn.light).toEqual(fresh.shadcn.light)
    expect(cached.shadcn.dark).toEqual(fresh.shadcn.dark)
    expect(cached.warnings).toEqual(fresh.warnings)
  })

  it('round-trip — alternating sources hit independently', () => {
    const a1 = getDerivedTheme(DEFAULT_INPUTS)
    const b1 = getDerivedTheme({ ...DEFAULT_INPUTS, seedHex: '#ff0000' })
    const a2 = getDerivedTheme(DEFAULT_INPUTS)
    expect(a1).not.toBe(b1)
    // why: cache holds up to MAX_CACHE_SIZE=6 entries (issue #20), so A → B
    // → A returns the original A reference — both fit in the working set.
    // The forcing value of this assertion is that contrast-bundle's three
    // tiers + a parallel useResolvedTokens consumer don't evict each other.
    expect(a2).toBe(a1)
  })

  // why: contrast bundle composition (issue #20). Distinct contrastLevel
  // arguments map to distinct cache slots against the same source. Without
  // this, buildContrastBundle's medium/high tiers would alias the default.
  it('keys on contrastLevel — same source at different tiers does not collide', () => {
    const a = getDerivedTheme(DEFAULT_INPUTS)
    const medium = getDerivedTheme(DEFAULT_INPUTS, 0.5)
    const high = getDerivedTheme(DEFAULT_INPUTS, 1.0)
    expect(a).not.toBe(medium)
    expect(medium).not.toBe(high)
    // re-fetch each tier — all three slots remain hot
    expect(getDerivedTheme(DEFAULT_INPUTS)).toBe(a)
    expect(getDerivedTheme(DEFAULT_INPUTS, 0.5)).toBe(medium)
    expect(getDerivedTheme(DEFAULT_INPUTS, 1.0)).toBe(high)
  })

  // why: cache eviction is FIFO at MAX_CACHE_SIZE=6 entries. Pinning the
  // policy: filling the cache and then re-querying the oldest entry forces a
  // re-derive (a new object reference). If someone bumps the cap or switches
  // to LRU, this test fails and the change becomes deliberate.
  it('drops oldest entry past cap (FIFO at 6 slots)', () => {
    const sources = [
      DEFAULT_INPUTS,
      { ...DEFAULT_INPUTS, seedHex: '#ff0000' },
      { ...DEFAULT_INPUTS, seedHex: '#00ff00' },
      { ...DEFAULT_INPUTS, seedHex: '#0000ff' },
      { ...DEFAULT_INPUTS, seedHex: '#ffff00' },
      { ...DEFAULT_INPUTS, seedHex: '#ff00ff' },
    ]
    const first = getDerivedTheme(sources[0])
    for (let i = 1; i < sources.length; i++) getDerivedTheme(sources[i])
    // 7th distinct source evicts sources[0]
    getDerivedTheme({ ...DEFAULT_INPUTS, seedHex: '#00ffff' })
    const firstAgain = getDerivedTheme(sources[0])
    expect(firstAgain).not.toBe(first)
  })
})

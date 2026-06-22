import { DEFAULT_INPUTS, SCHEMA_VERSION } from '@tonex/core/schema'
import { describe, expect, it } from 'vitest'
import { loadPortableTheme, serializePortableTheme } from './portable'

// why: the (de)serializer is the by-value seam #219 adds either side of the engine.
// Core owns the FORMAT (parsePortableTheme); these tests pin the two CLI-side jobs in
// ISOLATION (the run-boundary suite covers the end-to-end round-trip): a clean theme
// round-trips, the bytes are canonical (stable key order), and the three failure modes
// reject with a message. Prior art: core's schema.test.ts (parsePortableTheme).
describe('PortableTheme (de)serializer', () => {
  it('round-trips a DEFAULT_INPUTS theme through serialize → load', () => {
    const raw = serializePortableTheme(DEFAULT_INPUTS)
    const loaded = loadPortableTheme(raw)
    expect(loaded.ok).toBe(true)
    if (loaded.ok) expect(loaded.theme).toEqual(DEFAULT_INPUTS)
  })

  it('emits canonical, stable-ordered bytes regardless of input key order', () => {
    // a shuffled copy must serialize to the SAME bytes — canonicalization sorts keys
    const shuffled = Object.fromEntries(
      Object.entries(DEFAULT_INPUTS).reverse(),
    ) as typeof DEFAULT_INPUTS
    expect(serializePortableTheme(shuffled)).toBe(serializePortableTheme(DEFAULT_INPUTS))
    // version stamp is present in the output
    expect(JSON.parse(serializePortableTheme(DEFAULT_INPUTS)).version).toBe(SCHEMA_VERSION)
  })

  it('rejects malformed JSON with a message', () => {
    const r = loadPortableTheme('not json {')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message).toMatch(/JSON/)
  })

  it('rejects a schema-invalid shape with a message', () => {
    const r = loadPortableTheme(JSON.stringify({ version: SCHEMA_VERSION, seed: 'wrong' }))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message).toMatch(/PortableTheme/)
  })

  it('rejects a version mismatch (no migration ladder, ADR-0009 c.4)', () => {
    const stale = { ...DEFAULT_INPUTS, version: 999 }
    const r = loadPortableTheme(JSON.stringify(stale))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message).toMatch(/version/)
  })
})

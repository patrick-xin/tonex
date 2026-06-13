import { describe, expect, it } from 'vitest'
import { hctFromHex } from '../hct'
import { DEFAULT_INPUTS, type PortableTheme } from '../schema'
import { adjustTokens } from './adjust-tokens'

// why: adjustTokens is the source-aware adjuster the CLI's `tonex adjust` calls
// (#198). It derives the theme ONCE, resolves each request's token to its
// currently-resolved color, and reports a per-token before/after/achieved fact.
// Tests pin the load-bearing behaviors — resolve across core ∪ extended layers,
// batch, compounding-from-current-state, input-error rejection, and purity —
// one case each per the keep-tests-small convention, not a sign/axis matrix
// (shiftHct's own tests already cover the HCT honesty contract).

describe('adjustTokens', () => {
  it('resolves a CORE token and reports before/after/requested/achieved', () => {
    // why: AC — derive once, resolve a core token (--color-primary lives in
    // MD_CORE_TOKEN_NAMES → read derived.md[mode]), shift it, report the fact.
    // `before` is the derived primary projected to hex; `after` is the shifted
    // hex; `achieved` is shiftHct's re-derived (honest) delta, not the request.
    const [res] = adjustTokens(DEFAULT_INPUTS, [
      { mode: 'light', token: '--color-primary', dTone: 5, dChroma: 3 },
    ])
    expect(res.mode).toBe('light')
    expect(res.token).toBe('--color-primary')
    expect(res.before).toMatch(/^#[0-9a-f]{6}$/)
    expect(res.after).toMatch(/^#[0-9a-f]{6}$/)
    expect(res.requested).toEqual({ dTone: 5, dChroma: 3 })
    // achieved is re-derived from the result vs the before color
    const before = hctFromHex(res.before)
    const after = hctFromHex(res.after)
    expect(res.achieved.dTone).toBeCloseTo(after.tone - before.tone, 5)
    expect(res.achieved.dChroma).toBeCloseTo(after.chroma - before.chroma, 5)
  })

  it('resolves an EXTENDED token via the extended md layer', () => {
    // why: AC — extended tokens (--color-surface-tint ∈ MD_EXTENDED_TOKEN_NAMES)
    // are NOT in derived.md[mode]; they live in derived.md[`${mode}Extended`].
    // A wrong-layer lookup would read undefined and throw — this pins that the
    // extended branch resolves to a real color.
    const [res] = adjustTokens(DEFAULT_INPUTS, [
      { mode: 'light', token: '--color-surface-tint', dTone: -4 },
    ])
    expect(res.before).toMatch(/^#[0-9a-f]{6}$/)
    expect(res.after).toMatch(/^#[0-9a-f]{6}$/)
    // dChroma omitted → normalized to 0
    expect(res.requested).toEqual({ dTone: -4, dChroma: 0 })
  })

  it('returns one result per request for a batch call', () => {
    // why: AC — a multi-request call returns every result, order-preserved.
    const results = adjustTokens(DEFAULT_INPUTS, [
      { mode: 'light', token: '--color-primary', dTone: 2 },
      { mode: 'dark', token: '--color-secondary', dChroma: -3 },
    ])
    expect(results).toHaveLength(2)
    expect(results[0].token).toBe('--color-primary')
    expect(results[0].mode).toBe('light')
    expect(results[1].token).toBe('--color-secondary')
    expect(results[1].mode).toBe('dark')
  })

  it('compounds from the currently-resolved (pinned) value', () => {
    // why: AC — when source already pins the target token, `before` is the
    // PINNED color, not MCU's. applyMd3TokenOverrides runs last in the md
    // pipeline, so derived.md already reflects the pin → compounding for free.
    // --color-primary is NOT a treatment subject, so the pin survives derive
    // verbatim (a surface/outline token would be re-treated after the pin).
    const pinned: PortableTheme = {
      ...DEFAULT_INPUTS,
      md3TokenOverrides: { light: { '--color-primary': '#123456' }, dark: {} },
    }
    const [res] = adjustTokens(pinned, [
      { mode: 'light', token: '--color-primary', dTone: 0, dChroma: 0 },
    ])
    // zero-delta identity over the pinned color → before === after === the pin
    expect(res.before).toBe('#123456')
    expect(res.after).toBe('#123456')
  })

  it('throws on an unknown token name (input error, not a silent no-op)', () => {
    // why: AC — runtime input validation. The CLI passes raw strings; an
    // out-of-domain token must throw (Slice 3 maps this to exit 2).
    expect(() =>
      adjustTokens(DEFAULT_INPUTS, [
        // @ts-expect-error — deliberately out-of-domain to exercise runtime guard
        { mode: 'light', token: '--color-not-a-token', dTone: 1 },
      ]),
    ).toThrow()
  })

  it('throws on an invalid mode', () => {
    // why: AC — invalid mode is an input error.
    expect(() =>
      adjustTokens(DEFAULT_INPUTS, [
        // @ts-expect-error — deliberately invalid mode to exercise runtime guard
        { mode: 'sideways', token: '--color-primary', dTone: 1 },
      ]),
    ).toThrow()
  })

  it('throws on a request with neither axis present', () => {
    // why: AC — a no-axis request carries no instruction; reject it rather than
    // silently returning an identity result.
    expect(() =>
      adjustTokens(DEFAULT_INPUTS, [{ mode: 'light', token: '--color-primary' }]),
    ).toThrow()
  })

  it('does not mutate source', () => {
    // why: AC — purity. The call must not write back into source (no pin leak).
    const source: PortableTheme = {
      ...DEFAULT_INPUTS,
      md3TokenOverrides: { light: {}, dark: {} },
    }
    const snapshot = structuredClone(source)
    adjustTokens(source, [{ mode: 'light', token: '--color-primary', dTone: 5, dChroma: 3 }])
    expect(source).toEqual(snapshot)
  })
})

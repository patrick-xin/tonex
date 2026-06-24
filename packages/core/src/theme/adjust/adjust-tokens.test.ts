import { describe, expect, it } from 'vitest'
import { hctFromHex } from '../hct'
import { DEFAULT_INPUTS, type PortableTheme } from '../schema'
import { adjustTokens } from './adjust-tokens'

// why: adjustTokens is the source-aware adjuster the CLI's `tonex adjust` calls
// (#198). The agent types the BARE md role name it read from `--to colors`
// (`primary`); adjustTokens canonicalizes it internally. The RESULT keeps the
// canonical `--color-` id because applyAdjustments folds it into
// md3TokenOverrides, whose keys are canonical MdTokenNames. Tests pin the
// load-bearing behaviors — bare-name resolution across core ∪ extended layers,
// batch, compounding-from-current-state, input-error rejection (incl. the
// rejected internal `--color-` id), and purity — one case each per the
// keep-tests-small convention.

describe('adjustTokens', () => {
  it('resolves a bare CORE token; the reported token stays the canonical --color- id', () => {
    // why: AC — bare `primary` resolves to derived.md (MD_CORE), is shifted, and
    // is reported under its canonical id so applyAdjustments can pin it. `before`
    // is the derived primary as hex; `after` the shifted hex; `achieved`
    // shiftHct's re-derived (honest) delta, not the request.
    const [res] = adjustTokens(DEFAULT_INPUTS, [
      { mode: 'light', token: 'primary', dTone: 5, dChroma: 3 },
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

  it('resolves a bare EXTENDED token via the extended md layer', () => {
    // why: AC — extended tokens (bare `surface-tint` ∈ MD_EXTENDED) are NOT in
    // derived.md[mode]; they live in derived.md[`${mode}Extended`]. A wrong-layer
    // lookup would read undefined and throw — this pins the extended branch.
    const [res] = adjustTokens(DEFAULT_INPUTS, [
      { mode: 'light', token: 'surface-tint', dTone: -4 },
    ])
    expect(res.token).toBe('--color-surface-tint')
    expect(res.before).toMatch(/^#[0-9a-f]{6}$/)
    expect(res.after).toMatch(/^#[0-9a-f]{6}$/)
    // dChroma omitted → normalized to 0
    expect(res.requested).toEqual({ dTone: -4, dChroma: 0 })
  })

  it('returns one result per request for a batch call', () => {
    // why: AC — a multi-request call returns every result, order-preserved.
    const results = adjustTokens(DEFAULT_INPUTS, [
      { mode: 'light', token: 'primary', dTone: 2 },
      { mode: 'dark', token: 'secondary', dChroma: -3 },
    ])
    expect(results).toHaveLength(2)
    expect(results[0].token).toBe('--color-primary')
    expect(results[0].mode).toBe('light')
    expect(results[1].token).toBe('--color-secondary')
    expect(results[1].mode).toBe('dark')
  })

  it('compounds from the currently-resolved (pinned) value', () => {
    // why: AC — when source already pins the target token, `before` is the PINNED
    // color, not MCU's. The pin map is keyed by the canonical id; the request is
    // the bare role name — this pins that a bare request resolves to the canonical
    // pinned token. --color-primary is NOT a treatment subject, so the pin
    // survives derive verbatim.
    const pinned: PortableTheme = {
      ...DEFAULT_INPUTS,
      md3TokenOverrides: { light: { '--color-primary': '#123456' }, dark: {} },
    }
    const [res] = adjustTokens(pinned, [{ mode: 'light', token: 'primary', dTone: 0, dChroma: 0 }])
    // zero-delta identity over the pinned color → before === after === the pin
    expect(res.before).toBe('#123456')
    expect(res.after).toBe('#123456')
  })

  it('rejects the internal --color- id and points at the bare role name', () => {
    // why: AC — `--color-` is core's internal token id, not the public surface;
    // an agent must drive adjust from the bare role name (`--to colors` form).
    expect(() =>
      adjustTokens(DEFAULT_INPUTS, [{ mode: 'light', token: '--color-primary', dTone: 1 }]),
    ).toThrow(/bare role name.*primary/)
  })

  it('throws on an unknown token name (input error, not a silent no-op)', () => {
    // why: AC — runtime input validation. The CLI passes raw strings; an
    // out-of-domain token must throw (mapped to exit 2).
    expect(() =>
      adjustTokens(DEFAULT_INPUTS, [{ mode: 'light', token: 'not-a-token', dTone: 1 }]),
    ).toThrow()
  })

  it('names the bound md token (bare) when a shadcn role is fed', () => {
    // why: AC — an agent that copies a role out of `generate --to shadcn` and
    // feeds it to adjust gets told it's a shadcn role and pointed at the bare md
    // role it binds to under DEFAULT_SHADCN_ROLE_BINDINGS (--primary → primary).
    expect(() =>
      adjustTokens(DEFAULT_INPUTS, [{ mode: 'light', token: '--primary', dTone: 1 }]),
    ).toThrow(/--primary is a shadcn role.*did you mean primary/)
  })

  it('suggests a bare md token (never a shadcn role) on a typo', () => {
    // why: AC — the did-you-mean for a genuine typo ranges over the bare md
    // vocabulary ONLY; adjust takes md tokens, so a shadcn role would be wrong.
    expect(() =>
      adjustTokens(DEFAULT_INPUTS, [{ mode: 'light', token: 'primry', dTone: 1 }]),
    ).toThrow(/did you mean primary/)
  })

  it('throws on an invalid mode', () => {
    // why: AC — invalid mode is an input error.
    expect(() =>
      adjustTokens(DEFAULT_INPUTS, [
        // @ts-expect-error — deliberately invalid mode to exercise runtime guard
        { mode: 'sideways', token: 'primary', dTone: 1 },
      ]),
    ).toThrow()
  })

  it('throws on a request with neither axis present', () => {
    // why: AC — a no-axis request carries no instruction; reject it rather than
    // silently returning an identity result.
    expect(() => adjustTokens(DEFAULT_INPUTS, [{ mode: 'light', token: 'primary' }])).toThrow()
  })

  it('does not mutate source', () => {
    // why: AC — purity. The call must not write back into source (no pin leak).
    const source: PortableTheme = {
      ...DEFAULT_INPUTS,
      md3TokenOverrides: { light: {}, dark: {} },
    }
    const snapshot = structuredClone(source)
    adjustTokens(source, [{ mode: 'light', token: 'primary', dTone: 5, dChroma: 3 }])
    expect(source).toEqual(snapshot)
  })
})

import { describe, expect, it } from 'vitest'
import { deriveTheme } from './derive'
import { hexFromHct } from './hct'
import { oklchFromHex } from './oklch'
import { type CustomColorEntry, DEFAULT_INPUTS, DEFAULT_SHADCN_ROLE_BINDINGS } from './schema'

// why: under DEFAULT seed (~hue 290), SchemeCmf.getErrorHue routes to the
// final else clause: (secondHue > 12 && secondHue <= 28) ? 32 : 16. Single-
// source falls into bucket 16; second.hue=20 lands in bucket 32. Constructed
// via Hct so the fixture is deterministic regardless of hex<->HCT rounding.
const CMF_SECOND_HEX_BUCKET_SHIFT = hexFromHct({ hue: 20, chroma: 60, tone: 50 })

const OKLCH = /^oklch\([\d.]+ [\d.]+ [\d.]+\)$/

// why: hex inputs (overrides, locks) emit as their oklch projection — assert
// against the exact projection so any change to the conversion math fails
// here instead of silently drifting at the CSS surface.
const RED = oklchFromHex('#ff0000')
const GREEN = oklchFromHex('#00ff00')
const ABCDEF = oklchFromHex('#abcdef')

describe('deriveTheme', () => {
  it('emits md primary role family for both modes', () => {
    const { md } = deriveTheme(DEFAULT_INPUTS)
    for (const mode of [md.light, md.dark]) {
      expect(mode['--color-primary']).toMatch(OKLCH)
      expect(mode['--color-on-primary']).toMatch(OKLCH)
      expect(mode['--color-primary-container']).toMatch(OKLCH)
      expect(mode['--color-on-primary-container']).toMatch(OKLCH)
    }
  })

  it('emits md surface family for both modes', () => {
    const { md } = deriveTheme(DEFAULT_INPUTS)
    for (const mode of [md.light, md.dark]) {
      expect(mode['--color-surface']).toMatch(OKLCH)
      expect(mode['--color-surface-container']).toMatch(OKLCH)
      expect(mode['--color-surface-container-high']).toMatch(OKLCH)
      expect(mode['--color-on-surface']).toMatch(OKLCH)
    }
  })

  it('emits shadcn primary + primary-foreground for both modes', () => {
    const { shadcn } = deriveTheme(DEFAULT_INPUTS)
    for (const mode of [shadcn.light, shadcn.dark]) {
      expect(mode['--primary']).toMatch(OKLCH)
      expect(mode['--primary-foreground']).toMatch(OKLCH)
    }
  })

  it('shadcn primary mirrors md primary-container; foreground mirrors md on-primary-container', () => {
    const { md, shadcn } = deriveTheme(DEFAULT_INPUTS)
    expect(shadcn.light['--primary']).toBe(md.light['--color-primary-container'])
    expect(shadcn.light['--primary-foreground']).toBe(md.light['--color-on-primary-container'])
    expect(shadcn.dark['--primary']).toBe(md.dark['--color-primary-container'])
    expect(shadcn.dark['--primary-foreground']).toBe(md.dark['--color-on-primary-container'])
  })

  it('derives different md primary values for light vs dark', () => {
    // why: md primary differs across modes by MD3 spec (tone 40 light vs 80 dark).
    // We don't assert shadcn light !== dark here because shadcn primary mirrors
    // md primary-container, whose cross-mode delta is variant-dependent — cmf
    // with the default seed happens to collapse it. The mapping-rule test above
    // already covers shadcn correctness.
    const { md } = deriveTheme(DEFAULT_INPUTS)
    expect(md.light['--color-primary']).not.toBe(md.dark['--color-primary'])
  })

  it('derives different md surface values for light vs dark', () => {
    const { md } = deriveTheme(DEFAULT_INPUTS)
    expect(md.light['--color-surface']).not.toBe(md.dark['--color-surface'])
    expect(md.light['--color-on-surface']).not.toBe(md.dark['--color-on-surface'])
  })

  it('different seeds yield different primaries', () => {
    const red = deriveTheme({ ...DEFAULT_INPUTS, seedHex: '#ff0000' })
    const green = deriveTheme({ ...DEFAULT_INPUTS, seedHex: '#00ff00' })
    expect(red.shadcn.light['--primary']).not.toBe(green.shadcn.light['--primary'])
  })

  it('variant dispatch picks a real strategy by name', () => {
    // why: two registry entries means `variants[source.variant]` must do real
    // lookup. cmf vs tonalSpot at the same seed produce different primary
    // tones — the structural assertion that dispatch is not hardcoded to cmf.
    const cmf = deriveTheme({ ...DEFAULT_INPUTS, variant: 'cmf' })
    const tonalSpot = deriveTheme({ ...DEFAULT_INPUTS, variant: 'tonalSpot' })
    expect(cmf.md.light['--color-primary']).not.toBe(tonalSpot.md.light['--color-primary'])
  })

  it('returns no warnings for valid input', () => {
    expect(deriveTheme(DEFAULT_INPUTS).warnings).toEqual([])
  })

  it('is deterministic', () => {
    const a = deriveTheme(DEFAULT_INPUTS)
    const b = deriveTheme(DEFAULT_INPUTS)
    expect(a).toEqual(b)
  })

  describe('md3TokenOverrides (slice 6 — generic per-token override map)', () => {
    it('overrides any md token in the addressed mode and leaves others at MCU', () => {
      // why: slice 6 promise — any md token can be overridden via
      // md3TokenOverrides[mode][token]. Verifies (a) a non-primary-family
      // token is overridable (--color-secondary), (b) light/dark are
      // independent maps, (c) tokens not in the override map flow through
      // unchanged.
      const baseline = deriveTheme(DEFAULT_INPUTS)
      const overridden = deriveTheme({
        ...DEFAULT_INPUTS,
        md3TokenOverrides: {
          light: { '--color-primary': '#ff0000', '--color-secondary': '#00ff00' },
          dark: { '--color-primary': '#abcdef' },
        },
      })
      expect(overridden.md.light['--color-primary']).toBe(RED)
      expect(overridden.md.light['--color-secondary']).toBe(GREEN)
      expect(overridden.md.dark['--color-primary']).toBe(ABCDEF)
      // light override of secondary doesn't bleed into dark
      expect(overridden.md.dark['--color-secondary']).toBe(baseline.md.dark['--color-secondary'])
      // unmapped tokens unaffected
      expect(overridden.md.light['--color-tertiary']).toBe(baseline.md.light['--color-tertiary'])
    })

    it('empty override maps produce no behavioral change', () => {
      const baseline = deriveTheme(DEFAULT_INPUTS)
      const explicit = deriveTheme({
        ...DEFAULT_INPUTS,
        md3TokenOverrides: { light: {}, dark: {} },
      })
      expect(explicit).toEqual(baseline)
    })
  })

  describe('md3TokenOverrides — primary-container case', () => {
    it('empty maps leave md primary-container at MCU value', () => {
      const baseline = deriveTheme(DEFAULT_INPUTS)
      const explicit = deriveTheme({
        ...DEFAULT_INPUTS,
        md3TokenOverrides: { light: {}, dark: {} },
      })
      expect(explicit.md.light['--color-primary-container']).toBe(
        baseline.md.light['--color-primary-container'],
      )
      expect(explicit.md.dark['--color-primary-container']).toBe(
        baseline.md.dark['--color-primary-container'],
      )
    })

    it('light override replaces md.light primary-container only', () => {
      const baseline = deriveTheme(DEFAULT_INPUTS)
      const overridden = deriveTheme({
        ...DEFAULT_INPUTS,
        md3TokenOverrides: { light: { '--color-primary-container': '#ff0000' }, dark: {} },
      })
      expect(overridden.md.light['--color-primary-container']).toBe(RED)
      expect(overridden.md.dark['--color-primary-container']).toBe(
        baseline.md.dark['--color-primary-container'],
      )
    })

    it('dark override replaces md.dark primary-container only', () => {
      const baseline = deriveTheme(DEFAULT_INPUTS)
      const overridden = deriveTheme({
        ...DEFAULT_INPUTS,
        md3TokenOverrides: { light: {}, dark: { '--color-primary-container': '#00ff00' } },
      })
      expect(overridden.md.light['--color-primary-container']).toBe(
        baseline.md.light['--color-primary-container'],
      )
      expect(overridden.md.dark['--color-primary-container']).toBe(GREEN)
    })

    it('override propagates to shadcn primary via cross-layer mapping', () => {
      // why: shadcn.--primary mirrors md.--color-primary-container. Mutation
      // pressure on md primary-container must flow through to shadcn primary
      // — this is the no-drift contract under editing pressure (ADR-0017).
      const overridden = deriveTheme({
        ...DEFAULT_INPUTS,
        md3TokenOverrides: {
          light: { '--color-primary-container': '#ff0000' },
          dark: { '--color-primary-container': '#00ff00' },
        },
      })
      expect(overridden.shadcn.light['--primary']).toBe(RED)
      expect(overridden.shadcn.dark['--primary']).toBe(GREEN)
    })
  })

  describe('paletteOverrides', () => {
    it('empty map produces no behavioral change vs default source', () => {
      // why: drift-guard contract. paletteOverrides defaulting to {} must
      // emit byte-identical output to a source without the field. Any
      // non-empty interaction with applyPaletteOverrides for an empty map
      // would break this and the bake/drift test downstream.
      const baseline = deriveTheme(DEFAULT_INPUTS)
      const explicit = deriveTheme({ ...DEFAULT_INPUTS, paletteOverrides: {} })
      expect(explicit).toEqual(baseline)
    })

    it('primary override regenerates the entire primary family, leaves others untouched', () => {
      // why: the load-bearing claim of this feature. Overriding primary
      // changes all four primary-family tokens, AND nothing in the secondary,
      // tertiary, neutral, error families moves. Verifies that mutation lands
      // on primaryPalette only — not via accidentally cloning the scheme or
      // mutating shared state.
      const baseline = deriveTheme(DEFAULT_INPUTS)
      const overridden = deriveTheme({
        ...DEFAULT_INPUTS,
        paletteOverrides: { primary: '#ff0066' },
      })
      // primary family moves
      expect(overridden.md.light['--color-primary']).not.toBe(baseline.md.light['--color-primary'])
      expect(overridden.md.light['--color-on-primary']).not.toBe(
        baseline.md.light['--color-on-primary'],
      )
      expect(overridden.md.light['--color-primary-container']).not.toBe(
        baseline.md.light['--color-primary-container'],
      )
      expect(overridden.md.light['--color-on-primary-container']).not.toBe(
        baseline.md.light['--color-on-primary-container'],
      )
      // siblings stay
      expect(overridden.md.light['--color-secondary']).toBe(baseline.md.light['--color-secondary'])
      expect(overridden.md.light['--color-tertiary']).toBe(baseline.md.light['--color-tertiary'])
      expect(overridden.md.light['--color-error']).toBe(baseline.md.light['--color-error'])
      // dark mode primary also moves (same palette, both modes)
      expect(overridden.md.dark['--color-primary']).not.toBe(baseline.md.dark['--color-primary'])
    })

    it('error override regenerates the error family only', () => {
      // why: secondary check on a different palette to confirm the loop
      // generalizes. Error has the same family shape as primary (color/on/
      // container/on-container).
      const baseline = deriveTheme(DEFAULT_INPUTS)
      const overridden = deriveTheme({
        ...DEFAULT_INPUTS,
        paletteOverrides: { error: '#22c55e' },
      })
      expect(overridden.md.light['--color-error']).not.toBe(baseline.md.light['--color-error'])
      expect(overridden.md.light['--color-on-error']).not.toBe(
        baseline.md.light['--color-on-error'],
      )
      expect(overridden.md.light['--color-error-container']).not.toBe(
        baseline.md.light['--color-error-container'],
      )
      // primary untouched
      expect(overridden.md.light['--color-primary']).toBe(baseline.md.light['--color-primary'])
    })

    it('neutral override propagates to surface family', () => {
      // why: neutralPalette drives the surface ramp inside MCU. Surface
      // tokens must reflect the override. Tested under variant=tonalSpot to
      // avoid CMF's neutral-handling differences.
      const tonal: typeof DEFAULT_INPUTS = { ...DEFAULT_INPUTS, variant: 'tonalSpot' }
      const baseline = deriveTheme(tonal)
      const overridden = deriveTheme({
        ...tonal,
        paletteOverrides: { neutral: '#888899' },
      })
      expect(overridden.md.light['--color-surface']).not.toBe(baseline.md.light['--color-surface'])
      expect(overridden.md.light['--color-surface-container']).not.toBe(
        baseline.md.light['--color-surface-container'],
      )
    })

    it('token override beats palette override per-token (token wins)', () => {
      // why: ordering contract — palette override regenerates the family,
      // then token override pins specific tokens. Surgical pin must always
      // beat broad regen so the user's deliberate per-token choice survives.
      const overridden = deriveTheme({
        ...DEFAULT_INPUTS,
        paletteOverrides: { primary: '#ff0066' },
        md3TokenOverrides: {
          light: { '--color-primary': '#ff0000' },
          dark: {},
        },
      })
      // light --color-primary is the token-pinned hex, not the palette regen
      expect(overridden.md.light['--color-primary']).toBe(RED)
      // dark --color-primary still reflects the palette override (no token pin)
      // — assert by NOT being the baseline cmf dark primary.
      const baseline = deriveTheme(DEFAULT_INPUTS)
      expect(overridden.md.dark['--color-primary']).not.toBe(baseline.md.dark['--color-primary'])
    })

    it('disabled override (cmf + tertiary) is a no-op at derive time', () => {
      // why: even if the field carries a value (e.g. user set tertiary under
      // tonalSpot, then switched to cmf — setter doesn't strip), derive must
      // skip applying it. Otherwise the user sees a half-applied family that
      // disagrees with the disabled UI state.
      const baseline = deriveTheme({ ...DEFAULT_INPUTS, variant: 'cmf' })
      const overridden = deriveTheme({
        ...DEFAULT_INPUTS,
        variant: 'cmf',
        paletteOverrides: { tertiary: '#ffaa00' },
      })
      expect(overridden.md.light['--color-tertiary']).toBe(baseline.md.light['--color-tertiary'])
      expect(overridden.md.light['--color-tertiary-container']).toBe(
        baseline.md.light['--color-tertiary-container'],
      )
    })

    it('palette override propagates through to shadcn via the binding chain', () => {
      // why: end-to-end — palette override changes md primary-container,
      // shadcn.--primary mirrors md primary-container, so shadcn must reflect
      // the regen automatically (no separate shadcn rewrite needed).
      const baseline = deriveTheme(DEFAULT_INPUTS)
      const overridden = deriveTheme({
        ...DEFAULT_INPUTS,
        paletteOverrides: { primary: '#ff0066' },
      })
      expect(overridden.shadcn.light['--primary']).not.toBe(baseline.shadcn.light['--primary'])
    })
  })

  describe('cmfSecondSourceHex', () => {
    it('null is identity — output equals single-source build byte-for-byte', () => {
      // why: drift-guard contract. cmfSecondSourceHex defaulting to null
      // must produce a build path identical to passing no second hct at
      // all, which the cmf strategy short-circuits via the secondHct ===
      // undefined branch. Locks that no array allocation slips into the
      // default path where it would shift any md token.
      const baseline = deriveTheme({ ...DEFAULT_INPUTS, variant: 'cmf' })
      const explicit = deriveTheme({
        ...DEFAULT_INPUTS,
        variant: 'cmf',
        cmfSecondSourceHex: null,
      })
      expect(explicit.md.light).toEqual(baseline.md.light)
      expect(explicit.md.dark).toEqual(baseline.md.dark)
      expect(explicit.shadcn.light).toEqual(baseline.shadcn.light)
      expect(explicit.shadcn.dark).toEqual(baseline.shadcn.dark)
    })

    it('shifts tertiary and error md tokens away from baseline under cmf', () => {
      // why: SchemeCmf reads sourceColorHcts[1] to drive tertiaryPalette
      // (full reassign with second hue+chroma) AND errorPalette hue (via
      // getErrorHue lookup over both source hues). Tertiary always shifts.
      // Error shift requires the second hue to land in a different bucket
      // than the seed — see CMF_SECOND_HEX_BUCKET_SHIFT comment. Primary
      // and secondary must not shift.
      const baseline = deriveTheme({ ...DEFAULT_INPUTS, variant: 'cmf' })
      const second = deriveTheme({
        ...DEFAULT_INPUTS,
        variant: 'cmf',
        cmfSecondSourceHex: CMF_SECOND_HEX_BUCKET_SHIFT,
      })
      expect(second.md.light['--color-tertiary']).not.toBe(baseline.md.light['--color-tertiary'])
      expect(second.md.light['--color-error']).not.toBe(baseline.md.light['--color-error'])
      expect(second.md.light['--color-primary']).toBe(baseline.md.light['--color-primary'])
      expect(second.md.light['--color-secondary']).toBe(baseline.md.light['--color-secondary'])
    })

    it('non-cmf variant ignores the field — output equals baseline', () => {
      // why: structural backstop for the disabled-state contract. Even if
      // a value persisted from a prior cmf session is on the source, the
      // non-cmf strategy ignores its 4th `secondHct` param. Engine also
      // skips threading the hct when disabled-reason fires (defense in
      // depth). Either path produces identical output to no-value baseline.
      const baseline = deriveTheme({ ...DEFAULT_INPUTS, variant: 'tonalSpot' })
      const stale = deriveTheme({
        ...DEFAULT_INPUTS,
        variant: 'tonalSpot',
        cmfSecondSourceHex: CMF_SECOND_HEX_BUCKET_SHIFT,
      })
      expect(stale.md.light).toEqual(baseline.md.light)
      expect(stale.md.dark).toEqual(baseline.md.dark)
    })

    it('propagates to shadcn through the binding chain', () => {
      // why: shadcn.--destructive defaults to md --color-error under cmf;
      // changing the second source must flow through to the bound role.
      const baseline = deriveTheme({ ...DEFAULT_INPUTS, variant: 'cmf' })
      const second = deriveTheme({
        ...DEFAULT_INPUTS,
        variant: 'cmf',
        cmfSecondSourceHex: CMF_SECOND_HEX_BUCKET_SHIFT,
      })
      expect(second.shadcn.light['--destructive']).not.toBe(baseline.shadcn.light['--destructive'])
    })

    it('composes with paletteOverrides — override wins on overlapping palette', () => {
      // why: ordering contract — palette-override apply runs AFTER variant
      // build (which is where second-source folds into tertiary/error). So
      // a paletteOverrides.error hex stomps the second-source-shifted error
      // palette, while tertiary stays where second-source put it (override
      // is disabled for tertiary under cmf).
      const errorOverride = '#22c55e'
      const out = deriveTheme({
        ...DEFAULT_INPUTS,
        variant: 'cmf',
        cmfSecondSourceHex: CMF_SECOND_HEX_BUCKET_SHIFT,
        paletteOverrides: { error: errorOverride },
      })
      const secondOnly = deriveTheme({
        ...DEFAULT_INPUTS,
        variant: 'cmf',
        cmfSecondSourceHex: CMF_SECOND_HEX_BUCKET_SHIFT,
      })
      // override stomps second-source for error
      expect(out.md.light['--color-error']).not.toBe(secondOnly.md.light['--color-error'])
      // tertiary stays as second-source produced it (override disabled)
      expect(out.md.light['--color-tertiary']).toBe(secondOnly.md.light['--color-tertiary'])
    })
  })

  describe('shadcnRoleBindings', () => {
    it('default bindings preserve slice-1 mapping rule', () => {
      // why: locks the default behavior so changing the data shape can't
      // silently drift the visible mapping — DEFAULT_SHADCN_ROLE_BINDINGS
      // is the migration contract for any consumer who upgrades schema.
      const { md, shadcn } = deriveTheme(DEFAULT_INPUTS)
      expect(shadcn.light['--primary']).toBe(md.light['--color-primary-container'])
      expect(shadcn.dark['--primary']).toBe(md.dark['--color-primary-container'])
    })

    it('rebinding shadcn primary to md primary updates only that role', () => {
      const { md, shadcn } = deriveTheme({
        ...DEFAULT_INPUTS,
        shadcnRoleBindings: {
          light: {
            ...DEFAULT_SHADCN_ROLE_BINDINGS.light,
            '--primary': '--color-primary',
            '--primary-foreground': '--color-on-primary',
          },
          dark: {
            ...DEFAULT_SHADCN_ROLE_BINDINGS.dark,
            '--primary': '--color-primary',
            '--primary-foreground': '--color-on-primary',
          },
        },
      })
      expect(shadcn.light['--primary']).toBe(md.light['--color-primary'])
      expect(shadcn.light['--primary-foreground']).toBe(md.light['--color-on-primary'])
      expect(shadcn.dark['--primary']).toBe(md.dark['--color-primary'])
    })

    it('mode-keyed bindings can diverge across light and dark', () => {
      // why: the load-bearing reason bindings are mode-keyed — slice 7 will
      // admit cross-mode mapping divergence (e.g. for contrast). Verify the
      // mechanism here so the data shape carries weight before we use it.
      const { md, shadcn } = deriveTheme({
        ...DEFAULT_INPUTS,
        shadcnRoleBindings: {
          light: DEFAULT_SHADCN_ROLE_BINDINGS.light,
          dark: {
            ...DEFAULT_SHADCN_ROLE_BINDINGS.dark,
            '--primary': '--color-primary',
            '--primary-foreground': '--color-on-primary',
          },
        },
      })
      expect(shadcn.light['--primary']).toBe(md.light['--color-primary-container'])
      expect(shadcn.dark['--primary']).toBe(md.dark['--color-primary'])
    })

    it('binding flows override through cross-layer mapping', () => {
      // why: combined pressure — override mutates the md token, the binding
      // selects which md token shadcn reads from. Both must compose without
      // drift. This is the slice-2 small-loop contract end-to-end.
      const { shadcn } = deriveTheme({
        ...DEFAULT_INPUTS,
        md3TokenOverrides: { light: { '--color-primary-container': '#ff0000' }, dark: {} },
        shadcnRoleBindings: DEFAULT_SHADCN_ROLE_BINDINGS,
      })
      expect(shadcn.light['--primary']).toBe(RED)
    })
  })

  describe('contrastLevel', () => {
    it('non-zero contrast shifts md tokens away from baseline', () => {
      const baseline = deriveTheme(DEFAULT_INPUTS)
      const high = deriveTheme({ ...DEFAULT_INPUTS, contrastLevel: 0.5 })
      // why: MCU's contrastLevel adjusts tone on dynamic colors; at least
      // some primary-family tokens should differ. Asserting !== rather than
      // a specific value because exact tone math is MCU's spec, not ours.
      expect(high.md.light['--color-primary']).not.toBe(baseline.md.light['--color-primary'])
    })
  })

  describe('customColors', () => {
    const success: CustomColorEntry = {
      id: 'id-success',
      name: 'Success',
      hex: '#22c55e',
      blend: false,
      shadcnSource: 'color',
    }
    const warning: CustomColorEntry = {
      id: 'id-warning',
      name: 'Warning',
      hex: '#f59e0b',
      blend: false,
      shadcnSource: 'container',
    }

    it('empty array (default) emits no extra tokens', () => {
      const baseline = deriveTheme(DEFAULT_INPUTS)
      const explicit = deriveTheme({ ...DEFAULT_INPUTS, customColors: [] })
      expect(explicit).toEqual(baseline)
    })

    it('one entry emits 4 md tokens (light + dark) via slug', () => {
      const { md } = deriveTheme({ ...DEFAULT_INPUTS, customColors: [success] })
      for (const mode of [md.light, md.dark]) {
        expect(mode['--color-success']).toMatch(OKLCH)
        expect(mode['--color-on-success']).toMatch(OKLCH)
        expect(mode['--color-success-container']).toMatch(OKLCH)
        expect(mode['--color-on-success-container']).toMatch(OKLCH)
      }
      // light vs dark differ — MCU's customColor maps tones differently per mode
      expect(md.light['--color-success']).not.toBe(md.dark['--color-success'])
    })

    it('one entry emits 2 shadcn tokens sourced from md per shadcnSource=color', () => {
      const { md, shadcn } = deriveTheme({ ...DEFAULT_INPUTS, customColors: [success] })
      expect(shadcn.light['--success']).toBe(md.light['--color-success'])
      expect(shadcn.light['--success-foreground']).toBe(md.light['--color-on-success'])
      expect(shadcn.dark['--success']).toBe(md.dark['--color-success'])
      expect(shadcn.dark['--success-foreground']).toBe(md.dark['--color-on-success'])
    })

    it('shadcnSource=container pulls shadcn pair from container/onContainer', () => {
      const { md, shadcn } = deriveTheme({ ...DEFAULT_INPUTS, customColors: [warning] })
      expect(shadcn.light['--warning']).toBe(md.light['--color-warning-container'])
      expect(shadcn.light['--warning-foreground']).toBe(md.light['--color-on-warning-container'])
      expect(shadcn.dark['--warning']).toBe(md.dark['--color-warning-container'])
      expect(shadcn.dark['--warning-foreground']).toBe(md.dark['--color-on-warning-container'])
    })

    it('multiple entries emit independent token sets', () => {
      const { md, shadcn } = deriveTheme({
        ...DEFAULT_INPUTS,
        customColors: [success, warning],
      })
      expect(md.light['--color-success']).toMatch(OKLCH)
      expect(md.light['--color-warning']).toMatch(OKLCH)
      expect(shadcn.light['--success']).toBe(md.light['--color-success'])
      expect(shadcn.light['--warning']).toBe(md.light['--color-warning-container'])
      expect(md.light['--color-success']).not.toBe(md.light['--color-warning'])
    })

    it('does not affect existing md or shadcn tokens', () => {
      const baseline = deriveTheme(DEFAULT_INPUTS)
      const withCustom = deriveTheme({ ...DEFAULT_INPUTS, customColors: [success] })
      expect(withCustom.md.light['--color-primary']).toBe(baseline.md.light['--color-primary'])
      expect(withCustom.shadcn.light['--primary']).toBe(baseline.shadcn.light['--primary'])
      expect(withCustom.shadcn.light['--background']).toBe(baseline.shadcn.light['--background'])
    })

    it('blend=true shifts custom color toward source hue', () => {
      const blended = deriveTheme({
        ...DEFAULT_INPUTS,
        customColors: [{ ...success, blend: true }],
      })
      const unblended = deriveTheme({
        ...DEFAULT_INPUTS,
        customColors: [{ ...success, blend: false }],
      })
      expect(blended.md.light['--color-success']).not.toBe(unblended.md.light['--color-success'])
    })

    it('multi-word name slugifies for emission', () => {
      const entry: CustomColorEntry = {
        id: 'id-brand',
        name: 'Brand X',
        hex: '#3366ff',
        blend: false,
        shadcnSource: 'color',
      }
      const { md, shadcn } = deriveTheme({ ...DEFAULT_INPUTS, customColors: [entry] })
      expect(md.light['--color-brand-x']).toMatch(OKLCH)
      expect(shadcn.light['--brand-x']).toBe(md.light['--color-brand-x'])
    })
  })

  describe('surfaceAlgo', () => {
    it("'desaturate' at level 0 leaves md surface family untouched (identity)", () => {
      const baseline = deriveTheme(DEFAULT_INPUTS)
      const explicit = deriveTheme({
        ...DEFAULT_INPUTS,
        surfaceAlgo: 'desaturate',
        surfaceDesaturateLevel: { light: 0, dark: 0 },
      })
      expect(explicit.md.light['--color-surface']).toBe(baseline.md.light['--color-surface'])
    })

    it("'tint' replaces md surface tokens with treated values", () => {
      const baseline = deriveTheme(DEFAULT_INPUTS)
      const tinted = deriveTheme({
        ...DEFAULT_INPUTS,
        surfaceAlgo: 'tint',
        surfaceTintLevel: { light: 1, dark: 1 },
      })
      expect(tinted.md.light['--color-surface']).not.toBe(baseline.md.light['--color-surface'])
      // why: shadcn primary by default binds to primary-container (not surface),
      // so the treatment should NOT change shadcn primary at default bindings.
      expect(tinted.shadcn.light['--primary']).toBe(baseline.shadcn.light['--primary'])
    })

    it('shadcn rebound to a treated surface token reflects treatment', () => {
      const tinted = deriveTheme({
        ...DEFAULT_INPUTS,
        surfaceAlgo: 'tint',
        surfaceTintLevel: { light: 1, dark: 1 },
        shadcnRoleBindings: {
          light: {
            ...DEFAULT_SHADCN_ROLE_BINDINGS.light,
            '--primary': '--color-surface-container',
            '--primary-foreground': '--color-on-surface',
          },
          dark: {
            ...DEFAULT_SHADCN_ROLE_BINDINGS.dark,
            '--primary': '--color-surface-container',
            '--primary-foreground': '--color-on-surface',
          },
        },
      })
      // why: this is the load-bearing assertion that "treatment runs before
      // shadcn binds". If treatment were post-bind, shadcn primary would equal
      // the untreated md surface-container, breaking preview === export.
      expect(tinted.shadcn.light['--primary']).toBe(tinted.md.light['--color-surface-container'])
    })

    it('per-mode tint levels — moving light does not affect dark', () => {
      // why: load-bearing assertion that per-mode levels are independent.
      // Light tint = 1 (full primary character), dark tint = 0 (base shade).
      // Both modes are tinted — comparison is against a uniform-dark-level
      // baseline so "dark unchanged" means dark's value matches the dark-only
      // controlled rendering. Tint has no MCU short-circuit (level 0 = base
      // palette shade, NOT MCU output), so we compare against the same dark
      // level rather than against MCU.
      const splitA = deriveTheme({
        ...DEFAULT_INPUTS,
        surfaceAlgo: 'tint',
        surfaceTintLevel: { light: 1, dark: 0 },
      })
      const splitB = deriveTheme({
        ...DEFAULT_INPUTS,
        surfaceAlgo: 'tint',
        surfaceTintLevel: { light: 0, dark: 0 },
      })
      expect(splitA.md.light['--color-surface']).not.toBe(splitB.md.light['--color-surface'])
      expect(splitA.md.dark['--color-surface']).toBe(splitB.md.dark['--color-surface'])
    })

    it('per-mode levels — desaturate diverges across modes independently', () => {
      const baseline = deriveTheme(DEFAULT_INPUTS)
      const split = deriveTheme({
        ...DEFAULT_INPUTS,
        surfaceAlgo: 'desaturate',
        surfaceDesaturateLevel: { light: 0, dark: 1 },
      })
      // light untouched (level 0 short-circuit)
      expect(split.md.light['--color-surface']).toBe(baseline.md.light['--color-surface'])
      // dark fully neutralised
      expect(split.md.dark['--color-surface']).not.toBe(baseline.md.dark['--color-surface'])
    })
  })
})

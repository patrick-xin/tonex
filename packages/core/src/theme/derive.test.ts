import { argbFromHex, Hct } from '@tonex/mcu'
import { describe, expect, it } from 'vitest'
import { deriveTheme } from './derive'
import { hexFromHct } from './hct'
import {
  type CustomColorEntry,
  DEFAULT_INPUTS,
  DEFAULT_SHADCN_ROLE_BINDINGS,
  MD_CHART_TOKEN_NAMES,
  MD_CORE_TOKEN_NAMES,
  MD_EXTENDED_TOKEN_NAMES,
  MD_PALETTE_FAMILY_NAMES,
  MD_PALETTE_TONE_NAMES,
  SHADCN_CHART_TOKEN_NAMES,
} from './schema'

// why: under DEFAULT seed (~hue 290), SchemeCmf.getErrorHue routes to the
// final else clause: (secondHue > 12 && secondHue <= 28) ? 32 : 16. Single-
// source falls into bucket 16; second.hue=20 lands in bucket 32. Constructed
// via Hct so the fixture is deterministic regardless of hex<->HCT rounding.
const CMF_SECOND_HEX_BUCKET_SHIFT = hexFromHct({ hue: 20, chroma: 60, tone: 50 })

// why: TokenMap is argb-canonical (ADR-0021). Hex inputs (overrides, locks)
// land in the layer as their argbFromHex projection — assert against the
// exact argb value so any change to the boundary parser fails here instead
// of silently drifting downstream.
const RED = argbFromHex('#ff0000')
const GREEN = argbFromHex('#00ff00')
const ABCDEF = argbFromHex('#abcdef')

describe('deriveTheme', () => {
  it('emits md primary role family for both modes', () => {
    const { md } = deriveTheme(DEFAULT_INPUTS)
    for (const mode of [md.light, md.dark]) {
      expect(mode['--color-primary']).toEqual(expect.any(Number))
      expect(mode['--color-on-primary']).toEqual(expect.any(Number))
      expect(mode['--color-primary-container']).toEqual(expect.any(Number))
      expect(mode['--color-on-primary-container']).toEqual(expect.any(Number))
    }
  })

  it('emits md surface family for both modes', () => {
    const { md } = deriveTheme(DEFAULT_INPUTS)
    for (const mode of [md.light, md.dark]) {
      expect(mode['--color-surface']).toEqual(expect.any(Number))
      expect(mode['--color-surface-container']).toEqual(expect.any(Number))
      expect(mode['--color-surface-container-high']).toEqual(expect.any(Number))
      expect(mode['--color-on-surface']).toEqual(expect.any(Number))
    }
  })

  it('emits shadcn primary + primary-foreground for both modes', () => {
    const { shadcn } = deriveTheme(DEFAULT_INPUTS)
    for (const mode of [shadcn.light, shadcn.dark]) {
      expect(mode['--primary']).toEqual(expect.any(Number))
      expect(mode['--primary-foreground']).toEqual(expect.any(Number))
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

  // why: ADR-0026 slice override-1 R3 — resolution precedence per c.4:
  //   1. shadcnRoleOverrides[mode][role]              ← literal pin
  //   2. shadcnRoleBindings[mode][role] → md (post-md3-override)
  //   3. MCU
  // Override must beat both binding and md-layer override; absent override,
  // binding still flows md3TokenOverrides through; absent both, MCU lands.
  describe('shadcnRoleOverrides', () => {
    it('empty default produces no behavioral change vs absent override', () => {
      const baseline = deriveTheme(DEFAULT_INPUTS)
      const explicit = deriveTheme({
        ...DEFAULT_INPUTS,
        shadcnRoleOverrides: { light: {}, dark: {} },
      })
      expect(explicit).toEqual(baseline)
    })

    it('override beats binding — pinned role takes the literal hex', () => {
      const { shadcn } = deriveTheme({
        ...DEFAULT_INPUTS,
        shadcnRoleOverrides: { light: { '--ring': '#ff0000' }, dark: {} },
      })
      expect(shadcn.light['--ring']).toBe(RED)
    })

    it('override beats md3TokenOverrides on the bound token', () => {
      // why: c.4 — override is the more-specific surface (shadcn role) and
      // dominates the more-general md-layer pin even when both target the
      // same effective slot. md3 pin moves the underlying md token, override
      // pins the shadcn role; override wins.
      const { md, shadcn } = deriveTheme({
        ...DEFAULT_INPUTS,
        md3TokenOverrides: { light: { '--color-outline': '#00ff00' }, dark: {} },
        shadcnRoleOverrides: { light: { '--ring': '#ff0000' }, dark: {} },
      })
      // md token reflects the md3 pin
      expect(md.light['--color-outline']).toBe(GREEN)
      // shadcn role reflects the override (not the md3-pinned bound value)
      expect(shadcn.light['--ring']).toBe(RED)
    })

    it('without override, binding still respects md3TokenOverrides', () => {
      // why: with no shadcn override, the binding path takes the md3-pinned
      // value through the bound token. Confirms the override branch is
      // additive — not replacing the md3 propagation contract.
      const { shadcn } = deriveTheme({
        ...DEFAULT_INPUTS,
        md3TokenOverrides: { light: { '--color-outline': '#00ff00' }, dark: {} },
      })
      // --ring binds to --color-outline by default
      expect(shadcn.light['--ring']).toBe(GREEN)
    })

    it('without either override, role lands on the MCU-derived bound value', () => {
      const { md, shadcn } = deriveTheme(DEFAULT_INPUTS)
      expect(shadcn.light['--ring']).toBe(md.light['--color-outline'])
    })

    it('per-mode independence — light pinned, dark follows binding', () => {
      const { md, shadcn } = deriveTheme({
        ...DEFAULT_INPUTS,
        shadcnRoleOverrides: { light: { '--ring': '#ff0000' }, dark: {} },
      })
      expect(shadcn.light['--ring']).toBe(RED)
      expect(shadcn.dark['--ring']).toBe(md.dark['--color-outline'])
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
        expect(mode['--color-success']).toEqual(expect.any(Number))
        expect(mode['--color-on-success']).toEqual(expect.any(Number))
        expect(mode['--color-success-container']).toEqual(expect.any(Number))
        expect(mode['--color-on-success-container']).toEqual(expect.any(Number))
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
      expect(md.light['--color-success']).toEqual(expect.any(Number))
      expect(md.light['--color-warning']).toEqual(expect.any(Number))
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
      expect(md.light['--color-brand-x']).toEqual(expect.any(Number))
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

  describe('partition fields (ADR-0021)', () => {
    it('md.light contains exactly the 28 core role tokens (no extended, no chart)', () => {
      const { md } = deriveTheme(DEFAULT_INPUTS)
      const lightKeys = new Set(Object.keys(md.light))
      // every core name lands in `light`
      for (const name of MD_CORE_TOKEN_NAMES) expect(lightKeys.has(name)).toBe(true)
      // no extended name leaks into `light`
      for (const name of MD_EXTENDED_TOKEN_NAMES) expect(lightKeys.has(name)).toBe(false)
      // no chart name leaks into `light`
      for (const name of MD_CHART_TOKEN_NAMES) expect(lightKeys.has(name)).toBe(false)
    })

    it('md.lightExtended contains exactly the 22 extended role tokens', () => {
      const { md } = deriveTheme(DEFAULT_INPUTS)
      const extendedKeys = new Set(Object.keys(md.lightExtended))
      expect(extendedKeys.size).toBe(MD_EXTENDED_TOKEN_NAMES.length)
      for (const name of MD_EXTENDED_TOKEN_NAMES) expect(extendedKeys.has(name)).toBe(true)
    })

    it('md.lightChart and md.darkChart each have 5 chart tokens; values diverge across modes', () => {
      const { md } = deriveTheme(DEFAULT_INPUTS)
      expect(Object.keys(md.lightChart).length).toBe(MD_CHART_TOKEN_NAMES.length)
      expect(Object.keys(md.darkChart).length).toBe(MD_CHART_TOKEN_NAMES.length)
      for (const name of MD_CHART_TOKEN_NAMES) {
        expect(md.lightChart[name]).toEqual(expect.any(Number))
        expect(md.darkChart[name]).toEqual(expect.any(Number))
      }
      // why: light/dark mode chart tones intentionally differ to keep series
      // visible against the matching surface family. At least one position
      // shifting is the structural assertion that mode-aware tone selection
      // is wired (vs both modes reading identical tones).
      const someDiff = MD_CHART_TOKEN_NAMES.some((n) => md.lightChart[n] !== md.darkChart[n])
      expect(someDiff).toBe(true)
    })

    it('md.palette contains 78 tones (13 × 6 families), mode/contrast-invariant', () => {
      const baseline = deriveTheme(DEFAULT_INPUTS)
      const expectedCount = MD_PALETTE_FAMILY_NAMES.length * MD_PALETTE_TONE_NAMES.length
      expect(Object.keys(baseline.md.palette).length).toBe(expectedCount)

      // why: palette is contrast-invariant — the tonal ramp is a function of
      // seed + variant, not of contrast level. Pinning this lets inspect UIs
      // cache palette across contrast toggles.
      const high = deriveTheme({ ...DEFAULT_INPUTS, contrastLevel: 0.5 })
      expect(high.md.palette).toEqual(baseline.md.palette)
    })

    it('shadcn.lightChart mirrors md.lightChart values under the shadcn naming', () => {
      const { md, shadcn } = deriveTheme(DEFAULT_INPUTS)
      for (let i = 0; i < MD_CHART_TOKEN_NAMES.length; i++) {
        const mdName = MD_CHART_TOKEN_NAMES[i]
        const shadcnName = SHADCN_CHART_TOKEN_NAMES[i]
        expect(shadcn.lightChart[shadcnName]).toBe(md.lightChart[mdName])
        expect(shadcn.darkChart[shadcnName]).toBe(md.darkChart[mdName])
      }
    })

    it('chart.scheme="categorical": 5 chart tokens are distinct hue-rotated values at fixed chroma/tone', () => {
      // why: ADR-0024 (renamed to "categorical" per ADR-0027 c.2) — the scheme
      // synthesizes via Hct.from(hue, 50, tone). The 5 hue offsets
      // [0,120,240,60,180] guarantee distinct hues, so the emitted argb values
      // must all differ. Round-tripping each through Hct confirms chroma/tone
      // are pinned per-mode (45 light / 65 dark, post slice contrast-4) and
      // chroma rests at the configured 50 (modulo MCU gamut clipping).
      const { md } = deriveTheme({ ...DEFAULT_INPUTS, chart: { scheme: 'categorical' } })
      const lightArgbs = MD_CHART_TOKEN_NAMES.map((n) => md.lightChart[n] as number)
      expect(new Set(lightArgbs).size).toBe(5)
      for (const argb of lightArgbs) {
        const hct = Hct.fromInt(argb)
        expect(hct.tone).toBeCloseTo(45, 0)
      }
      const darkArgbs = MD_CHART_TOKEN_NAMES.map((n) => md.darkChart[n] as number)
      for (const argb of darkArgbs) {
        const hct = Hct.fromInt(argb)
        expect(hct.tone).toBeCloseTo(65, 0)
      }
    })

    it('chart.scheme="categorical": achromatic seed (chroma < 5) falls back to hue 270', () => {
      // why: ADR-0024 — gray seeds have no usable hue, so categorical pins
      // the base to 270 (purple) rather than producing an all-gray chart.
      // chart-1 lands at the base hue (offset 0); assert it round-trips
      // close to 270.
      const grayInputs = {
        ...DEFAULT_INPUTS,
        seedHex: '#808080',
        chart: { scheme: 'categorical' as const },
      }
      const { md } = deriveTheme(grayInputs)
      const chart1 = md.lightChart['--color-chart-1'] as number
      const hct = Hct.fromInt(chart1)
      expect(hct.hue).toBeGreaterThan(265)
      expect(hct.hue).toBeLessThan(275)
    })

    it('chart.scheme="sequential" (default) is unchanged from pre-axis behavior — palette-tone derivation', () => {
      // why: drift-guard. sequential is the default (ADR-0027 c.2, renamed
      // from "mono"); its derivation must remain the variant-aware
      // primaryPalette.tone() path that v9 had inline. Explicit
      // chart.scheme='sequential' must equal the default DEFAULT_INPUTS
      // result token-for-token.
      const baseline = deriveTheme(DEFAULT_INPUTS)
      const explicit = deriveTheme({ ...DEFAULT_INPUTS, chart: { scheme: 'sequential' } })
      expect(explicit.md.lightChart).toEqual(baseline.md.lightChart)
      expect(explicit.md.darkChart).toEqual(baseline.md.darkChart)
    })

    // why: ADR-0027 c.4 — chart overrides are terminal pins applied
    // post-rebrandChart on the shadcn-named tokens (--chart-N). Per-mode
    // sparse map; entries win over the scheme-derived value byte-identically
    // (argbFromHex of the pinned hex). MD layer is untouched — pins live on
    // the shadcn surface only, mirroring how shadcnRoleOverrides scope to
    // shadcn-named roles.
    it('shadcnChartOverrides pin wins on the shadcn layer; md.lightChart unaffected', () => {
      const pinned = deriveTheme({
        ...DEFAULT_INPUTS,
        shadcnChartOverrides: {
          light: { '--chart-1': '#ff0000', '--chart-3': '#00ff00' },
          dark: { '--chart-2': '#abcdef' },
        },
      })
      expect(pinned.shadcn.lightChart['--chart-1']).toBe(RED)
      expect(pinned.shadcn.lightChart['--chart-3']).toBe(GREEN)
      expect(pinned.shadcn.darkChart['--chart-2']).toBe(ABCDEF)
      // unpinned shadcn-layer chart tokens still track derivation
      const baseline = deriveTheme(DEFAULT_INPUTS)
      expect(pinned.shadcn.lightChart['--chart-2']).toBe(baseline.shadcn.lightChart['--chart-2'])
      expect(pinned.shadcn.darkChart['--chart-1']).toBe(baseline.shadcn.darkChart['--chart-1'])
      // md layer is not affected by shadcn-layer pins
      expect(pinned.md.lightChart).toEqual(baseline.md.lightChart)
      expect(pinned.md.darkChart).toEqual(baseline.md.darkChart)
    })

    it('shadcnChartOverrides empty map is byte-identical to DEFAULT_INPUTS chart emission', () => {
      // why: drift-guard. The default empty `{ light: {}, dark: {} }` must
      // produce the same chart layer as DEFAULT_INPUTS would absent the
      // field — the empty branch in applyShadcnChartOverrides must not
      // mutate values, only pass through.
      const baseline = deriveTheme(DEFAULT_INPUTS)
      const explicit = deriveTheme({
        ...DEFAULT_INPUTS,
        shadcnChartOverrides: { light: {}, dark: {} },
      })
      expect(explicit.shadcn.lightChart).toEqual(baseline.shadcn.lightChart)
      expect(explicit.shadcn.darkChart).toEqual(baseline.shadcn.darkChart)
    })

    it('custom-color slugs land in md.light (core), not in lightExtended', () => {
      // why: ADR-0021 commitment 3 — "custom colors continue to merge into
      // md.{light,dark}". Locks the partition rule that puts user-defined
      // brand colors in the core tier rather than the extended sidecar.
      const success: CustomColorEntry = {
        id: 'id-success',
        name: 'Success',
        hex: '#22c55e',
        blend: false,
        shadcnSource: 'color',
      }
      const { md } = deriveTheme({ ...DEFAULT_INPUTS, customColors: [success] })
      expect(md.light['--color-success']).toEqual(expect.any(Number))
      expect(md.lightExtended['--color-success']).toBeUndefined()
    })

    it('palette-override changes propagate to md.palette tones for the matching family', () => {
      // why: end-to-end check — paletteOverride mutates the scheme's
      // primaryPalette, and md.palette reads tones from the same palette
      // field. The override must flow through.
      const baseline = deriveTheme(DEFAULT_INPUTS)
      const overridden = deriveTheme({
        ...DEFAULT_INPUTS,
        paletteOverrides: { primary: '#ff0066' },
      })
      // some primary palette tone must shift
      const someShift = MD_PALETTE_TONE_NAMES.some(
        (t) =>
          overridden.md.palette[`--color-primary-${t}`] !==
          baseline.md.palette[`--color-primary-${t}`],
      )
      expect(someShift).toBe(true)
      // siblings (e.g. neutral) stay put
      expect(overridden.md.palette['--color-neutral-50']).toBe(
        baseline.md.palette['--color-neutral-50'],
      )
    })
  })
})

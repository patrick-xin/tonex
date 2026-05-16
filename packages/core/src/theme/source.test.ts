// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { ShadcnChartTokenName } from '../chart/schema'
import { hctFromHex } from './hct'
import {
  type CustomColorEntry,
  DEFAULT_INPUTS,
  type MdTokenName,
  PALETTE_NAMES,
  type PaletteName,
  type PortableTheme,
  SCHEMA_VERSION,
  SHADCN_ROLE_NAMES,
  type ShadcnRoleBindings,
} from './schema'
import { flushPersist, STORAGE_KEY, selectPortable, selectSeedHex, useSource } from './source'

// why: structural round-trip. NONDEFAULT_INPUTS is typed PortableTheme so
// adding a schema field surfaces here as a typecheck error — that is the
// load-bearing guard behind source.ts's blacklist `partialize` (which
// promises new fields persist automatically). Without this typecheck-driven
// fixture the blacklist promise has no enforcement.
//
// Split into write + read halves: a single combined body would need a
// capture-clear-restore dance to make the read assertion meaningful (memory
// already holds the values it would rehydrate). Two tests, one mutation each.

// why: deeply non-default bindings — every role pinned to the same md token
// per mode, with light vs dark intentionally different. The point isn't a
// sensible mapping; it's that EVERY key persists round-trip independently.
// `as` cast is safe because we map over the role tuple itself.
const NONDEFAULT_BINDINGS_LIGHT: ShadcnRoleBindings = Object.fromEntries(
  SHADCN_ROLE_NAMES.map((role) => [role, '--color-primary']),
) as ShadcnRoleBindings
const NONDEFAULT_BINDINGS_DARK: ShadcnRoleBindings = Object.fromEntries(
  SHADCN_ROLE_NAMES.map((role) => [role, '--color-on-surface']),
) as ShadcnRoleBindings

const NONDEFAULT_CUSTOM_COLORS: CustomColorEntry[] = [
  {
    id: 'id-success',
    name: 'Success',
    description: 'positive feedback',
    hex: '#22c55e',
    blend: true,
    shadcnSource: 'color',
  },
  {
    id: 'id-warning',
    name: 'Warning',
    hex: '#f59e0b',
    blend: false,
    shadcnSource: 'container',
  },
]

const NONDEFAULT_INPUTS: PortableTheme = {
  version: SCHEMA_VERSION,
  seed: { ...hctFromHex('#ff00aa'), exactHex: '#ff00aa' },
  variant: 'tonalSpot',
  contrastLevel: 0.5,
  seedHexLock: true,
  md3TokenOverrides: {
    light: { '--color-primary-container': '#aabbcc', '--color-secondary': '#445566' },
    dark: { '--color-primary-container': '#112233' },
  },
  shadcnRoleBindings: { light: NONDEFAULT_BINDINGS_LIGHT, dark: NONDEFAULT_BINDINGS_DARK },
  shadcnRoleOverrides: {
    light: { '--ring': '#abcdef', '--background': '#112233' },
    dark: { '--ring': '#445566' },
  },
  shadcnChartOverrides: {
    light: { '--chart-1': '#abc123', '--chart-5': '#deadbe' },
    dark: { '--chart-2': '#445566' },
  },
  surfaceAlgo: 'tint',
  surfacePaletteName: 'slate',
  surfaceTintLevel: { light: 0.42, dark: 0.18 },
  surfaceDesaturateLevel: { light: 0.73, dark: 0.31 },
  customColors: NONDEFAULT_CUSTOM_COLORS,
  paletteOverrides: {
    primary: '#ff0066',
    secondary: '#33ccaa',
    tertiary: '#ffaa00',
    neutral: '#888899',
    neutralVariant: '#776655',
    error: '#ee2244',
  },
  cmfSecondSourceHex: '#aabbcc',
  chart: { scheme: 'categorical', hueSpread: 40, hueAnchor: 'prominent-edge' },
}

describe('useSource persistence round-trip', () => {
  beforeEach(() => {
    localStorage.clear()
    useSource.setState({ ...DEFAULT_INPUTS, _hydrated: true })
  })

  afterEach(() => {
    localStorage.clear()
    useSource.setState({ ...DEFAULT_INPUTS, _hydrated: false })
  })

  it('write half — every PortableTheme field is persisted via setters', () => {
    const s = useSource.getState()
    s.actions.setSeedHex(selectSeedHex(NONDEFAULT_INPUTS))
    s.actions.setVariant(NONDEFAULT_INPUTS.variant)
    s.actions.setContrastLevel(NONDEFAULT_INPUTS.contrastLevel)
    // why: setSeedHexLock must run AFTER setSeedHex above; once locked, the
    // seed setter no-ops, so reordering would silently drop the seed write.
    s.actions.setSeedHexLock(NONDEFAULT_INPUTS.seedHexLock)
    for (const mode of ['light', 'dark'] as const) {
      for (const [token, hex] of Object.entries(NONDEFAULT_INPUTS.md3TokenOverrides[mode])) {
        s.actions.setMd3TokenOverride(mode, token as MdTokenName, hex)
      }
    }
    for (const mode of ['light', 'dark'] as const) {
      for (const role of SHADCN_ROLE_NAMES) {
        s.actions.setShadcnRoleBinding(mode, role, NONDEFAULT_INPUTS.shadcnRoleBindings[mode][role])
      }
    }
    for (const mode of ['light', 'dark'] as const) {
      for (const [role, hex] of Object.entries(NONDEFAULT_INPUTS.shadcnRoleOverrides[mode])) {
        s.actions.setShadcnRoleOverride(mode, role as (typeof SHADCN_ROLE_NAMES)[number], hex)
      }
    }
    for (const mode of ['light', 'dark'] as const) {
      for (const [token, hex] of Object.entries(NONDEFAULT_INPUTS.shadcnChartOverrides[mode])) {
        s.actions.setShadcnChartOverride(mode, token as ShadcnChartTokenName, hex)
      }
    }
    s.actions.setSurfaceAlgo(NONDEFAULT_INPUTS.surfaceAlgo)
    s.actions.setSurfacePaletteName(NONDEFAULT_INPUTS.surfacePaletteName)
    for (const mode of ['light', 'dark'] as const) {
      s.actions.setSurfaceTintLevel(mode, NONDEFAULT_INPUTS.surfaceTintLevel[mode])
      s.actions.setSurfaceDesaturateLevel(mode, NONDEFAULT_INPUTS.surfaceDesaturateLevel[mode])
    }
    for (const entry of NONDEFAULT_CUSTOM_COLORS) s.actions.addCustomColor(entry)
    for (const palette of PALETTE_NAMES) {
      const hex = NONDEFAULT_INPUTS.paletteOverrides[palette]
      if (hex !== undefined) s.actions.setPaletteOverride(palette, hex)
    }
    // why: cmfSecondSourceHex is only writable under variant=cmf — the
    // setter consults cmfSecondSourceDisabledReason and no-ops on non-cmf.
    // Stage cmf, write the field, restore the fixture variant. Switching
    // back to non-cmf does not strip the value (engine ignores at apply
    // time when disabled, by design), so the persisted state matches the
    // fixture's variant=tonalSpot AND cmfSecondSourceHex='#aabbcc' shape.
    s.actions.setVariant('cmf')
    s.actions.setCmfSecondSourceHex(NONDEFAULT_INPUTS.cmfSecondSourceHex)
    s.actions.setVariant(NONDEFAULT_INPUTS.variant)
    s.actions.setChartScheme(NONDEFAULT_INPUTS.chart.scheme)
    s.actions.setChartHueSpread(NONDEFAULT_INPUTS.chart.hueSpread)
    s.actions.setChartHueAnchor(NONDEFAULT_INPUTS.chart.hueAnchor)

    // why: persist writes are debounced (issue #9) — drain the pending
    // write so the localStorage assertion below sees the latest state
    // without racing the timer.
    flushPersist()
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === null) throw new Error('expected localStorage to contain persisted state')
    const raw = JSON.parse(stored)
    expect(raw.version).toBe(SCHEMA_VERSION)
    expect(raw.state).toMatchObject(NONDEFAULT_INPUTS)
  })

  it('read half — rehydrate reproduces every PortableTheme field', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: NONDEFAULT_INPUTS, version: SCHEMA_VERSION }),
    )
    await useSource.persist.rehydrate()
    expect(useSource.getState()).toMatchObject(NONDEFAULT_INPUTS)
  })

  describe('customColors CRUD', () => {
    it('addCustomColor appends an entry', () => {
      const s = useSource.getState()
      s.actions.addCustomColor(NONDEFAULT_CUSTOM_COLORS[0]!)
      expect(useSource.getState().customColors).toEqual([NONDEFAULT_CUSTOM_COLORS[0]])
      s.actions.addCustomColor(NONDEFAULT_CUSTOM_COLORS[1]!)
      expect(useSource.getState().customColors).toEqual(NONDEFAULT_CUSTOM_COLORS)
    })

    it('updateCustomColor mutates by id, leaves others untouched', () => {
      const s = useSource.getState()
      for (const e of NONDEFAULT_CUSTOM_COLORS) s.actions.addCustomColor(e)
      s.actions.updateCustomColor('id-success', { hex: '#000000', blend: false })
      const updated = useSource.getState().customColors
      expect(updated[0]).toMatchObject({ id: 'id-success', hex: '#000000', blend: false })
      // other entry untouched
      expect(updated[1]).toEqual(NONDEFAULT_CUSTOM_COLORS[1])
    })

    it('removeCustomColor drops by id', () => {
      const s = useSource.getState()
      for (const e of NONDEFAULT_CUSTOM_COLORS) s.actions.addCustomColor(e)
      s.actions.removeCustomColor('id-success')
      expect(useSource.getState().customColors).toEqual([NONDEFAULT_CUSTOM_COLORS[1]])
    })

    it('addCustomColor rejects duplicate slug', () => {
      const s = useSource.getState()
      s.actions.addCustomColor(NONDEFAULT_CUSTOM_COLORS[0]!)
      expect(() =>
        s.actions.addCustomColor({ ...NONDEFAULT_CUSTOM_COLORS[0]!, id: 'id-different' }),
      ).toThrow(/duplicates/)
    })

    it('addCustomColor rejects reserved name', () => {
      const s = useSource.getState()
      expect(() =>
        s.actions.addCustomColor({
          id: 'id-bad',
          name: 'primary',
          hex: '#000000',
          blend: false,
          shadcnSource: 'color',
        }),
      ).toThrow(/reserved/)
    })

    it('updateCustomColor rejects rename to reserved or duplicate slug', () => {
      const s = useSource.getState()
      for (const e of NONDEFAULT_CUSTOM_COLORS) s.actions.addCustomColor(e)
      expect(() => s.actions.updateCustomColor('id-success', { name: 'primary' })).toThrow(
        /reserved/,
      )
      expect(() => s.actions.updateCustomColor('id-success', { name: 'Warning' })).toThrow(
        /duplicates/,
      )
    })
  })

  // why: HCT setters must replace exactly one axis and route through the same
  // lock gate as setSeedHex. Round-trip via hctFromHex on the resulting hex
  // because hexFromHct may snap to gamut — direct equality on the requested
  // axis would fail at extreme values.
  describe('HCT setters', () => {
    it('setSeedHue replaces hue exactly, preserves chroma + tone (ADR-0028)', () => {
      // why: post-ADR-0028 setSeedHue writes seed.hue directly — no hex
      // round-trip, so the assertion can be byte-exact. Pre-ADR-0028 the
      // round-trip through hexFromHct could clamp chroma at gamut walls
      // and rotate hue at low chroma (Mechanism B). Both classes of drift
      // are gone once the canonical HCT is the source of truth.
      useSource.setState({ seed: { hue: 0, chroma: 10, tone: 50 }, _hydrated: true })
      useSource.getState().actions.setSeedHue(120)
      const after = useSource.getState().seed
      expect(after.hue).toBe(120)
      expect(after.chroma).toBe(10)
      expect(after.tone).toBe(50)
    })

    it('setSeedTone replaces tone exactly, preserves hue + chroma', () => {
      useSource.setState({ seed: { hue: 90, chroma: 30, tone: 50 }, _hydrated: true })
      useSource.getState().actions.setSeedTone(80)
      const after = useSource.getState().seed
      expect(after.tone).toBe(80)
      expect(after.hue).toBe(90)
      expect(after.chroma).toBe(30)
    })

    it('setSeedChroma replaces chroma exactly, preserves hue + tone', () => {
      useSource.setState({ seed: { hue: 90, chroma: 10, tone: 50 }, _hydrated: true })
      useSource.getState().actions.setSeedChroma(20)
      const after = useSource.getState().seed
      expect(after.chroma).toBe(20)
      expect(after.hue).toBe(90)
      expect(after.tone).toBe(50)
    })

    it('all four setters no-op when seedHexLock is true', () => {
      const s = useSource.getState()
      s.actions.setSeedHex('#6750a4')
      s.actions.setSeedHexLock(true)
      const lockedSeed = useSource.getState().seed
      s.actions.setSeedHex('#abcdef')
      s.actions.setSeedHue(0)
      s.actions.setSeedChroma(80)
      s.actions.setSeedTone(50)
      expect(useSource.getState().seed).toEqual(lockedSeed)
    })

    // why: issue #56 — pre-fix sliders displayed Math.round(value) at step=1,
    // so a button-tap-and-Enter on the inline value display (or a drag with
    // no real movement) used to commit the rounded integer, decompose →
    // swap-axis → recompose, and silently drift seedHex by 1–2 channels.
    // Downstream amplification: up to 41ch on a CMF md token, 252ch under
    // fidelity, AA verdict flips on --muted-foreground/--muted. Programmatic
    // callers of these setters (the UI now routes through useHctFromHex, but
    // the per-axis actions stay exported per hct-control-sliders.tsx) inherit
    // the same tolerance gate: any caller submitting a value within solver
    // epsilon of the current axis cannot mutate seedHex.
    //
    // Tolerance is half a `.toFixed(2)` step (5e-3): the slider's button-tap
    // path commits the displayed value verbatim, so the setter must treat
    // that as a no-op while still letting a typed change of 0.01 through.
    describe('HCT setters no-op on round-trip-equivalent input (issue #56)', () => {
      // why: seeds with decimal HCT — exactly the surface that used to drift
      // when rounded. #6750a4 already lives on an integer HCT triplet, so
      // it's the control. Mix of bright/saturated and one near-grey to
      // cover the CHROMA_HUE_LOCK regime ceiling. Post-ADR-0028 the seeds
      // are stored with exactHex set, so a no-op setter preserves both the
      // canonical HCT AND the exact bytes — selectSeedHex stays identical.
      const SEEDS = ['#ff5722', '#1e88e5', '#4caf50', '#9c27b0', '#3b82f6', '#ec4899', '#7a7a7a']

      const seedWithExact = (seedHex: string) => ({
        ...DEFAULT_INPUTS,
        seed: { ...hctFromHex(seedHex), exactHex: seedHex },
        _hydrated: true,
      })

      it('setSeedHue is byte-stable when input equals current decimal hue', () => {
        for (const seedHex of SEEDS) {
          useSource.setState(seedWithExact(seedHex))
          const { hue } = hctFromHex(seedHex)
          useSource.getState().actions.setSeedHue(hue)
          expect(useSource.getState().seed.exactHex).toBe(seedHex)
          expect(selectSeedHex(useSource.getState())).toBe(seedHex)
        }
      })

      it('setSeedChroma is byte-stable when input equals current decimal chroma', () => {
        for (const seedHex of SEEDS) {
          useSource.setState(seedWithExact(seedHex))
          const { chroma } = hctFromHex(seedHex)
          useSource.getState().actions.setSeedChroma(chroma)
          expect(useSource.getState().seed.exactHex).toBe(seedHex)
          expect(selectSeedHex(useSource.getState())).toBe(seedHex)
        }
      })

      it('setSeedTone is byte-stable when input equals current decimal tone', () => {
        for (const seedHex of SEEDS) {
          useSource.setState(seedWithExact(seedHex))
          const { tone } = hctFromHex(seedHex)
          useSource.getState().actions.setSeedTone(tone)
          expect(useSource.getState().seed.exactHex).toBe(seedHex)
          expect(selectSeedHex(useSource.getState())).toBe(seedHex)
        }
      })

      it('setSeedHue is byte-stable on near-current input within solver tolerance', () => {
        for (const seedHex of SEEDS) {
          useSource.setState(seedWithExact(seedHex))
          const { hue } = hctFromHex(seedHex)
          // why: 4e-3 sits inside the 5e-3 tolerance — the band the
          // `.toFixed(2)` display rounds away. Outside the band, the setter
          // must still mutate (real user intent).
          useSource.getState().actions.setSeedHue(hue + 4e-3)
          expect(useSource.getState().seed.exactHex).toBe(seedHex)
        }
      })

      it('setSeedChroma is byte-stable on near-current input within solver tolerance', () => {
        for (const seedHex of SEEDS) {
          useSource.setState(seedWithExact(seedHex))
          const { chroma } = hctFromHex(seedHex)
          useSource.getState().actions.setSeedChroma(chroma + 4e-3)
          expect(useSource.getState().seed.exactHex).toBe(seedHex)
        }
      })

      it('setSeedTone is byte-stable on near-current input within solver tolerance', () => {
        for (const seedHex of SEEDS) {
          useSource.setState(seedWithExact(seedHex))
          const { tone } = hctFromHex(seedHex)
          useSource.getState().actions.setSeedTone(tone + 4e-3)
          expect(useSource.getState().seed.exactHex).toBe(seedHex)
        }
      })
    })
  })

  describe('setPaletteOverride', () => {
    it('writes hex under the addressed palette key', () => {
      const s = useSource.getState()
      s.actions.setPaletteOverride('primary', '#ff0066')
      expect(useSource.getState().paletteOverrides.primary).toBe('#ff0066')
      s.actions.setPaletteOverride('error', '#ee2244')
      expect(useSource.getState().paletteOverrides).toEqual({
        primary: '#ff0066',
        error: '#ee2244',
      })
    })

    it('null deletes the key (not stores null)', () => {
      const s = useSource.getState()
      s.actions.setPaletteOverride('primary', '#ff0066')
      s.actions.setPaletteOverride('primary', null)
      expect(useSource.getState().paletteOverrides).not.toHaveProperty('primary')
    })

    it('throws on malformed hex', () => {
      const s = useSource.getState()
      expect(() => s.actions.setPaletteOverride('primary', 'ff0066')).toThrow(/invalid hex/)
      expect(() => s.actions.setPaletteOverride('primary', '#ff')).toThrow(/invalid hex/)
      expect(() => s.actions.setPaletteOverride('primary', '#zzzzzz')).toThrow(/invalid hex/)
    })

    it('no-ops when paletteOverrideDisabledReason returns a string (cmf + tertiary)', () => {
      const s = useSource.getState()
      s.actions.setVariant('cmf')
      s.actions.setPaletteOverride('tertiary', '#ffaa00')
      expect(useSource.getState().paletteOverrides).not.toHaveProperty('tertiary')
      // other palettes still write under cmf
      s.actions.setPaletteOverride('primary', '#ff0066')
      expect(useSource.getState().paletteOverrides.primary).toBe('#ff0066')
    })

    it('does not strip a previously-set override when the source enters a disabled state', () => {
      // why: setter only blocks NEW writes; existing overrides survive
      // variant changes. Engine consults disabled-reason at apply time and
      // skips disabled entries without mutating state. This keeps the
      // setter's responsibility narrow and the data shape stable across
      // variant flips. DEFAULT_VARIANT is 'cmf', so the test must first
      // switch to a non-cmf variant to set tertiary, then flip to cmf.
      const s = useSource.getState()
      s.actions.setVariant('tonalSpot')
      s.actions.setPaletteOverride('tertiary', '#ffaa00')
      s.actions.setVariant('cmf')
      expect(useSource.getState().paletteOverrides.tertiary).toBe('#ffaa00')
    })

    it('typecheck: PaletteName narrows to the six MCU palettes', () => {
      // why: compile-time guard via the const tuple. Adding a stray name
      // (e.g. 'background') would be a TS error, not a runtime no-op.
      const palettes: PaletteName[] = [
        'primary',
        'secondary',
        'tertiary',
        'neutral',
        'neutralVariant',
        'error',
      ]
      expect(palettes).toHaveLength(6)
    })
  })

  describe('setCmfSecondSourceHex', () => {
    it('writes hex when variant is cmf', () => {
      const s = useSource.getState()
      s.actions.setVariant('cmf')
      s.actions.setCmfSecondSourceHex('#ff8800')
      expect(useSource.getState().cmfSecondSourceHex).toBe('#ff8800')
    })

    it('null clears the value', () => {
      const s = useSource.getState()
      s.actions.setVariant('cmf')
      s.actions.setCmfSecondSourceHex('#ff8800')
      s.actions.setCmfSecondSourceHex(null)
      expect(useSource.getState().cmfSecondSourceHex).toBeNull()
    })

    it('throws on malformed hex', () => {
      const s = useSource.getState()
      s.actions.setVariant('cmf')
      expect(() => s.actions.setCmfSecondSourceHex('ff8800')).toThrow(/invalid hex/)
      expect(() => s.actions.setCmfSecondSourceHex('#ff')).toThrow(/invalid hex/)
      expect(() => s.actions.setCmfSecondSourceHex('#zzzzzz')).toThrow(/invalid hex/)
    })

    it('no-ops when variant is not cmf', () => {
      const s = useSource.getState()
      s.actions.setVariant('tonalSpot')
      s.actions.setCmfSecondSourceHex('#ff8800')
      expect(useSource.getState().cmfSecondSourceHex).toBeNull()
    })

    it('does not strip a previously-set value when the source enters a disabled state', () => {
      // why: same shape as setPaletteOverride's disabled-state behavior —
      // setter only blocks NEW writes; existing values survive variant
      // flips. Engine ignores them at apply time when disabled. Lets the
      // user toggle variants to compare without losing their CMF input.
      const s = useSource.getState()
      s.actions.setVariant('cmf')
      s.actions.setCmfSecondSourceHex('#ff8800')
      s.actions.setVariant('tonalSpot')
      expect(useSource.getState().cmfSecondSourceHex).toBe('#ff8800')
    })

    it('clearing to null is also disabled when variant is not cmf', () => {
      // why: the setter gate is uniform — both write and clear are blocked
      // while the field is disabled. Otherwise a UI that bypassed the
      // disabled state could clear the value and lose the user's input.
      const s = useSource.getState()
      s.actions.setVariant('cmf')
      s.actions.setCmfSecondSourceHex('#ff8800')
      s.actions.setVariant('tonalSpot')
      s.actions.setCmfSecondSourceHex(null)
      expect(useSource.getState().cmfSecondSourceHex).toBe('#ff8800')
    })
  })

  // why: ADR-0026 slice override-1 R2 — setShadcnRoleOverride mirrors
  // setMd3TokenOverride's seam: hex sets the entry, null deletes it,
  // malformed hex throws at the boundary so a bad value never reaches derive.
  // Per-mode writes leave the other mode untouched.
  describe('setShadcnRoleOverride', () => {
    it('writes hex under the addressed (mode, role)', () => {
      const s = useSource.getState()
      s.actions.setShadcnRoleOverride('light', '--ring', '#abcdef')
      expect(useSource.getState().shadcnRoleOverrides.light['--ring']).toBe('#abcdef')
      expect(useSource.getState().shadcnRoleOverrides.dark).toEqual({})
    })

    it('null deletes the entry (not stores null)', () => {
      const s = useSource.getState()
      s.actions.setShadcnRoleOverride('light', '--ring', '#abcdef')
      s.actions.setShadcnRoleOverride('light', '--ring', null)
      expect(useSource.getState().shadcnRoleOverrides.light).not.toHaveProperty('--ring')
    })

    it('throws on malformed hex', () => {
      const s = useSource.getState()
      expect(() => s.actions.setShadcnRoleOverride('light', '--ring', 'not-hex')).toThrow(
        /invalid hex/,
      )
      expect(() => s.actions.setShadcnRoleOverride('light', '--ring', '#abc')).toThrow(
        /invalid hex/,
      )
    })

    it('per-mode writes — light does not affect dark', () => {
      const s = useSource.getState()
      s.actions.setShadcnRoleOverride('light', '--ring', '#abcdef')
      s.actions.setShadcnRoleOverride('dark', '--ring', '#445566')
      expect(useSource.getState().shadcnRoleOverrides.light['--ring']).toBe('#abcdef')
      expect(useSource.getState().shadcnRoleOverrides.dark['--ring']).toBe('#445566')
      s.actions.setShadcnRoleOverride('light', '--ring', null)
      expect(useSource.getState().shadcnRoleOverrides.light).not.toHaveProperty('--ring')
      expect(useSource.getState().shadcnRoleOverrides.dark['--ring']).toBe('#445566')
    })
  })

  // why: issue #33 — MCU 2025/2026 spec curves treat any contrastLevel < 0
  // as identical to 0 (every ContrastCurve has `low === normal`) and >1
  // saturates at `high`. Setter clamps so source state never holds an inert
  // value that would mislead the export header or any third-party caller.
  // PortableThemeSchema enforces the same range so a stale persisted value
  // outside [0, 1] cannot rehydrate (rehydrate falls back to DEFAULT_INPUTS).
  describe('setContrastLevel clamps to [0, 1]', () => {
    it('negative values clamp to 0', () => {
      const s = useSource.getState()
      s.actions.setContrastLevel(-0.5)
      expect(useSource.getState().contrastLevel).toBe(0)
      s.actions.setContrastLevel(-1)
      expect(useSource.getState().contrastLevel).toBe(0)
      s.actions.setContrastLevel(-1000)
      expect(useSource.getState().contrastLevel).toBe(0)
    })

    it('values > 1 clamp to 1', () => {
      const s = useSource.getState()
      s.actions.setContrastLevel(1.5)
      expect(useSource.getState().contrastLevel).toBe(1)
      s.actions.setContrastLevel(2)
      expect(useSource.getState().contrastLevel).toBe(1)
      s.actions.setContrastLevel(1000)
      expect(useSource.getState().contrastLevel).toBe(1)
    })

    it('values in [0, 1] pass through unchanged', () => {
      const s = useSource.getState()
      s.actions.setContrastLevel(0)
      expect(useSource.getState().contrastLevel).toBe(0)
      s.actions.setContrastLevel(0.5)
      expect(useSource.getState().contrastLevel).toBe(0.5)
      s.actions.setContrastLevel(1)
      expect(useSource.getState().contrastLevel).toBe(1)
    })
  })

  it('setSeedHex no-ops when seedHexLock is true', () => {
    const s = useSource.getState()
    s.actions.setSeedHex('#aabbcc')
    s.actions.setSeedHexLock(true)
    s.actions.setSeedHex('#112233')
    expect(selectSeedHex(useSource.getState())).toBe('#aabbcc')
    s.actions.setSeedHexLock(false)
    s.actions.setSeedHex('#112233')
    expect(selectSeedHex(useSource.getState())).toBe('#112233')
  })

  // why: structural reset assertion — from a fully non-default state, reset()
  // must restore every PortableTheme field to DEFAULT_INPUTS. Uses the same
  // NONDEFAULT_INPUTS fixture as the persistence round-trip; if a future
  // schema field is added without DEFAULT_INPUTS coverage OR reset() drops
  // wholesale-replace semantics, this fails. Compares via selectPortable so
  // _hydrated and actions don't pollute the equality.
  it('reset() restores every PortableTheme field from arbitrary state', () => {
    useSource.setState({ ...NONDEFAULT_INPUTS, _hydrated: true })
    expect(selectPortable(useSource.getState())).toEqual(NONDEFAULT_INPUTS)
    useSource.getState().actions.reset()
    expect(selectPortable(useSource.getState())).toEqual(DEFAULT_INPUTS)
    expect(useSource.getState()._hydrated).toBe(true)
  })

  // why: ADR-0009 — schema validates the rehydrated shape; on parse failure
  // recovery is all-or-nothing reset. Simulate a tampered localStorage
  // record whose version field is current but whose seed shape is malformed
  // (tone out of [0, 100]). Without the parse gate, deriveTheme would feed
  // a bad triplet into Hct.from and produce garbage. With it, the source
  // snaps back to DEFAULT_INPUTS and the user gets a working editor.
  it('rehydrate with invalid persisted state resets to DEFAULT_INPUTS', async () => {
    const corrupt = { ...DEFAULT_INPUTS, seed: { hue: 0, chroma: 0, tone: 999 } }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: corrupt, version: SCHEMA_VERSION }))
    await useSource.persist.rehydrate()
    expect(selectPortable(useSource.getState())).toEqual(DEFAULT_INPUTS)
    expect(useSource.getState()._hydrated).toBe(true)
  })

  it('rehydrate with valid persisted state passes through untouched', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: NONDEFAULT_INPUTS, version: SCHEMA_VERSION }),
    )
    await useSource.persist.rehydrate()
    expect(selectPortable(useSource.getState())).toEqual(NONDEFAULT_INPUTS)
    expect(useSource.getState()._hydrated).toBe(true)
  })

  // why: ADR-0028 — HCT is the canonical persisted seed; pasted hex is
  // preserved verbatim via seed.exactHex until any HCT axis is touched.
  // Tests pin the four invariants the design rests on:
  //   1. setSeedHex stores both the HCT decomposition AND the exact hex bytes
  //   2. Any HCT-axis setter clears exactHex (user has left hex-input mode)
  //   3. A chroma touch in the CHROMA_HUE_LOCK regime preserves seed.hue
  //      (Mechanism B from #57 — pre-fix drift was up to 12.888°)
  //   4. A lock-release chroma touch (3.99 → 4.5) preserves seed.hue
  //      (pre-fix drift was up to 3.3° across 8/15 probed seeds)
  describe('canonical HCT seed (ADR-0028, issue #57)', () => {
    it('setSeedHex preserves exact hex bytes via selectSeedHex', () => {
      // why: ADR-0003's primary intake concern — #3B82F6 round-trips through
      // hexFromHct to #3B82F4. exactHex preserves the user's pasted bytes.
      const s = useSource.getState()
      s.actions.setSeedHex('#3b82f6')
      expect(selectSeedHex(useSource.getState())).toBe('#3b82f6')
      expect(useSource.getState().seed.exactHex).toBe('#3b82f6')
    })

    it('setSeedHex populates seed.{hue,chroma,tone} from the hex', async () => {
      const { hctFromHex } = await import('./hct')
      const s = useSource.getState()
      s.actions.setSeedHex('#3b82f6')
      const expected = hctFromHex('#3b82f6')
      const { seed } = useSource.getState()
      expect(seed.hue).toBeCloseTo(expected.hue, 5)
      expect(seed.chroma).toBeCloseTo(expected.chroma, 5)
      expect(seed.tone).toBeCloseTo(expected.tone, 5)
    })

    it('setSeedHue clears seed.exactHex (user has left hex-input mode)', () => {
      const s = useSource.getState()
      s.actions.setSeedHex('#3b82f6')
      expect(useSource.getState().seed.exactHex).toBe('#3b82f6')
      s.actions.setSeedHue(120)
      expect(useSource.getState().seed.exactHex).toBeUndefined()
    })

    it('setSeedChroma clears seed.exactHex', () => {
      const s = useSource.getState()
      s.actions.setSeedHex('#3b82f6')
      s.actions.setSeedChroma(80)
      expect(useSource.getState().seed.exactHex).toBeUndefined()
    })

    it('setSeedTone clears seed.exactHex', () => {
      const s = useSource.getState()
      s.actions.setSeedHex('#3b82f6')
      s.actions.setSeedTone(50)
      expect(useSource.getState().seed.exactHex).toBeUndefined()
    })

    it('selectSeedHex returns hexFromHct(seed) when exactHex is absent', async () => {
      const { hexFromHct } = await import('./hct')
      // No setter call — DEFAULT_INPUTS.seed.exactHex is '#6750a4' (the
      // project default). Drop into a no-exactHex state via direct setState
      // to exercise the fallback branch.
      const baseHct = { hue: 90, chroma: 30, tone: 50 }
      useSource.setState({ seed: baseHct, _hydrated: true })
      expect(selectSeedHex(useSource.getState())).toBe(hexFromHct(baseHct))
    })

    // why: load-bearing for ADR-0028. Pre-fix, setSeedChroma at chroma<4
    // ran the canonical seed through hexFromHct → hctFromHex and MCU's
    // gamut solver picked a different in-gamut hue for the new (chroma,
    // tone) pair — up to 12.888° silent rotation. Post-fix, the setter
    // writes seed.chroma directly and seed.hue is untouched.
    it('setSeedChroma at chroma<4 preserves seed.hue exactly (Mechanism B)', () => {
      // The seed that produced the maximum probed drift (probe 12 of #57).
      useSource.setState({
        seed: { hue: 90, chroma: 0.5, tone: 70 },
        _hydrated: true,
      })
      useSource.getState().actions.setSeedChroma(1.0)
      const { seed } = useSource.getState()
      expect(seed.hue).toBe(90)
      expect(seed.chroma).toBe(1.0)
      expect(seed.tone).toBe(70)
    })

    it('setSeedChroma lock-release (3.99 → 4.5) preserves seed.hue', () => {
      useSource.setState({
        seed: { hue: 180, chroma: 3.99, tone: 70 },
        _hydrated: true,
      })
      useSource.getState().actions.setSeedChroma(4.5)
      const { seed } = useSource.getState()
      expect(seed.hue).toBe(180)
      expect(seed.chroma).toBe(4.5)
    })

    it('setSeedTone at chroma<4 preserves seed.hue exactly', () => {
      useSource.setState({
        seed: { hue: 270, chroma: 0.5, tone: 50 },
        _hydrated: true,
      })
      useSource.getState().actions.setSeedTone(80)
      const { seed } = useSource.getState()
      expect(seed.hue).toBe(270)
      expect(seed.chroma).toBe(0.5)
      expect(seed.tone).toBe(80)
    })

    // why: defense-in-depth for #56 must survive the canonical-HCT flip.
    // Tolerance gate (5e-3) still suppresses no-op axis writes — but now
    // it gates against seed.{axis}, not against hctFromHex(seedHex).
    it('setSeedHue is byte-stable on within-tolerance input (issue #56 carryover)', () => {
      useSource.setState({
        seed: { hue: 90, chroma: 30, tone: 50, exactHex: '#aabbcc' },
        _hydrated: true,
      })
      useSource.getState().actions.setSeedHue(90 + 4e-3)
      // exactHex preserved because the setter no-oped — within tolerance,
      // no axis write happened, so the user did not "leave hex-input mode".
      expect(useSource.getState().seed.exactHex).toBe('#aabbcc')
      expect(useSource.getState().seed.hue).toBe(90)
    })

    it('seedHexLock blocks all four setters (hex + three axes)', () => {
      const s = useSource.getState()
      s.actions.setSeedHex('#112233')
      s.actions.setSeedHexLock(true)
      const before = useSource.getState().seed
      s.actions.setSeedHex('#445566')
      s.actions.setSeedHue(180)
      s.actions.setSeedChroma(50)
      s.actions.setSeedTone(80)
      expect(useSource.getState().seed).toEqual(before)
    })

    // why: wide-sweep regression for Mechanism B (#57 probe 12). Pre-fix the
    // 75-seed matrix (5 hues × 5 low chromas × 3 tones) showed max |Δhue| of
    // 12.888° after a chroma-only setter call; 10/75 seeds drifted >1°.
    // Post-fix every seed must hold its hue verbatim — the setter writes
    // seed.chroma and leaves seed.hue untouched. The 0.01 tolerance below
    // is generous (effectively a no-op for the post-fix path); any drift at
    // all means the canonical-HCT contract has regressed.
    describe('wide-sweep drift-guard (75 low-chroma seeds, ADR-0028)', () => {
      const HUES = [0, 90, 180, 270, 315] as const
      const CHROMAS = [0.5, 1, 2, 3, 3.99] as const
      const TONES = [30, 50, 70] as const

      it('chroma-only setter preserves hue across all 75 low-chroma seeds', () => {
        const drifters: string[] = []
        for (const hue of HUES) {
          for (const chroma of CHROMAS) {
            for (const tone of TONES) {
              useSource.setState({ seed: { hue, chroma, tone }, _hydrated: true })
              // why: 1.0 sits inside the lock regime; the prior bug rotated
              // hue here. Skip when current chroma equals 1 to avoid the
              // 5e-3 tolerance gate suppressing the write — that case is
              // a no-op for both pre- and post-fix paths.
              const target = chroma === 1 ? 1.5 : 1
              useSource.getState().actions.setSeedChroma(target)
              const drift = Math.abs(useSource.getState().seed.hue - hue)
              if (drift > 0.01)
                drifters.push(`hue=${hue},c=${chroma}→${target},t=${tone}:Δ=${drift.toFixed(3)}`)
            }
          }
        }
        expect(drifters).toEqual([])
      })

      it('tone-only setter preserves hue across all 75 low-chroma seeds', () => {
        const drifters: string[] = []
        for (const hue of HUES) {
          for (const chroma of CHROMAS) {
            for (const tone of TONES) {
              useSource.setState({ seed: { hue, chroma, tone }, _hydrated: true })
              const target = tone === 50 ? 60 : 50
              useSource.getState().actions.setSeedTone(target)
              const drift = Math.abs(useSource.getState().seed.hue - hue)
              if (drift > 0.01)
                drifters.push(`hue=${hue},c=${chroma},t=${tone}→${target}:Δ=${drift.toFixed(3)}`)
            }
          }
        }
        expect(drifters).toEqual([])
      })

      // why: the lock-release case (chroma 3.99 → 4.5) is where the hue
      // slider re-enables. Pre-fix this drifted up to 3.3° on 8/15 probed
      // seeds because the canonical seed went through a hex round-trip;
      // post-fix the user's hue survives intact.
      it('lock-release (chroma 3.99 → 4.5) preserves hue', () => {
        const drifters: string[] = []
        for (const hue of HUES) {
          for (const tone of TONES) {
            useSource.setState({ seed: { hue, chroma: 3.99, tone }, _hydrated: true })
            useSource.getState().actions.setSeedChroma(4.5)
            const drift = Math.abs(useSource.getState().seed.hue - hue)
            if (drift > 0.01) drifters.push(`hue=${hue},t=${tone}:Δ=${drift.toFixed(3)}`)
          }
        }
        expect(drifters).toEqual([])
      })
    })
  })
})

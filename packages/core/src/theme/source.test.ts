// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { ShadcnChartTokenName } from '../chart/schema'
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
  STORAGE_KEY,
} from './schema'
import { flushPersist, selectPortable, useSource } from './source'

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
  seedHex: '#ff00aa',
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
    s.actions.setSeedHex(NONDEFAULT_INPUTS.seedHex)
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
    it('setSeedHue replaces hue, preserves tone (chroma may gamut-clamp)', async () => {
      // why: chroma can drop when hue changes — gamut wall narrows for some
      // hues at the same (chroma, tone). That's MCU's solver doing its job,
      // not a bug. Use a low-chroma seed so the assertion isolates the axis
      // replacement from gamut clamping; tone is the genuinely-invariant axis.
      const { hexFromHct, hctFromHex } = await import('./hct')
      useSource.setState({ seedHex: hexFromHct({ hue: 0, chroma: 10, tone: 50 }) })
      const before = hctFromHex(useSource.getState().seedHex)
      useSource.getState().actions.setSeedHue(120)
      const after = hctFromHex(useSource.getState().seedHex)
      // why: MCU's solver produces hue values within ~1° of the request
      // after the round trip through hexFromHct → hctFromHex. ±2 covers
      // every observed drift without coupling to exact solver output.
      expect(Math.abs(after.hue - 120)).toBeLessThan(2)
      expect(Math.abs(after.chroma - before.chroma)).toBeLessThan(2)
      expect(Math.abs(after.tone - before.tone)).toBeLessThan(2)
    })

    it('setSeedTone replaces tone, preserves hue', async () => {
      const { hctFromHex } = await import('./hct')
      const before = hctFromHex(useSource.getState().seedHex)
      useSource.getState().actions.setSeedTone(80)
      const after = hctFromHex(useSource.getState().seedHex)
      expect(Math.abs(after.tone - 80)).toBeLessThan(2)
      expect(Math.abs(after.hue - before.hue)).toBeLessThan(2)
    })

    it('setSeedChroma replaces chroma, preserves hue + tone', async () => {
      const { hctFromHex } = await import('./hct')
      const before = hctFromHex(useSource.getState().seedHex)
      useSource.getState().actions.setSeedChroma(20)
      const after = hctFromHex(useSource.getState().seedHex)
      expect(Math.abs(after.chroma - 20)).toBeLessThan(2)
      expect(Math.abs(after.hue - before.hue)).toBeLessThan(2)
      expect(Math.abs(after.tone - before.tone)).toBeLessThan(2)
    })

    it('all three setters no-op when seedHexLock is true', () => {
      const s = useSource.getState()
      s.actions.setSeedHex('#6750a4')
      s.actions.setSeedHexLock(true)
      const locked = useSource.getState().seedHex
      s.actions.setSeedHue(0)
      s.actions.setSeedChroma(80)
      s.actions.setSeedTone(50)
      expect(useSource.getState().seedHex).toBe(locked)
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
    expect(useSource.getState().seedHex).toBe('#aabbcc')
    s.actions.setSeedHexLock(false)
    s.actions.setSeedHex('#112233')
    expect(useSource.getState().seedHex).toBe('#112233')
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

  // why: ADR-0009 — schema validates the v9 result post-migrate; on parse
  // failure the recovery is all-or-nothing reset. Simulate a tampered
  // localStorage record whose version field is current (so the migrate
  // ladder is a no-op) but whose seedHex is malformed. Without the parse
  // gate, deriveTheme would consume the bad hex and throw at MCU. With it,
  // the source snaps back to DEFAULT_INPUTS and the user gets a working
  // editor instead of a broken one.
  it('rehydrate with invalid persisted state resets to DEFAULT_INPUTS', async () => {
    const corrupt = { ...DEFAULT_INPUTS, seedHex: 'not-a-hex' }
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
})

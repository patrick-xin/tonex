// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  type CustomColorEntry,
  DEFAULT_INPUTS,
  type MdTokenName,
  type PortableTheme,
  SCHEMA_VERSION,
  SHADCN_ROLE_NAMES,
  type ShadcnRoleBindings,
  STORAGE_KEY,
} from './schema'
import { selectPortable, useSource } from './source'

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
  surfaceAlgo: 'tint',
  surfacePaletteName: 'slate',
  surfaceTintLevel: { light: 0.42, dark: 0.18 },
  surfaceDesaturateLevel: { light: 0.73, dark: 0.31 },
  customColors: NONDEFAULT_CUSTOM_COLORS,
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
    s.actions.setSurfaceAlgo(NONDEFAULT_INPUTS.surfaceAlgo)
    s.actions.setSurfacePaletteName(NONDEFAULT_INPUTS.surfacePaletteName)
    for (const mode of ['light', 'dark'] as const) {
      s.actions.setSurfaceTintLevel(mode, NONDEFAULT_INPUTS.surfaceTintLevel[mode])
      s.actions.setSurfaceDesaturateLevel(mode, NONDEFAULT_INPUTS.surfaceDesaturateLevel[mode])
    }
    for (const entry of NONDEFAULT_CUSTOM_COLORS) s.actions.addCustomColor(entry)

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

  it('v1 → v2 migrate: missing role bindings fill from defaults; persisted ones survive', async () => {
    // why: v1 only persisted --primary + --primary-foreground bindings. After
    // the v2 expansion, rehydrate must merge defaults under persisted bindings
    // so bindShadcn finds every role. Without this migration, deriveTheme
    // throws "role X bound to missing md token undefined" on first render.
    const v1State = {
      ...DEFAULT_INPUTS,
      shadcnRoleBindings: {
        light: { '--primary': '--color-primary', '--primary-foreground': '--color-on-primary' },
        dark: { '--primary': '--color-surface', '--primary-foreground': '--color-on-surface' },
      },
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: v1State, version: 1 }))
    await useSource.persist.rehydrate()

    const bindings = useSource.getState().shadcnRoleBindings
    // user's v1 edits survive
    expect(bindings.light['--primary']).toBe('--color-primary')
    expect(bindings.dark['--primary']).toBe('--color-surface')
    // missing roles filled from defaults
    expect(bindings.light['--background']).toBe('--color-surface')
    expect(bindings.dark['--card']).toBe('--color-surface-bright')
    expect(bindings.light['--sidebar-border']).toBe('--color-outline')
  })

  it('v3 → v4 migrate: lifts md3PrimaryContainerOverride into md3TokenOverrides', async () => {
    // why: slice 6 generalized the single-token override field into a
    // per-token map. Persisted v3 state has md3PrimaryContainerOverride as a
    // mode-keyed { light, dark } pair; rehydrate must place each non-null
    // value into md3TokenOverrides[mode]['--color-primary-container'] and
    // drop the old field. Null values produce no entry (override absence).
    const v3State = {
      ...DEFAULT_INPUTS,
      md3PrimaryContainerOverride: { light: '#aabbcc', dark: null },
    }
    // remove the new field so the persisted shape matches v3 exactly
    delete (v3State as Partial<PortableTheme>).md3TokenOverrides
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: v3State, version: 3 }))
    await useSource.persist.rehydrate()

    const overrides = useSource.getState().md3TokenOverrides
    expect(overrides.light['--color-primary-container']).toBe('#aabbcc')
    expect(overrides.dark['--color-primary-container']).toBeUndefined()
    expect(
      (useSource.getState() as Partial<{ md3PrimaryContainerOverride: unknown }>)
        .md3PrimaryContainerOverride,
    ).toBeUndefined()
  })

  it('v4 → v5 migrate: missing surfacePaletteName fills to default zinc', async () => {
    // why: slice 7 generalized applySurfaceTint to read base shades from a
    // user-picked TW neutral palette. Persisted v4 records have no
    // surfacePaletteName field; rehydrate must fill it with 'zinc' so the
    // default behavior matches v4 (where the algorithm was hardcoded to zinc).
    // Without this fill, surfacePaletteName would be undefined and the tint
    // algorithm would NPE on the palette lookup.
    const v4State = { ...DEFAULT_INPUTS } as Partial<PortableTheme>
    delete v4State.surfacePaletteName
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: v4State, version: 4 }))
    await useSource.persist.rehydrate()
    expect(useSource.getState().surfacePaletteName).toBe('zinc')
  })

  it('v6 → v7 migrate: flat surface levels lift into per-mode shape', async () => {
    // why: pre-v7 the levels were flat numbers shared across modes. Migration
    // mirrors the value into both modes so post-rehydrate output is identical
    // (level 0 in both modes is identity; non-zero values render the same in
    // both modes as before). A v6-shaped record with no levels at all flows
    // through DEFAULT_INPUTS via zustand's spread.
    const v6State = {
      ...DEFAULT_INPUTS,
      surfaceTintLevel: 0.42 as unknown as PortableTheme['surfaceTintLevel'],
      surfaceDesaturateLevel: 0.73 as unknown as PortableTheme['surfaceDesaturateLevel'],
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: v6State, version: 6 }))
    await useSource.persist.rehydrate()
    expect(useSource.getState().surfaceTintLevel).toEqual({ light: 0.42, dark: 0.42 })
    expect(useSource.getState().surfaceDesaturateLevel).toEqual({ light: 0.73, dark: 0.73 })
  })

  it('v5 → v6 migrate: legacy primaryHexLock is dropped', async () => {
    // why: slice-10 audit pruned primaryHexLock; rehydrate must delete the
    // persisted field so it doesn't shadow current state. Asserting the
    // field is absent (not just null) guards against the migration becoming
    // a no-op via accidental key preservation.
    const v5State = {
      ...DEFAULT_INPUTS,
      // legacy v5 shape — flat number levels (lifted to {light,dark} in v7)
      surfaceTintLevel: 0 as unknown as PortableTheme['surfaceTintLevel'],
      surfaceDesaturateLevel: 0 as unknown as PortableTheme['surfaceDesaturateLevel'],
      primaryHexLock: { light: '#ff5500', dark: '#00ccff' },
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: v5State, version: 5 }))
    await useSource.persist.rehydrate()
    expect(
      (useSource.getState() as Partial<{ primaryHexLock: unknown }>).primaryHexLock,
    ).toBeUndefined()
  })

  it('v2 → v3 migrate: missing customColors fills to empty array', async () => {
    // why: v2 had no customColors field; rehydrate must fill it so derive's
    // buildCustomColorsMd iteration doesn't NPE on `undefined.length`.
    const v2State = {
      ...DEFAULT_INPUTS,
      // simulate a persisted v2 record that lacks the field entirely
      customColors: undefined as unknown as CustomColorEntry[],
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: v2State, version: 2 }))
    await useSource.persist.rehydrate()
    expect(useSource.getState().customColors).toEqual([])
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
})

// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  DEFAULT_INPUTS,
  type PortableTheme,
  SCHEMA_VERSION,
  SHADCN_ROLE_NAMES,
  type ShadcnRoleBindings,
  STORAGE_KEY,
} from './schema'
import { useSource } from './source'

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

const NONDEFAULT_INPUTS: PortableTheme = {
  version: SCHEMA_VERSION,
  seedHex: '#ff00aa',
  variant: 'tonalSpot',
  contrastLevel: 0.5,
  primaryHexLock: { light: '#ff5500', dark: '#00ccff' },
  seedHexLock: true,
  md3PrimaryContainerOverride: { light: '#aabbcc', dark: '#112233' },
  shadcnRoleBindings: { light: NONDEFAULT_BINDINGS_LIGHT, dark: NONDEFAULT_BINDINGS_DARK },
  surfaceAlgo: 'tint',
  surfaceTintLevel: 0.42,
  surfaceDesaturateLevel: 0.73,
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
    s.setSeedHex(NONDEFAULT_INPUTS.seedHex)
    s.setVariant(NONDEFAULT_INPUTS.variant)
    s.setContrastLevel(NONDEFAULT_INPUTS.contrastLevel)
    s.setPrimaryHexLock('light', NONDEFAULT_INPUTS.primaryHexLock.light)
    s.setPrimaryHexLock('dark', NONDEFAULT_INPUTS.primaryHexLock.dark)
    // why: setSeedHexLock must run AFTER setSeedHex above; once locked, the
    // seed setter no-ops, so reordering would silently drop the seed write.
    s.setSeedHexLock(NONDEFAULT_INPUTS.seedHexLock)
    s.setMd3PrimaryContainerOverride('light', NONDEFAULT_INPUTS.md3PrimaryContainerOverride.light)
    s.setMd3PrimaryContainerOverride('dark', NONDEFAULT_INPUTS.md3PrimaryContainerOverride.dark)
    for (const mode of ['light', 'dark'] as const) {
      for (const role of SHADCN_ROLE_NAMES) {
        s.setShadcnRoleBinding(mode, role, NONDEFAULT_INPUTS.shadcnRoleBindings[mode][role])
      }
    }
    s.setSurfaceAlgo(NONDEFAULT_INPUTS.surfaceAlgo)
    s.setSurfaceTintLevel(NONDEFAULT_INPUTS.surfaceTintLevel)
    s.setSurfaceDesaturateLevel(NONDEFAULT_INPUTS.surfaceDesaturateLevel)

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

  it('setSeedHex no-ops when seedHexLock is true', () => {
    const s = useSource.getState()
    s.setSeedHex('#aabbcc')
    s.setSeedHexLock(true)
    s.setSeedHex('#112233')
    expect(useSource.getState().seedHex).toBe('#aabbcc')
    s.setSeedHexLock(false)
    s.setSeedHex('#112233')
    expect(useSource.getState().seedHex).toBe('#112233')
  })
})

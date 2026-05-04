// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_INPUTS, type PortableTheme, SCHEMA_VERSION, STORAGE_KEY } from './schema'
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

const NONDEFAULT_INPUTS: PortableTheme = {
  version: SCHEMA_VERSION,
  seedHex: '#ff00aa',
  variant: 'tonalSpot',
  md3PrimaryContainerOverride: { light: '#aabbcc', dark: '#112233' },
  shadcnRoleBindings: {
    light: { '--primary': '--color-primary', '--primary-foreground': '--color-on-primary' },
    dark: { '--primary': '--color-surface', '--primary-foreground': '--color-on-surface' },
  },
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
    s.setMd3PrimaryContainerOverride('light', NONDEFAULT_INPUTS.md3PrimaryContainerOverride.light)
    s.setMd3PrimaryContainerOverride('dark', NONDEFAULT_INPUTS.md3PrimaryContainerOverride.dark)
    for (const mode of ['light', 'dark'] as const) {
      s.setShadcnRoleBinding(
        mode,
        '--primary',
        NONDEFAULT_INPUTS.shadcnRoleBindings[mode]['--primary'],
      )
      s.setShadcnRoleBinding(
        mode,
        '--primary-foreground',
        NONDEFAULT_INPUTS.shadcnRoleBindings[mode]['--primary-foreground'],
      )
    }
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
})

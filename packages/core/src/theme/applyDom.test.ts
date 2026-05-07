// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { applyDom } from './applyDom'
import { deriveTheme, type TokenMap } from './derive'
import { oklchString } from './oklch'
import { DEFAULT_INPUTS, DEFAULT_SHADCN_ROLE_BINDINGS, type PortableTheme } from './schema'
import { selectPortable, useSource } from './source'

const STYLE_ID = 'tonex-tokens'

interface ProjectedLayer {
  light: Record<string, string>
  dark: Record<string, string>
}

// why: applyDom no longer rewrites textContent on update — it sets per-token
// declarations on four stable rules (ADR-0017 amendment 2026-05-06). Tests
// that assert "what's in the live DOM" therefore read tokens BACK from the
// live CSSOM via getPropertyValue rather than parsing textContent. The
// drift-guard contract is data-level: applyDom's effective tokens equal what
// deriveTheme produced for the same source.
//
// ADR-0021: TokenMap is argb-canonical at the derive boundary; the DOM holds
// oklch strings (the projected form applyDom writes via oklchString). Read-
// back is naturally a string map — projectLayer projects deriveTheme's argb
// output to the same string domain so the comparison stays apples-to-apples.
function readTokensFromStyle(): {
  md: { light: Record<string, string>; dark: Record<string, string> }
  shadcn: { light: Record<string, string>; dark: Record<string, string> }
} {
  const el = document.getElementById(STYLE_ID)
  if (!(el instanceof HTMLStyleElement)) {
    throw new Error(`expected <style id="${STYLE_ID}">`)
  }
  const sheet = el.sheet
  if (sheet === null) throw new Error('style element has no sheet')
  const layers: Record<string, Record<string, string>> = {}
  for (let i = 0; i < sheet.cssRules.length; i++) {
    const r = sheet.cssRules[i]
    if (!(r instanceof CSSStyleRule)) continue
    const tokens: Record<string, string> = {}
    for (let j = 0; j < r.style.length; j++) {
      const name = r.style.item(j)
      if (name === '') continue
      tokens[name] = r.style.getPropertyValue(name).trim()
    }
    layers[r.selectorText] = tokens
  }
  return {
    md: { light: layers['.md'] ?? {}, dark: layers['html.dark .md'] ?? {} },
    shadcn: { light: layers['.shadcn'] ?? {}, dark: layers['html.dark .shadcn'] ?? {} },
  }
}

function projectLayer(layer: TokenMap): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [name, argb] of Object.entries(layer)) {
    out[name] = oklchString(argb)
  }
  return out
}

// why: DOM holds core + chart merged per ADR-0021 commitment 4. Extended and
// palette stay data-only — never written by applyDom — so this projection
// helper deliberately omits them; any future regression that emits extended
// would surface here as an unexpected key.
function projectTheme(theme: ReturnType<typeof deriveTheme>): {
  md: ProjectedLayer
  shadcn: ProjectedLayer
} {
  return {
    md: {
      light: projectLayer({ ...theme.md.light, ...theme.md.lightChart }),
      dark: projectLayer({ ...theme.md.dark, ...theme.md.darkChart }),
    },
    shadcn: {
      light: projectLayer({ ...theme.shadcn.light, ...theme.shadcn.lightChart }),
      dark: projectLayer({ ...theme.shadcn.dark, ...theme.shadcn.darkChart }),
    },
  }
}

function tokenCount(): number {
  const written = readTokensFromStyle()
  return (
    Object.keys(written.md.light).length +
    Object.keys(written.md.dark).length +
    Object.keys(written.shadcn.light).length +
    Object.keys(written.shadcn.dark).length
  )
}

describe('applyDom (jsdom integration)', () => {
  let unsubscribe: (() => void) | undefined

  beforeEach(() => {
    // why: store is module-scoped and shared across tests; reset deliberately.
    useSource.setState({ ...DEFAULT_INPUTS, _hydrated: false })
    document.head.innerHTML = ''
  })

  afterEach(() => {
    unsubscribe?.()
    unsubscribe = undefined
  })

  it('writes no token declarations pre-hydration', () => {
    unsubscribe = applyDom()
    // why: scaffold (four empty rules) IS written so we can capture stable
    // CSSStyleRule references; pre-hydration the rules have zero declarations.
    // Asserting token count = 0 instead of textContent='' captures the actual
    // contract (no live values applied) without false-positive on the scaffold.
    expect(tokenCount()).toBe(0)
  })

  it('writes all four scope blocks after hydration', () => {
    useSource.setState({ _hydrated: true })
    unsubscribe = applyDom()
    const written = readTokensFromStyle()

    expect(Object.keys(written.md.light).length).toBeGreaterThan(0)
    expect(Object.keys(written.md.dark).length).toBeGreaterThan(0)
    expect(Object.keys(written.shadcn.light).length).toBeGreaterThan(0)
    expect(Object.keys(written.shadcn.dark).length).toBeGreaterThan(0)
    expect(written.md.light['--color-primary']).toBeDefined()
    expect(written.shadcn.light['--primary']).toBeDefined()
  })

  it('uses a single style element across updates', () => {
    useSource.setState({ _hydrated: true })
    unsubscribe = applyDom()
    useSource.getState().actions.setSeedHex('#ff0000')
    useSource.getState().actions.setSeedHex('#00ff00')

    const styles = document.head.querySelectorAll(`style#${STYLE_ID}`)
    expect(styles).toHaveLength(1)
  })

  it('updates token values when source changes', () => {
    useSource.setState({ _hydrated: true, seedHex: '#6750a4' })
    unsubscribe = applyDom()
    const before = readTokensFromStyle().md.light['--color-primary']

    useSource.getState().actions.setSeedHex('#ff0000')
    const after = readTokensFromStyle().md.light['--color-primary']

    expect(before).toBeDefined()
    expect(after).toBeDefined()
    expect(after).not.toBe(before)
  })

  it('unsubscribe stops further DOM writes', () => {
    useSource.setState({ _hydrated: true })
    unsubscribe = applyDom()
    const before = readTokensFromStyle().md.light['--color-primary']

    unsubscribe()
    unsubscribe = undefined
    useSource.getState().actions.setSeedHex('#ff0000')
    const after = readTokensFromStyle().md.light['--color-primary']

    expect(after).toBe(before)
  })

  // why: per-token writes only touch CHANGED properties. Pin this so a
  // future regression to "rewrite everything" loses the perf win silently —
  // the test would still pass on data, but this assertion catches the
  // implementation drift. Issue #9.
  it('removeProperty fires when a token disappears (customColor removed)', () => {
    const success = {
      id: 'id-success',
      name: 'Success',
      hex: '#22c55e',
      blend: false,
      shadcnSource: 'color' as const,
    }
    useSource.setState({ _hydrated: true, customColors: [success] })
    unsubscribe = applyDom()
    expect(readTokensFromStyle().md.light['--color-success']).toBeDefined()

    useSource.getState().actions.removeCustomColor('id-success')
    expect(readTokensFromStyle().md.light['--color-success']).toBeUndefined()
  })

  // why: drift-guard at the spine seam — applyDom's effective tokens must
  // equal deriveTheme(source) output for ANY source, not just DEFAULT_INPUTS.
  // The www-side globals-drift test only covers DEFAULT_INPUTS; this closes
  // the gap. Anything that recomputes inside applyDom or deriveTheme without
  // the other following will fail one of these cases. ADR-0017 +
  // ADR-0017 amendment 2026-05-06 (data-level pinning).
  describe('preview === export round-trip', () => {
    const cases: Array<{ name: string; source: PortableTheme }> = [
      { name: 'default inputs', source: DEFAULT_INPUTS },
      { name: 'red seed', source: { ...DEFAULT_INPUTS, seedHex: '#ff0000' } },
      { name: 'tonalSpot variant', source: { ...DEFAULT_INPUTS, variant: 'tonalSpot' } },
      {
        name: 'override applied',
        source: {
          ...DEFAULT_INPUTS,
          md3TokenOverrides: {
            light: { '--color-primary-container': '#abcdef' },
            dark: { '--color-primary-container': '#123456' },
          },
        },
      },
      {
        name: 'rebound shadcn primary',
        source: {
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
        },
      },
      {
        name: 'tint treatment',
        source: {
          ...DEFAULT_INPUTS,
          surfaceAlgo: 'tint',
          surfaceTintLevel: { light: 0.5, dark: 0.5 },
        },
      },
      {
        name: 'tint with non-default palette',
        source: {
          ...DEFAULT_INPUTS,
          surfaceAlgo: 'tint',
          surfaceTintLevel: { light: 0.5, dark: 0.5 },
          surfacePaletteName: 'slate',
        },
      },
      {
        name: 'tint with per-mode divergence',
        source: {
          ...DEFAULT_INPUTS,
          surfaceAlgo: 'tint',
          surfaceTintLevel: { light: 0.8, dark: 0.2 },
        },
      },
      {
        name: 'desaturate treatment',
        source: {
          ...DEFAULT_INPUTS,
          surfaceAlgo: 'desaturate',
          surfaceDesaturateLevel: { light: 0.7, dark: 0.7 },
        },
      },
      {
        name: 'desaturate with per-mode divergence',
        source: {
          ...DEFAULT_INPUTS,
          surfaceAlgo: 'desaturate',
          surfaceDesaturateLevel: { light: 0, dark: 1 },
        },
      },
      {
        name: 'tint + shadcn bound to surface',
        source: {
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
        },
      },
      {
        name: 'contrast level high',
        source: { ...DEFAULT_INPUTS, contrastLevel: 0.5 },
      },
      {
        // why: seedHexLock is a source-input gate, not a derived-side flag —
        // it must NOT change the rendered output. Pairing it with a non-default
        // seedHex confirms the seed is what drives derive while the lock just
        // governs future writes. Pinning this round-trip prevents anyone from
        // accidentally threading seedHexLock into derive in the future.
        name: 'seedHexLock with non-default seed',
        source: { ...DEFAULT_INPUTS, seedHex: '#ff5500', seedHexLock: true },
      },
      {
        name: 'customColors with shadcnSource=color',
        source: {
          ...DEFAULT_INPUTS,
          customColors: [
            {
              id: 'id-success',
              name: 'Success',
              hex: '#22c55e',
              blend: false,
              shadcnSource: 'color',
            },
          ],
        },
      },
      {
        name: 'customColors with shadcnSource=container + blend',
        source: {
          ...DEFAULT_INPUTS,
          customColors: [
            {
              id: 'id-warning',
              name: 'Warning',
              hex: '#f59e0b',
              blend: true,
              shadcnSource: 'container',
            },
          ],
        },
      },
    ]

    for (const { name, source } of cases) {
      it(`applyDom matches deriveTheme(...) for ${name}`, () => {
        useSource.setState({ ...source, _hydrated: true })
        unsubscribe = applyDom()
        const written = readTokensFromStyle()
        const expected = projectTheme(deriveTheme(source))
        expect(written.md.light).toEqual(expected.md.light)
        expect(written.md.dark).toEqual(expected.md.dark)
        expect(written.shadcn.light).toEqual(expected.shadcn.light)
        expect(written.shadcn.dark).toEqual(expected.shadcn.dark)
      })
    }

    it('selectPortable(state) is the same input applyDom feeds derive', () => {
      // why: the projection helper IS the contract — if selectPortable diverges
      // from PortableTheme shape, applyDom and useResolvedTokens diverge with
      // it. This test pins the shape match without coupling to specific keys.
      useSource.setState({ ...DEFAULT_INPUTS, _hydrated: true, seedHex: '#abc123' })
      unsubscribe = applyDom()
      const written = readTokensFromStyle()
      const projected = selectPortable(useSource.getState())
      const expected = projectTheme(deriveTheme(projected))
      expect(written.md.light).toEqual(expected.md.light)
      expect(written.md.dark).toEqual(expected.md.dark)
      expect(written.shadcn.light).toEqual(expected.shadcn.light)
      expect(written.shadcn.dark).toEqual(expected.shadcn.dark)
    })
  })
})

// @vitest-environment jsdom
import { deriveTheme, hctFromHex, type TokenMap } from '@tonex/core'
import { oklchString } from '@tonex/core/oklch'
import {
  DEFAULT_INPUTS,
  DEFAULT_SHADCN_ROLE_BINDINGS,
  type PortableTheme,
} from '@tonex/core/schema'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { applyDom } from './applyDom'
import { selectPortable, useSource } from './source'

const withSeed = (hex: string) => ({
  ...DEFAULT_INPUTS,
  seed: { ...hctFromHex(hex), exactHex: hex },
})

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

// why: DOM holds md core + extended + chart merged (ADR-0021 c.4, amended
// 2026-05-29 — extended is DOM-emitted so showcase demos get live extended
// tokens). Palette stays data-only and is omitted here; shadcn has no extended
// analog. A regression that drops extended from applyDom — or starts emitting
// palette — surfaces here as a key mismatch.
function projectTheme(theme: ReturnType<typeof deriveTheme>): {
  md: ProjectedLayer
  shadcn: ProjectedLayer
} {
  return {
    md: {
      light: projectLayer({
        ...theme.md.light,
        ...theme.md.lightExtended,
        ...theme.md.lightChart,
      }),
      dark: projectLayer({
        ...theme.md.dark,
        ...theme.md.darkExtended,
        ...theme.md.darkChart,
      }),
    },
    shadcn: {
      // why: brand is mode-invariant (one map) and previewable in the live DOM,
      // so it merges into BOTH .shadcn blocks — same pattern as chart, which
      // applyDom always emits even though export gates it.
      light: projectLayer({
        ...theme.shadcn.light,
        ...theme.shadcn.lightChart,
        ...theme.shadcn.brand,
      }),
      dark: projectLayer({
        ...theme.shadcn.dark,
        ...theme.shadcn.darkChart,
        ...theme.shadcn.brand,
      }),
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

  it('emits the brand pair into both .shadcn blocks, mode-invariant', () => {
    // why: brand must be previewable in the editor (a brand button resolves
    // bg-brand) — so applyDom writes it to the live DOM in both modes with the
    // same value, even though export keeps it opt-in.
    useSource.setState({ _hydrated: true })
    unsubscribe = applyDom()
    const written = readTokensFromStyle()

    expect(written.shadcn.light['--brand']).toBeDefined()
    expect(written.shadcn.light['--brand-foreground']).toBeDefined()
    expect(written.shadcn.dark['--brand']).toBe(written.shadcn.light['--brand'])
    expect(written.shadcn.dark['--brand-foreground']).toBe(
      written.shadcn.light['--brand-foreground'],
    )
  })

  // why: remount must reuse the existing scaffold instead of rewriting
  // textContent — a textContent write reparses the sheet and replaces the
  // CSSStyleRule instances, breaking the per-token setProperty hot path
  // (ADR-0017 amendment 2026-05-06 / issue #9). Identity check on a captured
  // rule reference is the cleanest proof: same object after remount means
  // no reparse happened.
  it('remount reuses existing scaffold (no textContent rewrite)', () => {
    useSource.setState({ _hydrated: true })
    unsubscribe = applyDom()

    const el = document.getElementById(STYLE_ID)
    if (!(el instanceof HTMLStyleElement)) throw new Error('expected style element')
    const sheet = el.sheet
    if (sheet === null) throw new Error('style element has no sheet')

    let firstMdRule: CSSStyleRule | undefined
    for (let i = 0; i < sheet.cssRules.length; i++) {
      const r = sheet.cssRules[i]
      if (r instanceof CSSStyleRule && r.selectorText === '.md') {
        firstMdRule = r
        break
      }
    }
    if (firstMdRule === undefined) throw new Error('expected .md rule on first mount')

    unsubscribe()
    unsubscribe = applyDom()

    let secondMdRule: CSSStyleRule | undefined
    for (let i = 0; i < sheet.cssRules.length; i++) {
      const r = sheet.cssRules[i]
      if (r instanceof CSSStyleRule && r.selectorText === '.md') {
        secondMdRule = r
        break
      }
    }
    expect(secondMdRule).toBe(firstMdRule)
  })

  // why: if the scaffold is corrupted (hot-reload surfacing stale text, or any
  // external mutation), ensureStyleElement must rebuild it. Pin the partial-
  // scaffold path so the reuse fast-path can never silently swallow a missing
  // selector.
  it('partial scaffold triggers rebuild', () => {
    useSource.setState({ _hydrated: true })
    unsubscribe = applyDom()
    unsubscribe()
    unsubscribe = undefined

    const el = document.getElementById(STYLE_ID)
    if (!(el instanceof HTMLStyleElement)) throw new Error('expected style element')
    el.textContent = '.md {}'

    unsubscribe = applyDom()

    const sheet = el.sheet
    if (sheet === null) throw new Error('style element has no sheet')
    const present = new Set<string>()
    for (let i = 0; i < sheet.cssRules.length; i++) {
      const r = sheet.cssRules[i]
      if (r instanceof CSSStyleRule) present.add(r.selectorText)
    }
    expect(present.has('.md')).toBe(true)
    expect(present.has('html.dark .md')).toBe(true)
    expect(present.has('.shadcn')).toBe(true)
    expect(present.has('html.dark .shadcn')).toBe(true)
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
    useSource.setState({ _hydrated: true, seed: { ...hctFromHex('#6750a4'), exactHex: '#6750a4' } })
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

  // why: in steady-state slider drags the token set is stable — only argb
  // values change. The deletion walk over `Object.keys(last)` per scope per
  // tick is wasted work; applyDiff short-circuits when key counts prove no
  // key disappeared. Pin: removeProperty must not fire across N stable ticks.
  // Issue #25.
  it('does not call removeProperty during steady-state value-only updates', () => {
    useSource.setState({ _hydrated: true, seed: { ...hctFromHex('#6750a4'), exactHex: '#6750a4' } })
    unsubscribe = applyDom()

    const el = document.getElementById(STYLE_ID)
    if (!(el instanceof HTMLStyleElement)) throw new Error('expected style element')
    const sheet = el.sheet
    if (sheet === null) throw new Error('style element has no sheet')

    let removeCalls = 0
    for (let i = 0; i < sheet.cssRules.length; i++) {
      const r = sheet.cssRules[i]
      if (!(r instanceof CSSStyleRule)) continue
      const original = r.style.removeProperty.bind(r.style)
      r.style.removeProperty = (name: string) => {
        removeCalls += 1
        return original(name)
      }
    }

    // why: drive 60 slider-style ticks where only the seed (and thus argb
    // values) shifts — the key set is stable across the whole sweep.
    for (let i = 0; i < 60; i++) {
      const v = (i * 4).toString(16).padStart(2, '0')
      useSource.getState().actions.setSeedHex(`#${v}50a4`)
    }

    expect(removeCalls).toBe(0)
  })

  // why: paired with the steady-state pin — when the key set actually shrinks
  // (custom-color removal), the deletion walk must still run. Pins that the
  // key-count shortcut never swallows real removals. Issue #25.
  it('still calls removeProperty when a custom color is removed', () => {
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

    const el = document.getElementById(STYLE_ID)
    if (!(el instanceof HTMLStyleElement)) throw new Error('expected style element')
    const sheet = el.sheet
    if (sheet === null) throw new Error('style element has no sheet')

    const removedNames: string[] = []
    for (let i = 0; i < sheet.cssRules.length; i++) {
      const r = sheet.cssRules[i]
      if (!(r instanceof CSSStyleRule)) continue
      const original = r.style.removeProperty.bind(r.style)
      r.style.removeProperty = (name: string) => {
        removedNames.push(name)
        return original(name)
      }
    }

    useSource.getState().actions.removeCustomColor('id-success')

    expect(removedNames).toContain('--color-success')
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
      { name: 'red seed', source: withSeed('#ff0000') },
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
        source: { ...DEFAULT_INPUTS, contrastLevel: { light: 0.5, dark: 0.5 } },
      },
      {
        // why: seedHexLock is a source-input gate, not a derived-side flag — it
        // must NOT change the rendered output. This case pins applyDom↔derive
        // consistency for a locked, non-default source (the seed drives derive;
        // the lock only governs future writes). It does NOT by itself catch the
        // lock leaking into derive — applyDom and deriveTheme both read the
        // source, so a leak would shift both sides together and still match.
        // That invariant lives in derive.test.ts ('input-only fields never reach
        // derive'); this case complements it on the DOM seam.
        name: 'seedHexLock with non-default seed',
        source: { ...withSeed('#ff5500'), seedHexLock: true },
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
      useSource.setState({ ...withSeed('#abc123'), _hydrated: true })
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

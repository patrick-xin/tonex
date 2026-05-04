// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { applyDom } from './applyDom'
import { deriveTheme } from './derive'
import { formatCss } from './format'
import { DEFAULT_INPUTS, type PortableTheme } from './schema'
import { selectPortable, useSource } from './source'

const STYLE_ID = 'tonex-tokens'

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

  it('writes nothing pre-hydration', () => {
    unsubscribe = applyDom()
    const css = document.getElementById(STYLE_ID)?.textContent ?? ''
    expect(css).toBe('')
  })

  it('writes all four scope blocks after hydration', () => {
    useSource.setState({ _hydrated: true })
    unsubscribe = applyDom()
    const css = document.getElementById(STYLE_ID)?.textContent ?? ''

    expect(css).toMatch(/^\.md\s*\{/m)
    expect(css).toMatch(/^html\.dark \.md\s*\{/m)
    expect(css).toMatch(/^\.shadcn\s*\{/m)
    expect(css).toMatch(/^html\.dark \.shadcn\s*\{/m)

    expect(css).toContain('--color-primary:')
    expect(css).toContain('--primary:')
  })

  it('uses a single style element, replacing textContent on update', () => {
    useSource.setState({ _hydrated: true })
    unsubscribe = applyDom()
    useSource.getState().setSeedHex('#ff0000')
    useSource.getState().setSeedHex('#00ff00')

    const styles = document.head.querySelectorAll(`style#${STYLE_ID}`)
    expect(styles).toHaveLength(1)
  })

  it('updates when source changes', () => {
    useSource.setState({ _hydrated: true, seedHex: '#6750a4' })
    unsubscribe = applyDom()
    const before = document.getElementById(STYLE_ID)?.textContent

    useSource.getState().setSeedHex('#ff0000')
    const after = document.getElementById(STYLE_ID)?.textContent

    expect(after).not.toBe(before)
  })

  it('unsubscribe stops further DOM writes', () => {
    useSource.setState({ _hydrated: true })
    unsubscribe = applyDom()
    const before = document.getElementById(STYLE_ID)?.textContent

    unsubscribe()
    unsubscribe = undefined
    useSource.getState().setSeedHex('#ff0000')
    const after = document.getElementById(STYLE_ID)?.textContent

    expect(after).toBe(before)
  })

  // why: drift-guard at the spine seam — applyDom and the export path
  // (formatCss(deriveTheme(...))) must produce identical text for ANY source
  // state, not just DEFAULT_INPUTS. The www-side globals-drift test only
  // covers DEFAULT_INPUTS; this closes the gap for arbitrary mutations.
  // Anything that recomputes inside applyDom or formatCss without the other
  // following will fail one of these cases. ADR-0017.
  describe('preview === export round-trip', () => {
    const cases: Array<{ name: string; source: PortableTheme }> = [
      { name: 'default inputs', source: DEFAULT_INPUTS },
      { name: 'red seed', source: { ...DEFAULT_INPUTS, seedHex: '#ff0000' } },
      { name: 'tonalSpot variant', source: { ...DEFAULT_INPUTS, variant: 'tonalSpot' } },
      {
        name: 'override applied',
        source: {
          ...DEFAULT_INPUTS,
          md3PrimaryContainerOverride: { light: '#abcdef', dark: '#123456' },
        },
      },
      {
        name: 'rebound shadcn primary',
        source: {
          ...DEFAULT_INPUTS,
          shadcnRoleBindings: {
            light: { '--primary': '--color-primary', '--primary-foreground': '--color-on-primary' },
            dark: { '--primary': '--color-primary', '--primary-foreground': '--color-on-primary' },
          },
        },
      },
    ]

    for (const { name, source } of cases) {
      it(`applyDom matches formatCss(deriveTheme(...)) for ${name}`, () => {
        useSource.setState({ ...source, _hydrated: true })
        unsubscribe = applyDom()
        const written = document.getElementById(STYLE_ID)?.textContent ?? ''
        const expected = formatCss(deriveTheme(source))
        expect(written).toBe(expected)
      })
    }

    it('selectPortable(state) is the same input applyDom feeds derive', () => {
      // why: the projection helper IS the contract — if selectPortable diverges
      // from PortableTheme shape, applyDom and useResolvedTokens diverge with
      // it. This test pins the shape match without coupling to specific keys.
      useSource.setState({ ...DEFAULT_INPUTS, _hydrated: true, seedHex: '#abc123' })
      unsubscribe = applyDom()
      const written = document.getElementById(STYLE_ID)?.textContent ?? ''
      const projected = selectPortable(useSource.getState())
      expect(written).toBe(formatCss(deriveTheme(projected)))
    })
  })
})

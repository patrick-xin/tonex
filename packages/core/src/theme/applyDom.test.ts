// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { applyDom } from './applyDom'
import { DEFAULT_INPUTS } from './schema'
import { useSource } from './source'

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
})

import { describe, expect, it } from 'vitest'
import { getHighlighter, HIGHLIGHT_LANGS, highlightCode } from './index'

describe('highlightCode', () => {
  it('emits dual-theme Shiki markup with per-mode CSS variables', async () => {
    const html = await highlightCode('a { color: red }', 'css')
    // Shiki's dual-theme output carries both modes as CSS variables so a single
    // render serves light and dark — toggled by `.dark` on <html> (next-themes).
    expect(html).toContain('<pre')
    expect(html).toContain('shiki')
    expect(html).toContain('--shiki-light')
    expect(html).toContain('--shiki-dark')
    // token text must survive tokenization, not just the markup
    expect(html).toContain('color')
  })

  it('highlights every language the export tabs emit', async () => {
    for (const lang of HIGHLIGHT_LANGS) {
      const html = await highlightCode('x', lang)
      expect(html).toContain('<pre')
    }
  })

  it('reuses one highlighter instance across calls (module-level singleton)', async () => {
    const [a, b] = await Promise.all([getHighlighter(), getHighlighter()])
    expect(a).toBe(b)
  })
})

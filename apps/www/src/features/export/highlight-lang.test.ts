import { describe, expect, it } from 'vitest'
import { tabToHighlightLang } from './highlight-lang'

describe('tabToHighlightLang', () => {
  it('maps the three CSS-shaped tabs to css', () => {
    expect(tabToHighlightLang('Tailwind')).toBe('css')
    expect(tabToHighlightLang('CSS')).toBe('css')
    expect(tabToHighlightLang('shadcn')).toBe('css')
  })

  it('maps data-format tabs to their grammars', () => {
    expect(tabToHighlightLang('JSON')).toBe('json')
    expect(tabToHighlightLang('Dart')).toBe('dart')
  })

  // the load-bearing case: Design.md's body is a `colors:` map, so it reads as
  // YAML, not Markdown.
  it('maps Design.md to yaml', () => {
    expect(tabToHighlightLang('DESIGN.md')).toBe('yaml')
  })
})

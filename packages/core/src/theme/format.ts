import type { DerivedTheme, TokenMap } from './derive'

function formatBlock(selector: string, tokens: TokenMap): string {
  const decls = Object.entries(tokens)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n')
  return `${selector} {\n${decls}\n}`
}

// why: the same formatter is used by applyDom (runtime <style> element) and
// the globals.css bake script (first-paint defaults). One implementation is
// the only way preview === export holds. The drift-guard test relies on
// this. ADR-0017.
//
// Block order: md light, md dark, shadcn light, shadcn dark. Stable because
// `Object.entries` preserves insertion order for string keys; deriveTheme
// builds tokens in a deterministic order.
export function formatCss(theme: DerivedTheme): string {
  return [
    formatBlock('.md', theme.md.light),
    formatBlock('html.dark .md', theme.md.dark),
    formatBlock('.shadcn', theme.shadcn.light),
    formatBlock('html.dark .shadcn', theme.shadcn.dark),
  ].join('\n\n')
}

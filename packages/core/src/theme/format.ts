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
  return [formatLayer(theme, 'md'), formatLayer(theme, 'shadcn')].join('\n\n')
}

// why: layer-scoped formatter. The slice-2 verification UI renders md and
// shadcn export blocks side-by-side; both consume the same DerivedTheme so
// the visible code mirrors what applyDom writes to the live <style>. If the
// rendered swatch and this code disagree on a value, that is exactly the
// drift mode ADR-0017 exists to surface.
export function formatLayer(theme: DerivedTheme, layer: 'md' | 'shadcn'): string {
  return [
    formatBlock(`.${layer}`, theme[layer].light),
    formatBlock(`html.dark .${layer}`, theme[layer].dark),
  ].join('\n\n')
}

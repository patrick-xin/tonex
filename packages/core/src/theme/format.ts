import type { DerivedTheme, TokenMap } from './derive'
import { oklchString } from './oklch'
import { MD_TOKEN_NAMES } from './schema'

function formatBlock(selector: string, tokens: TokenMap): string {
  const decls = Object.entries(tokens)
    .map(([name, argb]) => `  ${name}: ${oklchString(argb)};`)
    .join('\n')
  return `${selector} {\n${decls}\n}`
}

// why: ADR-0021 collapses format.ts to a thin convenience wrapper for the
// bake. Production paste-ready emission goes through `exportCss(bundle,
// layer, options)`; formatCss exists so `pnpm bake` can build globals.css
// from `deriveTheme(DEFAULT_INPUTS)` without constructing a single-tier
// bundle each time. Output stays byte-identical to today's globals.css
// (drift-guard constraint).
//
// Argb-canonical per ADR-0021 — TokenMap holds argb numbers; this file
// projects to oklch at stringification time.
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
//
// md emission merges core + extended in source order (matches today's
// globals.css). Custom-color slugs land at the tail of `light`/`dark` per
// deriveTheme's spread order. shadcn has no extended tier; light/dark only.
export function formatLayer(theme: DerivedTheme, layer: 'md' | 'shadcn'): string {
  if (layer === 'md') {
    return [
      formatBlock('.md', mergeMdEmission(theme.md.light, theme.md.lightExtended)),
      formatBlock('html.dark .md', mergeMdEmission(theme.md.dark, theme.md.darkExtended)),
    ].join('\n\n')
  }
  return [
    formatBlock('.shadcn', theme.shadcn.light),
    formatBlock('html.dark .shadcn', theme.shadcn.dark),
  ].join('\n\n')
}

// why: emission order must match the baked globals.css (drift-guard
// constraint). deriveTheme's `light` field iterates MD_TOKEN_NAMES in
// family-grouped order while skipping extended; merging extended back in via
// spread gives core-then-extended order, which differs from today's
// interleaved order. To preserve byte-identical bytes, re-key the emission
// against MD_TOKEN_NAMES so output matches today's family-grouped layout.
function mergeMdEmission(core: TokenMap, extended: TokenMap): TokenMap {
  const out: TokenMap = {}
  for (const name of MD_TOKEN_NAMES) {
    const argb = core[name] ?? extended[name]
    if (argb !== undefined) out[name] = argb
  }
  // why: custom-color slugs are NOT in MD_TOKEN_NAMES; append them in
  // insertion order (matches today's emission, which appends customs after
  // the static set).
  for (const [name, argb] of Object.entries(core)) {
    if (!(name in out)) out[name] = argb
  }
  return out
}

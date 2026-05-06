import type { DerivedTheme, TokenMap } from '../derive'
import { SHADCN_ROLE_NAMES } from '../schema'

// why: paste-ready CSS for downstream consumers. Two shapes by audience:
//  - 'md': full Tailwind v4 globals.css (boilerplate header + @theme inline +
//    :root + .dark) — md users adopt our token namespace wholesale.
//  - 'shadcn': :root + .dark only; the user's shadcn project already owns
//    the @import / @custom-variant / shadcn @theme inline. We extend
//    @theme inline only for custom-color slugs the user defined here, since
//    shadcn-cli wouldn't have generated bridges for them.
//
// ADR-0017: this file is a sink — it stringifies what deriveTheme returned
// and never recomputes a color, role mapping, or numeric format. If a value
// looks wrong, the bug is upstream in derive.ts, not here.

export type ExportLayer = 'md' | 'shadcn'

const SHADCN_ROLE_SET: ReadonlySet<string> = new Set(SHADCN_ROLE_NAMES)

function block(selector: string, tokens: TokenMap): string {
  const decls = Object.entries(tokens)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n')
  return `${selector} {\n${decls}\n}`
}

function themeInlineBlock(utilityNames: string[], sourceFor: (name: string) => string): string {
  const decls = utilityNames.map((u) => `  ${u}: var(${sourceFor(u)});`).join('\n')
  return `@theme inline {\n${decls}\n}`
}

export function exportCss(theme: DerivedTheme, layer: ExportLayer): string {
  if (layer === 'md') {
    const tokens = Object.keys(theme.md.light)
    return [
      '@import "tailwindcss";',
      '',
      '@custom-variant dark (&:is(.dark *));',
      '',
      themeInlineBlock(tokens, (t) => t),
      '',
      block(':root', theme.md.light),
      '',
      block('.dark', theme.md.dark),
      '',
    ].join('\n')
  }

  // shadcn: any key outside the closed SHADCN_ROLE_NAMES set is a
  // custom-color slug pair (--{slug}, --{slug}-foreground) the user added.
  const customSlugTokens = Object.keys(theme.shadcn.light).filter((k) => !SHADCN_ROLE_SET.has(k))
  const parts = [block(':root', theme.shadcn.light), '', block('.dark', theme.shadcn.dark)]
  if (customSlugTokens.length > 0) {
    // why: shadcn keys are `--{slug}` / `--{slug}-foreground`; the matching
    // Tailwind v4 utility name is `--color-{slug}`. Drop the leading `--`
    // and prepend `--color-` to bridge between the two namespaces.
    parts.push(
      '',
      themeInlineBlock(
        customSlugTokens.map((t) => `--color-${t.slice(2)}`),
        (u) => `--${u.slice('--color-'.length)}`,
      ),
    )
  }
  return `${parts.join('\n')}\n`
}

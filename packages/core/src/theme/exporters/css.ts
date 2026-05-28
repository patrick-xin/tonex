import type { DerivedTheme, TokenMap } from '../derive'
import { hexString, oklchString } from '../oklch'
import { SHADCN_ROLE_NAMES } from '../schema'
import type { ContrastBundle, ExportOptions } from './bundle'
import { mergeMdEmission } from './format'

// why: paste-ready CSS for downstream consumers. Two shapes by audience:
//  - 'md': full Tailwind v4 globals.css (boilerplate header + @theme inline +
//    :root + .dark) — md users adopt our token namespace wholesale. Selectors
//    are root-level so the file drops into the consumer project with no
//    `class="md"` wrapper required. Editor-app internal globals.css (via
//    `formatCss` / `pnpm bake`) keeps `.md` / `html.dark .md` because it
//    coexists with `.shadcn` in the same document — `exportCss` is for
//    downstream users and that constraint doesn't apply.
//  - 'shadcn': :root + .dark, paste-ready. The shadcn audience replaces
//    the role blocks shadcn-cli scaffolded; root selectors are the drop-in
//    target. `includeHeader` (off by default) prepends the Tailwind v4
//    incantation for green-field projects without existing globals.css.
//    Contrast tiers are not emitted on this path — shadcn users don't
//    consume the contrast axis.
//
// ADR-0017: this file is a sink — it stringifies what deriveTheme returned
// and never recomputes a color, role mapping, or numeric format. If a value
// looks wrong, the bug is upstream in derive.ts, not here.
//
// Argb-canonical per ADR-0021 — TokenMap holds argb numbers; projection to
// oklch / hex happens here at stringification time. The PRD's commitment 1
// deliberately moves projection out of derive and into this seam so a future
// colorspace lands as a one-helper change.
//
// Bundle-shaped per ADR-0021 commitment 5 — single-contrast wraps the theme
// as `{ default: theme }`; multi-contrast bundles add `medium`/`high` tiers
// that emit as class-scoped `.contrast-medium` / `.contrast-high` rule
// blocks (composed with `.dark` for the dark axis). Iteration is bundle-
// driven so emission auto-includes any tier the bundle carries.
//
// ExportOptions filters are wired here. Defaults reflect the lean dialog
// output (extended/palette/chart all off, oklch). Filter combinations are
// applied per rule block before stringification — toggling a flag in the
// dialog produces exact byte-equal output to what the user pastes.

export type ExportLayer = 'md' | 'shadcn'

const SHADCN_ROLE_SET: ReadonlySet<string> = new Set(SHADCN_ROLE_NAMES)

// why: md export uses paste-ready root selectors. Default tier is `:root` /
// `.dark`; contrast tiers stack class-wise on the dark axis so the tier
// class can land on any container (`.contrast-medium` on its own; the
// `.dark.contrast-medium` form for dark-mode rows). `@custom-variant dark
// (&:is(.dark *))` in the boilerplate keeps the dark cascade working under
// any of these selectors.
const MD_SELECTOR = {
  default: { light: ':root', dark: '.dark' },
  medium: { light: '.contrast-medium', dark: '.dark.contrast-medium' },
  high: { light: '.contrast-high', dark: '.dark.contrast-high' },
} as const

// why: shadcn export now uses paste-ready root selectors (`:root` / `.dark`)
// — the shadcn audience pastes our output to REPLACE shadcn-cli's role
// blocks, not extend them. Drop-in shape matches what shadcn-cli generates
// so users can swap with no scope class. Contrast tiers are intentionally
// omitted from shadcn (see exportCss); shadcn users don't consume the
// contrast axis.
const SHADCN_SELECTOR = {
  light: ':root',
  dark: '.dark',
} as const

type ContrastTier = keyof typeof MD_SELECTOR

// why: colorspace projection at the seam (ADR-0021 commitment 1). Adding a
// third colorspace later (lab, p3) is one branch here plus one helper in
// oklch.ts.
function projectArgb(argb: number, fmt: 'oklch' | 'hex'): string {
  return fmt === 'hex' ? hexString(argb) : oklchString(argb)
}

function block(selector: string, tokens: TokenMap, fmt: 'oklch' | 'hex'): string {
  const decls = Object.entries(tokens)
    .map(([name, argb]) => `  ${name}: ${projectArgb(argb, fmt)};`)
    .join('\n')
  return `${selector} {\n${decls}\n}`
}

function themeInlineBlock(utilityNames: string[], sourceFor: (name: string) => string): string {
  const decls = utilityNames.map((u) => `  ${u}: var(${sourceFor(u)});`).join('\n')
  return `@theme inline {\n${decls}\n}`
}

// why: enumerate tiers present in the bundle in canonical order. Default
// always present; medium/high optional. exportCss emits each tier as a
// `(light, dark)` pair under the corresponding contrast-class prefix.
function tiersOf(bundle: ContrastBundle): Array<[ContrastTier, DerivedTheme]> {
  const out: Array<[ContrastTier, DerivedTheme]> = [['default', bundle.default]]
  if (bundle.medium !== undefined) out.push(['medium', bundle.medium])
  if (bundle.high !== undefined) out.push(['high', bundle.high])
  return out
}

interface ResolvedOptions {
  colorFormat: 'oklch' | 'hex'
  includeExtended: boolean
  includePalette: boolean
  includeChart: boolean
  includeBrand: boolean
  includeHeader: boolean
}

function resolveOptions(options: ExportOptions): ResolvedOptions {
  return {
    colorFormat: options.colorFormat ?? 'oklch',
    includeExtended: options.includeExtended ?? false,
    includePalette: options.includePalette ?? false,
    includeChart: options.includeChart ?? false,
    includeBrand: options.includeBrand ?? false,
    includeHeader: options.includeHeader ?? false,
  }
}

// why: build the per-tier md token map honoring all filter flags. Palette
// is layered in only when requested AND only on the default-tier light
// rule (mode/contrast-invariant — ADR-0021 commitment 5 says palette
// declares once); other (mode, tier) pairs skip it.
function buildMdRuleTokens(
  theme: DerivedTheme,
  mode: 'light' | 'dark',
  tier: ContrastTier,
  opts: ResolvedOptions,
): TokenMap {
  const core = mode === 'light' ? theme.md.light : theme.md.dark
  const extended = mode === 'light' ? theme.md.lightExtended : theme.md.darkExtended
  const chart = mode === 'light' ? theme.md.lightChart : theme.md.darkChart
  const merged = mergeMdEmission(core, opts.includeExtended ? extended : null)
  if (opts.includeChart) Object.assign(merged, chart)
  if (opts.includePalette && mode === 'light' && tier === 'default') {
    Object.assign(merged, theme.md.palette)
  }
  return merged
}

function buildShadcnRuleTokens(
  theme: DerivedTheme,
  mode: 'light' | 'dark',
  opts: ResolvedOptions,
): TokenMap {
  const core = mode === 'light' ? theme.shadcn.light : theme.shadcn.dark
  if (!opts.includeChart && !opts.includeBrand) return core
  const out: TokenMap = { ...core }
  if (opts.includeChart) {
    Object.assign(out, mode === 'light' ? theme.shadcn.lightChart : theme.shadcn.darkChart)
  }
  if (opts.includeBrand) {
    // why: brand is mode-invariant (same map in both blocks). Merge only keys
    // the layer doesn't already carry, so a user's custom color named "brand"
    // (already emitting --brand via the custom path) wins over the injected pair
    // — no duplicate declaration.
    for (const [name, argb] of Object.entries(theme.shadcn.brand)) {
      if (!(name in core)) out[name] = argb
    }
  }
  return out
}

// why: @theme inline lists every Tailwind utility name. Toggling extended,
// chart, or palette extends the list — each flag adds its tokens both to
// the @theme block (registers the utility) and to the corresponding rule
// block (provides the value). Palette tokens (`--color-{family}-{tone}`)
// register here so `bg-primary-50` / `text-error-100` etc. resolve as
// Tailwind utilities; the value flows in via the mode/contrast-invariant
// :root declaration. Custom-color slugs always emit because they're brand
// surfaces, not opt-in ornament.
function mdUtilityNames(theme: DerivedTheme, opts: ResolvedOptions): string[] {
  const set = new Set<string>(Object.keys(theme.md.light))
  if (opts.includeExtended) for (const k of Object.keys(theme.md.lightExtended)) set.add(k)
  if (opts.includeChart) for (const k of Object.keys(theme.md.lightChart)) set.add(k)
  if (opts.includePalette) for (const k of Object.keys(theme.md.palette)) set.add(k)
  return Array.from(set)
}

export function exportCss(
  bundle: ContrastBundle,
  layer: ExportLayer,
  options: ExportOptions = {},
): string {
  const opts = resolveOptions(options)
  const tiers = tiersOf(bundle)

  if (layer === 'md') {
    const tokens = mdUtilityNames(bundle.default, opts)
    const lines: string[] = [
      '@import "tailwindcss";',
      '',
      '@custom-variant dark (&:is(.dark *));',
      '',
      themeInlineBlock(tokens, (t) => t),
      '',
    ]
    for (const [tier, theme] of tiers) {
      const lightTokens = buildMdRuleTokens(theme, 'light', tier, opts)
      const darkTokens = buildMdRuleTokens(theme, 'dark', tier, opts)
      lines.push(
        block(MD_SELECTOR[tier].light, lightTokens, opts.colorFormat),
        '',
        block(MD_SELECTOR[tier].dark, darkTokens, opts.colorFormat),
        '',
      )
    }
    return lines.join('\n')
  }

  // shadcn: paste-ready :root + .dark, no contrast tiers (shadcn audience
  // doesn't consume the contrast axis). Any key outside the closed
  // SHADCN_ROLE_NAMES set is a custom-color slug pair (--{slug},
  // --{slug}-foreground) the user added.
  const defaultTheme = bundle.default
  const customSlugTokens = Object.keys(defaultTheme.shadcn.light).filter(
    (k) => !SHADCN_ROLE_SET.has(k),
  )
  // why: the opt-in brand pair registers its Tailwind utilities the same way
  // custom slugs do (--brand → --color-brand). Append deduped so a custom color
  // already named "brand" isn't registered twice.
  if (opts.includeBrand) {
    for (const k of Object.keys(defaultTheme.shadcn.brand)) {
      if (!customSlugTokens.includes(k)) customSlugTokens.push(k)
    }
  }
  const parts: string[] = []
  if (opts.includeHeader) {
    parts.push('@import "tailwindcss";', '', '@custom-variant dark (&:is(.dark *));', '')
  }
  parts.push(
    block(
      SHADCN_SELECTOR.light,
      buildShadcnRuleTokens(defaultTheme, 'light', opts),
      opts.colorFormat,
    ),
    '',
    block(
      SHADCN_SELECTOR.dark,
      buildShadcnRuleTokens(defaultTheme, 'dark', opts),
      opts.colorFormat,
    ),
    '',
  )
  if (customSlugTokens.length > 0) {
    // why: shadcn keys are `--{slug}` / `--{slug}-foreground`; the matching
    // Tailwind v4 utility name is `--color-{slug}`. Drop the leading `--`
    // and prepend `--color-` to bridge between the two namespaces.
    parts.push(
      themeInlineBlock(
        customSlugTokens.map((t) => `--color-${t.slice(2)}`),
        (u) => `--${u.slice('--color-'.length)}`,
      ),
      '',
    )
  }
  return parts.join('\n')
}

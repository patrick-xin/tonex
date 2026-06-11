import type { DerivedTheme, TokenMap } from '../derive'
import type { Mode } from '../mode'
import { hexString, oklchString } from '../oklch'
import { MD_TOKEN_NAMES } from '../schema'
import type { ColorFormat, ContrastBundle, ExportOptions } from './bundle'
import { mergeMdEmission } from './format'

// why: framework-agnostic Material Design CSS — the artifact a non-Tailwind
// audience pastes. Distinct from exporters/css.ts (`md` layer) on three axes:
//   - Namespace: system tokens emit as `--md-sys-color-*` (the MD3 spec name
//     Material Web Components read), not our Tailwind-friendly `--color-*`.
//     Toggled by `mdSysPrefix`; only the closed MD_TOKEN_NAMES set is renamed,
//     so chart/palette/custom slugs (not spec tokens) stay `--color-*`.
//   - Dark axis: one `:root` block, every token a `light-dark(L, D)` pair.
//     `color-scheme: light dark` makes a no-framework page follow the OS for
//     free; the `.dark` / `[data-theme]` switches flip `color-scheme` for the
//     class- and attribute-toggle conventions, and any other stack forces a
//     mode by setting `color-scheme` itself. This halves block count vs the
//     duplicate-:root/.dark shape and needs no Tailwind boilerplate.
//   - No `@theme inline`: these are raw custom properties, not Tailwind
//     utilities.
//
// ADR-0017: this is a sink — it stringifies what deriveTheme returned and never
// recomputes a color. Projection to oklch/hex happens at this seam via the
// oklch.ts helpers (ADR-0021 commitment 1), same as css.ts.

const MD_TOKEN_SET: ReadonlySet<string> = new Set(MD_TOKEN_NAMES)

const CONTRAST_TIER_CLASS = {
  medium: '.contrast-medium',
  high: '.contrast-high',
} as const

function projectArgb(argb: number, fmt: 'oklch' | 'hex'): string {
  return fmt === 'hex' ? hexString(argb) : oklchString(argb)
}

// why: spec rename is a prefix swap on the closed system set. Custom slugs,
// chart, and palette are not MD3 system tokens, so they keep `--color-*`
// regardless of the toggle — `--md-sys-color-chart-1` would name a token the
// spec doesn't define.
function emitName(name: string, mdSysPrefix: boolean): string {
  if (mdSysPrefix && MD_TOKEN_SET.has(name)) {
    return `--md-sys-color-${name.slice('--color-'.length)}`
  }
  return name
}

interface ResolvedOptions {
  colorFormat: ColorFormat
  mdSysPrefix: boolean
  includeExtended: boolean
  includeChart: boolean
}

// why: native-CSS defaults diverge from css.ts — extended is ON because
// Material Web Components read `--md-sys-color-*-fixed` etc., and mdSysPrefix
// is ON because the spec namespace is the whole point of this format.
function resolveOptions(options: ExportOptions): ResolvedOptions {
  return {
    colorFormat: options.colorFormat ?? 'oklch',
    mdSysPrefix: options.mdSysPrefix ?? true,
    includeExtended: options.includeExtended ?? true,
    includeChart: options.includeChart ?? false,
  }
}

// why: the mode-aware token set for one tier — system core (+ extended) merged
// in canonical order, custom slugs appended (mergeMdEmission), chart optional.
// Palette is omitted here: it's mode/contrast-invariant, so a light-dark() pair
// would be `light-dark(x, x)` — handled separately as flat declarations.
function modeTokens(theme: DerivedTheme, mode: Mode, opts: ResolvedOptions): TokenMap {
  const core = mode === 'light' ? theme.md.light : theme.md.dark
  const extended = mode === 'light' ? theme.md.lightExtended : theme.md.darkExtended
  const merged = mergeMdEmission(core, opts.includeExtended ? extended : null)
  if (opts.includeChart) {
    Object.assign(merged, mode === 'light' ? theme.md.lightChart : theme.md.darkChart)
  }
  return merged
}

// why: light and dark share the same key set (same token list per tier), so
// iterate light's keys and pair each with dark's value. Emits one
// `name: light-dark(L, D);` line per token under the resolved namespace.
function tierDeclarations(theme: DerivedTheme, opts: ResolvedOptions): string[] {
  const light = modeTokens(theme, 'light', opts)
  const dark = modeTokens(theme, 'dark', opts)
  return Object.keys(light).map((name) => {
    const value = `light-dark(${projectArgb(light[name], opts.colorFormat)}, ${projectArgb(dark[name], opts.colorFormat)})`
    return `  ${emitName(name, opts.mdSysPrefix)}: ${value};`
  })
}

export function exportNativeCss(bundle: ContrastBundle, options: ExportOptions = {}): string {
  const opts = resolveOptions(options)
  const blocks: string[] = []

  const rootLines = ['  color-scheme: light dark;', ...tierDeclarations(bundle.default, opts)]
  blocks.push(`:root {\n${rootLines.join('\n')}\n}`)

  // why: switch `color-scheme` for the two dominant toggle conventions — a
  // `.dark`/`.light` class (React/next-themes/Tailwind) and a `[data-theme]`
  // attribute (Vue/Svelte/Astro/daisyUI). light-dark() resolves against the
  // computed color-scheme, so flipping it is all a toggle needs to do.
  blocks.push('.dark,\n[data-theme="dark"] {\n  color-scheme: dark;\n}')
  blocks.push('.light,\n[data-theme="light"] {\n  color-scheme: light;\n}')

  for (const tier of ['medium', 'high'] as const) {
    const theme = bundle[tier]
    if (theme === undefined) continue
    blocks.push(`${CONTRAST_TIER_CLASS[tier]} {\n${tierDeclarations(theme, opts).join('\n')}\n}`)
  }

  return `${blocks.join('\n\n')}\n`
}

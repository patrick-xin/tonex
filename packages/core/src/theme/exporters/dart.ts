import type { MdChartTokenName } from '../../chart/schema'
import type { DerivedTheme, TokenMap } from '../derive'
import type { Mode } from '../mode'
import { argbComponents } from '../oklch'
import type { MdTokenName } from '../schema'
import type { ContrastBundle, ExportOptions } from './bundle'

// why: paste-ready Flutter theme shaped like Material Theme Builder's Dart
// export (ADR-0021 c.9, ADR-0029 — match the target's shape, ship our roster).
// A `MaterialTheme` class exposes a `ColorScheme` factory per mode plus the
// `ThemeData` builders a Flutter app drops in. Sibling to css.ts / json.ts and
// bound by the same rules: ADR-0017 — this is a sink, it reshapes / re-encodes
// what deriveTheme returned and never recomputes a color or role mapping;
// ADR-0021 c.1 — argb is canonical inside DerivedTheme, projection to the Dart
// `Color(0x…)` literal happens here at the seam.
//
// We are not a fork of MTB: where Flutter's ColorScheme can hold a tonex token
// we emit it, even one MTB's own sample omits (`onInverseSurface`). Where the
// fixed-shape ColorScheme has no field — the four `*-dim` role tokens, chart,
// palette — the token is simply absent (divergence visible by construction).
// Chart / palette reach Dart parity through their own emission channels in a
// later slice (dart-3). Contrast tiers (dart-2) emit when the bundle carries
// them — the lean default bundle is still just light + dark.

// why: the ColorScheme constructor is a fixed-shape arg list, so the roster is
// an explicit ordered [dartField, token] map rather than a camelCase transform
// of the token name. Order follows MTB's emission order (the human reference in
// __fixtures__). Most fields camelCase cleanly from the token, but
// `--color-inverse-on-surface` → `onInverseSurface` does NOT, which is why the
// mapping is spelled out instead of derived.
const COLOR_SCHEME_FIELDS: ReadonlyArray<readonly [string, MdTokenName]> = [
  ['primary', '--color-primary'],
  ['surfaceTint', '--color-surface-tint'],
  ['onPrimary', '--color-on-primary'],
  ['primaryContainer', '--color-primary-container'],
  ['onPrimaryContainer', '--color-on-primary-container'],
  ['secondary', '--color-secondary'],
  ['onSecondary', '--color-on-secondary'],
  ['secondaryContainer', '--color-secondary-container'],
  ['onSecondaryContainer', '--color-on-secondary-container'],
  ['tertiary', '--color-tertiary'],
  ['onTertiary', '--color-on-tertiary'],
  ['tertiaryContainer', '--color-tertiary-container'],
  ['onTertiaryContainer', '--color-on-tertiary-container'],
  ['error', '--color-error'],
  ['onError', '--color-on-error'],
  ['errorContainer', '--color-error-container'],
  ['onErrorContainer', '--color-on-error-container'],
  ['surface', '--color-surface'],
  ['onSurface', '--color-on-surface'],
  ['onSurfaceVariant', '--color-on-surface-variant'],
  ['outline', '--color-outline'],
  ['outlineVariant', '--color-outline-variant'],
  ['shadow', '--color-shadow'],
  ['scrim', '--color-scrim'],
  ['inverseSurface', '--color-inverse-surface'],
  ['onInverseSurface', '--color-inverse-on-surface'],
  ['inversePrimary', '--color-inverse-primary'],
  ['primaryFixed', '--color-primary-fixed'],
  ['onPrimaryFixed', '--color-on-primary-fixed'],
  ['primaryFixedDim', '--color-primary-fixed-dim'],
  ['onPrimaryFixedVariant', '--color-on-primary-fixed-variant'],
  ['secondaryFixed', '--color-secondary-fixed'],
  ['onSecondaryFixed', '--color-on-secondary-fixed'],
  ['secondaryFixedDim', '--color-secondary-fixed-dim'],
  ['onSecondaryFixedVariant', '--color-on-secondary-fixed-variant'],
  ['tertiaryFixed', '--color-tertiary-fixed'],
  ['onTertiaryFixed', '--color-on-tertiary-fixed'],
  ['tertiaryFixedDim', '--color-tertiary-fixed-dim'],
  ['onTertiaryFixedVariant', '--color-on-tertiary-fixed-variant'],
  ['surfaceDim', '--color-surface-dim'],
  ['surfaceBright', '--color-surface-bright'],
  ['surfaceContainerLowest', '--color-surface-container-lowest'],
  ['surfaceContainerLow', '--color-surface-container-low'],
  ['surfaceContainer', '--color-surface-container'],
  ['surfaceContainerHigh', '--color-surface-container-high'],
  ['surfaceContainerHighest', '--color-surface-container-highest'],
]

// why: project argb → Flutter's `Color(0xAARRGGBB)` literal at the seam (ADR-
// 0021 c.1). Built from the rgb components so the alpha byte is always `ff` —
// MTB emits opaque colors, our md tokens are opaque, and forcing it keeps the
// literal canonical regardless of an upstream alpha byte. Lowercase six-digit
// rgb matches MTB's convention.
function dartColor(argb: number): string {
  const { r, g, b } = argbComponents(argb)
  const hex = (n: number) => n.toString(16).padStart(2, '0')
  return `Color(0xff${hex(r)}${hex(g)}${hex(b)})`
}

// why: one ColorScheme factory body for a single mode. Merge core + extended
// into one lookup (surfaceTint / inverse* / fixed* / shadow / scrim live in the
// extended map) and emit the explicit field roster in order. `brightness` leads
// — it is the one non-Color arg Flutter's ColorScheme takes.
function buildColorScheme(theme: DerivedTheme, mode: Mode): string {
  const core = mode === 'light' ? theme.md.light : theme.md.dark
  const extended = mode === 'light' ? theme.md.lightExtended : theme.md.darkExtended
  const lookup: TokenMap = { ...core, ...extended }
  const lines = [`      brightness: Brightness.${mode},`]
  for (const [field, token] of COLOR_SCHEME_FIELDS) {
    const argb = lookup[token]
    if (argb === undefined) continue
    lines.push(`      ${field}: ${dartColor(argb)},`)
  }
  return lines.join('\n')
}

// why: the (mode × tier) factory + its ThemeData accessor, mirroring MTB's
// `lightScheme()` / `light()` and `lightMediumContrastScheme()` /
// `lightMediumContrast()` pairings. The accessor name is `${mode}${tier}` — the
// base tier carries no suffix (`light` / `dark`), so a lean bundle reproduces
// dart-1's two-method output byte-for-byte. `const ColorScheme(...)` so Flutter
// can fold it at compile time.
function modeBlock(theme: DerivedTheme, mode: Mode, tier: TierSuffix): string {
  const name = `${mode}${tier}`
  return [
    `  static ColorScheme ${name}Scheme() {`,
    '    return const ColorScheme(',
    buildColorScheme(theme, mode),
    '    );',
    '  }',
    '',
    `  ThemeData ${name}() {`,
    `    return theme(${name}Scheme());`,
    '  }',
  ].join('\n')
}

// why: the ThemeData builder MTB ships, with one deliberate fix —
// `scaffoldBackgroundColor` reads `colorScheme.surface` rather than the
// deprecated `colorScheme.background` (removed in current Flutter), so emitted
// code compiles warning-free. We are not a fork of MTB; we ship working Dart.
const THEME_BUILDER = [
  '  ThemeData theme(ColorScheme colorScheme) => ThemeData(',
  '    useMaterial3: true,',
  '    brightness: colorScheme.brightness,',
  '    colorScheme: colorScheme,',
  '    textTheme: textTheme.apply(',
  '      bodyColor: colorScheme.onSurface,',
  '      displayColor: colorScheme.onSurface,',
  '    ),',
  '    scaffoldBackgroundColor: colorScheme.surface,',
  '    canvasColor: colorScheme.surface,',
  '  );',
].join('\n')

// why: the contrast-tier suffix attached to a ColorScheme factory / ThemeData
// accessor name. The base tier is suffix-free so the lean path stays identical
// to dart-1; medium / high mirror MTB's `*MediumContrast` / `*HighContrast`.
type TierSuffix = '' | 'MediumContrast' | 'HighContrast'

// why: walk the tiers the bundle actually carries (ADR-0021 c.5 — medium / high
// are present only when includeContrastVariants is on) and pair each with its
// MTB suffix. A lean bundle yields just the base tier, so exportDart collapses
// back to dart-1's two-method form with no dead branches.
function presentTiers(bundle: ContrastBundle): ReadonlyArray<readonly [DerivedTheme, TierSuffix]> {
  const tiers: Array<readonly [DerivedTheme, TierSuffix]> = [[bundle.default, '']]
  if (bundle.medium) tiers.push([bundle.medium, 'MediumContrast'])
  if (bundle.high) tiers.push([bundle.high, 'HighContrast'])
  return tiers
}

// why: chart is a tonex family (ADR-0027) Flutter's ColorScheme has no slot
// for, so it emits as its own `ChartColors` class — a const constructor over
// chart1..chart5 with light()/dark() factories, mirroring the JSON/CSS chart
// block (#89). Explicit [field, token] roster like COLOR_SCHEME_FIELDS: the
// names map mechanically (`--color-chart-1` → `chart1`) but spelling it out
// keeps the sink dumb and the field order pinned.
const CHART_FIELDS: ReadonlyArray<readonly [string, MdChartTokenName]> = [
  ['chart1', '--color-chart-1'],
  ['chart2', '--color-chart-2'],
  ['chart3', '--color-chart-3'],
  ['chart4', '--color-chart-4'],
  ['chart5', '--color-chart-5'],
]

// why: one ChartColors factory body for a single mode. Chart is mode-aware
// (lightChart / darkChart) but contrast-invariant, so it reads the base tier.
function chartFactory(name: Mode, chart: DerivedTheme['md']['lightChart']): string {
  const lines = [`  static ChartColors ${name}() => const ChartColors(`]
  for (const [field, token] of CHART_FIELDS) {
    const argb = chart[token]
    if (argb === undefined) continue
    lines.push(`    ${field}: ${dartColor(argb)},`)
  }
  lines.push('  );')
  return lines.join('\n')
}

// why: the standalone ChartColors class, emitted next to MaterialTheme when the
// chart channel is on. Named fields (not a List) so series read by role; const
// factories so Flutter folds them at compile time.
function chartColorsClass(theme: DerivedTheme): string {
  return [
    'class ChartColors {',
    '  const ChartColors({',
    '    required this.chart1,',
    '    required this.chart2,',
    '    required this.chart3,',
    '    required this.chart4,',
    '    required this.chart5,',
    '  });',
    '',
    '  final Color chart1;',
    '  final Color chart2;',
    '  final Color chart3;',
    '  final Color chart4;',
    '  final Color chart5;',
    '',
    chartFactory('light', theme.md.lightChart),
    '',
    chartFactory('dark', theme.md.darkChart),
    '}',
  ].join('\n')
}

export function exportDart(bundle: ContrastBundle, options: ExportOptions = {}): string {
  const tiers = presentTiers(bundle)
  // why: group every tier of one mode before the next, matching MTB's emission
  // order (light, lightMediumContrast, lightHighContrast, then the dark trio).
  const blocks: string[] = []
  for (const mode of ['light', 'dark'] as const) {
    for (const [theme, tier] of tiers) {
      blocks.push(modeBlock(theme, mode, tier))
    }
  }
  const parts = [
    'import "package:flutter/material.dart";',
    '',
    'class MaterialTheme {',
    '  final TextTheme textTheme;',
    '',
    '  const MaterialTheme(this.textTheme);',
    '',
    blocks.join('\n\n'),
    '',
    THEME_BUILDER,
    '}',
  ]
  // why: chart rides alongside MaterialTheme as its own class, gated on the
  // includeChart option — off by default, so the lean export is just the theme.
  if (options.includeChart) parts.push('', chartColorsClass(bundle.default))
  parts.push('')
  return parts.join('\n')
}

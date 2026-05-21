import type { DerivedTheme, TokenMap } from '../derive'
import type { Mode } from '../mode'
import { argbComponents } from '../oklch'
import type { MdTokenName } from '../schema'
import type { ContrastBundle } from './bundle'

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
// later slice; this slice ships the default light + dark ColorScheme only.

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

// why: the per-mode factory + its ThemeData accessor, mirroring MTB's
// `lightScheme()` / `light()` pairing. `const ColorScheme(...)` so Flutter can
// fold it at compile time.
function modeBlock(theme: DerivedTheme, mode: Mode): string {
  const Scheme = mode === 'light' ? 'light' : 'dark'
  return [
    `  static ColorScheme ${Scheme}Scheme() {`,
    '    return const ColorScheme(',
    buildColorScheme(theme, mode),
    '    );',
    '  }',
    '',
    `  ThemeData ${Scheme}() {`,
    `    return theme(${Scheme}Scheme());`,
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

export function exportDart(bundle: ContrastBundle): string {
  const theme = bundle.default
  return [
    'import "package:flutter/material.dart";',
    '',
    'class MaterialTheme {',
    '  final TextTheme textTheme;',
    '',
    '  const MaterialTheme(this.textTheme);',
    '',
    modeBlock(theme, 'light'),
    '',
    modeBlock(theme, 'dark'),
    '',
    THEME_BUILDER,
    '}',
    '',
  ].join('\n')
}

import {
  argbFromHex,
  type DynamicScheme,
  Hct,
  MaterialDynamicColors,
  customColor as mdCustomColor,
} from '@tonex/mcu'
import { variants } from '../variants'
import { cmfSecondSourceDisabledReason } from './cmf-second-source'
import type { Mode } from './mode'
import { applyPaletteOverrides } from './palette-override'
import {
  type CustomColorEntry,
  MD_CHART_TOKEN_NAMES,
  MD_CORE_TOKEN_NAMES,
  MD_EXTENDED_TOKEN_NAMES,
  MD_PALETTE_FAMILY_NAMES,
  MD_PALETTE_TONE_NAMES,
  MD_TOKEN_NAMES,
  type MdTokenName,
  type PortableTheme,
  SHADCN_CHART_TOKEN_NAMES,
  SHADCN_ROLE_NAMES,
  type ShadcnRoleBindings,
  slugifyCustomColorName,
} from './schema'
import { applySurfaceDesaturate, applySurfaceTint } from './surface'

// why: ADR-0021 commitment 1 — argb is the canonical wire format inside
// DerivedTheme. Colorspace projection (argb → oklch / hex) is a format-time
// concern owned by applyDom (oklchString) and exporters (oklchString or
// hexString depending on ExportOptions.colorFormat). Storing argb here keeps
// derive's intermediate stages projection-free: surface treatments, palette
// overrides, and shadcn binding all read/write the same number domain MCU
// itself uses, eliminating round-trip parses inside the spine.

export type TokenMap = Record<string, number>

// why: ADR-0021 commitment 3 — fields keyed by *what each class is for*, not
// flattened with sidecar Sets. Each field's update frequency, DOM relevance,
// and consumer set is sharp:
//
//   light/dark           — 28 core role tokens + custom-color slugs.
//                          Mode-aware. DOM-emitted by applyDom.
//   lightChart/darkChart — 5 chart tokens. Mode-aware. DOM-emitted (merged
//                          into the same scope rule as core for free use
//                          inside the editor).
//   lightExtended/...    — 22 extended role tokens (fixed/dim/inverse/
//                          surface-tint/shadow/scrim). Mode-aware. Data only
//                          (consumed by inspect UIs via useResolvedTokens);
//                          NOT emitted by applyDom — see commitment 4.
//   palette              — 78 palette tones (13 × 6). Mode/contrast-invariant.
//                          Data only.
//
// shadcn carries only the DOM-emitted surfaces — extended/palette have no
// shadcn analog and the cross-layer binding surface stays closed at
// SHADCN_ROLE_NAMES (extending it is its own ADR/slice).
export interface MdLayer {
  light: TokenMap
  dark: TokenMap
  lightChart: TokenMap
  darkChart: TokenMap
  lightExtended: TokenMap
  darkExtended: TokenMap
  palette: TokenMap
}

export interface ShadcnLayer {
  light: TokenMap
  dark: TokenMap
  lightChart: TokenMap
  darkChart: TokenMap
}

export interface ResolvedLayer {
  light: TokenMap
  dark: TokenMap
}

// why: lean spine — `md` and `shadcn` are the two layers the export path
// emits. Surface-treatment algorithms run inline below (between md emit and
// shadcn bind) so applyDom AND formatCss reflect the same treated tokens by
// construction. ADR-0017 holds because preview === export both consume the
// same DerivedTheme; treatment is a transform on `md`, not a parallel field.
export interface DerivedTheme {
  md: MdLayer
  shadcn: ShadcnLayer
  warnings: string[]
}

const MD_CORE_TOKEN_SET: ReadonlySet<string> = new Set(MD_CORE_TOKEN_NAMES)
const MD_EXTENDED_TOKEN_SET: ReadonlySet<string> = new Set(MD_EXTENDED_TOKEN_NAMES)

// why: arbitrary 5-tone spread per mode (ADR-0021 commitment 2 — "fixed 5-
// tone mapping"). Tunable; chart UX hasn't pinned exact tones yet. Light-mode
// tones skew darker so chart-1 shows up against the surface; dark-mode tones
// skew lighter for the same reason. Mode-aware, contrast-invariant — palette
// tones don't shift with MCU contrast level.
const CHART_TONES_LIGHT = [40, 60, 80, 25, 75] as const
const CHART_TONES_DARK = [80, 60, 40, 95, 25] as const

const mdc = new MaterialDynamicColors()

// why: explicit MdTokenName → MCU getter table. Verbose but the mapping is
// the load-bearing fact this module owes its readers — kebab-cased token
// names don't trivially round-trip to camelCase getter names without a rule
// (e.g. `--color-on-surface-variant` → `onSurfaceVariant`), and a transform
// would hide MCU's actual API surface behind string mangling. Adding an md
// token: extend MD_TOKEN_NAMES in schema.ts AND add the resolver here.
// TypeScript's Record<MdTokenName, ...> ensures both move together.
// why: dim getters are typed `DynamicColor | undefined` but at runtime under
// MCU's current spec stack (MaterialDynamicColors.colorSpec === 2026 → 2025 →
// 2021) they always return a real DynamicColor — the 2025 layer defines them
// directly without `extendSpecVersion`, so the 2021 base's `undefined` is
// shadowed for any scheme regardless of specVersion. The non-null assertion
// captures this invariant. If MCU ever pulls dim back into 2021, this throws
// at the boundary instead of leaking undefined into oklchFromArgb.
const MD_TOKEN_RESOLVERS: Record<MdTokenName, (s: DynamicScheme) => number> = {
  '--color-primary': (s) => mdc.primary().getArgb(s),
  '--color-on-primary': (s) => mdc.onPrimary().getArgb(s),
  '--color-primary-container': (s) => mdc.primaryContainer().getArgb(s),
  '--color-on-primary-container': (s) => mdc.onPrimaryContainer().getArgb(s),
  '--color-primary-fixed': (s) => mdc.primaryFixed().getArgb(s),
  '--color-primary-fixed-dim': (s) => mdc.primaryFixedDim().getArgb(s),
  '--color-on-primary-fixed': (s) => mdc.onPrimaryFixed().getArgb(s),
  '--color-on-primary-fixed-variant': (s) => mdc.onPrimaryFixedVariant().getArgb(s),
  '--color-primary-dim': (s) => mdc.primaryDim()!.getArgb(s),
  '--color-secondary': (s) => mdc.secondary().getArgb(s),
  '--color-on-secondary': (s) => mdc.onSecondary().getArgb(s),
  '--color-secondary-container': (s) => mdc.secondaryContainer().getArgb(s),
  '--color-on-secondary-container': (s) => mdc.onSecondaryContainer().getArgb(s),
  '--color-secondary-fixed': (s) => mdc.secondaryFixed().getArgb(s),
  '--color-secondary-fixed-dim': (s) => mdc.secondaryFixedDim().getArgb(s),
  '--color-on-secondary-fixed': (s) => mdc.onSecondaryFixed().getArgb(s),
  '--color-on-secondary-fixed-variant': (s) => mdc.onSecondaryFixedVariant().getArgb(s),
  '--color-secondary-dim': (s) => mdc.secondaryDim()!.getArgb(s),
  '--color-tertiary': (s) => mdc.tertiary().getArgb(s),
  '--color-on-tertiary': (s) => mdc.onTertiary().getArgb(s),
  '--color-tertiary-container': (s) => mdc.tertiaryContainer().getArgb(s),
  '--color-on-tertiary-container': (s) => mdc.onTertiaryContainer().getArgb(s),
  '--color-tertiary-fixed': (s) => mdc.tertiaryFixed().getArgb(s),
  '--color-tertiary-fixed-dim': (s) => mdc.tertiaryFixedDim().getArgb(s),
  '--color-on-tertiary-fixed': (s) => mdc.onTertiaryFixed().getArgb(s),
  '--color-on-tertiary-fixed-variant': (s) => mdc.onTertiaryFixedVariant().getArgb(s),
  '--color-tertiary-dim': (s) => mdc.tertiaryDim()!.getArgb(s),
  '--color-error': (s) => mdc.error().getArgb(s),
  '--color-on-error': (s) => mdc.onError().getArgb(s),
  '--color-error-container': (s) => mdc.errorContainer().getArgb(s),
  '--color-on-error-container': (s) => mdc.onErrorContainer().getArgb(s),
  '--color-error-dim': (s) => mdc.errorDim()!.getArgb(s),
  '--color-surface': (s) => mdc.surface().getArgb(s),
  '--color-on-surface': (s) => mdc.onSurface().getArgb(s),
  '--color-on-surface-variant': (s) => mdc.onSurfaceVariant().getArgb(s),
  '--color-surface-dim': (s) => mdc.surfaceDim().getArgb(s),
  '--color-surface-bright': (s) => mdc.surfaceBright().getArgb(s),
  '--color-surface-container-lowest': (s) => mdc.surfaceContainerLowest().getArgb(s),
  '--color-surface-container-low': (s) => mdc.surfaceContainerLow().getArgb(s),
  '--color-surface-container': (s) => mdc.surfaceContainer().getArgb(s),
  '--color-surface-container-high': (s) => mdc.surfaceContainerHigh().getArgb(s),
  '--color-surface-container-highest': (s) => mdc.surfaceContainerHighest().getArgb(s),
  '--color-surface-tint': (s) => mdc.surfaceTint().getArgb(s),
  '--color-inverse-surface': (s) => mdc.inverseSurface().getArgb(s),
  '--color-inverse-on-surface': (s) => mdc.inverseOnSurface().getArgb(s),
  '--color-inverse-primary': (s) => mdc.inversePrimary().getArgb(s),
  '--color-shadow': (s) => mdc.shadow().getArgb(s),
  '--color-scrim': (s) => mdc.scrim().getArgb(s),
  '--color-outline': (s) => mdc.outline().getArgb(s),
  '--color-outline-variant': (s) => mdc.outlineVariant().getArgb(s),
}

// why: collapses the prior light/dark dup. Iterates MD_TOKEN_NAMES so every
// schema entry is forced through the resolver — adding a name without a
// resolver is a TS error at the table site, not a silent missing token.
// Returns argb directly (ADR-0021); projection happens at the format/applyDom
// seam.
function buildMdLayer(scheme: DynamicScheme): TokenMap {
  const out: TokenMap = {}
  for (const name of MD_TOKEN_NAMES) {
    out[name] = MD_TOKEN_RESOLVERS[name](scheme)
  }
  return out
}

// why: bindings are data, not code — the mapping rule is a runtime lookup
// against md emitted tokens. Mode-keyed because the default map already has
// cross-mode asymmetry (card, popover, sidebar-foreground). ADR-0017.
function bindShadcn(mdLayer: TokenMap, bindings: ShadcnRoleBindings): TokenMap {
  const out: TokenMap = {}
  for (const role of SHADCN_ROLE_NAMES) {
    const mdToken = bindings[role]
    const value = mdLayer[mdToken]
    if (value === undefined) {
      throw new Error(`[bindShadcn] role ${role} bound to missing md token ${mdToken}`)
    }
    out[role] = value
  }
  return out
}

// why: deriveTheme is THE spine. Both modes co-derive in one call so a
// second `deriveTheme` for "the other mode" cannot exist by construction.
// Source has no top-level `mode` field; mode is owned by next-themes on
// <html class="dark"> and selected via cascade. See ADR-0017.
//
// Cross-layer mapping is driven by source.shadcnRoleBindings (per-mode).
// Default bindings (DEFAULT_SHADCN_ROLE_BINDINGS) come from legacy tonex's
// MD3_ROLE_MAP. Editing the bindings flows directly to the shadcn layer
// without touching md, by construction.
//
// Pipeline order (ADR-0021 commitment 3):
//   1. Build flat md layer (50 tokens core+extended, single resolver pass).
//   2. Apply token overrides (any of the 50, sparse map per mode).
//   3. Apply surface treatment (touches only core surface family).
//   4. Compute custom-color groups + merge their md tokens.
//   5. Bind shadcn from the merged map (allows any md token as a binding
//      target — extended included).
//   6. Compute chart (5 tokens per mode from primaryPalette).
//   7. Compute palette (78 tones, mode-invariant).
//   8. SPLIT the merged md result into core/extended/custom buckets by name
//      so each field's consumer set is sharp.
export function deriveTheme(source: PortableTheme): DerivedTheme {
  const seedHct = Hct.fromInt(argbFromHex(source.seedHex))
  const variant = variants[source.variant]

  // why: cmf is the only strategy that reads the second hct; resolve once
  // here and let other strategies ignore the param. Skip when the field is
  // disabled (variant !== cmf) so a value persisted under cmf doesn't bleed
  // into the call signature for non-cmf strategies — keeps the no-cmf build
  // path byte-identical to v8.
  const secondHct =
    source.cmfSecondSourceHex !== null && cmfSecondSourceDisabledReason(source) === null
      ? Hct.fromInt(argbFromHex(source.cmfSecondSourceHex))
      : undefined

  const lightScheme = variant.build(seedHct, false, source.contrastLevel, secondHct)
  const darkScheme = variant.build(seedHct, true, source.contrastLevel, secondHct)

  // why: palette-level override runs FIRST — mutates the scheme's tonal
  // palette fields in place so every md token derived from MCU sees the
  // overridden source. MCU's variant-specific tone choices (e.g. monochrome's
  // primary at tone 100/0 vs tonalSpot's 40/80) flow through unchanged
  // because we're swapping the palette, not the tone selection. Disabled
  // overrides (paletteOverrideDisabledReason) are skipped inside.
  applyPaletteOverrides(lightScheme, darkScheme, source)

  // why: MCU build → palette override → md emit → generic token override.
  // Token override is the surgical pin and runs LAST so user pins always
  // win over both MCU and the palette regen.
  const mdLightBase = applyMd3TokenOverrides(
    buildMdLayer(lightScheme),
    source.md3TokenOverrides.light,
  )
  const mdDarkBase = applyMd3TokenOverrides(buildMdLayer(darkScheme), source.md3TokenOverrides.dark)

  // why: treatment runs BEFORE shadcn binds so any binding pointed at a
  // surface token reflects the treated value automatically. Default
  // surfaceAlgo='desaturate' at level 0 is identity via the desaturate
  // short-circuit — drift-guard baseline holds byte-for-byte.
  const treatedLight = applyTreatment(mdLightBase, 'light', source)
  const treatedDark = applyTreatment(mdDarkBase, 'dark', source)

  // why: customColor groups are computed once (light + dark together via MCU)
  // then split per mode. Their md tokens MERGE INTO the treated md layers
  // before shadcn binding so any future shadcn role rebound to a custom md
  // token would resolve — current bindings can't (closed enum), but the
  // ordering keeps the spine consistent: every md token in the final layer
  // is a candidate for binding, customs included. Shadcn customs are
  // produced separately and merged into shadcn layers post-bind.
  const seedArgb = argbFromHex(source.seedHex)
  const customGroups = source.customColors.map((entry) => ({
    entry,
    slug: slugifyCustomColorName(entry.name),
    group: mdCustomColor(seedArgb, {
      value: argbFromHex(entry.hex),
      name: entry.name,
      blend: entry.blend,
    }),
  }))

  const customMdLight = buildCustomColorsMd(customGroups, 'light')
  const customMdDark = buildCustomColorsMd(customGroups, 'dark')
  const mergedLight = { ...treatedLight, ...customMdLight }
  const mergedDark = { ...treatedDark, ...customMdDark }

  // why: split happens AT RETURN — all internal pipeline stages operate on
  // the flat 50-token map so token overrides, treatment, and shadcn binding
  // logic stay tier-agnostic. Custom slugs (entries outside both static
  // partitions) flow into the core `light`/`dark` field by design (ADR-0021
  // commitment 3 — "custom colors continue to merge into md.{light,dark}").
  const splitLight = splitMdLayer(mergedLight)
  const splitDark = splitMdLayer(mergedDark)

  const mdLightChart = buildMdChart(lightScheme, 'light')
  const mdDarkChart = buildMdChart(darkScheme, 'dark')

  return {
    md: {
      light: splitLight.core,
      dark: splitDark.core,
      lightChart: mdLightChart,
      darkChart: mdDarkChart,
      lightExtended: splitLight.extended,
      darkExtended: splitDark.extended,
      // why: palette is mode/contrast-invariant — pull from either scheme; we
      // pick lightScheme to keep the dependency direction one-way.
      palette: buildMdPalette(lightScheme),
    },
    shadcn: {
      light: {
        ...bindShadcn(mergedLight, source.shadcnRoleBindings.light),
        ...buildCustomColorsShadcn(customGroups, customMdLight),
      },
      dark: {
        ...bindShadcn(mergedDark, source.shadcnRoleBindings.dark),
        ...buildCustomColorsShadcn(customGroups, customMdDark),
      },
      lightChart: rebrandChart(mdLightChart),
      darkChart: rebrandChart(mdDarkChart),
    },
    warnings: [],
  }
}

// why: split a flat md TokenMap into core / extended buckets via the partition
// Sets. Tokens outside both partitions (custom-color slugs) go into core —
// custom colors are first-class brand surfaces, not extended ornament.
function splitMdLayer(layer: TokenMap): { core: TokenMap; extended: TokenMap } {
  const core: TokenMap = {}
  const extended: TokenMap = {}
  for (const [name, argb] of Object.entries(layer)) {
    if (MD_EXTENDED_TOKEN_SET.has(name)) extended[name] = argb
    else core[name] = argb
  }
  return { core, extended }
}

// why: chart tokens are sourced from the scheme's primary palette via a fixed
// per-mode 5-tone mapping. Palette is the same construct shadcn-rebound
// surfaces read from, so picking tones from it makes chart series visually
// coherent with the rest of the theme (same hue/chroma family).
function buildMdChart(scheme: DynamicScheme, mode: Mode): TokenMap {
  const tones = mode === 'light' ? CHART_TONES_LIGHT : CHART_TONES_DARK
  const out: TokenMap = {}
  MD_CHART_TOKEN_NAMES.forEach((name, i) => {
    out[name] = scheme.primaryPalette.tone(tones[i])
  })
  return out
}

// why: shadcn's chart names are the same 5 values the md side computes, just
// renamed (`--color-chart-1` → `--chart-1`). One source of truth, two
// namespaces — chart character can't drift between layers.
function rebrandChart(mdChart: TokenMap): TokenMap {
  const out: TokenMap = {}
  SHADCN_CHART_TOKEN_NAMES.forEach((shadcnName, i) => {
    const argb = mdChart[MD_CHART_TOKEN_NAMES[i]]
    if (argb === undefined) {
      throw new Error(`[rebrandChart] missing md chart token at index ${i}`)
    }
    out[shadcnName] = argb
  })
  return out
}

// why: 78 palette tones (13 tones × 6 palettes). Mode/contrast-invariant —
// the palette is a tone ramp; mode picks tones from it. We expose the full
// ramp for inspect UIs (landing showcase, tone-palette swatches) so they can
// render any tone without re-deriving from the seed.
const MD_PALETTE_FIELD_BY_NAME: Record<string, keyof DynamicScheme> = {
  primary: 'primaryPalette',
  secondary: 'secondaryPalette',
  tertiary: 'tertiaryPalette',
  neutral: 'neutralPalette',
  'neutral-variant': 'neutralVariantPalette',
  error: 'errorPalette',
}

function buildMdPalette(scheme: DynamicScheme): TokenMap {
  const out: TokenMap = {}
  for (const family of MD_PALETTE_FAMILY_NAMES) {
    const palette = scheme[MD_PALETTE_FIELD_BY_NAME[family]] as DynamicScheme['primaryPalette']
    for (const tone of MD_PALETTE_TONE_NAMES) {
      out[`--md-ref-palette-${family}-${tone}`] = palette.tone(tone)
    }
  }
  return out
}

interface ResolvedCustomGroup {
  entry: CustomColorEntry
  slug: string
  group: ReturnType<typeof mdCustomColor>
}

// why: emits 4 md tokens per custom entry from MCU's CustomColorGroup. Tones
// are MCU's choice (40/100/90/10 light, 80/20/30/90 dark). Argb-canonical
// per ADR-0021 — projection happens at the format/applyDom seam.
function buildCustomColorsMd(groups: ResolvedCustomGroup[], mode: Mode): TokenMap {
  const out: TokenMap = {}
  for (const { slug, group } of groups) {
    const colors = group[mode]
    out[`--color-${slug}`] = colors.color
    out[`--color-on-${slug}`] = colors.onColor
    out[`--color-${slug}-container`] = colors.colorContainer
    out[`--color-on-${slug}-container`] = colors.onColorContainer
  }
  return out
}

// why: shadcn pair sourced from the SAME mdLayer the rest of derive uses, so
// any value-shifting transforms (none today on custom colors, but in case of
// future sink-side hooks) propagate. Pair selector is per-entry shadcnSource:
// 'color' → --{slug}/--{slug}-foreground ← --color-{slug}/--color-on-{slug};
// 'container' → ← --color-{slug}-container/--color-on-{slug}-container.
function buildCustomColorsShadcn(groups: ResolvedCustomGroup[], mdLayer: TokenMap): TokenMap {
  const out: TokenMap = {}
  for (const { entry, slug } of groups) {
    const pair =
      entry.shadcnSource === 'color'
        ? { color: `--color-${slug}`, on: `--color-on-${slug}` }
        : { color: `--color-${slug}-container`, on: `--color-on-${slug}-container` }
    const colorValue = mdLayer[pair.color]
    const onValue = mdLayer[pair.on]
    if (colorValue === undefined || onValue === undefined) {
      throw new Error(`[buildCustomColorsShadcn] missing md token for slug ${slug}`)
    }
    out[`--${slug}`] = colorValue
    out[`--${slug}-foreground`] = onValue
  }
  return out
}

function applyTreatment(layer: TokenMap, mode: Mode, source: PortableTheme): TokenMap {
  if (source.surfaceAlgo === 'tint')
    return applySurfaceTint(layer, mode, source.surfaceTintLevel[mode], source.surfacePaletteName)
  return applySurfaceDesaturate(layer, source.surfaceDesaturateLevel[mode])
}

// why: generic per-token override map for one mode. Overrides are STORED as
// hex (user-facing color pickers emit hex); convert hex → argb at the boundary
// so the layer stays in canonical argb (ADR-0021). Tokens not present in the
// override flow through unchanged. Runs LAST in the md pipeline (after MCU
// build) so override always wins.
function applyMd3TokenOverrides(
  layer: TokenMap,
  overrides: Partial<Record<MdTokenName, string>>,
): TokenMap {
  const keys = Object.keys(overrides) as MdTokenName[]
  if (keys.length === 0) return layer
  const out = { ...layer }
  for (const token of keys) {
    const hex = overrides[token]
    if (hex !== undefined) out[token] = argbFromHex(hex)
  }
  return out
}

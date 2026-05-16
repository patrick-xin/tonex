import {
  argbFromHex,
  type DynamicColor,
  type DynamicScheme,
  Hct,
  MaterialDynamicColors,
  customColor as mdCustomColor,
} from '@tonex/mcu'
import { applyShadcnChartOverrides, buildMdChart, rebrandChart } from '../../chart/build'
import { cmfSecondSourceDisabledReason } from '../../cmf/second-source'
import { variants } from '../../variants'
import type { Mode } from '../mode'
import { applyPaletteOverrides } from '../palette-override'
import {
  type CustomColorEntry,
  MD_CORE_TOKEN_NAMES,
  MD_EXTENDED_TOKEN_NAMES,
  MD_PALETTE_TONE_NAMES,
  MD_TOKEN_NAMES,
  type MdTokenName,
  PALETTE_FAMILIES,
  type PortableTheme,
  SHADCN_ROLE_NAMES,
  type ShadcnRoleBindings,
  type ShadcnRoleName,
  slugifyCustomColorName,
} from '../schema'
import { applySurfaceDesaturate, applySurfaceTint } from '../surface'

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

// why: explicit MdTokenName → MCU getter table. Verbose but the mapping is
// the load-bearing fact this module owes its readers — kebab-cased token
// names don't trivially round-trip to camelCase getter names without a rule
// (e.g. `--color-on-surface-variant` → `onSurfaceVariant`), and a transform
// would hide MCU's actual API surface behind string mangling. Adding an md
// token: extend MD_TOKEN_NAMES in schema.ts AND add the resolver here.
// TypeScript's Record<MdTokenName, ...> ensures both move together.
//
// why: resolvers take `mdc` as a parameter rather than closing over a module
// singleton — `MaterialDynamicColors` is constructed fresh per `deriveTheme`
// call (issue #21). Today's MCU constructor is stateless, but the boundary
// belongs at derive's seam: when we swap our vendored MCU for the upstream
// package (ADR-0012), upgrades ship outside our control and any future
// per-instance memoization would silently leak across calls under a
// singleton. Construction is a thin façade allocation; the derive cache
// absorbs repeat calls so only cache misses pay it.

// why: MCU's dim getters return `DynamicColor | undefined` because the 2021 spec
// declares them optional. Under the live spec stack (2026 → 2025 → 2021), the
// 2025 layer defines them directly without `extendSpecVersion`, so they always
// return a real DynamicColor for any scheme regardless of specVersion.
// Centralizing the assertion: one site that throws with a readable message if
// MCU's spec dispatch ever changes, instead of four NPEs on `.getArgb` of
// undefined buried in resolver lines.
function dimArgb(
  getter: () => DynamicColor | undefined,
  scheme: DynamicScheme,
  label: string,
): number {
  const color = getter()
  if (color === undefined) {
    throw new Error(`[derive] MCU returned undefined for ${label} — spec stack may have changed`)
  }
  return color.getArgb(scheme)
}

type MdTokenResolver = (s: DynamicScheme, mdc: MaterialDynamicColors) => number

const MD_TOKEN_RESOLVERS: Record<MdTokenName, MdTokenResolver> = {
  '--color-primary': (s, mdc) => mdc.primary().getArgb(s),
  '--color-on-primary': (s, mdc) => mdc.onPrimary().getArgb(s),
  '--color-primary-container': (s, mdc) => mdc.primaryContainer().getArgb(s),
  '--color-on-primary-container': (s, mdc) => mdc.onPrimaryContainer().getArgb(s),
  '--color-primary-fixed': (s, mdc) => mdc.primaryFixed().getArgb(s),
  '--color-primary-fixed-dim': (s, mdc) => mdc.primaryFixedDim().getArgb(s),
  '--color-on-primary-fixed': (s, mdc) => mdc.onPrimaryFixed().getArgb(s),
  '--color-on-primary-fixed-variant': (s, mdc) => mdc.onPrimaryFixedVariant().getArgb(s),
  '--color-primary-dim': (s, mdc) => dimArgb(() => mdc.primaryDim(), s, '--color-primary-dim'),
  '--color-secondary': (s, mdc) => mdc.secondary().getArgb(s),
  '--color-on-secondary': (s, mdc) => mdc.onSecondary().getArgb(s),
  '--color-secondary-container': (s, mdc) => mdc.secondaryContainer().getArgb(s),
  '--color-on-secondary-container': (s, mdc) => mdc.onSecondaryContainer().getArgb(s),
  '--color-secondary-fixed': (s, mdc) => mdc.secondaryFixed().getArgb(s),
  '--color-secondary-fixed-dim': (s, mdc) => mdc.secondaryFixedDim().getArgb(s),
  '--color-on-secondary-fixed': (s, mdc) => mdc.onSecondaryFixed().getArgb(s),
  '--color-on-secondary-fixed-variant': (s, mdc) => mdc.onSecondaryFixedVariant().getArgb(s),
  '--color-secondary-dim': (s, mdc) =>
    dimArgb(() => mdc.secondaryDim(), s, '--color-secondary-dim'),
  '--color-tertiary': (s, mdc) => mdc.tertiary().getArgb(s),
  '--color-on-tertiary': (s, mdc) => mdc.onTertiary().getArgb(s),
  '--color-tertiary-container': (s, mdc) => mdc.tertiaryContainer().getArgb(s),
  '--color-on-tertiary-container': (s, mdc) => mdc.onTertiaryContainer().getArgb(s),
  '--color-tertiary-fixed': (s, mdc) => mdc.tertiaryFixed().getArgb(s),
  '--color-tertiary-fixed-dim': (s, mdc) => mdc.tertiaryFixedDim().getArgb(s),
  '--color-on-tertiary-fixed': (s, mdc) => mdc.onTertiaryFixed().getArgb(s),
  '--color-on-tertiary-fixed-variant': (s, mdc) => mdc.onTertiaryFixedVariant().getArgb(s),
  '--color-tertiary-dim': (s, mdc) => dimArgb(() => mdc.tertiaryDim(), s, '--color-tertiary-dim'),
  '--color-error': (s, mdc) => mdc.error().getArgb(s),
  '--color-on-error': (s, mdc) => mdc.onError().getArgb(s),
  '--color-error-container': (s, mdc) => mdc.errorContainer().getArgb(s),
  '--color-on-error-container': (s, mdc) => mdc.onErrorContainer().getArgb(s),
  '--color-error-dim': (s, mdc) => dimArgb(() => mdc.errorDim(), s, '--color-error-dim'),
  '--color-surface': (s, mdc) => mdc.surface().getArgb(s),
  '--color-on-surface': (s, mdc) => mdc.onSurface().getArgb(s),
  '--color-on-surface-variant': (s, mdc) => mdc.onSurfaceVariant().getArgb(s),
  '--color-surface-dim': (s, mdc) => mdc.surfaceDim().getArgb(s),
  '--color-surface-bright': (s, mdc) => mdc.surfaceBright().getArgb(s),
  '--color-surface-container-lowest': (s, mdc) => mdc.surfaceContainerLowest().getArgb(s),
  '--color-surface-container-low': (s, mdc) => mdc.surfaceContainerLow().getArgb(s),
  '--color-surface-container': (s, mdc) => mdc.surfaceContainer().getArgb(s),
  '--color-surface-container-high': (s, mdc) => mdc.surfaceContainerHigh().getArgb(s),
  '--color-surface-container-highest': (s, mdc) => mdc.surfaceContainerHighest().getArgb(s),
  '--color-surface-tint': (s, mdc) => mdc.surfaceTint().getArgb(s),
  '--color-inverse-surface': (s, mdc) => mdc.inverseSurface().getArgb(s),
  '--color-inverse-on-surface': (s, mdc) => mdc.inverseOnSurface().getArgb(s),
  '--color-inverse-primary': (s, mdc) => mdc.inversePrimary().getArgb(s),
  '--color-shadow': (s, mdc) => mdc.shadow().getArgb(s),
  '--color-scrim': (s, mdc) => mdc.scrim().getArgb(s),
  '--color-outline': (s, mdc) => mdc.outline().getArgb(s),
  '--color-outline-variant': (s, mdc) => mdc.outlineVariant().getArgb(s),
}

// why: collapses the prior light/dark dup. Iterates MD_TOKEN_NAMES so every
// schema entry is forced through the resolver — adding a name without a
// resolver is a TS error at the table site, not a silent missing token.
// Returns argb directly (ADR-0021); projection happens at the format/applyDom
// seam.
function buildMdLayer(scheme: DynamicScheme, mdc: MaterialDynamicColors): TokenMap {
  const out: TokenMap = {}
  for (const name of MD_TOKEN_NAMES) {
    out[name] = MD_TOKEN_RESOLVERS[name](scheme, mdc)
  }
  return out
}

// why: bindings are data, not code — the mapping rule is a runtime lookup
// against md emitted tokens. Mode-keyed because the default map already has
// cross-mode asymmetry (card, popover, sidebar-foreground). ADR-0017.
//
// why: ADR-0026 c.4/c.5 — `overrides` is a sparse hex map per (mode, role).
// When set, the literal hex wins over the binding-resolved md value.
// Resolved inside derive so every consumer (applyDom, exporters) sees the
// post-override value through the existing DerivedTheme shape (ADR-0017).
// Empty map takes the binding branch for every role — drift-guard baseline
// stays byte-identical when shadcnRoleOverrides defaults to `{ light: {},
// dark: {} }`.
function bindShadcn(
  mdLayer: TokenMap,
  bindings: ShadcnRoleBindings,
  overrides: Partial<Record<ShadcnRoleName, string>>,
): TokenMap {
  const out: TokenMap = {}
  for (const role of SHADCN_ROLE_NAMES) {
    const overrideHex = overrides[role]
    if (overrideHex !== undefined) {
      out[role] = argbFromHex(overrideHex)
      continue
    }
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
//   6. Compute chart (5 tokens per mode; mono branch reads primaryPalette,
//      multi branch synthesizes via Hct.from — see ADR-0024).
//   7. Compute palette (78 tones, mode-invariant).
//   8. SPLIT the merged md result into core/extended/custom buckets by name
//      so each field's consumer set is sharp.
export function deriveTheme(source: PortableTheme): DerivedTheme {
  // why: ADR-0028 — read canonical HCT directly from source.seed, not via
  // hexFromHct → hctFromHex. The round-trip at chroma<4 silently rotated
  // hue by up to 12.888° (issue #57 Mechanism B); reading the triplet
  // directly preserves the user's pick verbatim. `Hct.from` runs MCU's
  // solver to land an in-gamut argb — that's the canonical engine entry
  // point regardless of the seed's origin (hex paste or HCT slider).
  const seedHct = Hct.from(source.seed.hue, source.seed.chroma, source.seed.tone)
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

  const mdc = new MaterialDynamicColors()

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
    buildMdLayer(lightScheme, mdc),
    source.md3TokenOverrides.light,
  )
  const mdDarkBase = applyMd3TokenOverrides(
    buildMdLayer(darkScheme, mdc),
    source.md3TokenOverrides.dark,
  )

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
  // ADR-0028: reuse seedHct.toInt() rather than re-projecting through hex —
  // canonical HCT is the source of truth; the customColor blend reference
  // tracks the engine's in-gamut argb without a redundant hex round-trip.
  const seedArgb = seedHct.toInt()
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

  // why: the algorithmic sequential branch bisects against the md surface
  // family for the 3:1 floor. Under default shadcn bindings `--background` ≡
  // `--color-surface` and `--card` ≡ `--color-surface-container`, so passing
  // the md-side partners is sufficient for the contrast-pair contract today;
  // non-default bindings are at the user's discretion via chart overrides.
  const lightChartPartners: readonly number[] = [
    splitLight.core['--color-surface'] as number,
    splitLight.core['--color-surface-container'] as number,
  ]
  const darkChartPartners: readonly number[] = [
    splitDark.core['--color-surface'] as number,
    splitDark.core['--color-surface-container'] as number,
  ]
  const mdLightChart = buildMdChart(seedHct, lightScheme, 'light', source.chart, lightChartPartners)
  const mdDarkChart = buildMdChart(seedHct, darkScheme, 'dark', source.chart, darkChartPartners)

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
        ...bindShadcn(
          mergedLight,
          source.shadcnRoleBindings.light,
          source.shadcnRoleOverrides.light,
        ),
        ...buildCustomColorsShadcn(customGroups, customMdLight),
      },
      dark: {
        ...bindShadcn(mergedDark, source.shadcnRoleBindings.dark, source.shadcnRoleOverrides.dark),
        ...buildCustomColorsShadcn(customGroups, customMdDark),
      },
      lightChart: applyShadcnChartOverrides(
        rebrandChart(mdLightChart),
        source.shadcnChartOverrides.light,
      ),
      darkChart: applyShadcnChartOverrides(
        rebrandChart(mdDarkChart),
        source.shadcnChartOverrides.dark,
      ),
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

// why: 78 palette tones (13 tones × 6 palettes). Mode/contrast-invariant —
// the palette is a tone ramp; mode picks tones from it. We expose the full
// ramp for inspect UIs (landing showcase, tone-palette swatches) so they can
// render any tone without re-deriving from the seed. Iterates PALETTE_FAMILIES
// so the kebab emission slug and DynamicScheme field stay in lockstep.
function buildMdPalette(scheme: DynamicScheme): TokenMap {
  const out: TokenMap = {}
  for (const { emissionName, schemeField } of PALETTE_FAMILIES) {
    const palette = scheme[schemeField] as DynamicScheme['primaryPalette']
    for (const tone of MD_PALETTE_TONE_NAMES) {
      out[`--color-${emissionName}-${tone}`] = palette.tone(tone)
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

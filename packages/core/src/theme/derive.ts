import {
  argbFromHex,
  type DynamicScheme,
  Hct,
  MaterialDynamicColors,
  customColor as mdCustomColor,
  TonalPalette,
} from '@tonex/mcu'
import { variants } from '../variants'
import { oklchFromArgb, oklchFromHex } from './oklch'
import {
  type CustomColorEntry,
  MD_TOKEN_NAMES,
  type MdTokenName,
  type PortableTheme,
  SHADCN_ROLE_NAMES,
  type ShadcnRoleBindings,
  slugifyCustomColorName,
} from './schema'
import { applySurfaceDesaturate } from './surfaceDesaturate'
import { applySurfaceTint } from './surfaceTint'

// why: emission format is `oklch(L C H)` — shadcn v4 + tailwind v4
// convention. MCU still operates in argb internally; conversion happens at
// THIS module's TokenMap boundary so format.ts stays a pure stringifier.

export type TokenMap = Record<string, string>

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
  md: ResolvedLayer
  shadcn: ResolvedLayer
  warnings: string[]
}

const mdc = new MaterialDynamicColors()

// why: explicit MdTokenName → MCU getter table. Verbose but the mapping is
// the load-bearing fact this module owes its readers — kebab-cased token
// names don't trivially round-trip to camelCase getter names without a rule
// (e.g. `--color-on-surface-variant` → `onSurfaceVariant`), and a transform
// would hide MCU's actual API surface behind string mangling. Adding an md
// token: extend MD_TOKEN_NAMES in schema.ts AND add the resolver here.
// TypeScript's Record<MdTokenName, ...> ensures both move together.
const MD_TOKEN_RESOLVERS: Record<MdTokenName, (s: DynamicScheme) => number> = {
  '--color-primary': (s) => mdc.primary().getArgb(s),
  '--color-on-primary': (s) => mdc.onPrimary().getArgb(s),
  '--color-primary-container': (s) => mdc.primaryContainer().getArgb(s),
  '--color-on-primary-container': (s) => mdc.onPrimaryContainer().getArgb(s),
  '--color-secondary': (s) => mdc.secondary().getArgb(s),
  '--color-on-secondary': (s) => mdc.onSecondary().getArgb(s),
  '--color-secondary-container': (s) => mdc.secondaryContainer().getArgb(s),
  '--color-on-secondary-container': (s) => mdc.onSecondaryContainer().getArgb(s),
  '--color-tertiary': (s) => mdc.tertiary().getArgb(s),
  '--color-on-tertiary': (s) => mdc.onTertiary().getArgb(s),
  '--color-tertiary-container': (s) => mdc.tertiaryContainer().getArgb(s),
  '--color-on-tertiary-container': (s) => mdc.onTertiaryContainer().getArgb(s),
  '--color-error': (s) => mdc.error().getArgb(s),
  '--color-on-error': (s) => mdc.onError().getArgb(s),
  '--color-error-container': (s) => mdc.errorContainer().getArgb(s),
  '--color-on-error-container': (s) => mdc.onErrorContainer().getArgb(s),
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
  '--color-outline': (s) => mdc.outline().getArgb(s),
  '--color-outline-variant': (s) => mdc.outlineVariant().getArgb(s),
}

// why: collapses the prior light/dark dup. Iterates MD_TOKEN_NAMES so every
// schema entry is forced through the resolver — adding a name without a
// resolver is a TS error at the table site, not a silent missing token.
function buildMdLayer(scheme: DynamicScheme): TokenMap {
  const out: TokenMap = {}
  for (const name of MD_TOKEN_NAMES) {
    out[name] = oklchFromArgb(MD_TOKEN_RESOLVERS[name](scheme))
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
export function deriveTheme(source: PortableTheme): DerivedTheme {
  const seedHct = Hct.fromInt(argbFromHex(source.seedHex))
  const variant = variants[source.variant]

  const lightScheme = variant.build(seedHct, false, source.contrastLevel)
  const darkScheme = variant.build(seedHct, true, source.contrastLevel)

  const mdLightBase = applyPrimaryFamily(
    buildMdLayer(lightScheme),
    'light',
    source.primaryHexLock.light,
    source.md3PrimaryContainerOverride.light,
  )
  const mdDarkBase = applyPrimaryFamily(
    buildMdLayer(darkScheme),
    'dark',
    source.primaryHexLock.dark,
    source.md3PrimaryContainerOverride.dark,
  )

  // why: treatment runs BEFORE shadcn binds so any binding pointed at a
  // surface token reflects the treated value automatically. Default
  // surfaceAlgo='none' is the zero-cost branch — drift-guard baseline holds.
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
  const mdLight = { ...treatedLight, ...customMdLight }
  const mdDark = { ...treatedDark, ...customMdDark }

  return {
    md: { light: mdLight, dark: mdDark },
    shadcn: {
      light: {
        ...bindShadcn(treatedLight, source.shadcnRoleBindings.light),
        ...buildCustomColorsShadcn(customGroups, customMdLight),
      },
      dark: {
        ...bindShadcn(treatedDark, source.shadcnRoleBindings.dark),
        ...buildCustomColorsShadcn(customGroups, customMdDark),
      },
    },
    warnings: [],
  }
}

interface ResolvedCustomGroup {
  entry: CustomColorEntry
  slug: string
  group: ReturnType<typeof mdCustomColor>
}

// why: emits 4 md tokens per custom entry from MCU's CustomColorGroup. Tones
// are MCU's choice (40/100/90/10 light, 80/20/30/90 dark) — we just convert
// argb → oklch at the boundary so the layer stays in canonical format.
function buildCustomColorsMd(
  groups: ResolvedCustomGroup[],
  mode: 'light' | 'dark',
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const { slug, group } of groups) {
    const colors = group[mode]
    out[`--color-${slug}`] = oklchFromArgb(colors.color)
    out[`--color-on-${slug}`] = oklchFromArgb(colors.onColor)
    out[`--color-${slug}-container`] = oklchFromArgb(colors.colorContainer)
    out[`--color-on-${slug}-container`] = oklchFromArgb(colors.onColorContainer)
  }
  return out
}

// why: shadcn pair sourced from the SAME mdLayer the rest of derive uses, so
// any value-shifting transforms (none today on custom colors, but in case of
// future sink-side hooks) propagate. Pair selector is per-entry shadcnSource:
// 'color' → --{slug}/--{slug}-foreground ← --color-{slug}/--color-on-{slug};
// 'container' → ← --color-{slug}-container/--color-on-{slug}-container.
function buildCustomColorsShadcn(
  groups: ResolvedCustomGroup[],
  mdLayer: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {}
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

function applyTreatment(layer: TokenMap, mode: 'light' | 'dark', source: PortableTheme): TokenMap {
  if (source.surfaceAlgo === 'tint') return applySurfaceTint(layer, mode, source.surfaceTintLevel)
  if (source.surfaceAlgo === 'desaturate')
    return applySurfaceDesaturate(layer, source.surfaceDesaturateLevel)
  return layer
}

// why: M3 baseline tones for the primary family. When the user pins primary
// to an exact hex, build a TonalPalette from the locked HCT (preserves hue +
// chroma) and read these tones for the derived siblings. Container-override
// still wins over the lock-derived container — overrides are the lower-level
// escape hatch when the auto-derive doesn't match the user's intent.
const PRIMARY_FAMILY_TONES: Record<
  'light' | 'dark',
  { onPrimary: number; container: number; onContainer: number }
> = {
  light: { onPrimary: 100, container: 90, onContainer: 10 },
  dark: { onPrimary: 20, container: 30, onContainer: 90 },
}

// why: applies primary-family overrides + lock to a fully-built md layer.
// Operates by mutation-on-copy so non-primary tokens flow through unchanged.
// Order: container override always lands first; lock (if set) regenerates
// the family from a TonalPalette but yields the container slot back to the
// override if both are present.
function applyPrimaryFamily(
  layer: TokenMap,
  mode: 'light' | 'dark',
  lockedHex: string | null,
  containerOverride: string | null,
): TokenMap {
  const out = { ...layer }
  // why: overrides + locks are STORED as hex (user-facing color pickers emit
  // hex). Convert at the boundary so the layer stays in canonical oklch.
  if (containerOverride !== null) {
    out['--color-primary-container'] = oklchFromHex(containerOverride)
  }
  if (lockedHex !== null) {
    const palette = TonalPalette.fromHct(Hct.fromInt(argbFromHex(lockedHex)))
    const tones = PRIMARY_FAMILY_TONES[mode]
    out['--color-primary'] = oklchFromHex(lockedHex)
    out['--color-on-primary'] = oklchFromArgb(palette.tone(tones.onPrimary))
    out['--color-primary-container'] =
      containerOverride !== null
        ? oklchFromHex(containerOverride)
        : oklchFromArgb(palette.tone(tones.container))
    out['--color-on-primary-container'] = oklchFromArgb(palette.tone(tones.onContainer))
  }
  return out
}

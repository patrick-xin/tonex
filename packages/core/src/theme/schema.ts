import { isValidHex } from '@tonex/color-utils'
import type { DynamicScheme } from '@tonex/mcu'
import * as v from 'valibot'
import {
  CHART_SCHEMES,
  type ChartScheme,
  HUE_ANCHOR_DEFAULT,
  HUE_ANCHORS,
  HUE_SPREAD_DEFAULT,
  type HueAnchor,
  SHADCN_CHART_TOKEN_NAMES,
  type ShadcnChartTokenName,
} from '../chart/schema'
import { type VariantName, variants } from '../variants'
import {
  type CustomColorEntry,
  slugifyCustomColorName,
  validateCustomColorEntry,
} from './custom-color/entry'
import { hctFromHex } from './hct'
import { SHADCN_PRESETS } from './shadcn-presets'
import { NEUTRAL_PALETTE_NAMES, type NeutralPaletteName } from './surface'

// why: CustomColorEntry + slug/validate fns live at ./custom-color/entry post
// #64 — the custom-color slot is a capability folder now. Re-exported here so
// `@tonex/core/schema` consumers keep the existing import surface and the
// outer barrel re-exports the wire-shape contract from a single location.
export { type CustomColorEntry, slugifyCustomColorName, validateCustomColorEntry }

// why: SCHEMA_VERSION pins the persisted PortableTheme shape contract per
// ADR-0009. v2 — ADR-0028 flips the canonical seed from `seedHex: string`
// to `seed: { hue, chroma, tone, exactHex? }`. Pre-launch breaking change
// per memory/feedback_prelaunch_breaking_changes.md: no forward migration
// from v1, persisted v1 records fail schema parse and reset to
// DEFAULT_INPUTS on rehydrate (ADR-0009 c.4). Future bumps follow ADR-
// 0009's procedure: increment SCHEMA_VERSION AND add a forward-migration
// branch in source.ts:migrate when there are live users to preserve.
export const SCHEMA_VERSION = 2 as const
export type SchemaVersion = typeof SCHEMA_VERSION

// why: canonical list of md tokens deriveTheme emits per mode. Used as the
// value-domain of ShadcnRoleBindings — the type system rejects bindings to
// tokens that don't exist. Adding a new md token: extend this list AND
// register a resolver in derive.ts MD_TOKEN_RESOLVERS (both must move
// together; the test suite catches drift).
//
// Order: families grouped, primary first to match M3 spec ordering. Surface
// dim/bright sit between base surface and the container ladder. Outline +
// outline-variant tail. Tertiary family included for md-side completeness
// even though no default shadcn binding currently consumes it — md is its
// own export surface, not just shadcn's substrate.
export const MD_TOKEN_NAMES = [
  '--color-primary',
  '--color-on-primary',
  '--color-primary-container',
  '--color-on-primary-container',
  '--color-primary-fixed',
  '--color-primary-fixed-dim',
  '--color-on-primary-fixed',
  '--color-on-primary-fixed-variant',
  '--color-primary-dim',
  '--color-secondary',
  '--color-on-secondary',
  '--color-secondary-container',
  '--color-on-secondary-container',
  '--color-secondary-fixed',
  '--color-secondary-fixed-dim',
  '--color-on-secondary-fixed',
  '--color-on-secondary-fixed-variant',
  '--color-secondary-dim',
  '--color-tertiary',
  '--color-on-tertiary',
  '--color-tertiary-container',
  '--color-on-tertiary-container',
  '--color-tertiary-fixed',
  '--color-tertiary-fixed-dim',
  '--color-on-tertiary-fixed',
  '--color-on-tertiary-fixed-variant',
  '--color-tertiary-dim',
  '--color-error',
  '--color-on-error',
  '--color-error-container',
  '--color-on-error-container',
  '--color-error-dim',
  '--color-surface',
  '--color-on-surface',
  '--color-on-surface-variant',
  '--color-surface-dim',
  '--color-surface-bright',
  '--color-surface-container-lowest',
  '--color-surface-container-low',
  '--color-surface-container',
  '--color-surface-container-high',
  '--color-surface-container-highest',
  '--color-surface-tint',
  '--color-inverse-surface',
  '--color-inverse-on-surface',
  '--color-inverse-primary',
  '--color-shadow',
  '--color-scrim',
  '--color-outline',
  '--color-outline-variant',
] as const
export type MdTokenName = (typeof MD_TOKEN_NAMES)[number]

// why: ADR-0021 commitment 2 — three-class md partition. MD_TOKEN_NAMES keeps
// its current family-grouped order (the baked globals.css emission order is
// load-bearing for the drift-guard); these subsets partition it by semantics
// class so each consumer reads what it needs. Type unions let role-binding
// editors (slice 7+) statically constrain the editable surface to a tier.
//
// Adding/removing a token: extend MD_TOKEN_NAMES (resolver in derive.ts), then
// place it in either MD_CORE_TOKEN_NAMES or MD_EXTENDED_TOKEN_NAMES. The two
// sets must partition MD_TOKEN_NAMES exhaustively (asserted in schema.test.ts).

export const MD_CORE_TOKEN_NAMES = [
  '--color-primary',
  '--color-on-primary',
  '--color-primary-container',
  '--color-on-primary-container',
  '--color-secondary',
  '--color-on-secondary',
  '--color-secondary-container',
  '--color-on-secondary-container',
  '--color-tertiary',
  '--color-on-tertiary',
  '--color-tertiary-container',
  '--color-on-tertiary-container',
  '--color-error',
  '--color-on-error',
  '--color-error-container',
  '--color-on-error-container',
  '--color-surface',
  '--color-on-surface',
  '--color-on-surface-variant',
  '--color-surface-dim',
  '--color-surface-bright',
  '--color-surface-container-lowest',
  '--color-surface-container-low',
  '--color-surface-container',
  '--color-surface-container-high',
  '--color-surface-container-highest',
  '--color-outline',
  '--color-outline-variant',
] as const satisfies readonly MdTokenName[]
export type MdCoreTokenName = (typeof MD_CORE_TOKEN_NAMES)[number]

export const MD_EXTENDED_TOKEN_NAMES = [
  '--color-primary-fixed',
  '--color-primary-fixed-dim',
  '--color-on-primary-fixed',
  '--color-on-primary-fixed-variant',
  '--color-primary-dim',
  '--color-secondary-fixed',
  '--color-secondary-fixed-dim',
  '--color-on-secondary-fixed',
  '--color-on-secondary-fixed-variant',
  '--color-secondary-dim',
  '--color-tertiary-fixed',
  '--color-tertiary-fixed-dim',
  '--color-on-tertiary-fixed',
  '--color-on-tertiary-fixed-variant',
  '--color-tertiary-dim',
  '--color-error-dim',
  '--color-surface-tint',
  '--color-inverse-surface',
  '--color-inverse-on-surface',
  '--color-inverse-primary',
  '--color-shadow',
  '--color-scrim',
] as const satisfies readonly MdTokenName[]
export type MdExtendedTokenName = (typeof MD_EXTENDED_TOKEN_NAMES)[number]

// why: ADR-0021 commitment 2 — palette tokens expose the full tonal ramp for
// each of MCU's six palettes. Mode/contrast invariant (a palette IS a tone
// ramp; the scheme picks tones from it per mode). 18 tones × 6 palettes = 108.
// Ladder matches Google's Material Theme Builder reference grid 1:1 so the
// inspect UI's swatch column reads identically to the official tool. Naming
// follows the project-wide `--color-{family}-{tone}` convention so palette
// tones live in the same namespace as role tokens (Tailwind v4
// `bg-primary-50` once they're registered in `@theme inline`). Numeric tone
// suffix (`-50`, `-100`) disambiguates from M3 role tokens (`--color-primary-
// container`, etc.) — no collision. Consumed by inspect UIs (landing
// showcase, tone-palette swatches, per-token override editor) via
// useResolvedTokens(); never emitted to DOM by applyDom (data-only per
// commitment 4).
export const MD_PALETTE_TONE_NAMES = [
  0, 5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100,
] as const
export type MdPaletteToneName = (typeof MD_PALETTE_TONE_NAMES)[number]

// why: single canonical table for the six MCU palette families. Each row binds
// the camelCase override key (PaletteName, used by paletteOverrides storage),
// the kebab emission slug (MdPaletteFamilyName, ADR-0021 c.2 — kebab is
// required at the M3 token boundary), and the MCU DynamicScheme field name
// (used by both palette-override/apply.ts and buildMdPalette in derive.ts).
// Adding a new family is a one-row TS-checked addition; previous codebase
// carried two hand-typed lookup tables that could drift.
export const PALETTE_FAMILIES = [
  { paletteName: 'primary', emissionName: 'primary', schemeField: 'primaryPalette' },
  { paletteName: 'secondary', emissionName: 'secondary', schemeField: 'secondaryPalette' },
  { paletteName: 'tertiary', emissionName: 'tertiary', schemeField: 'tertiaryPalette' },
  { paletteName: 'neutral', emissionName: 'neutral', schemeField: 'neutralPalette' },
  {
    paletteName: 'neutralVariant',
    emissionName: 'neutral-variant',
    schemeField: 'neutralVariantPalette',
  },
  { paletteName: 'error', emissionName: 'error', schemeField: 'errorPalette' },
] as const satisfies readonly {
  paletteName: string
  emissionName: string
  schemeField: keyof DynamicScheme
}[]

// why: derived from PALETTE_FAMILIES. The literal union of emission slugs is
// preserved via the indexed-access type below; the runtime array is cast back
// to the narrow readonly type so picklist-style consumers keep their literal
// narrowing.
export type MdPaletteFamilyName = (typeof PALETTE_FAMILIES)[number]['emissionName']
export const MD_PALETTE_FAMILY_NAMES = PALETTE_FAMILIES.map(
  (p) => p.emissionName,
) as readonly MdPaletteFamilyName[]

// why: cross-product the family × tone tuples once at module scope. Adding a
// new tone or family flows through this array (and into derive's emission
// loop) without an explicit name list. The `as const` widens to the full 78-
// element tuple type so MdPaletteTokenName is the exact union.
export const MD_PALETTE_TOKEN_NAMES: readonly string[] = MD_PALETTE_FAMILY_NAMES.flatMap((family) =>
  MD_PALETTE_TONE_NAMES.map((tone) => `--color-${family}-${tone}` as const),
)
export type MdPaletteTokenName = `--color-${MdPaletteFamilyName}-${MdPaletteToneName}`

// why: shadcn-classic role surface. Listed as a const tuple (sibling to
// MD_TOKEN_NAMES) so iteration sites read from one canonical source. Adding
// a role here forces the type to widen, the bindings record to gain the
// key, and every iterator (derive.bindShadcn, globals.css alias bridge,
// testbed UI) to surface the new entry. No --destructive-foreground —
// destructive's contrast partner is already bound via on-error in legacy
// shadcn templates.
export const SHADCN_ROLE_NAMES = [
  '--background',
  '--foreground',
  '--card',
  '--card-foreground',
  '--popover',
  '--popover-foreground',
  '--primary',
  '--primary-foreground',
  '--secondary',
  '--secondary-foreground',
  '--muted',
  '--muted-foreground',
  '--accent',
  '--accent-foreground',
  '--destructive',
  '--border',
  '--input',
  '--ring',
  '--sidebar',
  '--sidebar-foreground',
  '--sidebar-primary',
  '--sidebar-primary-foreground',
  '--sidebar-accent',
  '--sidebar-accent-foreground',
  '--sidebar-border',
  '--sidebar-ring',
] as const
export type ShadcnRoleName = (typeof SHADCN_ROLE_NAMES)[number]

export type ShadcnRoleBindings = Record<ShadcnRoleName, MdTokenName>

// why: re-exported from SHADCN_PRESETS.default.shadcnRoleBindings so the
// default binding map has a single source of truth — the `default` preset.
// Pre-launch this thin re-export keeps callers (drift-guard tests, UI reset
// buttons, applyDom tests) working without import churn while the SSOT
// migrates into the preset library. Asymmetric primary, branded ring, and
// container-style card/popover all flow from the preset definition.
export const DEFAULT_SHADCN_ROLE_BINDINGS: {
  light: ShadcnRoleBindings
  dark: ShadcnRoleBindings
} = SHADCN_PRESETS.default.shadcnRoleBindings

// why: canonical list of MCU's six tonal palettes. Derived from
// PALETTE_FAMILIES (defined above) — that table is the single source binding
// camelCase override key ↔ kebab emission slug ↔ DynamicScheme field. Used
// as the value-domain of paletteOverrides. Adding a new MCU palette: extend
// PALETTE_FAMILIES (TS-checked at all consumers).
export type PaletteName = (typeof PALETTE_FAMILIES)[number]['paletteName']
export const PALETTE_NAMES = PALETTE_FAMILIES.map((p) => p.paletteName) as readonly PaletteName[]

// why: which surface treatment deriveTheme applies post-md-emit. Mutually
// exclusive — composing tint and desaturate isn't a product feature. There is
// no 'none' algo: identity is desaturate at level 0 (chroma multiplier 0 =
// MCU as-is, see surface/desaturate.ts). Drift-guard baseline (globals.css
// === formatCss(deriveTheme(DEFAULT_INPUTS))) holds because applySurfaceDesaturate
// short-circuits at level <= 0 returning the untreated layer byte-for-byte.
export const SURFACE_ALGOS = ['tint', 'desaturate'] as const
export type SurfaceAlgo = (typeof SURFACE_ALGOS)[number]

// why: ADR-0028 — canonical seed shape. HCT axes are the source of truth;
// `exactHex` preserves the user's pasted bytes verbatim across the hex
// round-trip (#3B82F6 would otherwise project to #3B82F4 via MCU's solver).
// Set only on hex-input paths (paste, image extraction, native picker);
// cleared by any HCT-axis setter the moment the user leaves hex-input mode.
// Selector `selectSeedHex(s)` returns `s.seed.exactHex ?? hexFromHct(s.seed)`
// so consumers don't reason about the presence/absence at every read site.
export interface Seed {
  hue: number
  chroma: number
  tone: number
  exactHex?: string
}

// why: PortableTheme is the portable wire shape — what gets serialized to
// localStorage, files, or the network. SourceState (in source.ts) is the
// in-memory shape and equals: PortableTheme − version + _hydrated + actions.
// Keep this minimal in slice 1; future slices add overrides, locks, etc.
export interface PortableTheme {
  version: SchemaVersion
  // why: ADR-0028 — canonical HCT seed with optional exactHex preservation.
  // Supersedes v1's `seedHex: string`. Read via `selectSeedHex(state)` for a
  // hex projection (exporters, applyDom); read `seed.{hue,chroma,tone}`
  // directly for HCT consumers (sliders, gradients) — no `hctFromHex(seedHex)`
  // anywhere in product code.
  seed: Seed
  variant: VariantName
  // why: MCU contrastLevel input — fed straight into variant.build(). Range
  // [0, 1]: 0 is the baseline, 1 is maximum contrast. MCU's spec range is
  // [-1, 1] but the 2025/2026 spec curves (which we use) treat any value
  // < 0 as identical to 0 (every ContrastCurve has `low === normal`) and
  // > 1 saturates at `high`. Schema rejects out-of-range; setter clamps
  // (issue #33).
  contrastLevel: number
  // why: source-input gate, not a per-token snapshot. When true, every
  // seed setter (setSeedHex, setSeedHue/Chroma/Tone) becomes a no-op — one
  // structural gate covers every mutation pathway (hex input, HCT slider,
  // image extraction). Lock is orthogonal to override: locking after setting
  // overrides preserves overrides because they live on different fields.
  // Boolean (not mode-keyed) — locking the seed locks both modes since the
  // seed itself isn't mode-keyed. Field name retained from v1 for API
  // continuity; semantics generalise to "lock the canonical seed."
  seedHexLock: boolean
  // why: per ADR-0017 commitment 3 — mode-keyed `{ light, dark }` at the top,
  // `Record<MdTokenName, hex>` inside. Mirrors the export's `:root + .dark`
  // block structure one-to-one. Partial because most tokens stay at MCU; an
  // entry's presence means "user pinned this token for this mode". null is
  // not a value — clearing is `delete overrides[mode][token]` in the setter.
  // Override beats both MCU and primaryHexLock (lock regenerates the family,
  // overrides land last per derive.ts).
  md3TokenOverrides: {
    light: Partial<Record<MdTokenName, string>>
    dark: Partial<Record<MdTokenName, string>>
  }
  // why: cross-layer mapping is data, not code. Mode-keyed because some
  // slice-7 mappings will diverge across modes (e.g. light primary →
  // primary-container, dark primary → primary for contrast). ADR-0017.
  shadcnRoleBindings: { light: ShadcnRoleBindings; dark: ShadcnRoleBindings }
  // why: ADR-0026 — literal pin on a shadcn role, sibling to bindings.
  // Bindings are symbolic (role → md token, tracks MCU); overrides are
  // literal (role → hex, detached from MCU). Per-mode partial map mirrors
  // md3TokenOverrides modulo the key domain; an entry's presence means
  // "user pinned this role for this mode." Override beats binding AND
  // md3TokenOverrides per c.4 — invoked at the more-specific surface.
  // Empty default keeps drift-guard byte-identical: bindShadcn takes the
  // binding branch for every role.
  shadcnRoleOverrides: {
    light: Partial<Record<ShadcnRoleName, string>>
    dark: Partial<Record<ShadcnRoleName, string>>
  }
  // why: ADR-0027 c.4 — literal pin on a shadcn chart token, sibling to
  // shadcnRoleOverrides on the chart-token domain. Per-mode partial map
  // keyed on SHADCN_CHART_TOKEN_NAMES. Override is terminal and scheme-
  // agnostic: pinned values win post-rebrandChart regardless of
  // chart.scheme. Empty default keeps drift-guard byte-identical (chart
  // emission unchanged when both modes have zero entries).
  shadcnChartOverrides: {
    light: Partial<Record<ShadcnChartTokenName, string>>
    dark: Partial<Record<ShadcnChartTokenName, string>>
  }
  // why: surface treatment is a post-derive transform applied inside
  // deriveTheme so applyDom AND formatCss reflect it identically — preview
  // === export (ADR-0017). `surfaceAlgo` selects which (if any) algorithm
  // runs; the level for the selected algorithm controls strength.
  // - surfacePaletteName: which TW neutral palette feeds the tint base.
  //   Only consumed when surfaceAlgo='tint'. Default 'zinc' preserves the
  //   pre-slice-7 behavior bytewise (algorithm was hardcoded to zinc).
  // - surfaceTintLevel: 0=neutral palette base → 1=full primary character.
  //   Mode-keyed since v7 — independent levels per mode.
  // - surfaceTintTextLevel: opt-in brand accent on on-surface/on-surface-
  //   variant, 0=MCU text → 1=text at the primary's hue+chroma (GH #92).
  //   DECOUPLED from surfaceTintLevel by design so "neutral surfaces +
  //   brand-accented text" is reachable. Only consumed when surfaceAlgo=
  //   'tint'. Default {0,0} keeps the drift-guard baseline byte-identical.
  // - surfaceDesaturateLevel: 0=MCU as-is → 1=chroma stripped. Mode-keyed
  //   since v7. The level=0 short-circuit in applySurfaceDesaturate keeps
  //   the drift-guard baseline byte-identical when both modes are 0.
  surfaceAlgo: SurfaceAlgo
  surfacePaletteName: NeutralPaletteName
  surfaceTintLevel: { light: number; dark: number }
  surfaceTintTextLevel: { light: number; dark: number }
  surfaceDesaturateLevel: { light: number; dark: number }
  // why: user-defined dual-layer color slots (md: 4 tokens, shadcn: 2 tokens
  // sourced per entry.shadcnSource). Empty by default — drift-guard baseline
  // (globals.css === formatCss(deriveTheme(DEFAULT_INPUTS))) holds because
  // an empty array means zero extra emission. Validate via
  // validateCustomColorEntry on add/edit; deriveTheme assumes input is
  // already validated and slug-unique.
  customColors: CustomColorEntry[]
  // why: per-palette hex override map. Replaces the corresponding
  // TonalPalette on the DynamicScheme post-construction; MCU then computes
  // every dependent token using its variant-specific tone choices, so the
  // family-regen stays correct for monochrome / vibrant / expressive (not
  // just tonalSpot). Flat hex (not mode-keyed): a palette is a tone ramp,
  // the scheme reads tones from it per mode. Empty default keeps drift-
  // guard baseline byte-identical. Some entries are conditionally invalid
  // (e.g. tertiary under variant=cmf because CMF's tertiary is driven by
  // a second-source HCT) — see palette-override/disabled-reason.ts. Setter
  // and engine both consult that selector; UI disables the input when the
  // selector returns a reason. Hex format validated at the setter boundary
  // via isValidHex; deriveTheme assumes input is already valid.
  paletteOverrides: Partial<Record<PaletteName, string>>
  // why: optional second source color for the CMF variant. SchemeCmf accepts
  // Hct[]; when an array is passed the second entry becomes the
  // `secondarySourceColorHct`, which (a) reassigns tertiaryPalette to a
  // TonalPalette built from the second hue+chroma and (b) feeds the
  // errorPalette hue via SchemeCmf.getErrorHue(primaryHue, secondHue). null
  // means single-source — MCU's documented fallback is secondHct = seedHct,
  // which the SchemeCmf constructor handles internally. Only the cmf
  // strategy reads this field; non-cmf strategies ignore it. Setter and
  // engine both consult cmfSecondSourceDisabledReason (variant !== 'cmf'
  // disables the field). Hex format validated at the setter boundary via
  // isValidHex.
  cmfSecondSourceHex: string | null
  // why: chart-palette namespace (ADR-0027 c.1). Holds derivation axes that
  // shape the chart token output:
  // - scheme — sequential (default, shadcn convention; primary palette at
  //   contrast-aware tones, variant-aware) or categorical (hue-rotated
  //   synthesis via Hct.from() at fixed chroma/tone, variant-bypassed;
  //   achromatic seed (chroma < 5) falls back to hue 270).
  // - hueSpread — only meaningful under sequential. Degrees of hue rotation
  //   between chart-1 and chart-N. 0 = single-hue (legacy slice-2 default);
  //   default 80 (slice 3) = multi-hue. Bounded [0, 360]; values past ~120
  //   start reading as categorical rather than sequential.
  // - hueAnchor — only meaningful under sequential when hueSpread > 0.
  //   Picks which slot pins to the brand/seed hue; see HUE_ANCHORS docstring.
  // ADR-0024 introduced the axis; ADR-0027 c.2/c.3 reshaped the namespace.
  chart: { scheme: ChartScheme; hueSpread: number; hueAnchor: HueAnchor }
}

// why: DEFAULT_INPUTS is referenced by source initial state, the baked
// globals.css, and the drift-guard test. Changing the seed here means
// regenerating globals.css and re-baselining the drift-guard. exactHex
// is set to the project default '#6750a4' so the hex display reads back
// verbatim even though the HCT axes are the canonical store — same UX
// contract as a user-pasted hex (ADR-0028).
const DEFAULT_SEED_HEX = '#6750a4'
export const DEFAULT_INPUTS: PortableTheme = {
  version: SCHEMA_VERSION,
  seed: { ...hctFromHex(DEFAULT_SEED_HEX), exactHex: DEFAULT_SEED_HEX },
  variant: SHADCN_PRESETS.default.variant,
  contrastLevel: 0,
  seedHexLock: false,
  md3TokenOverrides: { light: {}, dark: {} },
  shadcnRoleBindings: SHADCN_PRESETS.default.shadcnRoleBindings,
  shadcnRoleOverrides: { light: {}, dark: {} },
  shadcnChartOverrides: { light: {}, dark: {} },
  surfaceAlgo: SHADCN_PRESETS.default.surfaceAlgo,
  surfacePaletteName: SHADCN_PRESETS.default.surfacePaletteName,
  surfaceTintLevel: SHADCN_PRESETS.default.surfaceTintLevel,
  surfaceTintTextLevel: SHADCN_PRESETS.default.surfaceTintTextLevel,
  surfaceDesaturateLevel: SHADCN_PRESETS.default.surfaceDesaturateLevel,
  customColors: [],
  paletteOverrides: {},
  cmfSecondSourceHex: null,
  chart: { scheme: 'sequential', hueSpread: HUE_SPREAD_DEFAULT, hueAnchor: HUE_ANCHOR_DEFAULT },
}

// why: ADR-0009 — runtime contract for PortableTheme. Migration ladder lifts
// persisted shape to v10; this schema validates the v10 result post-rehydrate.
// Recovery on failure is all-or-nothing reset to DEFAULT_INPUTS, gated in
// source.ts:onRehydrateStorage. Field-level helpers (isValidHex from
// @tonex/color-utils, validateCustomColorEntry from ./custom-color/entry)
// are reused as refinements so the validation logic has one source of truth.
//
// Cast is safe: `variants` is typed `Record<VariantName, ...>`, so its keys
// are exactly the VariantName union at runtime. Picklist needs a non-empty
// tuple literal type; the cast widens to the form valibot wants without
// changing runtime behavior.
const VARIANT_NAMES = Object.keys(variants) as [VariantName, ...VariantName[]]

const HexSchema = v.pipe(v.string(), v.check(isValidHex, 'invalid hex'))

// why: ADR-0028 — canonical seed shape. Hue allowed inclusive of 360 so a
// slider drag to the wraparound point stores a distinct value from 0 (the
// useHctFromHex hook's prior local cache existed exactly to preserve this
// distinction; with HCT canonical in the store, the schema must allow it).
// MCU's hexFromHct projects 360 and 0 to the same hex — that's the
// collapse point, not a state distinction worth losing. chroma has no
// hard upper bound (MCU's gamut wall is hue+tone dependent; ~150 is a
// soft ceiling at the most chromatic axes); tone is in [0, 100]. exactHex
// is optional and must be a valid hex when present.
const SeedSchema = v.object({
  hue: v.pipe(v.number(), v.minValue(0), v.maxValue(360)),
  chroma: v.pipe(v.number(), v.minValue(0)),
  tone: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
  exactHex: v.optional(HexSchema),
})

const CustomColorEntrySchema = v.pipe(
  v.object({
    id: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    hex: HexSchema,
    blend: v.boolean(),
    shadcnSource: v.picklist(['color', 'container'] as const),
  }),
  // why: validateCustomColorEntry handles slug derivation, reserved-name
  // collision, and hex format. Pass an empty existing-set — slug uniqueness
  // across entries is enforced at the array level below.
  v.check((e) => validateCustomColorEntry(e, new Set()) === null, 'invalid custom color entry'),
)

const CustomColorsSchema = v.pipe(
  v.array(CustomColorEntrySchema),
  v.check((arr) => {
    const slugs = arr.map((e) => slugifyCustomColorName(e.name))
    return new Set(slugs).size === slugs.length
  }, 'duplicate custom color slug'),
)

// why: per-mode partial map of md token → hex. Empty default. valibot's
// v.record constrains keys to MD_TOKEN_NAMES and values to hex; partiality
// is correct because user pins are sparse.
const Md3TokenOverridesPerModeSchema = v.record(v.picklist(MD_TOKEN_NAMES), HexSchema)

// why: exhaustive map — every shadcn role must have a binding for derive's
// bindShadcn lookup to succeed. v.record validates keys and values; the
// trailing v.check enforces all 26 keys present (otherwise rehydrate would
// produce a half-populated map and bindShadcn throws).
const ShadcnRoleBindingsSchema = v.pipe(
  v.record(v.picklist(SHADCN_ROLE_NAMES), v.picklist(MD_TOKEN_NAMES)),
  v.check(
    (rec) => SHADCN_ROLE_NAMES.every((k) => k in rec),
    'shadcn bindings missing required role',
  ),
)

const PaletteOverridesSchema = v.record(v.picklist(PALETTE_NAMES), HexSchema)

// why: ADR-0026 c.3 — per-mode partial map of shadcn role → hex. Empty
// default. v.record constrains keys to SHADCN_ROLE_NAMES and values to
// hex; partiality is correct because user pins are sparse.
const ShadcnRoleOverridesPerModeSchema = v.record(v.picklist(SHADCN_ROLE_NAMES), HexSchema)

// why: ADR-0027 c.4 — per-mode partial map of shadcn chart token → hex.
// Mirrors role-override shape modulo the key domain. v.record constrains
// keys to SHADCN_CHART_TOKEN_NAMES and values to hex; pin sparsity is
// the expected default state.
const ShadcnChartOverridesPerModeSchema = v.record(v.picklist(SHADCN_CHART_TOKEN_NAMES), HexSchema)

const ModeKeyedNumberSchema = v.object({ light: v.number(), dark: v.number() })

export const PortableThemeSchema = v.object({
  version: v.literal(SCHEMA_VERSION),
  seed: SeedSchema,
  variant: v.picklist(VARIANT_NAMES),
  contrastLevel: v.pipe(v.number(), v.minValue(0), v.maxValue(1)),
  seedHexLock: v.boolean(),
  md3TokenOverrides: v.object({
    light: Md3TokenOverridesPerModeSchema,
    dark: Md3TokenOverridesPerModeSchema,
  }),
  shadcnRoleBindings: v.object({
    light: ShadcnRoleBindingsSchema,
    dark: ShadcnRoleBindingsSchema,
  }),
  shadcnRoleOverrides: v.object({
    light: ShadcnRoleOverridesPerModeSchema,
    dark: ShadcnRoleOverridesPerModeSchema,
  }),
  shadcnChartOverrides: v.object({
    light: ShadcnChartOverridesPerModeSchema,
    dark: ShadcnChartOverridesPerModeSchema,
  }),
  surfaceAlgo: v.picklist(SURFACE_ALGOS),
  surfacePaletteName: v.picklist(NEUTRAL_PALETTE_NAMES),
  surfaceTintLevel: ModeKeyedNumberSchema,
  surfaceTintTextLevel: ModeKeyedNumberSchema,
  surfaceDesaturateLevel: ModeKeyedNumberSchema,
  customColors: CustomColorsSchema,
  paletteOverrides: PaletteOverridesSchema,
  cmfSecondSourceHex: v.union([HexSchema, v.null()]),
  chart: v.object({
    scheme: v.picklist(CHART_SCHEMES),
    hueSpread: v.pipe(v.number(), v.minValue(0), v.maxValue(360)),
    hueAnchor: v.picklist(HUE_ANCHORS),
  }),
})

// why: returns a discriminated result instead of throwing — the caller
// (onRehydrateStorage) decides recovery. All-or-nothing: any failure means
// reset to DEFAULT_INPUTS, so we don't surface field-level errors here.
export function parsePortableTheme(
  input: unknown,
): { ok: true; theme: PortableTheme } | { ok: false } {
  const result = v.safeParse(PortableThemeSchema, input)
  if (!result.success) return { ok: false }
  return { ok: true, theme: result.output as PortableTheme }
}

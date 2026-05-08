import * as v from 'valibot'
import { DEFAULT_VARIANT, type VariantName, variants } from '../variants'
import { NEUTRAL_PALETTE_NAMES, type NeutralPaletteName } from './surface'

// why: bumped to 9 — cmfSecondSourceHex added. Optional second source color
// for the CMF variant; SchemeCmf accepts Hct[] and uses the second entry as
// `secondarySourceColorHct`, which feeds the tertiaryPalette (full reassign
// with second hue+chroma) AND the errorPalette (hue picked via a lookup
// over both source hues). Threaded into VariantStrategy.build as an optional
// 4th param; only the cmf strategy reads it. null default = single-source
// build (MCU's documented fallback: second = first), byte-identical to v8.
// Disabled when variant !== 'cmf' (see cmf-second-source.ts); setter and
// engine both consult that selector. Migration v8→v9 fills null.
// v8: paletteOverrides added. Per-palette hex overrides for
// MCU's six tonal palettes (primary, secondary, tertiary, neutral,
// neutralVariant, error). Override applies post-construction by replacing
// the palette field on the DynamicScheme; MCU's variant-specific tone
// choices flow through unchanged so the family-regen is correct for every
// scheme (not just tonalSpot). Flat hex map (not mode-keyed): a palette is
// a tone ramp, the scheme picks tones from it per mode. Empty default
// keeps drift-guard byte-identical. Migration v7→v8 fills `{}`. Closes the
// "family-regen" gap left open when primaryHexLock was pruned in v6 — same
// product need, generalized to all six palettes, lifted from the legacy
// generator's validated implementation.
// v7: surfaceTintLevel and surfaceDesaturateLevel migrated from flat number
// to { light, dark } so a user can edit one mode's level without mutating
// the other. Aligns surfaces with the per-mode shape already used by
// md3TokenOverrides and shadcnRoleBindings. surfaceAlgo and surfacePaletteName
// stay flat: algo is an "open question" per the originating issue (defer
// mode-keying until real usage pressure); palette is a tint *source*, not a
// per-mode value. Migration v6→v7 lifts the flat number into both modes
// (unshipped values stay byte-equal post-migrate).
// v6 (slice 10): primaryHexLock pruned. The half-feature pinned --color-
// primary to a hex and regenerated the family from a TonalPalette;
// md3TokenOverrides covers the pin use case and the family-regen story is
// deferred until a real product need surfaces. Migration v5→v6 deletes the
// persisted field.
// v5 (slice 7): applySurfaceTint generalized from hardcoded zinc to any of
// NEUTRAL_PALETTE_NAMES. New field surfacePaletteName picks the base
// palette; v4→v5 migration fills 'zinc' so existing users see identical
// output (zinc was the prior hardcoded base).
// v4 (slice 6): md3PrimaryContainerOverride (single-token, mode-keyed)
// generalized to md3TokenOverrides (per-token map per mode). Migration
// lifts the persisted hex into md3TokenOverrides[mode][--color-primary-
// container] and drops the old field.
// v3 (slice 3): customColors[] field added to PortableTheme. Persisted v2
// stores have no customColors key; zustand persist shallow-merges, so
// rehydrate would leave the field undefined and any iteration site
// (deriveTheme buildCustomColorsMd) would NPE. Migration fills [].
// v2 (slice 2): md token set expanded 8→28, shadcn roles 2→26 — persisted
// v1 stores only had 2 role bindings; migration spreads defaults under
// persisted bindings so bindShadcn finds every role.
// Future bumps: increment AND extend the migrate function in source.ts.
export const SCHEMA_VERSION = 10 as const
export type SchemaVersion = typeof SCHEMA_VERSION

// why: STORAGE_KEY is the localStorage key, not a schema-version indicator.
// The trailing `-v1` is pinned for migration continuity — zustand keys storage
// by this name and runs `migrate` against whatever's at this key. Renaming
// would orphan every existing user's persisted state. SCHEMA_VERSION (above)
// is the version axis; this constant must NOT track it.
export const STORAGE_KEY = 'tonex-theme-v1' as const

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

// why: ADR-0021 commitment 2 — chart tokens are derived from the primary
// palette via a fixed 5-tone mapping. Mode-aware (mirrors core role tokens),
// not contrast-invariant. Names match the shadcn convention prefixed with
// `--color-` so they line up with Tailwind v4 utility resolution.
export const MD_CHART_TOKEN_NAMES = [
  '--color-chart-1',
  '--color-chart-2',
  '--color-chart-3',
  '--color-chart-4',
  '--color-chart-5',
] as const
export type MdChartTokenName = (typeof MD_CHART_TOKEN_NAMES)[number]

// why: shadcn-side chart names mirror the prevailing shadcn convention
// (`--chart-1` … `--chart-5`). Values are sourced from the same primary
// palette tones — chart is one underlying domain, surfaced under each
// layer's namespace.
export const SHADCN_CHART_TOKEN_NAMES = [
  '--chart-1',
  '--chart-2',
  '--chart-3',
  '--chart-4',
  '--chart-5',
] as const
export type ShadcnChartTokenName = (typeof SHADCN_CHART_TOKEN_NAMES)[number]

// why: chart-color derivation has two shapes by intent. `mono` reads the
// scheme's primary palette at fixed tones (variant-aware — Vibrant /
// Expressive / Rainbow flavor flows through). `multi` synthesizes 5 hue-
// rotated points via Hct.from() at fixed chroma + tone (variant-bypassed —
// hue rotation is the whole point). shadcn's default is mono; multi is
// opt-in for dashboards that want maximum series separation. ADR-0024.
export const CHART_MODES = ['mono', 'multi'] as const
export type ChartMode = (typeof CHART_MODES)[number]

// why: ADR-0021 commitment 2 — palette tokens expose the full tonal ramp for
// each of MCU's six palettes. Mode/contrast invariant (a palette IS a tone
// ramp; the scheme picks tones from it per mode). 13 tones × 6 palettes = 78.
// Naming follows Material 3's `--md-ref-palette-{palette}-{tone}` so users
// recognise the convention. Consumed by inspect UIs (landing showcase, tone-
// palette swatches, per-token override editor) via useResolvedTokens(); never
// emitted to DOM by applyDom (data-only per commitment 4).
export const MD_PALETTE_TONE_NAMES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100] as const
export type MdPaletteToneName = (typeof MD_PALETTE_TONE_NAMES)[number]

export const MD_PALETTE_FAMILY_NAMES = [
  'primary',
  'secondary',
  'tertiary',
  'neutral',
  'neutral-variant',
  'error',
] as const
export type MdPaletteFamilyName = (typeof MD_PALETTE_FAMILY_NAMES)[number]

// why: cross-product the family × tone tuples once at module scope. Adding a
// new tone or family flows through this array (and into derive's emission
// loop) without an explicit name list. The `as const` widens to the full 78-
// element tuple type so MdPaletteTokenName is the exact union.
export const MD_PALETTE_TOKEN_NAMES: readonly string[] = MD_PALETTE_FAMILY_NAMES.flatMap((family) =>
  MD_PALETTE_TONE_NAMES.map((tone) => `--md-ref-palette-${family}-${tone}` as const),
)
export type MdPaletteTokenName = `--md-ref-palette-${MdPaletteFamilyName}-${MdPaletteToneName}`

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

// why: default light bindings — lifted from legacy tonex's MD3_ROLE_MAP.
// Structurally significant pairings:
//   - card → surface-dim (light) / surface-bright (dark) — cards float
//     darker than surface in light mode, lighter in dark mode.
//   - popover → surface (light) / surface-container (dark) — same intent.
//   - sidebar-foreground → on-surface (light) / on-surface-variant (dark) —
//     softer text on dark sidebars.
// border = input = ring = outline by design — outline is M3's edge token
// and shadcn's three edge roles all want the same value at default.
const DEFAULT_SHADCN_BINDINGS_LIGHT: ShadcnRoleBindings = {
  '--background': '--color-surface',
  '--foreground': '--color-on-surface',
  '--card': '--color-surface-dim',
  '--card-foreground': '--color-on-surface',
  '--popover': '--color-surface',
  '--popover-foreground': '--color-on-surface',
  '--primary': '--color-primary-container',
  '--primary-foreground': '--color-on-primary-container',
  '--secondary': '--color-secondary-container',
  '--secondary-foreground': '--color-on-secondary-container',
  '--muted': '--color-surface-container-high',
  '--muted-foreground': '--color-on-surface-variant',
  '--accent': '--color-surface-container-high',
  '--accent-foreground': '--color-on-surface',
  '--destructive': '--color-error',
  '--border': '--color-outline',
  '--input': '--color-outline',
  '--ring': '--color-outline',
  '--sidebar': '--color-surface-container-low',
  '--sidebar-foreground': '--color-on-surface',
  '--sidebar-primary': '--color-primary',
  '--sidebar-primary-foreground': '--color-on-primary',
  '--sidebar-accent': '--color-surface-container-highest',
  '--sidebar-accent-foreground': '--color-on-surface',
  '--sidebar-border': '--color-outline',
  '--sidebar-ring': '--color-outline',
}

// why: dark mode diverges from light only on the three asymmetric pairings
// above. Spread + override keeps the delta visible at a glance and prevents
// the two maps from silently drifting on edits — adding a key to LIGHT
// flows through DARK automatically.
const DEFAULT_SHADCN_BINDINGS_DARK: ShadcnRoleBindings = {
  ...DEFAULT_SHADCN_BINDINGS_LIGHT,
  '--card': '--color-surface-bright',
  '--popover': '--color-surface-container',
  '--sidebar-foreground': '--color-on-surface-variant',
}

export const DEFAULT_SHADCN_ROLE_BINDINGS: {
  light: ShadcnRoleBindings
  dark: ShadcnRoleBindings
} = {
  light: DEFAULT_SHADCN_BINDINGS_LIGHT,
  dark: DEFAULT_SHADCN_BINDINGS_DARK,
}

// why: customColors are first-class dual-layer entries — they emit their
// own md tokens (4 per entry: --color-{slug}, --color-on-{slug}, --color-
// {slug}-container, --color-on-{slug}-container) AND their own shadcn
// tokens (2 per entry: --{slug}, --{slug}-foreground), all derived from a
// single user-supplied hex via MCU's customColor(). They do NOT participate
// in shadcnRoleBindings — the role surface stays closed at SHADCN_ROLE_NAMES.
// `id` is the stable CRUD identity; `name` is freely editable and the slug
// is derived from it at emission time. `shadcnSource` picks which md pair
// feeds the shadcn pair: 'color' → --{slug} ← --color-{slug}; 'container'
// → --{slug} ← --color-{slug}-container (foreground follows the on-* twin).
export interface CustomColorEntry {
  id: string
  name: string
  description?: string
  hex: string
  blend: boolean
  shadcnSource: 'color' | 'container'
}

// why: slug derives from name. Lowercase, non-alphanumeric runs collapse to
// a single dash, edge dashes trimmed. Renaming is allowed (standard CRUD on
// id) — consumers of the OLD slug in exported CSS will break, by design;
// docs flag this. Empty slug after slugification is a validation failure.
export function slugifyCustomColorName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// why: any kebab name a custom-color slug would emit MUST NOT collide with
// an existing md token or shadcn role. Two collision sources: (1) the slug
// itself maps to --color-{slug} (md) AND --{slug} (shadcn), so we derive
// each blocked-slug from the kebab token name minus its `--color-`/`--`
// prefix; (2) the partner tokens we auto-emit (`--color-on-{slug}`,
// `--color-{slug}-container`, `--{slug}-foreground`) would collide if the
// user picks a slug starting with `on-` or ending in `-container` /
// `-foreground` — those patterns are blocked outright as a slug.
const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  ...MD_TOKEN_NAMES.map((t) => t.slice('--color-'.length)),
  ...SHADCN_ROLE_NAMES.map((t) => t.slice('--'.length)),
])

// why: returns null on success, an error message on failure. Caller decides
// whether to throw, surface in UI, or both. `existingSlugs` lets the
// caller exclude self when validating an edit (compare by id, gather slugs
// of the OTHER entries). Pure, no I/O — UI and store both call this.
export function validateCustomColorEntry(
  entry: { name: string; hex: string },
  existingSlugs: ReadonlySet<string>,
): string | null {
  const slug = slugifyCustomColorName(entry.name)
  if (slug.length === 0) return 'name must contain at least one alphanumeric character'
  if (slug.startsWith('on-'))
    return `name cannot produce a slug starting with "on-" (got "${slug}")`
  if (slug.endsWith('-container'))
    return `name cannot produce a slug ending with "-container" (got "${slug}")`
  if (slug.endsWith('-foreground'))
    return `name cannot produce a slug ending with "-foreground" (got "${slug}")`
  if (RESERVED_SLUGS.has(slug)) return `name "${slug}" collides with a reserved md or shadcn token`
  if (existingSlugs.has(slug)) return `name "${slug}" duplicates an existing custom color`
  if (!/^#[0-9a-fA-F]{6}$/.test(entry.hex)) return `hex must be a 6-digit "#rrggbb" value`
  return null
}

// why: canonical list of MCU's six tonal palettes. Each entry corresponds
// to a `*Palette` field on DynamicScheme that drives a family of md tokens
// (primary → primary/onPrimary/primary-container/on-primary-container; the
// neutral pair drives surface + outline). Order matches MCU's emission
// order in the spec — primary first, error last. Used as the value-domain
// of paletteOverrides AND as the iteration source in apply.ts so adding /
// removing a palette is a one-line edit. Adding a new MCU palette: extend
// this tuple AND add a mutation case in palette-override/apply.ts (both
// must move together; the type system enforces it via the Record type).
export const PALETTE_NAMES = [
  'primary',
  'secondary',
  'tertiary',
  'neutral',
  'neutralVariant',
  'error',
] as const
export type PaletteName = (typeof PALETTE_NAMES)[number]

// why: which surface treatment deriveTheme applies post-md-emit. Mutually
// exclusive — composing tint and desaturate isn't a product feature. There is
// no 'none' algo: identity is desaturate at level 0 (chroma multiplier 0 =
// MCU as-is, see surface/desaturate.ts). Drift-guard baseline (globals.css
// === formatCss(deriveTheme(DEFAULT_INPUTS))) holds because applySurfaceDesaturate
// short-circuits at level <= 0 returning the untreated layer byte-for-byte.
export const SURFACE_ALGOS = ['tint', 'desaturate'] as const
export type SurfaceAlgo = (typeof SURFACE_ALGOS)[number]

// why: PortableTheme is the portable wire shape — what gets serialized to
// localStorage, files, or the network. SourceState (in source.ts) is the
// in-memory shape and equals: PortableTheme − version + _hydrated + actions.
// Keep this minimal in slice 1; future slices add overrides, locks, etc.
export interface PortableTheme {
  version: SchemaVersion
  seedHex: string
  variant: VariantName
  // why: MCU contrastLevel input — fed straight into variant.build(). Range
  // -1..1 per MCU spec; 0 is the baseline. Drives tone offsets across all
  // dynamic colors, so changing it shifts every md token in lockstep.
  contrastLevel: number
  // why: source-input gate, not a per-token snapshot. When true, setSeedHex
  // becomes a no-op — pathways that mutate the seed (hex input, HCT slider,
  // image extraction) all flow through the same setter. Lock is orthogonal
  // to override: locking after setting overrides preserves overrides because
  // they live on different fields. Boolean (not mode-keyed) — locking the
  // seed locks both modes since seedHex itself isn't mode-keyed.
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
  // why: surface treatment is a post-derive transform applied inside
  // deriveTheme so applyDom AND formatCss reflect it identically — preview
  // === export (ADR-0017). `surfaceAlgo` selects which (if any) algorithm
  // runs; the level for the selected algorithm controls strength.
  // - surfacePaletteName: which TW neutral palette feeds the tint base.
  //   Only consumed when surfaceAlgo='tint'. Default 'zinc' preserves the
  //   pre-slice-7 behavior bytewise (algorithm was hardcoded to zinc).
  // - surfaceTintLevel: 0=neutral palette base → 1=full primary character.
  //   Mode-keyed since v7 — independent levels per mode.
  // - surfaceDesaturateLevel: 0=MCU as-is → 1=chroma stripped. Mode-keyed
  //   since v7. The level=0 short-circuit in applySurfaceDesaturate keeps
  //   the drift-guard baseline byte-identical when both modes are 0.
  surfaceAlgo: SurfaceAlgo
  surfacePaletteName: NeutralPaletteName
  surfaceTintLevel: { light: number; dark: number }
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
  // why: chart-color derivation axis. 'mono' (default, shadcn convention)
  // reads the primary palette at fixed tones — variant-aware. 'multi' rotates
  // hue around the seed at fixed chroma/tone — variant-bypassed by design.
  // Achromatic seed (chroma < 5) under multi falls back to hue 270 so a gray
  // seed still produces a colorful series. ADR-0024.
  chartMode: ChartMode
}

// why: DEFAULT_INPUTS is referenced by source initial state, the baked
// globals.css, and the drift-guard test. Changing seedHex here means
// regenerating globals.css and re-baselining the drift-guard.
export const DEFAULT_INPUTS: PortableTheme = {
  version: SCHEMA_VERSION,
  seedHex: '#6750a4',
  variant: DEFAULT_VARIANT,
  contrastLevel: 0,
  seedHexLock: false,
  md3TokenOverrides: { light: {}, dark: {} },
  shadcnRoleBindings: DEFAULT_SHADCN_ROLE_BINDINGS,
  surfaceAlgo: 'desaturate',
  surfacePaletteName: 'zinc',
  surfaceTintLevel: { light: 0, dark: 0 },
  surfaceDesaturateLevel: { light: 0, dark: 0 },
  customColors: [],
  paletteOverrides: {},
  cmfSecondSourceHex: null,
  chartMode: 'mono',
}

// why: shared 6-digit hex predicate. Used by validateCustomColorEntry's
// inline check pattern and by the paletteOverride setter. Centralizing
// avoids two regex literals drifting on case/format rules.
export function isValidHex(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex)
}

// why: ADR-0009 — runtime contract for PortableTheme. Migration ladder lifts
// persisted shape to v10; this schema validates the v10 result post-rehydrate.
// Recovery on failure is all-or-nothing reset to DEFAULT_INPUTS, gated in
// source.ts:onRehydrateStorage. Field-level helpers (isValidHex,
// validateCustomColorEntry) are reused as refinements so the validation
// logic has one source of truth.
//
// Cast is safe: `variants` is typed `Record<VariantName, ...>`, so its keys
// are exactly the VariantName union at runtime. Picklist needs a non-empty
// tuple literal type; the cast widens to the form valibot wants without
// changing runtime behavior.
const VARIANT_NAMES = Object.keys(variants) as [VariantName, ...VariantName[]]

const HexSchema = v.pipe(v.string(), v.check(isValidHex, 'invalid hex'))

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

const ModeKeyedNumberSchema = v.object({ light: v.number(), dark: v.number() })

export const PortableThemeSchema = v.object({
  version: v.literal(SCHEMA_VERSION),
  seedHex: HexSchema,
  variant: v.picklist(VARIANT_NAMES),
  contrastLevel: v.number(),
  seedHexLock: v.boolean(),
  md3TokenOverrides: v.object({
    light: Md3TokenOverridesPerModeSchema,
    dark: Md3TokenOverridesPerModeSchema,
  }),
  shadcnRoleBindings: v.object({
    light: ShadcnRoleBindingsSchema,
    dark: ShadcnRoleBindingsSchema,
  }),
  surfaceAlgo: v.picklist(SURFACE_ALGOS),
  surfacePaletteName: v.picklist(NEUTRAL_PALETTE_NAMES),
  surfaceTintLevel: ModeKeyedNumberSchema,
  surfaceDesaturateLevel: ModeKeyedNumberSchema,
  customColors: CustomColorsSchema,
  paletteOverrides: PaletteOverridesSchema,
  cmfSecondSourceHex: v.union([HexSchema, v.null()]),
  chartMode: v.picklist(CHART_MODES),
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

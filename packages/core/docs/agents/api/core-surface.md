# Core surface

What `@tonex/core` exposes, by subpath. Read this before importing in `apps/www/` so you don't have to walk core's source to find what's already there. If your need isn't listed, the answer is usually compose in a www feature folder (ADR-0022 rule 5), not extend core.

## Subpaths

The package has five entry points (`packages/core/package.json` `exports`):

| Import path | What's in it | When to reach for it |
| --- | --- | --- |
| `@tonex/core` | engine + React adapters | derive, apply, read theme; HCT helpers; `Mode` |
| `@tonex/core/schema` | types, constants, validators | token names, palette types, schema parsing |
| `@tonex/core/oklch` | color-space conversion | hex ↔ oklch round-trips, luminance |
| `@tonex/core/data` | static palette tables | Tailwind palette, neutral palette names |
| `@tonex/core/variants` | variant strategies + registry | inspect/list variants in UI |

Subpaths are split so each has an independent reason-to-grow. Adding a schema field doesn't widen the engine surface; adding a variant doesn't touch the schema barrel.

## `@tonex/core` — engine

The live theme pipeline. Most www code imports from here.

**React adapters**:
- `useResolvedTokens()` — derived layer output. Returns `null` while the source store is unhydrated. Consumers MUST handle the null per ADR-0015. Canonical read for theme-aware UI.
- `useSource(selector)` — store reader for *source* state (inputs, overrides). Selector required.

**Derive / sinks**:
- `deriveTheme(source)` — pure function, source → `DerivedTheme`. Single colour-logic site (ADR-0017).
- `applyDom()` — DOM sink; no args. Reads the singleton source store (`useSource.getState()`) and re-renders on `useSource.subscribe(...)`; returns an unsubscribe. Writes a single shared `<style id="tonex-tokens">` in `document.head` with four fixed class-scoped rules (`.md`, `html.dark .md`, `.shadcn`, `html.dark .shadcn`) — not `:root`. SSR-safe (no-op when `window` is undefined); only writes once `_hydrated` (ADR-0015). No colour logic here.
- `exportCss(theme, opts)` — CSS string export. Siblings `exportDart`, `exportJson`, `exportNativeCss` emit the same bundle in their formats (the export dialog's format tabs).
- `formatCss`, `formatLayer` — formatting helpers.
- `buildContrastBundle(input)` — paired light/dark contrast bundle.
- `evaluateThemeContrast(theme, customColors?)` → `ContrastReport` (`{ light, dark }` of `PairResult`) — pure contrast analysis over a `DerivedTheme`, off the spine (ADR-0025 c.8). Backs the role-editor contrast surfaces; `PairResult` is one fg/bg result.
- `previewCustomColor(input)` → `CustomColorPreview` (`{ light, dark }` of `CustomColorPreviewRoles`) — preview a custom colour's MD roles without committing to source.

**HCT primitives**:
- `hctFromHex`, `hexFromHct`, `maxChroma`, `CHROMA_HUE_LOCK`, type `HctTriplet` — used by editor-rail and palette pickers.

**Mode** (per ADR-0016, do NOT inline `'light' | 'dark'` in www):
- `MODES` — tuple `['light', 'dark']`.
- `Mode` — type `'light' | 'dark'`.

**Source store selectors / internals**:
- `selectSeedHex(state)` — canonical seed→hex projection (`seed.exactHex ?? hexFromHct(seed)`, ADR-0028). Use this for the seed's hex; never `hctFromHex` a stored hex in product code.
- `selectHydrated(state)` — the source-hydration gate (`_hydrated`). Named home for gating that needs source state before any token derives (export availability, picker inputs); never read `_hydrated` directly (ADR-0015 amendment 2026-05-25).
- `selectPortable(state)`, `flushPersist()`, types `SourceActions`, `SourceState` — reach for only when writing store glue.

**Layer / token types**:
- `DerivedTheme`, `MdLayer`, `ResolvedLayer`, `ShadcnLayer`, `TokenMap`.
- `ExportLayer`, `ExportOptions`, `ContrastBundle`.

**Chart sequential** (ADR-0027 prototype surface; consumed by the throwaway `chart-lab` dev page):
- `buildSequentialReport(source, partners, params)` → `{ light, dark }` of `SequentialModeOutput` — monotonic-sequential chart anchors walked toward their binding partners until contrast holds.
- `HueAnchor` / `HUE_ANCHOR_DEFAULT` (`'chart-1'`) — which anchor keeps the brand hue.
- `HUE_SPREAD_DEFAULT`, `PROMINENT_EDGE_LIGHT_DEFAULT` (40), `PROMINENT_EDGE_DARK_DEFAULT` (60) — tuning defaults. `HUE_SPREAD_DEFAULT` is *also* exported from `@tonex/core/schema`; www imports it via both paths.

**Other**:
- `sourceColorHexFromImage(file)` — extract dominant colour from an uploaded image.
- `applySurfaceTint`, `applySurfaceDesaturate` — post-MCU transforms; `derive.ts` dispatches into them, callers rarely need them directly.

## `@tonex/core/schema` — types + constants

Pure types, frozen tuples, validators. Free to import widely; cheap.

**Token-name tuples** (frozen `as const`; the type is the union of literals):
- `MD_CORE_TOKEN_NAMES` → `MdCoreTokenName` (28 core MD tokens)
- `MD_EXTENDED_TOKEN_NAMES` → `MdExtendedTokenName`
- `MD_TOKEN_NAMES` → `MdTokenName` (full union — core ∪ extended)
- `MD_PALETTE_TOKEN_NAMES`, `MD_PALETTE_FAMILY_NAMES`, `MD_PALETTE_TONE_NAMES`
- `MD_CHART_TOKEN_NAMES` → `MdChartTokenName`
- `SHADCN_ROLE_NAMES` → `ShadcnRoleName`
- `SHADCN_CHART_TOKEN_NAMES` → `ShadcnChartTokenName`

**Gotcha — narrow-tuple `.includes`**: `MD_CORE_TOKEN_NAMES.includes(x)` infers `searchElement` as the *narrow* `MdCoreTokenName`, so it rejects wider `MdTokenName` values. Fix by hoisting `const SET: ReadonlySet<MdTokenName> = new Set(MD_CORE_TOKEN_NAMES)` and using `SET.has(x)` (also O(1)). Pattern in `features/color-roles-list/color-roles-list.tsx`.

**Other constants / types**:
- `DEFAULT_INPUTS`, `DEFAULT_SHADCN_ROLE_BINDINGS`
- `CHART_MODES` / `ChartMode`, `SURFACE_ALGOS` / `SurfaceAlgo`
- `PALETTE_NAMES` / `PaletteName`, `PALETTE_FAMILIES`
- `STORAGE_KEY`, `SCHEMA_VERSION`, `SchemaVersion`
- `PortableTheme`, `Seed` (canonical HCT seed + optional `exactHex`, ADR-0028), `PortableThemeSchema`, `parsePortableTheme`
- `ShadcnRoleBindings`, `CustomColorEntry`

**Disabled-reason helpers** (`string | null`; UI uses for tooltips on disabled inputs):
- `cmfSecondSourceDisabledReason(...)`
- `paletteOverrideDisabledReason(...)`

**Custom-color helpers**: `slugifyCustomColorName`, `validateCustomColorEntry`, `isValidHex`.

**Shadcn presets** (`theme/shadcn-presets`, `theme/preset-apply`; ADR-0031):
- `SHADCN_PRESETS` / `ShadcnPresetName`, type `ShadcnPreset` — curated theme-bundle presets (aesthetic recipe + curated source inputs).
- `findActivePreset(...)` — match current source against a preset by *recipe* fields only (never source inputs).
- `resolvePresetApply(...)` with `PresetAdoptChoices` (`{ seed?, contrast? }`) — pure resolver for what an apply adopts.

**Contrast (schema-level)**: `CONTRAST_PAIRS` / type `ContrastPair` — the static fg/bg pair definitions `evaluateThemeContrast` walks.

**Chart schema fragments**: `CHART_SCHEMES` / `ChartScheme`, `HUE_ANCHORS` / `HueAnchor`, `HUE_ANCHOR_DEFAULT`, `HUE_SPREAD_DEFAULT` (the chart token tuples above live here too). `HUE_*` are re-exported through the engine barrel as well — see Chart sequential above.

## `@tonex/core/oklch` — conversion

Boundary helpers for the argb-canonical `TokenMap` (ADR-0021). Project at the read site rather than storing a projected value.

- `hexString(argb)` — argb → `'#rrggbb'`. Default for swatches and CSS-var output.
- `argbFromHex(hex)` — hex → argb. Inverse of `hexString`; the hex→argb boundary primitive for read-sites that take a hex literal (swatch luminance, palette previews). Routes through the ADR-0025 firewall so www never imports `@tonex/mcu` directly.
- `oklchString(argb)` — argb → `'oklch(...)'` CSS string.
- `hexFromOklch({ l, c, h })` — hex from an oklch triple (oklch-input controls).
- `argbComponents(argb)` — `{ r, g, b, a }` 0–255.
- `relativeLuminance(argb)` — for contrast calculations.

## `@tonex/core/data` — static palettes

Value tables. No algorithms.

- `TAILWIND_PALETTE_OKLCH` — Tailwind's default palette in oklch. Backs the TW palette picker.
- `NEUTRAL_PALETTE_NAMES` → `NeutralPaletteName` — named neutral options.

## `@tonex/core/variants` — variant strategies

The variant registry; usually only inspect / picker UIs care.

- `variants` — registry record, key → `VariantStrategy`.
- `VariantName` — `keyof typeof variants`.
- `DEFAULT_VARIANT` — `'cmf'`.
- `VARIANT_GROUPS_ORDERED` — render order for the variant picker's optgroups.
- Types: `VariantGroup`, `VariantStrategy`.

Individual strategy files (`tonalSpot`, `vibrant`, …) are not exported. `derive.ts` looks them up via `variants[source.variant]`. Don't reach into a strategy file from www.

## What is *not* in core

Common reaches that belong in www, not core:

- **`useThemeToggle`, `useActiveMode`, `useSetMode`** — `apps/www/src/features/theme-mode/`. The only files allowed to import from `next-themes` (ADR-0015 amendment 2026-05-09).
- **Contrast utilities, role groupings, role-editor logic** — `apps/www/src/features/color-roles-list/`.
- **Export job UI / wiring** — `apps/www/src/features/export-*/`.

Pattern: when you find yourself composing 2–3 core hooks plus null-handling across multiple components, lift the composition into a feature folder hook (per ADR-0022 rule 5). Don't re-export core from a generic www barrel.

## When this doc is wrong

Hand-curated index. If `rg "from '@tonex/core" apps/www/src` shows an import that isn't listed here, this doc is stale — update it. If you need something that *should* exist and doesn't, the gap belongs in core; flag it before working around it in www.

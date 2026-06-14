# Core surface

What `@tonex/core` (the pure engine) and `@tonex/core-react` (the editor runtime) expose, by subpath. **Read this before importing `@tonex/core` in any consumer** — `apps/www`, the `tonex` CLI, `@tonex/core-react`, a future MCP server — so you don't have to walk the source to find what's already there. If your need isn't listed: in www, compose it in a feature folder (ADR-0022 rule 5); in any other consumer, if it's engine behaviour the gap belongs in core — add it there first, then import (ADR-0016). Either way **don't re-derive, re-encode, or re-score in the consumer** — that logic, and its contrast/encoding guarantees, lives here.

**The split (ADR-0037):** `@tonex/core` is framework-free — no React, no zustand, no DOM. The stateful editor runtime (the source store, the `useResolvedTokens` hook, `applyDom`, persistence) lives in `@tonex/core-react`, which depends one-way on `@tonex/core`. www imports pure symbols from `@tonex/core` (+ its subpaths) and stateful symbols from `@tonex/core-react`.

## Subpaths

`@tonex/core` has eight entry points (`packages/core/package.json` `exports`):

| Import path | What's in it | When to reach for it |
| --- | --- | --- |
| `@tonex/core` | pure engine | derive, export, read theme; HCT helpers; `Mode`; `selectSeedHex` |
| `@tonex/core/schema` | types, constants, validators | token names, palette types, schema parsing |
| `@tonex/core/oklch` | color-space conversion | hex ↔ oklch round-trips, luminance |
| `@tonex/core/data` | static palette tables | Tailwind palette, neutral palette names |
| `@tonex/core/variants` | variant strategies + registry | inspect/list variants in UI |
| `@tonex/core/derive-cache` | memoized `getDerivedTheme` | the editor runtime's shared derive cache; www almost never imports it directly |
| `@tonex/core/audit` | WCAG contrast verdict layer | gate a theme (`auditTheme`) or any pair list (`auditPairs`); the per-pair helpers (`applyLevel`, `resultOf`, `summarizeContrast`, `isDecorative`) the www contrast checker consumes |
| `@tonex/core/adjust` | relative ±HCT token adjustment | `adjustTokens` returns per-token before/after/achieved facts; `applyAdjustments` persists them into `md3TokenOverrides`. Leaf primitive `shiftHct` (tone+chroma shift) lives here too |

`@tonex/core-react` has one entry point (`.`) — see its section below.

Subpaths are split so each has an independent reason-to-grow. Adding a schema field doesn't widen the engine surface; adding a variant doesn't touch the schema barrel.

## `@tonex/core` — pure engine

The live theme pipeline, framework-free. Most www code imports from here.

**Derive / export**:
- `deriveTheme(source)` — pure function, source → `DerivedTheme`. Single colour-logic site (ADR-0017).
- `exportCss(theme, opts)` — CSS string export. Siblings `exportDart`, `exportJson`, `exportNativeCss` emit the same bundle in their formats (the export dialog's format tabs).
- `exportColorsJson(source, bundle, opts)` / `buildColorsJson(...)` → `ColorsJson` — tonex's **canonical** `colors.json`: a recipe header (`seed` / `variant` / `contrast` / `surface` / `format`) plus both-mode role values (full `MD_TOKEN_NAMES` roster, mode-major, kebab keys), encoded per `opts.colorFormat`. This is the artifact the skill projects FROM (ADR-0039 Decision 7), distinct from the foreign-projection sinks (`exportDesignMd`, `exportJson`) that reshape the same theme INTO a competitor's vocabulary. Surfaced as `tonex generate --to colors`.
- `COLOR_FORMATS` / `ColorFormat` — the colour-encoding tuple `ExportOptions.colorFormat` accepts (`'oklch'` default, `'hex'`). Projection happens at the exporter stringify seam (ADR-0021); a consumer surfacing the choice (the CLI's `--format`) imports the *tuple* for its values rather than re-inlining the union (ADR-0016).
- `formatCss`, `formatLayer` — formatting helpers.
- `buildContrastBundle(input)` — paired light/dark contrast bundle.
- `evaluateThemeContrast(theme, customColors?)` → `ContrastReport` (`{ light, dark }` of `PairResult`) — pure contrast analysis over a `DerivedTheme`, off the spine (ADR-0025 c.8). Backs the role-editor contrast surfaces; `PairResult` is one fg/bg result.
- `previewCustomColor(input)` → `CustomColorPreview` (`{ light, dark }` of `CustomColorPreviewRoles`) — preview a custom colour's MD roles without committing to source.

**HCT primitives**:
- `hctFromHex`, `hexFromHct`, `maxChroma`, `CHROMA_HUE_LOCK`, type `HctTriplet` — used by editor-rail and palette pickers.

**Mode** (per ADR-0016, do NOT inline `'light' | 'dark'` in www):
- `MODES` — tuple `['light', 'dark']`.
- `Mode` — type `'light' | 'dark'`.

**Seed projection** (pure):
- `selectSeedHex(state)` — canonical seed→hex projection (`seed.exactHex ?? hexFromHct(seed)`, ADR-0028). Pure; operates on any `{ seed }`, so a CLI/SDK calls it without the store (ADR-0016). Use this for the seed's hex; never `hctFromHex` a stored hex in product code. (The store-shaped selectors `selectHydrated` / `selectPortable` and `flushPersist` live in `@tonex/core-react` — see below.)

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

## `@tonex/core-react` — editor runtime

The stateful, browser-bound layer (ADR-0037). One entry point: `@tonex/core-react`. Depends one-way on `@tonex/core`. www imports these from here, **not** from `@tonex/core`.

**React adapters**:
- `useResolvedTokens()` — derived layer output. Returns `null` while the source store is unhydrated. Consumers MUST handle the null per ADR-0015. Canonical read for theme-aware UI.
- `useSource(selector)` — store reader for *source* state (inputs, overrides). Selector required.

**DOM sink**:
- `applyDom()` — DOM sink; no args. Reads the singleton source store (`useSource.getState()`) and re-renders on `useSource.subscribe(...)`; returns an unsubscribe. Writes a single shared `<style id="tonex-tokens">` in `document.head` with four fixed class-scoped rules (`.md`, `html.dark .md`, `.shadcn`, `html.dark .shadcn`) — not `:root`. SSR-safe (no-op when `window` is undefined); only writes once `_hydrated` (ADR-0015). No colour logic here.

**Store glue** (reach for only when writing store glue):
- `selectHydrated(state)` — the source-hydration gate (`_hydrated`). Named home for gating that needs source state before any token derives (export availability, picker inputs); never read `_hydrated` directly (ADR-0015 amendment 2026-05-25).
- `selectPortable(state)`, `flushPersist()`, types `SourceActions`, `SourceState`.

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
- `SCHEMA_VERSION`, `SchemaVersion`
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

**Shadcn binding presets** (`theme/binding-presets`; ADR-0031 #1) — the routing tier: named role→md-token maps with no color/recipe, applied via `setShadcnBindingPreset` (composes on top of any theme).
- `SHADCN_BINDING_PRESETS` / `ShadcnBindingPresetName`, type `ShadcnBindingPreset` — curated binding-only presets (description + light/dark role maps).
- `findActiveBindingPreset(...)` — match current bindings against the catalog by `shadcnRoleBindings` only (both modes). Tier-independent from `findActivePreset`: the binding picker highlights its own selection while the theme tier may read "custom".

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

## `@tonex/core/derive-cache` — memoized derive

- `getDerivedTheme(source, uniformContrast?)` — module-global FIFO cache (cap 6) over `deriveTheme`, keyed on `(source-identity, contrast pair)` (issue #9/#20). The editor runtime (`useResolvedTokens`, `applyDom`) and the exporters share one derive per source change. Exposed on its own subpath, off the pure main barrel, because the cache is module-global mutable state (ADR-0037) — www reads derived tokens via `useResolvedTokens`, not this directly.

## `@tonex/core/audit` — WCAG verdict layer

The contrast verdict layer, lifted out of the www contrast checker so the engine owns the gate (not the web app). Two functions over one scorer:

- `auditPairs(theme, pairs, { level? })` — the **primitive**: score an arbitrary `ContrastPair[]` against a `DerivedTheme` in both modes, returning `{ ok, results }`. Runs the uncached engine scorer, so any pair list is fair game (the CLI / foreign-fill `check` path).
- `auditTheme(theme, { level?, customColors?, includeBrand? })` — the **gate** over the canonical `CONTRAST_PAIRS` (the static spec set), returning `{ ok, level, failures, warnings, exempt, summary }`. Wired through the WeakMap-cached `evaluateThemeContrast` and its `includeBrand` / `customColors` opt-ins.
- **BLESSED gate policy:** `ok` fails on **text** failures only — a failing non-text/UI pair is reported as a `warn` but never blocks. Decorative pairs (the outline-variant set) are exempt: `'none'`, counted in `summary.exempt`.
- Helpers also exported (the www checker's verdict pieces, single-sourced here): `applyLevel`, `levelThreshold`, `resultOf`, `summarizeContrast`, `isDecorative`, plus types `Level`, `Result`, `EvaluatedPair`, `ContrastSummary`, `EvaluatedAuditPair`.

## What is *not* in core

Common reaches that belong in www, not core:

- **`useThemeToggle`, `useActiveMode`, `useSetMode`** — `apps/www/src/features/theme-mode/`. The only files allowed to import from `next-themes` (ADR-0015 amendment 2026-05-09).
- **Contrast *presentation* (badges, legend copy, row grouping, dual-intent collapse), role-editor logic** — `apps/www/src/features/contrast-checker/` + `color-roles-list/`. The pure *verdict* now lives in `@tonex/core/audit` (above); only the presentational shell stays app-side.
- **Export job UI / wiring** — `apps/www/src/features/export-*/`.

Pattern: when you find yourself composing 2–3 core hooks plus null-handling across multiple components, lift the composition into a feature folder hook (per ADR-0022 rule 5). Don't re-export core from a generic www barrel.

## When this doc is wrong

Hand-curated index. If `rg "from '@tonex/core" apps/www/src packages/cli/src packages/core-react/src` shows an import that isn't listed here, this doc is stale — update it. If you need something that *should* exist and doesn't, the gap belongs in core; flag it before working around it in the consumer.

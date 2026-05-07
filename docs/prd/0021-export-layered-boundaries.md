> **State:** Transient. Sourced from ADR-0021. Replace with the issue link once filed; delete on completion.

# Export pipeline — every layer at its own boundary (PRD)

Implements the ten commitments in `docs/adr/0021-export-layered-boundaries.md`.

## Problem Statement

Today, the export dialog ships only a Tailwind / shadcn CSS string at a single contrast level, in oklch only, with the full md token surface (50 tokens) and no filtering. Three problems follow:

1. **Visibility drift risk.** ADR-0017 closed value-drift between preview and export; the next failure mode is a token visible in the live preview that is silently absent from (or differently shaped in) the exported string. Without filter toggles surfaced in the dialog, users cannot see what they are actually about to paste.
2. **One-size-fits-all output.** Users who only want `:root + .dark` get a chart-bloated, palette-bloated, extended-token-bloated paste. Users who want hex (for design-token tooling) cannot get it. Users who want accessibility contrast variants get nothing.
3. **Layer concerns smeared across modules.** Colorspace projection lives inside `derive.ts` (oklch strings baked into TokenMaps); structure lives in exporters; partition logic lives nowhere. Adding a future formatter (TS, JSON, Dart) inherits this smear and adds new variants of the same bug surface.

## Solution

Restructure the export pipeline so each concern lives at its own seam:

- **Argb-canonical Derived.** Token maps hold `Record<string, number>` (argb). Colorspace projection (`oklchString` / `hexString`) is format-time, owned by exporters.
- **Three-class md partition + chart.** Schema declares `MD_CORE_TOKEN_NAMES` (28), `MD_EXTENDED_TOKEN_NAMES` (22), `MD_PALETTE_TOKEN_NAMES` (78), `MD_CHART_TOKEN_NAMES` (5) — each its own typed surface.
- **Dedicated `DerivedTheme` fields.** `md.{light, dark, lightChart, darkChart, lightExtended, darkExtended, palette}` and `shadcn.{light, dark, lightChart, darkChart}`. Update frequency, DOM relevance, and consumer set are sharp per field.
- **`applyDom` writes only DOM-relevant groups.** Extended + palette stay data-only, consumed by inspect UIs via `useResolvedTokens`. Per-tick setProperty count drops dramatically (issue #9 win).
- **Class-scoped contrast variants in one file.** `includeContrastVariants: true` emits three contrast tiers as `html.contrast-medium .md` / `html.contrast-high .md` selectors layered with the existing `.dark` class axis (ADR-0013).
- **Format options at the seam, defaults off.** `colorFormat`, `includeExtended`, `includePalette`, `includeChart`, `includeContrastVariants`. Defaults match today's behavior byte-for-byte.
- **WYSIWYG-visibility.** The dialog's export-string pane is filtered exactly to what the user pastes; live editor DOM stays full so the editor itself remains coherent.
- **Audience routing by composition.** `<ExportButton tabs={ExportTab[]} />`, route-agnostic. md and shadcn route layouts pass their own tab sets (ADR-0019).
- **Stubs visible, formatters deferred.** TS / JSON / Dart tabs ship visible from day one with TODO bodies; formatter files land in `packages/core/src/theme/exporters/<name>.ts` later.
- **Multi-file (M3-style) export deferred.** One file with class scopes; M3-tooling-compat parks until user feedback warrants.

## User Stories

1. As a Tailwind user, I want to copy a `globals.css` paste-ready string for the default Material color palette, so I can drop the theme into a fresh Tailwind v4 project without further editing.
2. As a shadcn user, I want a `:root + .dark` block targeting shadcn's role surface, so I can paste it under my existing `@import "tailwindcss"` without duplicating boilerplate.
3. As a user, I want the values I see in the dialog's export-string pane to byte-equal what I paste downstream, so I never have to second-guess what is in my clipboard.
4. As a user, I want default exports to omit chart, extended, and palette tokens, so my paste stays lean unless I explicitly opt in.
5. As a designer integrating with design-token tooling, I want to switch the export to hex format, so the values are consumable by tools that don't speak oklch.
6. As a chart-building user, I want to opt-in to chart tokens (`--color-chart-1`…`--color-chart-5`), so my Recharts/visx code can reference the project's primary palette tones without me wiring them by hand.
7. As an advanced Material user, I want to opt-in to extended tokens (fixed, fixed-dim, inverse, surface-tint, shadow, scrim), so I can build interfaces that consume the full M3 token surface.
8. As an inspect-UI builder (landing showcase, tone-palette swatches, per-token override editor), I want palette tones (78) available via `useResolvedTokens`, so I can render them directly without re-deriving.
9. As an accessibility-conscious user, I want to opt-in to medium and high contrast variants in one CSS file, so my downstream app can flip `html.contrast-high` to serve users who need higher contrast.
10. As a user with a non-zero contrast preview, I want the default contrast block to reflect my preview's contrast level (with medium/high tiers added at canonical 0.5 / 1.0 as additions), so the dialog never silently overrides my chosen baseline.
11. As a user editing in the live preview, I want the editor's swatches and override pickers to keep working regardless of my export filter toggles, so toggling "include extended off" doesn't black-out my editor chrome.
12. As a user on the md route, I want to see Tailwind / TS / JSON / Dart tabs, so the audience-relevant export shapes are surfaced.
13. As a user on the shadcn route, I want to see shadcn tokens only in tw format, so the audience-relevant export shapes are surfaced.
14. As a user, I want TS / JSON / Dart tabs to be visible from day one with a "coming soon" body, so I can see the roadmap and trust the project will deliver them.
15. As a developer running `pnpm bake`, I want `globals.css` to regenerate with byte-identical text post-refactor, so the drift-guard baseline holds and reviewers can verify zero functional regression.
16. As a contributor adding a future formatter, I want the partitions (`MD_CORE_TOKEN_NAMES`, `MD_EXTENDED_TOKEN_NAMES`, `MD_PALETTE_TOKEN_NAMES`, `MD_CHART_TOKEN_NAMES`) and type unions to be stable, so my formatter inherits the right tier statically without re-doing the partitioning.
17. As a user, I want per-tick DOM updates to be cheaper (issue #9), so dragging a slider stays at 60Hz on lower-end machines.
18. As a user, I want to toggle filters (chart, extended, palette, contrast variants, oklch/hex) inline in the dialog, so I can preview the exact paste before copying.
19. As a user, I want the dialog's filter toggles to start at the lean defaults each session, so I'm not surprised by previously-set state hidden in localStorage.
20. As a user with custom colors defined, I want my custom-color tokens to remain in the export regardless of toggle state, so my brand colors paste through deterministically.
21. As a user toggling `includeContrastVariants: true` along with `includeExtended: true`, I want the extended token tier to also cascade across contrast tiers, so my contrast-aware app sees consistent extended-token coverage.
22. As a developer, I want the colorspace projection to be a single helper called from one place, so adding a third colorspace later (lab, p3) is a one-helper-and-options-flag change.
23. As an inspect-UI builder, I want chart tokens (`--color-chart-1`…`--color-chart-5`) emitted to DOM by default (filter-gated only for export), so my chart components in the editor itself work without a toggle.
24. As a contributor, I want the drift-guard test to read tokens back from each `CSSStyleRule.style` for the four DOM-emitted fields, so any future code that bypasses `applyDom` is caught.
25. As a contributor, I want format-side snapshot tests to cover each filter combination over `exportCss(bundle, layer, options)`, so a formatter regression surfaces as a failing test, not a user bug report.

## Implementation Decisions

### Schema

- Add four constant arrays to `schema.ts`: `MD_CORE_TOKEN_NAMES` (28), `MD_EXTENDED_TOKEN_NAMES` (22), `MD_PALETTE_TOKEN_NAMES` (78), `MD_CHART_TOKEN_NAMES` (5). Existing `MD_TOKEN_NAMES` keeps its current family-grouped order; partitions are name-match Sets, not contiguous slices.
- Add corresponding type unions: `MdCoreTokenName`, `MdExtendedTokenName`, `MdPaletteTokenName`, `MdChartTokenName`.
- Chart token derivation: from the primary palette via a fixed 5-tone mapping (legacy function reused). Mode/contrast-aware (mirrors core role tokens).
- No new `PortableTheme` fields — toggle state is React-local in the dialog, not portable.

### Derived

- `TokenMap` type changes to `Record<string, number>` (argb).
- `DerivedTheme` shape:
  ```
  md: { light, dark, lightChart, darkChart, lightExtended, darkExtended, palette }
  shadcn: { light, dark, lightChart, darkChart }
  warnings
  ```
- `palette` is mode/contrast-invariant — tones don't shift with mode or contrast.
- Custom colors continue to merge into `md.{light,dark}` (core fields) and `shadcn.{light,dark}` post-bind, by presence.
- Cache key (`derive-cache.ts`) stays the same — keyed on `PortableTheme`.

### Colorspace projection

- New helpers in `oklch.ts` (or a new `format-color.ts`): `oklchString(argb: number): string`, `hexString(argb: number): string`.
- `oklchFromArgb` (current) becomes the primitive that `oklchString` wraps. `oklchFromHex` keeps its hex-input use case (token overrides).
- `applyDom` writes via `oklchString` at setProperty time. Exporters branch on `colorFormat`.

### buildContrastBundle (new deep module)

- Signature: `buildContrastBundle(source: PortableTheme, opts: { includeContrastVariants: boolean }): ContrastBundle`.
- `ContrastBundle = { default: DerivedTheme }` when single-contrast; `{ default, medium, high }` when variants requested.
- 3× `deriveTheme` calls at canonical levels: source's own `contrastLevel` for `default`, 0.5 for `medium`, 1.0 for `high`. Edge case: user's preview contrast ≠ 0 + variants on → `default` honors user's value, medium/high are accessibility additions.
- Lazy: www's hook calls it only on dialog mount/option change, not on every render.
- Cached against `(source, opts)` in `derive-cache.ts` so toggling contrast variants doesn't re-derive the default tier.

### Export options

- `ExportOptions { colorFormat?: 'oklch' | 'hex'; includeExtended?: boolean; includePalette?: boolean; includeChart?: boolean; includeContrastVariants?: boolean }`. All defaults reflect today's lean output.
- md tab surfaces 4 filters + colorFormat; shadcn tab surfaces `includeChart` + colorFormat.
- TS / JSON / Dart tabs do not surface filter UI (stub bodies until formatters land).

### applyDom

- Iterates only `md.{light, dark, lightChart, darkChart}` + `shadcn.{light, dark, lightChart, darkChart}` — eight DOM-emitted fields.
- Writes each via `oklchString(argb)`.
- Stops emitting `*Extended` and `palette`; those stay data-only on `DerivedTheme`.
- Drift-guard cleared: read-back covers eight scope rules instead of four (chart additions).

### exportCss

- Signature: `exportCss(bundle: ContrastBundle, layer: ExportLayer, options: ExportOptions): string`.
- Single-contrast bundles emit the existing `.md` + `html.dark .md` (and shadcn equivalents) shape; multi-contrast bundles add `html.contrast-medium .md` / `html.contrast-medium.dark .md` / `html.contrast-high .md` / `html.contrast-high.dark .md` rule blocks.
- Palette declares once in the `.md` rule (mode/contrast-invariant); role overrides cascade per tier.
- Filter combination is applied per rule block before stringification.
- Colorspace projection happens here via `oklchString` / `hexString`.

### format.ts

- Collapses to a thin wrapper: `formatCss(theme) = exportCss({ default: theme }, 'md', defaults)`. Used by `pnpm bake` only.
- `pnpm bake` regenerates `globals.css` with byte-identical text post-refactor (oklch output preserved at the lean defaults).

### Stubs

- `packages/core/src/theme/exporters/{ts.ts, json.ts, dart.ts}` — each exports a function returning a TODO stub body (move existing inline strings out of `useExportContent`). Per ADR-0008, the registry shape stays one-function-with-discriminator until a second real formatter ships.

### www export dialog

- `<ExportButton tabs={ExportTab[]} />` accepts the tab list from its caller (md route vs shadcn route layout).
- `useExportContent` calls `buildContrastBundle` lazily and threads local `ExportOptions` state into `exportCss`.
- New filter-toggle UI inside the dialog (per-tab visibility rules from the ADR). Local React state, not `useSource` (per consequences in ADR-0021).

### useResolvedTokens

- Surfaces extended (`mdLightExtended`, `mdDarkExtended`) and palette (`palette`) and chart (`mdLightChart`, `mdDarkChart`, `shadcnLightChart`, `shadcnDarkChart`) fields so inspect UIs can read them without a separate selector.

### Memo bookkeeping

- `tonex_cmf_vs_2025_spec.md` memo's `lifecycle` field bumps from `until-adr-0021` to whatever number the future shadcn-binding-expansion ADR ends up taking.

## Testing Decisions

A good test here exercises external behavior — what a downstream caller observes — not implementation details. The canonical pattern is `derive.test.ts`: `DEFAULT_INPUTS` + inline spread overrides + explicit assertions on output fields. No mocks; `deriveTheme` is pure (ADR-0005). No snapshots on the spine (`docs/agents/tdd.md`).

Three modules need new/extended test coverage:

### `buildContrastBundle.test.ts` (new)

- **Single-contrast shape:** `buildContrastBundle(DEFAULT_INPUTS, { includeContrastVariants: false })` returns a bundle whose only key is `default`, structurally identical to `deriveTheme(DEFAULT_INPUTS)`.
- **Multi-contrast shape:** with the flag on, returns `{ default, medium, high }` — three distinct `DerivedTheme`s.
- **Default-tier respects source.contrastLevel:** when source has `contrastLevel: -0.5` and variants are on, `default` reflects -0.5, `medium` reflects 0.5, `high` reflects 1.0.
- **Token shape parity:** every tier has the same field shape (`md.{light, dark, ...}`); only values differ.
- **Source flow-through:** custom colors, palette overrides, surface treatment all propagate identically across tiers.
- Prior art: `derive.test.ts` for the spread + explicit-assertions pattern.

### `exporters/css.test.ts` (extend existing)

- **Bundle signature migration:** existing tests adapt to `exportCss({ default: theme }, layer, defaults)`.
- **Filter combinations:** for each of the 5 boolean toggles × md/shadcn layer, assert the emitted CSS contains/omits the right rule blocks. Helper functions (`parseBlock`) are already in place.
- **Class-scoped contrast variants:** with `includeContrastVariants: true`, assert the emission contains exactly the 6 rule blocks (`.md`, `html.dark .md`, `html.contrast-medium .md`, `html.contrast-medium.dark .md`, `html.contrast-high .md`, `html.contrast-high.dark .md`) and that palette declares once at the top.
- **colorFormat branch:** with `colorFormat: 'hex'`, every value matches `/^#[0-9a-f]{6}$/i`; with `colorFormat: 'oklch'`, every value matches `/^oklch\(/`.
- **Palette declares once:** with `includePalette: true` and `includeContrastVariants: true`, palette declarations appear only in the base `.md` rule, not in any contrast tier rule.
- **Custom colors persist regardless of filters:** a customColor entry's tokens appear with all filter combinations.
- **Defaults equal current output:** `exportCss({ default: deriveTheme(DEFAULT_INPUTS) }, 'md', {})` produces text byte-identical to today's `formatCss(deriveTheme(DEFAULT_INPUTS))` (drift-guard baseline).
- Prior art: existing `exporters/css.test.ts` parseBlock helper and `withCustomColor` fixture.

### `applyDom.test.ts` (extend existing)

- **DOM-relevant subset only:** after a render, read back from each `CSSStyleRule.style` for the eight scope rules (`.md`, `html.dark .md`, `.shadcn`, `html.dark .shadcn`, plus the four chart variants if exposed via separate scope rules — otherwise chart merges into `.md` blocks per ADR re-read). Assert extended-token names and palette-tone names are absent from every DOM rule.
- **applyDom respects toggles is FALSE:** verify that toggling export options has no effect on what `applyDom` writes — DOM stays at the full functional theme regardless of dialog state. This makes the "live editor stays coherent" promise testable.
- **Argb→oklch projection at write time:** assert the value written to a rule is `oklchString(argb)` for the matching token's argb in `DerivedTheme`. Catches any code path that bypasses the projection helper.
- Prior art: existing `applyDom.test.ts` for jsdom + read-back patterns.

## Out of Scope

- **Real TS / JSON / Dart formatters.** Stub bodies only; first real formatter is its own slice.
- **M3-style multi-file (6 files) export.** Parked behind user feedback. Class-scoped single-file is the only contrast-variant shape.
- **PortableTheme schema bump for export options.** Toggle state is React-local; no v9→v10 migration required by this PRD.
- **Inspect UI consumers of `palette` / `*Extended` data.** Landing showcase, tone-palette swatches, per-token override editor — all separate slices that consume the data this PRD makes available.
- **Lab / P3 / additional colorspaces.** Architecture leaves room (one helper per colorspace), but only oklch + hex ship.
- **shadcn-binding-expansion** (the next ADR, currently unnumbered). The cmf memo's lifecycle bump is the only forward-link bookkeeping done here.
- **Cache invalidation strategy changes.** `derive-cache.ts` keying stays as-is; bundle-level caching is additive on top.

## Further Notes

- The `exporters/` registry shape from ADR-0008 stays one-function-with-discriminator until a second real format ships. Stubs don't count.
- Per ADR-0017 amendment, drift-guard reads tokens back from `CSSStyleRule.style` for the DOM-emitted fields × scope rules. Format-side has its own pure-function snapshot tests covering each filter combination.
- Edge case: user's preview contrast ≠ 0 + `includeContrastVariants: true` → `default` block reflects the user's preview contrast; `medium`/`high` blocks emit at canonical 0.5 / 1.0 as accessibility additions. The dialog's preview pane reflects this same behavior.
- Slice strategy: this PRD is large enough to split into multiple slices (per `docs/agents/slice-strategy.md`). Suggested order: (1) argb-canonical + colorspace helpers + applyDom adapt; (2) DerivedTheme partition fields + schema constants; (3) `buildContrastBundle` + class-scoped contrast emission; (4) `ExportOptions` filters in exportCss; (5) www dialog filter UI + tabs prop; (6) stub formatters. Each slice has its own one-sentence promise; `to-issues` skill turns this PRD into per-slice tickets.
- Promotion: when this PRD is filed as an issue (and tagged `needs-triage`), update this file's frontmatter to point at the issue link. Delete the file when the last child slice closes.

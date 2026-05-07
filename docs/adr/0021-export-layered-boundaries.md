> **State:** Frozen. Append amendment blocks only — never rewrite the body. New decisions get new ADRs.

# Export pipeline — every layer at its own boundary

Export is the product's deliverable. ADR-0017 established WYSIWYG between preview and export by *value*; this ADR commits to layered boundaries across the export pipeline so each concern lives at its own seam, and extends the WYSIWYG promise to *visibility*: what the user sees in the dialog's export-string pane is exactly what they paste. The previous prototype's failure mode was values diverging across paths (0017 closed it). The next failure mode would be visibility diverging — a token in the live preview that's silently absent from the export — and this ADR closes it before it surfaces.

**Decision:** ten commitments, organized by pipeline layer.

## 1. Argb-canonical

`DerivedTheme`'s token maps hold `Record<string, number>` (argb), not pre-formatted oklch strings. Colorspace projection (argb → oklch *or* hex) is a stringification concern, owned by `format.ts` via shared helpers `oklchString(argb)` and `hexString(argb)`. `applyDom` writes via `oklchString`; exporters branch on `colorFormat`.

**Why:** sharpens 0017's "exporters only format". Today colorspace lives in derive, structure lives in exporters. After this, *projection* is also format-time. One place owns colorspace; one helper backs every emission. Drift surface for hex/oklch divergence: zero.

## 2. Three-class md partition + chart

`schema.ts` exports four constant arrays:

- `MD_CORE_TOKEN_NAMES` (28) — primary/secondary/tertiary/error families, surface ladder, outline.
- `MD_EXTENDED_TOKEN_NAMES` (22) — fixed/fixed-dim families, per-family dim, inverse trio, surface-tint, shadow, scrim.
- `MD_PALETTE_TOKEN_NAMES` (78) — 13 tones × 6 palettes, mode/contrast invariant.
- `MD_CHART_TOKEN_NAMES` (5) — `--color-chart-1`…`--color-chart-5`, derived from the primary palette via a fixed 5-tone mapping (legacy function reused).

`MD_TOKEN_NAMES` keeps its current family-grouped order; partitions are name-match Sets, not contiguous slices. Order in baked CSS is unchanged.

**Why:** future formatters (TS / JSON / Dart) inherit the partitions for free. Type unions (`MdCoreTokenName`, etc.) make role-bindings statically check against the right tier.

## 3. Dedicated fields per semantics class

`MdLayer` carries fields keyed by *what each class is for*, not flattened with sidecar Sets:

```ts
interface MdLayer {
  light: TokenMap          // 28 core role (mode-aware, DOM-emitted)
  dark: TokenMap
  lightChart: TokenMap     // 5 chart (mode-aware, DOM-emitted, filter-gated for export)
  darkChart: TokenMap
  lightExtended: TokenMap  // 22 extended role (mode-aware, data-only)
  darkExtended: TokenMap
  palette: TokenMap        // 78 palette tones (mode/contrast-invariant, data-only)
}
interface ShadcnLayer {
  light: TokenMap          // shadcn core, including role-bound sidebar
  dark: TokenMap
  lightChart: TokenMap     // 5 chart with shadcn naming (`--chart-1`)
  darkChart: TokenMap
}
interface DerivedTheme { md: MdLayer; shadcn: ShadcnLayer; warnings: string[] }
```

**Why:** each field's update frequency, DOM relevance, and consumer set is sharp. `applyDom` iterates only DOM-emitted fields with no partition import. Format-time filters merge fields based on toggles. Shape encodes intent — every consumer reads what it needs without a filter step at the seam.

## 4. applyDom emits only DOM-relevant groups

`applyDom` writes `md.{light, dark, lightChart, darkChart}` + `shadcn.{light, dark, lightChart, darkChart}` to four scope rules per layer (per ADR-0013, ADR-0017's amendment for issue #9). It does **not** write `*Extended` or `palette` — those are data, consumed by inspect UIs (landing showcase, tone-palette swatches, per-token override editor) directly via `useResolvedTokens()`.

**Why:** app components (and the editor itself) only consume core role tokens + chart. Extended and palette have no runtime renderer; emitting them to DOM costs ~200 setProperty calls per source change for zero render benefit. Per-tick setProperty count drops to ~57 per mode block — direct issue #9 win.

## 5. Contrast variants as class-scoped single file

When `includeContrastVariants: true`, the export emits one CSS file with three contrast tiers scoped through `<html>` classes — same axis as ADR-0013's `dark` class:

```
.md                            { /* default contrast, light role + palette */ }
html.dark .md                  { /* default contrast, dark role */ }
html.contrast-medium .md       { /* mc, light role */ }
html.contrast-medium.dark .md  { /* mc, dark role */ }
html.contrast-high .md         { /* hc, light role */ }
html.contrast-high.dark .md    { /* hc, dark role */ }
```

Palette declares once in `.md`'s rule (mode/contrast-invariant); role overrides cascade per tier. A new helper `buildContrastBundle(source, { includeContrastVariants })` in core orchestrates the 3× derive when needed (canonical levels 0 / 0.5 / 1.0). `exportCss(bundle: ContrastBundle, layer, options)` always takes a bundle; single-contrast wraps as `{ default: theme }`. www's hook calls `buildContrastBundle` lazily — on export click, not on every render.

**Why:** matches our existing class-axis pattern. One file, one paste, no zip dependency. Edge case (user's preview contrast ≠ 0 + variants on): default block reflects user's preview contrast; medium/high blocks emit at canonical 0.5 / 1.0 as accessibility additions.

## 6. Format options at the seam, defaults off

`format.ts` accepts:

```ts
interface ExportOptions {
  colorFormat?: 'oklch' | 'hex'         // default 'oklch'
  includeExtended?: boolean              // default false
  includePalette?: boolean               // default false
  includeChart?: boolean                 // default false
  includeContrastVariants?: boolean      // default false
}
```

md exports surface 4 filters + colorFormat; shadcn exports surface 1 filter (`includeChart`) + colorFormat — sidebar is already covered by shadcn role bindings, custom colors emit by presence.

**Why:** every default reflects what most users actually paste. Extended, palette, chart, and contrast variants are opt-in surfaces — users who don't need them get a clean, lean export. Defaults match the current single-contrast oklch behavior.

## 7. WYSIWYG-visibility scoped to the inspect surface

ADR-0017's "preview === export" extends to visibility: the **inspect surface** the user sees in the dialog's export-string pane is filtered exactly to what they'll paste, byte-for-byte. Live DOM is unaffected — `applyDom` always emits the full functional theme so the editor itself stays coherent regardless of toggle state.

**Why:** strict applyDom-respects-toggles would break the editor (sink swatches, override pickers go transparent). The promise that matters is "the string you copy renders as the colors you'd see if you re-derived from the same source." That promise is between the dialog's preview pane and the user's downstream paste-target. Live editor chrome is a separate viewer.

## 8. Audience routing by composition

`<ExportButton tabs={ExportTab[]} />`. The route layout (per ADR-0019) decides which tabs appear:

- md routes pass `['Tailwind', 'TS', 'JSON', 'Dart']`.
- shadcn routes pass `['shadcn', 'TS', 'JSON', 'Dart']`.

The button is route-agnostic. No path-sniffing inside the dialog, no duplicated component.

**Why:** route already owns audience (ADR-0019). Composition keeps the dialog one component; tab choice is a prop, not internal logic.

## 9. Stubs visible, formatters deferred

TS / JSON / Dart tabs ship visible from day one with stub bodies (a TODO comment describing the intended output). When a formatter lands, it earns a file in `packages/core/src/theme/exporters/<name>.ts` (per ADR-0008) and the stub is replaced. The exporter registry shape from ADR-0008 stays deferred until two real formats coexist.

**Why:** users see the roadmap. The stub is cheap and pre-builds the tab structure so the only churn when a formatter lands is swapping the body.

## 10. Multi-file (M3-style) export deferred

Material's official theme builder ships 6 separate files (light/light-mc/light-hc + dark variants). We ship one file with class scopes (commitment 5). M3-compat as a separate "export as 6 files" preset is parked — gated on user feedback. When/if it lands, it joins the exporter registry alongside the class-scoped variant; no shape decided here re-opens.

**Why:** Tailwind / shadcn downstream tooling consumes class-flipping for mode; reusing the same axis for contrast is the natural extension. M3-tooling-compat (Material Web, Flutter ColorScheme) can land as a parallel exporter without re-shaping anything decided here.

## Consequences

- The `exporters/` registry shape from ADR-0008 stays one-function-with-discriminator until a second real format ships. Stubs don't count.
- Drift-guard test (ADR-0017's amendment) reads tokens back from each `CSSStyleRule.style` for the four DOM-emitted fields × four scope rules; format-side has its own pure-function snapshot tests over `exportCss(bundle, layer, options)` covering each filter combination.
- `pnpm bake` calls `formatCss(deriveTheme(DEFAULT_INPUTS))` — `formatCss` becomes a thin convenience wrapper that constructs `{ default: theme }` and calls `exportCss`. globals.css regenerates with identical text post-refactor (oklch output preserved).
- Toggle state for the dialog lives as React-local state, not in `useSource` (UI prefs aren't portable theme). Lift to a small UI store only when a second consumer (a production inspect UI) appears.
- The cmf-vs-2025 spec memo's `lifecycle` field bumps from `until-adr-0021` to whatever number the future shadcn-binding-expansion ADR ends up taking. Trivial bookkeeping.

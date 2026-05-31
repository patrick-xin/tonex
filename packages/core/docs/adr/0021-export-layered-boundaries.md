# Export pipeline — every layer at its own boundary

Export is the product's deliverable. ADR-0017 established WYSIWYG between preview and export by *value*; this ADR commits to layered boundaries across the export pipeline so each concern lives at its own seam, and extends the WYSIWYG promise to *visibility*: what the user sees in the dialog's export-string pane is exactly what they paste. The previous prototype's failure mode was values diverging across paths (0017 closed it). The next failure mode would be visibility diverging — a token in the live preview that's silently absent from the export — and this ADR closes it before it surfaces.

**Decision:** ten commitments, organized by pipeline layer.

## 1. Argb-canonical

`DerivedTheme`'s token maps hold `Record<string, number>` (argb), not pre-formatted oklch strings. Colorspace projection (argb → oklch *or* hex) is a stringification concern, owned by `format.ts` via shared helpers `oklchString(argb)` and `hexString(argb)`. `applyDom` writes via `oklchString`; exporters branch on `colorFormat`.

**Why:** sharpens 0017's "exporters only format". Today colorspace lives in derive, structure lives in exporters. After this, *projection* is also format-time. One place owns colorspace; one helper backs every emission. Drift surface for hex/oklch divergence: zero.

## 2. Three-class md partition + chart

The schema partitions md token names into four constant arrays by export tier — `MD_CORE_TOKEN_NAMES`, `MD_EXTENDED_TOKEN_NAMES`, `MD_PALETTE_TOKEN_NAMES`, `MD_CHART_TOKEN_NAMES` (each array's membership is the schema's, not restated here). For chart this commitment fixes only the names and their export tier; the *derivation* — how chart tokens are computed from the source — is ADR-0027's concern.

`MD_TOKEN_NAMES` keeps its family-grouped order; partitions are name-match Sets, not contiguous slices, so baked CSS order is unchanged.

**Why:** future formatters (TS / JSON / Dart) inherit the partitions for free. Type unions (`MdCoreTokenName`, etc.) make role-bindings statically check against the right tier.

## 3. Dedicated fields per semantics class

`MdLayer` carries fields keyed by *what each class is for*, not flattened with sidecar Sets. The md layer separates core role tokens (mode-aware, DOM-emitted), chart tokens (mode-aware, DOM-emitted, filter-gated for export), extended role tokens (mode-aware, DOM-emitted), and palette tones (mode/contrast-invariant, data-only). The shadcn layer carries core role tokens and chart tokens (with shadcn naming). `DerivedTheme` composes both layers plus warnings.

**Why:** each field's update frequency, DOM relevance, and consumer set is sharp. Format-time filters merge fields based on toggles. Shape encodes intent — every consumer reads what it needs without a filter step at the seam.

## 4. applyDom emits the live functional theme; palette stays data-only

`applyDom` writes `md.{light, dark, lightExtended, darkExtended, lightChart, darkChart}` + `shadcn.{light, dark, lightChart, darkChart}` to the scope rules per layer (per ADR-0013, ADR-0017's amendment for issue #9), merged into each mode block (`{ ...light, ...lightExtended, ...lightChart }`). Extended role tokens are live, seed-reactive CSS variables wherever a `.md` scope applies. `applyDom` does **not** write `palette` — palette tones have no `@theme` bridge and no CSS utility consumes them; they are inspect-data, read via `useResolvedTokens()`.

**Why:** the marketing/showcase pages drive the live mood-shift demo (the product wedge) off extended tokens as live CSS variables — `bg-inverse-surface`, `var(--color-primary-fixed)`, the fixed/dim/inverse families — so a data-only extended tier would silently freeze them at the baked `globals.css` default. This aligns with commitment 7: `applyDom` emits the full functional theme, and the extended tier is part of it. The cost (the 22-token extended tier × two md mode blocks of `setProperty`) is accepted knowingly; slider-drag stays bounded by `applyDiff` (unchanged values skip projection) and the extended roster is fixed, so it never churns the diff's key set. Palette is excluded because it has a different access pattern (inspect-data, read off the derived object directly) and no renderer.

## 5. Contrast variants as class-scoped single file (md); shadcn exports paste-replace `:root`

When `includeContrastVariants: true`, the **md** export emits one CSS file with three contrast tiers scoped through `<html>` classes — same axis as ADR-0013's `dark` class:

```
.md                            { /* default contrast, light role + palette */ }
html.dark .md                  { /* default contrast, dark role */ }
html.contrast-medium .md       { /* mc, light role */ }
html.contrast-medium.dark .md  { /* mc, dark role */ }
html.contrast-high .md         { /* hc, light role */ }
html.contrast-high.dark .md    { /* hc, dark role */ }
```

Palette declares once in `.md`'s rule (mode/contrast-invariant); role overrides cascade per tier. A new helper `buildContrastBundle(source, { includeContrastVariants })` in core orchestrates the 3× derive when needed (canonical levels 0 / 0.5 / 1.0). `exportCss(bundle: ContrastBundle, layer, options)` always takes a bundle; single-contrast wraps as `{ default: theme }`. www's hook calls `buildContrastBundle` lazily — on export click, not on every render.

The **shadcn** export instead emits root selectors `:root` (light) and `.dark` (dark) — a drop-in replacement for the blocks shadcn-cli scaffolds, because users paste our output to *replace* those blocks, not extend them. An opt-in `includeHeader: boolean` (default `false`) prepends the Tailwind v4 incantation (`@import "tailwindcss"` + `@custom-variant dark`) for green-field projects. The shadcn export ignores `includeContrastVariants` — contrast tiers are an md-side accessibility feature; if a bundle still carries medium/high tiers, the shadcn branch emits only the default tier. Internal scoping (`applyDom`, `format.ts`, the editor's own `globals.css`) keeps class-scoped `.md` / `.shadcn` because both layers coexist in the editor DOM (ADR-0013 symmetry); only the *user-facing export* seam differs by layer.

**Why:** the md class-axis matches our existing mode pattern — one file, one paste, no zip. The shadcn root-selector shape is byte-equivalent to what shadcn-cli writes, so the paste target is unambiguous; the original "extend an existing scoped block" framing optimized for a use case shadcn users don't actually hit.

## 6. Format options are one shared control surface, defaults lean

`format.ts` accepts an `ExportOptions` object whose defaults match the current single-contrast oklch behavior — `colorFormat: 'oklch'`, every `include*` filter off. Options are **one control surface shared across all formats**, not a per-tab filter set: a single option change re-renders every format at once, and each format applies the options meaningful to it and ignores the rest. A target schema that lacks a concept (e.g. a chart slot, or the Tailwind-only `includeHeader`) drops it, never invents it; `includeHeader` is read by shadcn only.

**Why:** options describe *the theme the user is handing off*, not the tab they happen to be on, so they sit above the format choice with one action propagating everywhere. Every default reflects what most users actually paste — extended, palette, chart, and contrast variants are opt-in surfaces; users who don't need them get a clean, lean export.

## 7. WYSIWYG-visibility scoped to the inspect surface

ADR-0017's "preview === export" extends to visibility: the **inspect surface** the user sees in the dialog's export-string pane is filtered exactly to what they'll paste, byte-for-byte. Live DOM is unaffected — `applyDom` always emits the full functional theme so the editor itself stays coherent regardless of toggle state.

**Why:** strict applyDom-respects-toggles would break the editor (sink swatches, override pickers go transparent). The promise that matters is "the string you copy renders as the colors you'd see if you re-derived from the same source." That promise is between the dialog's preview pane and the user's downstream paste-target. Live editor chrome is a separate viewer.

## 8. Audience routing by composition

`<ExportButton tabs={ExportTab[]} />`. The route layout (per ADR-0019) decides which tabs appear:

- md routes pass `['Tailwind', 'TS', 'JSON', 'Dart']`.
- shadcn routes pass `['shadcn']`.

The button is route-agnostic. No path-sniffing inside the dialog, no duplicated component.

**Why:** route already owns audience (ADR-0019). Composition keeps the dialog one component; tab choice is a prop, not internal logic.

## 9. Stubs visible, formatters deferred

TS / JSON / Dart tabs ship visible from day one with stub bodies (a TODO comment describing the intended output). When a formatter lands, it joins the `exporters/` barrel pattern per ADR-0008 and the stub is replaced.

**Why:** users see the roadmap. The stub is cheap and pre-builds the tab structure so the only churn when a formatter lands is swapping the body.

## 10. Multi-file (M3-style) export deferred

Material's official theme builder ships 6 separate files (light/light-mc/light-hc + dark variants). We ship one file with class scopes (commitment 5). M3-compat as a separate "export as 6 files" preset is parked — gated on user feedback. When/if it lands, it joins the exporter registry alongside the class-scoped variant; no shape decided here re-opens.

**Why:** Tailwind / shadcn downstream tooling consumes class-flipping for mode; reusing the same axis for contrast is the natural extension. M3-tooling-compat (Material Web, Flutter ColorScheme) can land as a parallel exporter without re-shaping anything decided here.

## Consequences

- Drift-guard test (ADR-0017's amendment) reads tokens back from each `CSSStyleRule.style`; its `projectTheme` helper covers the DOM-emitted fields — core + extended + chart for md — so the data-level contract is "applyDom's md tokens = core + extended + chart". Format-side has its own pure-function snapshot tests over `exportCss(bundle, layer, options)` covering each filter combination.
- `pnpm bake` regenerates `globals.css` from `DEFAULT_INPUTS` through the same export pipeline, byte-identical (oklch output preserved) — so baked and live output cannot diverge.
- Toggle state for the dialog: the JSON formatter (ADR-0029) is the second non-CSS consumer that made every tab read options, so whether toggle state lifts to a small UI store or stays React-local is an implementation call for the wiring slice, not a commitment here.

**Amendment anchors** — dates cited from code/docs; each decision is folded into the commitment bodies above and kept here only so the citation resolves in one hop:

- **2026-05-13** — shadcn export emits `:root` + `.dark` (paste-replace, not class scopes) with an opt-in `includeHeader`; shadcn ignores `includeContrastVariants`. Folded into commitment 5–6.
- **2026-05-29** — `applyDom` emits the md extended tier (reverses commitment 4's original *extended* exclusion; palette stays data-only). The showcase mood-shift demo is the second consumer that broke the "zero render benefit" premise. Folded into commitment 4.
- *Folded without a date anchor (not cited externally):* the chartMode axis refinement to commitment 2 (chart derivation now lives in ADR-0027), and the shared-control-surface reframing of commitment 6 (options are one surface across all formats, not per-tab — the JSON formatter retired the per-tab framing).

> **State:** Living rationale. Edit body when reality overtakes prose; the decision and rationale don't change without a new ADR.

# Export pipeline — every layer at its own boundary

Export is the product's deliverable. ADR-0017 established WYSIWYG between preview and export by *value*; this ADR commits to layered boundaries across the export pipeline so each concern lives at its own seam, and extends the WYSIWYG promise to *visibility*: what the user sees in the dialog's export-string pane is exactly what they paste. The previous prototype's failure mode was values diverging across paths (0017 closed it). The next failure mode would be visibility diverging — a token in the live preview that's silently absent from the export — and this ADR closes it before it surfaces.

**Decision:** ten commitments, organized by pipeline layer.

## 1. Argb-canonical

`DerivedTheme`'s token maps hold `Record<string, number>` (argb), not pre-formatted oklch strings. Colorspace projection (argb → oklch *or* hex) is a stringification concern, owned by `format.ts` via shared helpers `oklchString(argb)` and `hexString(argb)`. `applyDom` writes via `oklchString`; exporters branch on `colorFormat`.

**Why:** sharpens 0017's "exporters only format". Today colorspace lives in derive, structure lives in exporters. After this, *projection* is also format-time. One place owns colorspace; one helper backs every emission. Drift surface for hex/oklch divergence: zero.

## 2. Three-class md partition + chart

The schema exports four constant token-name arrays:

- `MD_CORE_TOKEN_NAMES` — primary/secondary/tertiary/error families, surface ladder, outline.
- `MD_EXTENDED_TOKEN_NAMES` — fixed/fixed-dim families, per-family dim, inverse trio, surface-tint, shadow, scrim.
- `MD_PALETTE_TOKEN_NAMES` — palette tones, mode/contrast invariant.
- `MD_CHART_TOKEN_NAMES` — chart slots, derived from the primary palette via a fixed tone mapping (chart-related arrays live in `chart/schema.ts`).

`MD_TOKEN_NAMES` keeps its current family-grouped order; partitions are name-match Sets, not contiguous slices. Order in baked CSS is unchanged.

**Why:** future formatters (TS / JSON / Dart) inherit the partitions for free. Type unions (`MdCoreTokenName`, etc.) make role-bindings statically check against the right tier.

## 3. Dedicated fields per semantics class

`MdLayer` carries fields keyed by *what each class is for*, not flattened with sidecar Sets. The md layer separates core role tokens (mode-aware, DOM-emitted), chart tokens (mode-aware, DOM-emitted, filter-gated for export), extended role tokens (mode-aware, data-only), and palette tones (mode/contrast-invariant, data-only). The shadcn layer carries core role tokens and chart tokens (with shadcn naming). `DerivedTheme` composes both layers plus warnings.

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

`format.ts` accepts an `ExportOptions` object whose defaults match the current single-contrast oklch behavior — `colorFormat: 'oklch'`, every `include*` filter off. md exports surface 4 filters + colorFormat; shadcn exports surface 1 filter (`includeChart`) + colorFormat — sidebar is already covered by shadcn role bindings, custom colors emit by presence.

**Why:** every default reflects what most users actually paste. Extended, palette, chart, and contrast variants are opt-in surfaces — users who don't need them get a clean, lean export. Defaults match the current single-contrast oklch behavior.

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

- Drift-guard test (ADR-0017's amendment) reads tokens back from each `CSSStyleRule.style` for the four DOM-emitted fields × four scope rules; format-side has its own pure-function snapshot tests over `exportCss(bundle, layer, options)` covering each filter combination.
- `pnpm bake` calls `formatCss(deriveTheme(DEFAULT_INPUTS))` — `formatCss` becomes a thin convenience wrapper that constructs `{ default: theme }` and calls `exportCss`. globals.css regenerates with identical text post-refactor (oklch output preserved).
- Toggle state for the dialog lives as React-local state, not in `useSource` (UI prefs aren't portable theme). Lift to a small UI store only when a second consumer (a production inspect UI) appears.
- The cmf-vs-2025 spec memo's `lifecycle` field bumps from `until-adr-0021` to whatever number the future shadcn-binding-expansion ADR ends up taking. Trivial bookkeeping.

---

## Amendment 2026-05-08 — chartMode axis (ADR-0024)

Commitment 2 of this ADR described `MD_CHART_TOKEN_NAMES` as "derived from the primary palette via a fixed 5-tone mapping." That description is the **mono** branch under ADR-0024's chartMode axis; it is no longer the only path.

ADR-0024 introduces `chartMode: 'mono' | 'multi'` on `PortableTheme`:
- **mono** (default) — preserves the primary-palette-derived behavior named here. Variant-aware. Drift-guard baseline holds (default `chartMode: 'mono'` produces byte-identical chart values to pre-axis output).
- **multi** — synthesizes via `Hct.from()` with hue rotation; bypasses the primary palette by design. See ADR-0024 commitment 2 for why the divergence is permanent.

Token shape (5 tokens, names per `MD_CHART_TOKEN_NAMES` / `SHADCN_CHART_TOKEN_NAMES`) and emission paths (formatCss, exportCss, applyDom) are **unchanged**. The axis acts upstream of stringification — exporters and applyDom consume the same `lightChart` / `darkChart` TokenMap shape regardless of mode.

---

## Amendment 2026-05-13 — shadcn export shape (paste-replace + bootstrap)

Commitment 5 of this ADR specified class-scoped selectors for the shadcn export (`.shadcn` / `html.dark .shadcn`) on the rationale that "the shadcn audience already owns root `:root` / `.dark` blocks from shadcn-cli." Field feedback flipped that: users paste our output to **replace** shadcn-cli's blocks, not extend them. Class-scoped output forced manual rewriting to merge with the existing globals.css.

**Decision:** shadcn export switches to root selectors `:root` (light) and `.dark` (dark) — drop-in replacement for the blocks shadcn-cli scaffolds. A new opt-in `includeHeader: boolean` (default `false`) prepends the Tailwind v4 incantation (`@import "tailwindcss"` + `@custom-variant dark (&:is(.dark *))`) for green-field projects starting without an existing globals.css.

**Decision:** shadcn export ignores `includeContrastVariants`. The contrast axis is not part of the shadcn audience's surface — contrast tiers are an md-side accessibility feature. The shadcn filter row does not expose the toggle; if a bundle still carries medium/high tiers, the shadcn branch in `exportCss` emits only the default tier (no contrast prefixes). md export shape (commitment 5) is unchanged.

**Decision:** the `ExportOptions` interface gains `includeHeader?: boolean`. md ignores the flag (md always emits the full header). shadcn reads it.

**Why:** matches the failure mode users actually hit. The original commitment 5 framing optimized for a use case (extending an existing scoped block) that isn't how shadcn users actually adopt new themes — they wholesale-replace globals.css role blocks. The new shape is byte-equivalent to what shadcn-cli writes, so the paste target is unambiguous.

**Internal scoping unchanged.** `applyDom`, `format.ts`, and the editor's `apps/www/src/styles/globals.css` still use class-scoped `.md` / `.shadcn` because md and shadcn coexist in the editor's DOM (ADR-0013 symmetry rule). This amendment is scoped to the **user-facing export** seam only.

**Consequence:** the export dialog hides the tab strip when only one tab is configured (shadcn route — we ship only the Tailwind v4 shape). The Tailwind tab on md routes keeps its full filter row.

---

## Amendment 2026-05-20 — options are a shared surface across every format

Commitment 6 framed `ExportOptions` as per-tab filter rows (md surfaces four filters, shadcn one), and the consequences kept toggle state React-local "until a second consumer appears." Real non-CSS formatters (JSON, per ADR-0029) make every tab a consumer, retiring the per-tab framing.

**Decision:** `ExportOptions` is one control surface shared across all formats, not a per-tab filter set. A single option change re-renders every format at once; each format applies the options meaningful to it and ignores the rest — JSON honors `colorFormat`, contrast, palette, and the role-tier toggle; it has no use for the Tailwind-only header flag, and a chart concept a target schema lacks is dropped, never invented. Defaults stay lean per commitment 6: a fresh dialog is the minimal export, toggles expand it.

**Why:** the per-tab framing was an artifact of only one real formatter existing when commitment 6 was written. Options describe *the theme the user is handing off*, not the tab they happen to be on — so they sit above the format choice, with one action propagating everywhere. A format ignoring an option it can't use is strictly simpler than maintaining disjoint per-tab option sets.

**Convention, not decision:** where the shared control row physically renders (e.g. above the tab strip) is an `apps/www` structure concern, recorded in `apps/www/CLAUDE.md` — not in this ADR.

**Consequence:** the original "lift toggle state to a UI store when a second consumer appears" line is now live — the JSON formatter is that second consumer. Whether the lift happens or React-local state still suffices is an implementation call for the wiring slice, not a commitment here.


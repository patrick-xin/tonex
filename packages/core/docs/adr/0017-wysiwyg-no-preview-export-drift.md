# WYSIWYG — preview and export never drift

The previous prototype's load-bearing failure mode: users got one set of colors in the live preview, pasted the export into their own project, and saw different colors. Competitors (tweakcn, realtimecolors) hit the same trap. The cause was multiple derive paths producing the same logical tokens through subtly different code (rounding, color-space conversion, mode-specific resolution), one feeding the preview and another feeding the export.

**Decision:** `deriveTheme(source)` is the single source of truth for token **values**. Every other consumer — `applyDom`, every entry in `exporters/`, the SSR'd `globals.css` — only **formats** what `deriveTheme` returned. None of them re-compute, re-round, or re-convert.

This is enforced by five concrete commitments:

1. **`deriveTheme(source) → { md, shadcn, warnings }`.** Serialization is exclusively an exporter concern; the previously-listed `css` field is dropped. This also strikes the `css` field from ADR-0005's spine signature (see the anchor note below).

2. **Both modes co-derived in one call.** Output shape: `{ md: { light, dark }, shadcn: { light, dark }, warnings }`. There is no top-level `mode` field on `source`. A second `deriveTheme` call to "get the dark mode" cannot exist, because the first call already produced it.

3. **Mode-keyed override shape: `{ light, dark }` at the top.** `md3TokenOverrides` and `shadcnTokenOverrides` are `{ light: Record<Token, Hex>; dark: Record<Token, Hex> }`. Mirrors the export's `:root + .dark` block structure exactly, so state-to-output is one-to-one — no transform = no drift surface.

4. **Mode toggle owned by `next-themes` on `<html class="dark">`.** Standard shadcn convention. Layer scoping (`.md`, `.shadcn`) stays symmetric and class-based on the scope element; mode is the orthogonal third axis. `applyDom` always emits all four blocks (`.md`, `html.dark .md`, `.shadcn`, `html.dark .shadcn`) — toggling mode is a class flip, never a re-derivation.

5. **`globals.css` baked from `deriveTheme(DEFAULT_INPUTS)`, gated by an integrity test.** First-paint defaults live in `globals.css` so SSR has no FOUC. A test asserts `globals.css` contents equal `deriveTheme(DEFAULT_INPUTS)` output; CI fails if derive.ts changes and `globals.css` doesn't. Hand-write or codegen — the test is the gate.

**Why:** WYSIWYG is the product promise this tool is built to deliver. Every architectural rule in this ADR exists to remove a code path where preview and export could diverge. The previous prototype had four derive paths (`recompute`, `recomputeDraft`, `resolveMd3Tokens`, `resolveShadcnTokensForApply`); this design has one.

**Consequence:**

- `applyDom` and `exporters/*` consume the same `{md, shadcn}` map. Any shared low-level formatter (e.g., `tokenToOklchString`) lives in `core/theme/` once. Reject any suggestion to put color logic — conversion, rounding, role mapping — in `applyDom` or `exporters/*`. Push it into `deriveTheme`.
- The drift-guard test pins preview-rendered tokens against the same `deriveTheme(source)` output exporters consume. Because `applyDom` writes per-token (below), the comparison is at the data layer — tokens read back from each `CSSStyleRule` — while exporter strings stay pinned textually via `formatCss` unit tests. Expand the pinned set as derive.ts grows.
- `applyDom` keeps a single `<style>` element in `<head>` (append-once, after `globals.css` in source order so cascade wins) but **updates per-token**: `CSSStyleRule.style.setProperty` against four stable rules (one per scope), diffed against last-written values so only changed tokens are written. `textContent` is not re-serialized on update — at 60Hz slider drag that would force a full re-parse and cascade re-resolve per tick (issue #9). The sink boundary is unchanged: `applyDom` still does no color logic.
- "Reset all" = `source.setState(DEFAULT_INPUTS)`. Don't reach around `persist` middleware with `localStorage.removeItem` — the source store is the only mutation surface.

**Amendment anchors** — dates cited from code/docs; each decision is folded into the body above and kept here only so the citation resolves in one hop:

- **2026-05-06** (issue #9) — `applyDom` moved from `textContent` replace to per-token `CSSStyleRule.style.setProperty` against four stable rules, diffed. The WYSIWYG contract is preserved: same `DerivedTheme` input as exporters, four scope blocks, mode-as-class-flip, `globals.css` still baked from `formatCss(deriveTheme(DEFAULT_INPUTS))`. The drift-guard test moved to data-layer comparison accordingly. Folded into commitment-4 + the Consequence.
- *Amendment to ADR-0005 (no date)* — the `css` field is struck from ADR-0005's spine signature; serialization is an exporter concern. The decision is commitment 1; kept reachable here in one hop for a reader coming from ADR-0005.

# WYSIWYG — preview and export never drift

The previous prototype's load-bearing failure mode: users got one set of colors in the live preview, pasted the export into their own project, and saw different colors. Competitors (tweakcn, realtimecolors) hit the same trap. The cause was multiple derive paths producing the same logical tokens through subtly different code (rounding, color-space conversion, mode-specific resolution), one feeding the preview and another feeding the export.

**Decision:** `deriveTheme(source)` is the single source of truth for token **values**. Every other consumer — `applyDom`, every entry in `exporters/`, the SSR'd `globals.css` — only **formats** what `deriveTheme` returned. None of them re-compute, re-round, or re-convert.

This is enforced by five concrete commitments:

1. **`deriveTheme(source) → { md, shadcn, warnings }`.** The previously-listed `css` field is dropped (see ADR-0005 amendment below). Serialization is exclusively an exporter concern.

2. **Both modes co-derived in one call.** Output shape: `{ md: { light, dark }, shadcn: { light, dark }, warnings }`. There is no top-level `mode` field on `source`. A second `deriveTheme` call to "get the dark mode" cannot exist, because the first call already produced it.

3. **Mode-keyed override shape: `{ light, dark }` at the top.** `md3TokenOverrides` and `shadcnTokenOverrides` are `{ light: Record<Token, Hex>; dark: Record<Token, Hex> }`. Mirrors the export's `:root + .dark` block structure exactly, so state-to-output is one-to-one — no transform = no drift surface.

4. **Mode toggle owned by `next-themes` on `<html class="dark">`.** Standard shadcn convention. Layer scoping (`.md`, `.shadcn`) stays symmetric and class-based on the scope element; mode is the orthogonal third axis. `applyDom` always emits all four blocks (`.md`, `html.dark .md`, `.shadcn`, `html.dark .shadcn`) — toggling mode is a class flip, never a re-derivation.

5. **`globals.css` baked from `deriveTheme(DEFAULT_INPUTS)`, gated by an integrity test.** First-paint defaults live in `globals.css` so SSR has no FOUC. A test asserts `globals.css` contents equal `deriveTheme(DEFAULT_INPUTS)` output; CI fails if derive.ts changes and `globals.css` doesn't. Hand-write or codegen — the test is the gate.

**Why:** WYSIWYG is the product promise this tool is built to deliver. Every architectural rule in this ADR exists to remove a code path where preview and export could diverge. The previous prototype had four derive paths (`recompute`, `recomputeDraft`, `resolveMd3Tokens`, `resolveShadcnTokensForApply`); this design has one.

**Consequence:**

- `applyDom` and `exporters/*` consume the same `{md, shadcn}` map. Any shared low-level formatter (e.g., `tokenToOklchString`) lives in `core/theme/` once. Reject any suggestion to put color logic — conversion, rounding, role mapping — in `applyDom` or `exporters/*`. Push it into `deriveTheme`.
- Slice 1 ships the drift-guard test (one md token + one shadcn token; expand as derive.ts grows).
- `applyDom` updates a single `<style>` element in `<head>` (append-once, replace `textContent` on update). After `globals.css` in source order, so cascade wins.
- "Reset all" = `source.setState(DEFAULT_INPUTS)`. Don't reach around `persist` middleware with `localStorage.removeItem` — the source store is the only mutation surface.

## Amendment to ADR-0005

ADR-0005's spine signature line currently reads `deriveTheme(source) → { md, shadcn, css, warnings }`. The `css` field is struck. The "named pure transforms (palettes, surface, tokens, css)" list loses `css`. This decision is part of (1) above — kept here so a future reader of ADR-0005 sees the amendment in one hop.

> **State:** Frozen. Append amendment blocks only — never rewrite the body. New decisions get new ADRs.

# Renderer ≠ exporter — distinct consumers, distinct shapes

`deriveTheme(source)` produces `{ md, shadcn, warnings }` (per ADR-0017). Two kinds of consumer eat that output: a runtime renderer that writes CSS variables onto the DOM for live preview, and exporter functions that serialise tokens into copy-paste output for human consumption. A reasonable-sounding suggestion is to fold both behind a single "sink" abstraction.

**Decision:** Keep them separate by *role*.

1. **Renderer.** `applyDom(theme)` writes a single `<style id="tonex-tokens">` element appended to `<head>` after `globals.css`. Emits four class-scoped blocks (`.md`, `html.dark .md`, `.shadcn`, `html.dark .shadcn`) per ADR-0013. No-ops while `_hydrated === false` (per ADR-0015). One renderer, called once per source change, idempotent.

2. **Exporters.** Pure functions in `packages/core/src/theme/exporters/` that take a theme and produce a string for human use (clipboard, file download). Today: `exportCss(theme, layer: 'md' | 'shadcn')` — single function, layer-discriminated. No DOM access, no side effects.

**Why:** A renderer needs cascade-correct DOM ordering, idempotent updates, and hydration-gating. An exporter needs human-readable formatting and zero side effects. Forcing one shape to serve both either bloats the renderer with format options or hobbles exporters with DOM concerns. Separating by role keeps each shape minimal and the test boundaries clean (renderer integration-tested in jsdom; exporters unit-tested as pure string returns).

**Consequence:**

- New output formats (json, dart, ts, …) earn their own files in `exporters/` when they actually ship. Today's single `exportCss` does **not** justify a typed registry — one entry isn't a registry, it's a function with a discriminator.
- **Future work — deferred until justified by demand:** when a 2nd export format ships, lift exporters into a typed registry (mirror the variants registry shape per ADR-0010): `exporters: Record<string, Exporter> as const satisfies …`. Don't pre-build the registry — build it the moment two formats need to coexist.
- `applyDom` is never called from a tool/CLI build step. Bake-time CSS comes from `formatCss(deriveTheme(DEFAULT_INPUTS))` — `formatCss` is a renderer-adjacent helper that produces the same text `applyDom` would emit, exposed as a string for build tooling. The drift-guard test asserts equality between baked output and live `formatCss` output for arbitrary source state.
- Tempted to add an `exportClipboard(theme)` that reads the DOM → refuse. Clipboard is a side-effect *consumer* of an exporter's string, not a separate exporter. The www app handles the clipboard call; core stays pure.
- Schema for the exporter contract (when registry-time arrives) is the same shape as variants and color-systems: `{ name, format(theme): string, mimeType }` or similar. The shape is anticipated, not committed — when registry-time arrives, the second exporter informs the final shape.

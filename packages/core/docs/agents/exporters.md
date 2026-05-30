> **State:** Living. Edit when a renderer or exporter rule changes; the why lives in the cited ADR.

# Sinks — renderer + exporters

Governs `theme/exporters/`, `bundle.ts`, `format.ts`, `applyDom`.

- **Renderer is single.** One `applyDom`, called once per source change, idempotent. No second runtime CSS writer. _(ADR-0008)_
- **Exporters are pure.** Files in `exporters/` return strings — no DOM, no side effects. _(ADR-0008)_
- **Bake-time CSS uses `formatCss`, not `applyDom`.** Tools and CLIs never call the renderer. _(ADR-0008)_
- **Clipboard is an app-layer consumer.** Don't bundle DOM/clipboard into core exporters. _(ADR-0008)_
- **New exporter = new file + barrel export.** Options extend `ExportOptions` in `bundle.ts`. The barrel + options pattern is the registry — no separate typed registry. _(ADR-0008)_
- **`DerivedTheme` token maps hold argb numbers.** Projection (argb → oklch/hex) is format-time; `format.ts` owns it via `oklchString(argb)` / `hexString(argb)`. `applyDom` writes via `oklchString`; exporters branch on `colorFormat`. _(ADR-0021 c.1)_
- **Layer shape encodes semantics class.** `MdLayer` separates core role tokens (mode-aware, DOM-emitted), chart tokens (mode-aware, DOM-emitted, filter-gated for export), extended role tokens (mode-aware, DOM-emitted per ADR-0021 c.4 amendment 2026-05-29), palette tones (mode/contrast-invariant, data-only). `applyDom` emits every md/shadcn field except palette tones. _(ADR-0021 c.3, c.4)_
- **Token-name partitions live as Sets on schema constants** (`MD_CORE_TOKEN_NAMES`, `MD_EXTENDED_TOKEN_NAMES`, `MD_PALETTE_TOKEN_NAMES`, `MD_CHART_TOKEN_NAMES`) — name-match Sets, not contiguous slices; baked-CSS order unchanged. _(ADR-0021 c.2)_
- **`ExportOptions` defaults match single-contrast oklch** (`colorFormat: 'oklch'`, every `include*` off) — the lean export most users paste. _(ADR-0021 c.6)_
- **`applyDom` always emits the full functional theme.** WYSIWYG-visibility filtering happens at the inspect surface, not the renderer. _(ADR-0021 c.7)_
- **Audience routing by composition.** `<ExportButton tabs={ExportTab[]} />`; the route decides which tabs appear. No path-sniffing inside the dialog. _(ADR-0021 c.8)_
- **Contrast variants emit as one class-scoped CSS file.** `buildContrastBundle(source, { includeContrastVariants })` runs the 3× derive when needed; `exportCss(bundle, layer, options)` always takes a bundle. _(ADR-0021 c.5)_
- **shadcn export uses `:root` + `.dark`, not class scopes** (users paste-replace shadcn-cli blocks); md export keeps class-scoped output. `includeContrastVariants` is md-only. _(ADR-0021 Amendment 2026-05-13)_
- **`includeHeader: boolean` is shadcn-only** — prepends the Tailwind v4 incantation for green-field projects; md ignores it. _(ADR-0021 Amendment 2026-05-13)_

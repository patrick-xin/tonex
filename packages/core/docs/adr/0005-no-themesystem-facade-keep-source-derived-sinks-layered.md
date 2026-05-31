# No ThemeSystem facade — keep Source / Derived / Sinks layered

A reasonable-sounding suggestion is to collapse the theme code behind a single `ThemeSystem` facade with `.apply()`, `.toCSS()`, `.copyToClipboard()` methods. We considered it and rejected it.

**Decision:** Keep the layered design: source-of-truth store, pure `deriveTheme(source) → { md, shadcn, warnings }`, and a Sink interface (DOM, clipboard) on the output side. `deriveTheme` stays pure with **zero React imports and zero side effects**. There is no facade class wrapping derivation and effects together.

> **Amended by ADR-0017:** the `css` field was originally part of the spine signature; it has been removed. CSS serialization lives exclusively in `exporters/*`. See ADR-0017 for the full WYSIWYG / no-drift commitment.

**Why a facade fails the deletion test:** Without `ThemeSystem`, callers write two lines: `const t = deriveTheme(useSource.getState()); applyDom(t)`. Complexity does not concentrate elsewhere, so the facade earns no leverage — it's a wrapper around two lines.

**Why the facade actively harms:**
1. Mixing pure derivation with DOM/clipboard side effects in one class makes derivation untestable without mocking effects. Today `deriveTheme` is testable as `(source) → output` with real fixtures.
2. The facade collapses real seams: TW + Radix as `ColorSystem` adapters, DOM + clipboard as Sink adapters. **Two adapters = real seam** — collapsing them is the textbook anti-move.
3. It defeats the slot-fill goal. Adding Radix under the layered design is one file in `color-systems/`. Adding it inside a facade means editing internal switches.
4. The "many imports" complaint that motivates the facade is a strawman: callers import the public surface (a hook + a sink), not the file tree.

**Consequence:** The public surface for callers is small but **not** funneled through one class — a hook (`useResolvedTokens`) for components, a pure derive function (`deriveTheme`) for tests and fixtures, and sink functions (`applyDom`, exporters) for DOM and export. The file count is higher than a facade design would have, but that's the **shape** of slot-fill, not a smell. Resist future suggestions to consolidate into a class.

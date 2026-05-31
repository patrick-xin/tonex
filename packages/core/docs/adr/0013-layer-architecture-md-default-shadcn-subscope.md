# Layer architecture — md default, shadcn sub-scope, both class-scoped

Tonex serves two audiences (md3 users, shadcn users) from one engine. ADR-0017 pins both layers always co-derived in one call. This ADR pins how those layers reach the DOM.

**Decision:**

1. **`<body class="md">`.** Tonex's app default is md. Set in the root layout.

2. **Shadcn is a class-scoped sub-region.** Where shadcn output is rendered (today: the shadcn canvas at `/theme/shadcn` per ADR-0019), a `<div class="shadcn">` wraps it.

3. **`applyDom` emits four class-scoped blocks.** `.md` (light), `html.dark .md`, `.shadcn` (light), `html.dark .shadcn`. **Both layers class-scoped — no `:root` shortcut.** Symmetric scoping is non-negotiable.

4. **Mode is owned by `next-themes` on `<html class="dark">`** — per ADR-0017 commitment 4. `applyDom` emits all four blocks regardless of mode; the `<html>` class flip selects which pair wins via cascade. No re-derivation on mode toggle.

5. **Single `<style id="tonex-tokens">` in `<head>`.** Appended once after `globals.css` so the cascade wins. (How it's updated — per-token, not re-serialized — is ADR-0017's perf concern.)

**Why:** Symmetric scoping (both layers class-scoped, neither at `:root`) is future-proof. An md preview pane embedded in a shadcn page would work without rewiring `applyDom`. Token-name collisions between MD3 and shadcn (both have notions of background, primary, foreground) are prevented structurally by the scope class — neither layer leaks into the other's namespace.

The route-segmentation play (ADR-0019) sits on top of this: the route picks which layer the canvas reads, but `applyDom` always emits both. Switching routes does not re-derive.

**Consequence:**

- **Reject** any suggestion to use route groups `(shadcn)/` and `(md)/` to multiplex the same URL — Next.js route groups are organisational, not layer multiplexers.
- **Reject** any suggestion to put one layer at `:root` and the other in a class. Symmetry is the rule.
- **Reject** the "single layer" framing — "the app is shadcn" or "the app is md" misses that both scopes coexist day one.
- **Reject** a runtime `<Layer>` context that swaps primitives at runtime — route-level segmentation (ADR-0019) is the layer mechanism.
- Slice 1 (the day-one tracer) verifies BOTH layers — one md element + one shadcn element, both updating from one source change. The "and" is load-bearing.
- The Tailwind v4 bridge between md `--color-*` tokens and shadcn classic names (`--primary` etc.) lives in `globals.css`, not in engine code. `derive.ts` stays a pure value function.

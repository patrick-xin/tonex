# @tonex/core-react — the editor runtime

A **consumer** of `@tonex/core`: the stateful, browser-bound layer the pure engine deliberately excludes — the zustand source store (`useSource`), the subscription hook (`useResolvedTokens`), the DOM sink (`applyDom`), debounced persistence (`flushPersist`). _(ADR-0037)_

## Consuming core (the rule for every consumer)

Before walking core's source, read its surface map → [`../core/docs/agents/api/core-surface.md`](../core/docs/agents/api/core-surface.md). Domain terms → [`../core/docs/glossary.md`](../core/docs/glossary.md).

- **Surface, don't reimplement.** Derivation, colour encoding, and the contrast verdict live in core; this package adds *state and DOM*, not color math. `applyDom` stringifies via core's `oklchString` — it computes no colors itself.
- **Dependency is one-way: `core-react → core`, never the reverse.** That's what keeps `@tonex/core` React-free and consumable by a CLI/SDK. Don't reach back from core into this package. _(ADR-0037)_
- **Need engine behaviour core lacks?** Add it to core first, then import it. _(ADR-0016)_

## Keep exactly

- **Hydration gate (ADR-0015).** `useResolvedTokens()` returns `null` until the source store hydrates — consumers MUST handle the null. `applyDom` is SSR-safe (no-op when `window` is undefined) and only writes once `_hydrated`. Read the gate via `selectHydrated`, never `_hydrated` directly.
- **One shared `<style id="tonex-tokens">`, four fixed scope rules** (`.md`, `html.dark .md`, `.shadcn`, `html.dark .shadcn`) in source order — match exporters/globals.css so the cascade is identical. _(ADR-0017)_

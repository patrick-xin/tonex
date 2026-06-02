# `@tonex/core-react` — split the editor runtime out of the pure engine

`@tonex/core` is ~95% pure already: `deriveTheme` and every sink it feeds are framework-free (ADR-0005). Four files carry the exception — the zustand source store (`theme/source.ts`), the React hook (`theme/useResolvedTokens.ts`), debounced `localStorage` persistence (`theme/persist-storage.ts`), and the live DOM sink (`theme/applyDom.ts`). Because the package barrel re-exports the store, any consumer that imports `@tonex/core` drags `zustand`, `react`, and a browser assumption into its dependency graph. ADR-0005's "`deriveTheme` is pure, zero React" is therefore only a **convention** today — nothing structural stops the engine from re-coupling.

**Decision:** Split `@tonex/core` into two packages along the purity line.

1. **`@tonex/core`** keeps its name and becomes the pure engine. Dependencies: `@tonex/color-utils`, `@tonex/mcu`, `valibot` — no `react`, no `zustand`, no `jsdom`. It holds the `deriveTheme` spine, schema, exporters, chart, contrast, surface, hct, oklch, and image domain.

2. **`@tonex/core-react`** holds the editor runtime: the zustand source store, the `useResolvedTokens` hook, debounced `localStorage` persistence, and the `applyDom` live DOM sink. Dependencies: `@tonex/core`, `@tonex/color-utils` (the store validates hex at the write seam via `isValidHex`), and `zustand`; `react` as a peer. It consumes the engine through public subpaths only — the main barrel plus `@tonex/core/schema` (the domain barrel that already re-exports the presets, edge-weight, palette-override, preset-apply and cmf-second-source helpers the store's reducers delegate to) and `@tonex/core/variants` — never reaching into `@tonex/core/src`.

3. **The dependency is one-way: `@tonex/core-react` → `@tonex/core`, never the reverse.** Pure domain logic currently hosted in the store file relocates to pure core — `selectSeedHex` (a pure function over `PortableTheme['seed']`, which a CLI would call → ADR-0016) moves to the engine; store-shaped selectors (`selectPortable`, `selectHydrated`, which read `SourceState`/`_hydrated`) move with the store.

4. **The boundary enforces ADR-0005 structurally.** Pure `@tonex/core` cannot import `zustand`/`react` because they are not in its dependency graph. What was convention becomes a structural guarantee, backed by a lint-enforced check.

5. **`apps/www` imports both** — the engine surface from `@tonex/core`, the store surface from `@tonex/core-react`.

**Why:** This extends ADR-0011's split-trigger rule (Consequence: "Splitting … only when a second consumer arrives. Two adapters = real seam; one consumer = manufactured seam."). A literal reading would defer the split until a CLI/SDK/AI consumer is in scope. We land it now, deliberately, as **foundation** — not as the second feature, which is explicitly out of scope here. Three things make the seam earned despite a single present consumer:

1. **It enforces an invariant www already depends on.** ADR-0005's purity is load-bearing for the engine's testability and dependency hygiene. The boundary converts it from a convention the barrel currently violates into a structural fact — so this is not a purely speculative seam, it pays off for the sole current consumer (jsdom-free engine tests, a clean dependency tree).
2. **One-time move beats two.** Doing the split as foundation now is cheaper than letting the engine accrete more store coupling and paying for a harder split later.
3. **The second consumer is anticipated, not hypothetical.** A CLI / SDK / AI integration is the named motivation; the boundary is the seam ADR-0011's split-trigger rule describes, landed ahead of the consumer rather than with it. The forcing condition (second consumer arrives) is accepted as already met in intent.

**Consequence:**

- `@tonex/core-react` ships `private: true` until it publishes (ADR-0011, Consequence: new publishable artifacts join `packages/` private-until-ready).
- Pure core's vitest drops `jsdom`; engine tests run in the node environment.
- A lint-enforced purity check (`scripts/check-conventions.mjs`) fails any commit that reintroduces `react`/`zustand` into `@tonex/core` production source — the regression lock on the boundary.
- `@tonex/core` must **never** import `@tonex/core-react`; the reverse-import is the failure mode the one-way rule blocks.
- A future second consumer (CLI/SDK/AI) imports only `@tonex/core` and never touches the React package — the payoff this foundation buys.
- Subpath exports remain the public surface for both packages (ADR-0016); each `package.json#exports` is the truth-source.
- The cache-backed `getDerivedTheme` (module-global FIFO, issue #20) is exposed on a dedicated `@tonex/core/derive-cache` subpath, **not** the main barrel — so the engine's pure front door advertises only the referentially-transparent `deriveTheme`, while the editor runtime (`useResolvedTokens`, `applyDom`) opts into the shared cache explicitly. This keeps the module-global cache state off the surface a future stateless SDK consumer reads first.
- This split serves the engine's **read path** (derive/export). The store's mutation rules (lock gating, touch-intent, the epsilon/gamut guards, clamp invariants, null-delete) stay welded into the zustand reducers and move *with* the store — so a future read-write integration (AI/CLI editing a theme through the same vetted rules) is a follow-on foundation slice that relocates those reducers into pure core. The one-way dep makes that later lift directional, not a rewrite; it is recorded here as anticipated, deferred work — see issue #178.
- Cited by number per ADR-0011 c.5; never renumber.

**Code anchors:** `packages/core-react/src/index.ts`, `packages/core-react/src/source.ts`, `packages/core/src/index.ts`, `scripts/check-conventions.mjs` — the editor-runtime barrel, the store consuming the engine via public subpaths, the purified engine barrel, and the core-purity regression lock.

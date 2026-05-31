# Production UI — layer-segmented routes, layer-unified engine

Foundation slices (1–8) shipped a layer-unified engine: `deriveTheme(source)` co-emits both md and shadcn tokens for both modes, on a single DOM, governed by ADR-0017 (no preview/export drift). Production UI design must serve two audiences (md3 users and shadcn users) without forking that engine and without reframing the product as "pick a layer."

**Decision:** Production UI is **layer-segmented at the route level** and **layer-unified at the engine level**. Two parallel views over one source store.

1. **One editor route per layer: `/theme` (md) and `/theme/shadcn`.** md sits at the `/theme` root; shadcn keeps its named segment. Implemented via Next.js route groups — `app/(app)/theme/(md)/page.tsx` resolves to `/theme`, `app/(app)/theme/(shadcn)/shadcn/page.tsx` to `/theme/shadcn` — parens used for layout encapsulation, never to multiplex the same URL (the two route-group folders resolve to distinct URLs). The route is the layer label; no in-app layer toggle. An **outer** route group encapsulates the editor (layouts/middleware for the in-app surface attach there); non-editor surfaces (marketing, docs) grow under their own outer sibling group, and md-/shadcn-side surfaces may grow within their layer's route group. The load-bearing rule is one route group per layer, plain folder paths, no in-app toggle — the specific `/theme/md3` symmetry of the first cut was not load-bearing.

2. **One source store, shared across both routes.** Single persistence key (`tonex-theme-v1`). Navigating between routes preserves all state. There is no per-route store, no per-route persistence, no migration on route change.

3. **Layer scoping (`.md`, `.shadcn`) is set by the route on a shared editor layout element.** `next-themes` continues to own dark mode (per ADR-0017 commitment 4). `applyDom` continues to emit all four blocks regardless of route — both layers are always present on the DOM. The route controls only which block the canvas *reads*.

4. **Chrome dogfoods `components/ui/` (md-styled) on every route.** Rail, top tabs, status strip, modals, settings, cross-route layer switcher — all sourced from tonex's own md-styled component library, regardless of which output the user is generating. Tonex IS an md-styled product that helps users generate themes for either output. A shadcn user sees an md-styled editor with a shadcn-styled canvas; this is intentional.

5. **Canvas is the only layer-segmented surface.** `/theme` canvas uses `components/ui/`; `/theme/shadcn` canvas uses `components/shadcn/`. Each canvas reads tokens from the layer block emitted by `applyDom` — no re-derivation, no re-skin, no runtime layer prop on shared components.

6. **`/` is a chooser landing.** Separate concern from the editor; ships in its own slice. Until then, `/` may placeholder-redirect to `/theme/shadcn` (the larger audience target per the brief tagline) or render a known-stub. Editor routes are independently navigable.

7. **`/sink` survives until editor parity.** The legacy testbed continues to verify the engine while production editor routes are built. Once `/theme` and `/theme/shadcn` cover every editing affordance plus canvas verification, `/sink` retires. Feature-driven, not date-driven.

**Why:** ADR-0017's WYSIWYG promise is "both layers always coherent." A layer toggle in the chrome introduces cognitive load that competes with that promise — the user starts thinking of one layer as primary and the other as an export target. Two routes solve audience legibility (a shadcn user sees shadcn components; an md3 user sees md3 components) without forking the engine, without persisting layer choice as a separate axis, and without inventing a third state shape. The product positioning becomes "edit once, export both," which is the differentiator that motivated the engine architecture in the first place.

**Consequence:**

- Implementation slices (10+) lift testbed rail controls into `features/editor-rail/`. The rail is shared between routes; per-route differences are slot-level (a shadcn-only collapsible appears only on `/theme/shadcn`, by route-level composition, not runtime branching).
- The cross-route layer switcher is a chrome control that navigates between the two routes; state persists via the shared store, so no extra plumbing.
- The "Customize Tokens" tab inside the rail (per legacy reference) is a content swap inside the rail body, not a route. Same store, same route — just a different rail mode.
- **Route-provided `<LayerContext>` is allowed for behavior parameterization, not primitive selection.** A workflow feature (e.g. `features/token-override/`) consumed from both `(md)` and `(shadcn)` subtrees may read a route-provided context to know *which token list / scheme / scope* it operates on. Still banned: runtime primitive switching — a component must not pick `components/ui/` vs `components/shadcn/` from context; primitive selection stays route-level. Rule of thumb: if removing the context changes *which component renders*, that's the banned pattern; if it changes *what data the same component renders*, that's allowed.
- `glossary.md` gains *Editor route*, *Chrome*, *Canvas* vocabulary when those terms become felt in code, per glossary.md's "vocabulary for unbuilt features doesn't belong here" rule.
- `docs/agents/slice-strategy.md` acknowledges blueprint slices (this one) as legitimate precedent for doc-only slices.

This ADR does not amend ADR-0017. ADR-0017's five commitments hold unchanged: both modes co-derived in one call, all four blocks always emitted, mode owned by next-themes, derive is the single source of truth, `globals.css` baked from defaults. Layer *presentation* is downstream of all of them.

**Amendment anchors** — dates cited from code/docs; each decision is folded into the body above and kept here only so the citation resolves in one hop:

- **2026-05-06** — md route shortened from `/theme/md3` to `/theme` (shadcn keeps its named segment). Folded into commitment 1.
- **2026-05-07** — outer route group encapsulates the editor; non-editor surfaces grow under their own outer sibling group. Commitment 1's "two editor routes" was the layer split, not a route cap. Folded into commitment 1.
- **2026-05-08** — route-provided `<LayerContext>` allowed for behavior parameterization (ADR-0022), distinct from the runtime primitive switching commitments 4–5 still ban. Folded into the Consequence.

**Code anchors:** `apps/www/src/lib/layer-context.tsx` — segmented md/shadcn route layer.

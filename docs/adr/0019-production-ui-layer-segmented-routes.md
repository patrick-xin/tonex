> **State:** Frozen. Append amendment blocks only — never rewrite the body. New decisions get new ADRs.

# Production UI — layer-segmented routes, layer-unified engine

Foundation slices (1–8) shipped a layer-unified engine: `deriveTheme(source)` co-emits both md and shadcn tokens for both modes, on a single DOM, governed by ADR-0017 (no preview/export drift). Production UI design must serve two audiences (md3 users and shadcn users) without forking that engine and without reframing the product as "pick a layer."

**Decision:** Production UI is **layer-segmented at the route level** and **layer-unified at the engine level**. Two parallel views over one source store.

1. **Two editor routes: `/theme/md3` and `/theme/shadcn`.** Plain folder paths. Next.js route groups (parens) are used for layout encapsulation, but never to multiplex the same URL. The route is the layer label; no in-app layer toggle.

2. **One source store, shared across both routes.** Single persistence key (`tonex-theme-v1`). Navigating between routes preserves all state. There is no per-route store, no per-route persistence, no migration on route change.

3. **Layer scoping (`.md`, `.shadcn`) is set by the route on a shared editor layout element.** `next-themes` continues to own dark mode (per ADR-0017 commitment 4). `applyDom` continues to emit all four blocks regardless of route — both layers are always present on the DOM. The route controls only which block the canvas *reads*.

4. **Chrome dogfoods `components/ui/` (md-styled) on every route.** Rail, top tabs, status strip, modals, settings, cross-route layer switcher — all sourced from tonex's own md-styled component library, regardless of which output the user is generating. Tonex IS an md-styled product that helps users generate themes for either output. A shadcn user sees an md-styled editor with a shadcn-styled canvas; this is intentional.

5. **Canvas is the only layer-segmented surface.** `/theme/md3` canvas uses `components/ui/`; `/theme/shadcn` canvas uses `components/shadcn/`. Each canvas reads tokens from the layer block emitted by `applyDom` — no re-derivation, no re-skin, no runtime layer prop on shared components.

6. **`/` is a chooser landing.** Separate concern from the editor; ships in its own slice. Until then, `/` may placeholder-redirect to `/theme/shadcn` (the larger audience target per the brief tagline) or render a known-stub. Editor routes are independently navigable.

7. **`/sink` survives until editor parity.** The legacy testbed continues to verify the engine while production editor routes are built. Once `/theme/{md3,shadcn}` cover every editing affordance plus canvas verification, `/sink` retires. Feature-driven, not date-driven.

**Why:** ADR-0017's WYSIWYG promise is "both layers always coherent." A layer toggle in the chrome introduces cognitive load that competes with that promise — the user starts thinking of one layer as primary and the other as an export target. Two routes solve audience legibility (a shadcn user sees shadcn components; an md3 user sees md3 components) without forking the engine, without persisting layer choice as a separate axis, and without inventing a third state shape. The product positioning becomes "edit once, export both," which is the differentiator that motivated the engine architecture in the first place.

**Consequence:**

- Implementation slices (10+) lift testbed rail controls into `features/editor-rail/` per ADR-0020 (lift standard). The rail is shared between routes; per-route differences are slot-level (a shadcn-only collapsible appears only on `/theme/shadcn`, by route-level composition, not runtime branching).
- The cross-route layer switcher is a chrome control that fires `<Link href="/theme/{other}">`. State persists via the shared store; no extra plumbing.
- The "Customize Tokens" tab inside the rail (per legacy reference) is a content swap inside the rail body, not a route. Same store, same route — just a different rail mode.
- `CONTEXT.md` gains *Editor route*, *Chrome*, *Canvas* vocabulary when those terms become felt in code, per CONTEXT.md's "vocabulary for unbuilt features doesn't belong here" rule.
- `docs/agents/slice-strategy.md` acknowledges blueprint slices (this one) as legitimate precedent for doc-only slices.

This ADR does not amend ADR-0017. ADR-0017's five commitments hold unchanged: both modes co-derived in one call, all four blocks always emitted, mode owned by next-themes, derive is the single source of truth, `globals.css` baked from defaults. Layer *presentation* is downstream of all of them.

## Amendment 2026-05-06 — md route shortened to `/theme`

Commitment 1 originally pinned the routes as `/theme/md3` and `/theme/shadcn`. Implementation in slice 10 settled on `/theme` (md) and `/theme/shadcn` instead — md sits at the `/theme` root, shadcn keeps its named segment. Implemented via Next.js route groups: `app/(app)/theme/(md)/page.tsx` resolves to `/theme`, `app/(app)/theme/(shadcn)/shadcn/page.tsx` to `/theme/shadcn`. Layer encapsulation via parens is preserved per the ADR's own ban on multiplexing the same URL — the two route-group folders resolve to distinct URLs.

**Why:** md3 is the broader-audience default per the brief tagline; the shorter URL signals it. Shadcn keeps its named segment because it's the targeted-audience export. The original `/theme/md3` symmetry was not load-bearing — what is load-bearing is one route per layer, plain folder paths, and no in-app layer toggle. All three still hold.

Commitments 2–7 are unchanged.

## Amendment 2026-05-07 — outer `(app)` group + `(root)` landing + md `components` subroute

Route tree expanded to anticipate non-editor surfaces (marketing, docs, future) without polluting the editor namespace. Three additions:

1. **Outer `(app)` route group.** Editor and testbed live under `app/(app)/`. Layouts or middleware that should apply only to the in-app surface attach here; pages outside the group (marketing landings, future docs) get their own siblings without leaking the app chrome.
2. **`(root)` route group for `/`.** The chooser landing is `app/(app)/(root)/page.tsx` rather than `app/(app)/page.tsx`. The group exists so the landing can grow siblings (about, pricing, future entry points) under a shared layout without colliding with `/theme` or `/sink`.
3. **Md-side `/theme/components` subroute.** A second md route at `app/(app)/theme/(md)/components/page.tsx`. Sits inside the `(md)` group so it inherits md scoping — same chrome, same layer assignment, different canvas content.

Commitment 1's "two editor routes" framing referred to the **layer split** (md vs shadcn), not a hard cap on total routes. Md-side surfaces may grow within `(md)/`; shadcn-side surfaces may grow within `(shadcn)/`. The load-bearing rule is unchanged: one route group per layer, plain folder paths, no in-app layer toggle.

**TBD:** Further `apps/www/src/` structure decisions (additional groups, marketing namespace, docs surface) defer until the UI pressure for them lands. Avoid speculative structure — pattern-gravity per ADR-0014 means the first concrete instance shapes the next ten.

Commitments 2–7 are unchanged.

## Amendment 2026-05-08 — `<LayerContext>` allowed for behavior parameterization (not primitive switching)

ADR-0022 introduces route-provided `<LayerContext>` so workflow features (e.g. `features/token-override/`) can read which layer's tokens they are operating on, when the same workflow is consumed from both `(md)` and `(shadcn)` route subtrees. This is distinct from — and does not loosen — this ADR's commitments 4 and 5.

**Still banned (unchanged):** runtime primitive switching. A component must not pick `components/ui/` vs `components/shadcn/` based on context. Primitive selection remains route-level: md routes import `components/ui/`, shadcn routes import `components/shadcn/`.

**Newly allowed:** behavior parameterization. A workflow feature consuming a route-provided context to know which token list / scheme / scope to operate on is a legitimate use of context. The context carries data, not primitive identity.

Rule of thumb: if removing the context would change *which component renders*, that's the banned pattern. If removing it would change *what data the same component renders*, that's the allowed pattern.

Commitments 1–7 are unchanged.

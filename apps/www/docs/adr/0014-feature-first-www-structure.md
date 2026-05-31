# Feature-first www structure with five hard rules

`apps/www/src/` is feature-first. The legacy prototype showed four failure modes that destroyed pattern-gravity: nested sub-features, multiple `shared/` rot folders, features without public surfaces, and layer mixed with workflow at the wrong abstraction level. The rules below block each one structurally.

**Decision:**

1. **No sub-features.** `features/<name>/` is the **only** namespace level. If a feature outgrows itself, **split into siblings**, never nest. `components/`, `hooks/`, `index.ts` inside a feature are *organisational*, not sub-features. A folder under `features/<name>/` qualifies as organisational only if its contents are private primitives or hooks consumed by the feature's own surface; if it carries a perceivable workflow (its own panel, its own user-facing flow), it is a sub-feature and must split into a sibling. Trigger to split: ~10+ files and a workflow the user could perceive as a separate thing.

2. **Each feature has an `index.ts` (or `index.tsx`) public surface.** Files inside a feature are private by convention; routes and other features import only from `features/<name>` (the index). **Bare files at `features/` root are forbidden** — every consumer that lives under `features/` must be inside a `features/<name>/` folder with an index, even if the folder has only one file today.

3. **Providers by scope.** App-wide → `app/_providers.tsx`. Feature-scoped → inside the feature folder (e.g. `features/<name>/providers.tsx`). **No top-level `providers/` folder ever.** The location of a provider tells you its scope.

4. **`components/` has a strict promotion rule, three layer-keyed folders.** A component (or component group) lives in `components/` ONLY when 2+ features import it; single-feature components stay private to their feature. There are exactly three primitive folders, distinguished by layer semantics — `components/ui/` (md-styled), `components/shadcn/` (shadcn-styled), and `components/shared/` (layer-agnostic). `components/shared/` is a legitimate home for cross-layer primitives that are neither md- nor shadcn-styled; the promotion gate (2+ features) bounds the rot failure mode the original prototype's `shared/` folders showed, so the ban that once applied to it was an over-correction.

5. **Surface vs workflow — superseded by ADR-0022.** The original rule 5 made all features layer-agnostic (no `features/md/` or `features/shadcn/`). ADR-0022 supersedes it with a workflow/surface split: **workflow features** (verbs — "pick a seed") stay layer-agnostic, but **surface features** (nouns/places — `features/md-rail/`, `features/shadcn-rail/`) may be layer-keyed because they ARE the layer-specific composition site. The current statement of this rule, plus rule 6 (the locate-test design metric) and the route-provided `<LayerContext>` carve-out, all live in ADR-0022. This rule's number is retained as the anchor; its content moved.

**Layout target:** the concrete tree — the living version, including which slots are created on demand and which form the always-present core — is in `rules/structure.md`. This ADR pins the rules above, not the tree.

**Why:** Pattern-gravity. The first feature folder becomes the template for the next ten. Each rule corresponds to a legacy failure mode; the structural prevention is cheaper than per-PR enforcement, and it survives subagent parallelism (which would otherwise amplify a bad pattern across many features before review catches it).

**Consequence:**

- New feature → model on a representative existing feature folder. That folder is the de-facto template.
- Tempted to nest sub-features → refuse; split into a sibling.
- Tempted to leave a hook bare at `features/` root → refuse; place under a `features/<name>/` folder (promote to `lib/` only when 2+ features consume it).
- Tempted to create `features/shared/` → refuse; that rot-folder name stays banned. A cross-layer *primitive* belongs in `components/shared/` once 2+ features need it; otherwise keep it private to its feature.
- Tempted to add a `<Layer>` context for *primitive selection* → refuse; route-level segmentation is the layer mechanism (ADR-0019). A route-provided `<LayerContext>` for *behavior parameterization* (which token list / scheme a workflow operates on) is allowed per ADR-0022 — the distinction is whether removing the context changes *which component renders* (banned) or *what data the same component renders* (allowed).
- Doc surface for these rules: `apps/www/CLAUDE.md` keeps the living version with locate-test examples and any subsequent route-plan adjustments. This ADR pins rules 1–4; ADR-0022 carries rules 5–6 and the worked examples.

**Amendment anchors** — folded into the rule bodies above; no external date-citations, kept for the supersession chain:

- **2026-05-08** — rule 5 superseded and rule 6 added by ADR-0022 (the `ADR-0014 → ADR-0022` chain). Folded into rule 5.
- **2026-05-19** — rule 4 relaxed: `components/shared/` allowed as the third primitive folder. Folded into rule 4.

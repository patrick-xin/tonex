> **State:** Frozen. Append amendment blocks only — never rewrite the body. New decisions get new ADRs.

# Feature-first www structure with five hard rules

`apps/www/src/` is feature-first. The legacy prototype showed four failure modes that destroyed pattern-gravity: nested sub-features, multiple `shared/` rot folders, features without public surfaces, and layer mixed with workflow at the wrong abstraction level. The rules below block each one structurally.

**Decision:**

1. **No sub-features.** `features/<name>/` is the **only** namespace level. If a feature outgrows itself, **split into siblings**, never nest. `components/`, `hooks/`, `index.ts` inside a feature are *organisational*, not sub-features. A folder under `features/<name>/` qualifies as organisational only if its contents are private primitives or hooks consumed by the feature's own surface; if it carries a perceivable workflow (its own panel, its own user-facing flow), it is a sub-feature and must split into a sibling. Trigger to split: ~10+ files and a workflow the user could perceive as a separate thing.

2. **Each feature has an `index.ts` (or `index.tsx`) public surface.** Files inside a feature are private by convention; routes and other features import only from `features/<name>` (the index). **Bare files at `features/` root are forbidden** — every consumer that lives under `features/` must be inside a `features/<name>/` folder with an index, even if the folder has only one file today.

3. **Providers by scope.** App-wide → `app/_providers.tsx`. Feature-scoped → inside the feature folder (e.g. `features/<name>/providers.tsx`). **No top-level `providers/` folder ever.** The location of a provider tells you its scope.

4. **`components/` has a strict promotion rule.** A component (or component group) lives in `components/` ONLY when 2+ features import it. Single-feature components stay private to their feature. There are exactly two layer-keyed primitive folders — `components/ui/` (md) and `components/shadcn/`. **No `components/shared/`.**

5. **Features are layer-agnostic.** A feature's job is the workflow ("pick a seed"). Primitives come from `components/ui/` or `components/shadcn/` based on the consumption site, not from feature-level forks. There is no `features/md/` or `features/shadcn/` — wrong abstraction level.

**Layout target:**

```
apps/www/src/
  app/                # routes (per ADR-0019 chrome/canvas split)
    _providers.tsx    # app-wide providers ONLY here
  features/           # workflow features, layer-agnostic
  components/
    ui/               # md-styled primitives
    shadcn/           # shadcn-styled primitives
  lib/                # www-only glue (clipboard, cn) — created on demand
  styles/
```

Most slots are created on demand. The features/ + components/ + app/_providers.tsx core is not.

**Why:** Pattern-gravity. The first feature folder becomes the template for the next ten. Each rule corresponds to a legacy failure mode; the structural prevention is cheaper than per-PR enforcement, and it survives subagent parallelism (which would otherwise amplify a bad pattern across many features before review catches it).

**Consequence:**

- New feature → model on the *first* existing feature folder. That folder is the de-facto template.
- Tempted to nest sub-features → refuse; split into a sibling.
- Tempted to leave a hook bare at `features/` root → refuse; place under a `features/<name>/` folder (promote to `lib/` only when 2+ features consume it).
- Tempted to create `features/shared/` → refuse; promote to `components/` if 2+ features need it, otherwise keep private.
- Tempted to add a `<Layer>` context → refuse; route-level segmentation is the layer mechanism (ADR-0019).
- Doc surface for these rules: `docs/agents/www-structure.md` keeps the living version with locate-test examples and any subsequent route-plan adjustments. This ADR pins the rules; the doc carries the working examples.
- **Known violations at write time** (tracked in tracker, not in this ADR): the codebase has a small number of rule-1, rule-2, and rule-4 violations at the moment this ADR lands. They are filed as cleanup issues; the rules supersede them, not the other way around.

## Amendment 2026-05-08 — rule 5 superseded; rule 6 added (see ADR-0022)

Three slices of real features (editor-rail, export, testbed in active use; md/shadcn rail split + shadcn token-override route on the near horizon) revealed two failure modes in the original rules:

1. **Rule 5 was over-broad.** It correctly bans layer-keyed *workflow* features (don't fork "pick a seed" per layer) but also blocked layer-keyed *surface* features like `features/md-rail/` and `features/shadcn-rail/`, which are legitimate layer-specific composition sites and are needed to keep cross-layer workflows like `token-override` from becoming homeless.
2. **The locate-test was implicit.** Pattern-gravity is really an agent-locality property, but the rules never made it the falsifiable design metric.

**ADR-0022 supersedes rule 5** by introducing a workflow/surface split — workflow features stay layer-agnostic; surface features may be layer-keyed because they ARE the composition site. **ADR-0022 adds rule 6** — locate-test as the design metric: a prompt that names X must resolve to `features/<X>/` or one primitive in `components/`, otherwise the structure has missed a name.

ADR-0022 also clarifies that route-provided `<LayerContext>` for behavior parameterization is allowed and distinct from the runtime primitive switching banned by ADR-0019.

Rules 1–4 of this ADR stand unchanged. See ADR-0022 for the current rule set and the locate-test worked examples.

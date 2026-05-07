> **State:** Living. Edit when the route plan or feature template changes.

# www structure

`apps/www/src/` is feature-first under strict anti-rot rules. The five hard rules are durable; the layout target moves as routes and features land. Route plan and chrome/canvas split are fixed by ADR-0019.

## Layout (target)

```
apps/www/src/
  app/
    layout.tsx                  # outer chrome
    _providers.tsx              # app-wide providers ONLY here
    (app)/                      # main app group
      (root)/page.tsx           # chooser landing (placeholder until built)
      sink/page.tsx             # testbed; retires after production parity
      theme/
        layout.tsx              # editor chrome (rail + tabs + status strip)
        (md)/
          page.tsx              # md editor route (/theme)
          components/page.tsx   # md components route (/theme/components)
        (shadcn)/
          shadcn/page.tsx       # shadcn editor route (/theme/shadcn)
  features/                      # workflow features, layer-agnostic
    testbed/                     # current verification surface; retiring
    editor-rail/                 # production rail (slice 10+)
  components/
    ui/                          # md-styled primitives (BaseUI + tailwind-variants + md tokens)
    shadcn/                      # shadcn-styled primitives
  lib/                           # www-only glue (clipboard wrapper, cn) — created on demand
  styles/
```

Most slots are created on demand. The two editor routes and the chrome/canvas split are not.

The route-group wrapping (`(app)`, `(root)`, `(md)`, `(shadcn)`) anticipates additional surfaces (marketing, docs, more md/shadcn pages) without polluting the editor namespace — see ADR-0019 amendment 2026-05-07. Further `apps/www/src/` structure decisions (new groups, top-level namespaces, additional `features/`/`components/` conventions) are **TBD until more UI lands**. Pattern-gravity (ADR-0014) means the first concrete instance shapes the next ten — no speculative structure.

## Five hard rules

1. **No sub-features.** `features/<name>/` is the only namespace level. If a feature outgrows itself, **split into siblings**, never nest. `components/`, `hooks/`, `index.ts` inside a feature are organizational, not sub-features. Trigger to split: ~10+ files and a workflow the user could perceive as a separate thing.

2. **Each feature has an `index.ts` public surface.** Files inside a feature are private by convention; routes and other features import only from `features/<name>` (the index). When feature #2 violates this, the inconsistency with feature #1 is visible — that visibility is the load-bearing pattern-gravity move.

3. **Providers by scope.** App-wide → `app/_providers.tsx`. Feature-scoped → inside the feature folder (e.g. `features/<name>/providers.tsx`). **No top-level `providers/` folder ever.** The location of a provider tells you its scope.

4. **`components/` has a strict promotion rule.** A component lives in `components/` ONLY when 2+ features import it. Single-feature components stay private to their feature. There are exactly two layer-keyed primitive folders — `components/ui/` (md) and `components/shadcn/`. No `components/shared/`.

5. **Features are layer-agnostic.** A feature's job is the workflow ("pick a seed"). Primitives come from `components/ui/` or `components/shadcn/` based on the consumption site, not from feature-level forks. There is no `features/md/` or `features/shadcn/` — wrong abstraction level.

## Chrome vs canvas (per ADR-0019)

- **Chrome** = editor shell (rail, top tabs, status strip, modals, settings, cross-route layer switcher). Always sourced from `components/ui/`, on every route. Tonex dogfoods its own md-styled component library regardless of which output the user is generating.
- **Canvas** = preview surface inside `app/(app)/theme/{(md), (shadcn)/shadcn}/page.tsx`. Layer-segmented: md canvas reads from `components/ui/`; shadcn canvas reads from `components/shadcn/`.

A shadcn user sees an md-styled editor with a shadcn-styled canvas. That is intentional — the editor IS a tonex product, not a generic shell.

## Locate-test (≤ 2 dirs deep, every time)

- Rail / nav / status strip / settings button → `components/ui/` (chrome is always md per ADR-0019)
- shadcn primitive (Button, Input, Tabs) used in the shadcn canvas → `components/shadcn/`
- md primitive used in chrome or md canvas → `components/ui/`
- Seed-picker workflow → `features/seed-picker/` (or whichever feature owns it; layer-agnostic)
- Toast provider → `app/_providers.tsx` if app-wide, `features/<x>/providers.tsx` if scoped
- Clipboard wrapper → `lib/`

## How to apply

- New feature → model on the *first* existing feature folder. Once `features/editor-rail/` lands, it is the new template.
- Tempted to create `features/shared/` → refuse; promote to `components/` if 2+ features need it, otherwise keep private.
- Tempted to nest sub-features → refuse; split into a sibling.
- Tempted to add a runtime `<Layer>` context that swaps primitives at runtime → refuse; route-level segmentation is the layer mechanism (ADR-0019).

## Why these rules exist

Pattern-gravity. The first feature folder becomes the template for the next ten. The legacy prototype showed all four failure modes the rules block:
- nested sub-features (rule 1)
- multiple `shared/` rot folders (rule 4)
- features with no public surface (rule 2)
- layer mixed with workflow at the wrong abstraction level (rule 5)

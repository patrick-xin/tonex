> **State:** Living. Edit when a structure rule changes; the why lives in the cited ADR.

# Structure — feature-first under anti-rot rules

Read before any www change. `apps/www/src/` is feature-first. Terms → [../../glossary.md](../../glossary.md). _(ADR-0014 rules 1–4; ADR-0022 rules 5–6)_

## Six rules
1. **One-level features.** `features/<name>/` is the only namespace level; sub-folders are organisational, never sub-features. Split to a sibling feature at ~10+ files **and** a perceivable separate workflow. _(ADR-0014)_
2. **`index.ts` per feature.** Routes and other features import only from `features/<name>`. No bare files at `features/` root. _(ADR-0014)_
3. **Providers by scope.** App-wide → `app/_providers.tsx`. Feature-scoped → inside the feature. No top-level `providers/`. _(ADR-0014)_
4. **`components/` is `ui/` (md primitives), `shadcn/` (shadcn primitives), `shared/` (used by 2+ features), `icons/` (missing-from-lib icons).** Single-feature components stay private to their feature. _(ADR-0014)_
5. **Two feature classes, named after what the prompt calls them.** Workflow features (verb — "what the user does"): layer-agnostic, e.g. `token-override/`, `source-color/`, `export/`. Surface features (noun/place — "where the user is"): layer-keyed names allowed, e.g. `md-rail/`, `top-nav/`, `testbed/`; they compose workflow features and carry no workflow logic beyond layout/tab-switching. _(ADR-0022)_
6. **Locate-test is the design metric.** A prompt "do X to Y" must resolve to one `features/<Y>/` or one `components/` primitive. No home → create the named feature folder before writing code; don't tuck work in an unrelated folder. _(ADR-0022)_

## Canonical tree
```
apps/www/src/
  app/
    layout.tsx                  # outer chrome
    _providers.tsx              # app-wide providers ONLY here
    (app)/
      (root)/page.tsx           # chooser landing
      theme/
        (md)/
          layout.tsx            # Server: <LayerProvider value="md"> + MdRail + <MdNavTabs/>
          _md-nav-tabs.tsx      # 'use client' — bridges config across RSC boundary
          _nav-config.ts        # mdNavConfig
          page.tsx              # /theme — md canvas
          components/{page.tsx,_blocks/}
        (shadcn)/shadcn/
          layout.tsx            # Server: <LayerProvider value="shadcn"> + chrome + ShadcnProvider
          _shadcn-nav-tabs.tsx  _nav-config.ts  _provider.tsx
          page.tsx              # /theme/shadcn — shadcn canvas
          {components,blocks,dashboard,charts}/{page.tsx,_blocks/}
          token-override/page.tsx          # full-page expansion of features/token-override/
  features/                     # workflow + surface features (rule 5);
    md-rail/  shadcn-rail/  top-nav/  testbed/        # surfaces (layer-keyed allowed)
    source-color/ scheme-variant/ palette-override/ custom-colors/
    surface-adjustment/ token-override/ export/ …     # workflow (layer-agnostic)
  components/ { ui/  shadcn/  shared/  icons/ }
  lib/ { layer-context.tsx  nav-config.ts  handles.ts  hooks/ }
  styles/
```
Most slots are created on demand; `theme/(md|shadcn)/layout.tsx` + `_nav-config.ts`, `_providers.tsx`, and the `features/`/`components/` core are not.

## Locate-test
| Prompt | Folder(s) |
|---|---|
| "Enable token override for shadcn" | `features/token-override/` + `features/shadcn-rail/` |
| "Tweak the md rail" / "the shadcn rail" | `features/md-rail/` / `features/shadcn-rail/` |
| "Top nav settings menu" | `features/top-nav/` |
| "Add a contribution-history block" | `app/(app)/theme/(md)/components/_blocks/` |
| "Edit md role colors" | `features/color-roles-list/` |
| "Tweak source-color picker" | `features/source-color/` |
| Toast provider, app-wide / feature-scoped | `app/_providers.tsx` / `features/<x>/providers.tsx` |
| Clipboard wrapper | `lib/` |

**When applying:** new workflow → name after the verb; new surface → name after the place (layer-keyed OK). Refuse: workflow logic inside a surface feature; forking a workflow per layer (`md-token-override/` + `shadcn-token-override/`); `features/shared/` (promote to `components/` at 2+ consumers); nested sub-features (split to siblings once the trigger fires); runtime primitive switching (route segmentation is the layer mechanism); dropping a block into `components/` (canvas content is route-colocated under `_<bucket>/`, promote at 2+ page consumers).

## Feature-or-route-content discriminator
One route consumer + layer-hardcoded naming — apply in order:
1. **Mutates source state** (`setSource*`, store actions)? → **workflow feature** under `features/<name>/`, even if layer-hardcoded today (layer-awareness can be added later).
2. **Passive display** (reads selectors only) AND hardcodes layer-specific names AND one consumer? → **route-content**, colocate at the route (`page.tsx` inline or sibling `_<view>.tsx`).
3. Layer-agnostic, or ≥2 consumers? → **feature**.

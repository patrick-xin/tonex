> **State:** Living. Edit when the route plan, feature template, or rule set changes.

# www structure

`apps/www/src/` is feature-first under explicit anti-rot rules. Authoritative ADRs: **ADR-0014** (rules 1–4), **ADR-0022** (rules 5–6, supersedes original rule 5). Route plan and chrome/canvas split are fixed by **ADR-0019** (with the `<LayerContext>` clarification in its 2026-05-08 amendment).

## Six rules

1. **One-level features.** `features/<name>/` is the only namespace level. Sub-folders inside a feature are organisational only — never sub-features. If a folder under `features/<name>/` carries a perceivable workflow (its own panel, its own user-facing flow), it splits into a sibling feature. Trigger: ~10+ files **and** a perceivable separate workflow.
2. **`index.ts` per feature.** Every feature exposes a public surface; routes and other features import only from `features/<name>`. **No bare files at `features/` root.**
3. **Providers by scope.** App-wide → `app/_providers.tsx`. Feature-scoped → inside the feature folder. **No top-level `providers/`.**
4. **`components/` is `ui/` and `shadcn/` only.** A component lives there only when 2+ features import it. Single-feature components stay private to their feature. No `components/shared/`. Icons live under `components/ui/` (chrome is md per ADR-0019; icons travel with chrome).
5. **Two classes of features, both named after what the prompt calls them** (per ADR-0022):
   - **Workflow features** (verb/action — "what the user does"): layer-agnostic. Examples: `features/token-override/`, `features/source-color/`, `features/scheme-variant/`, `features/custom-colors/`, `features/surface-adjustment/`, `features/palette-override/`, `features/export/`.
   - **Surface features** (noun/place — "where the user is"): layer-keyed names allowed and encouraged here, because surfaces ARE the layer-specific composition site. Examples: `features/md-rail/`, `features/shadcn-rail/`, `features/top-nav/`, `features/testbed/`. Surface features compose workflow features; they don't carry workflow logic of their own beyond layout and tab switching.
6. **Locate-test is the design metric** (per ADR-0022). A prompt of the form "do X to Y" must resolve to one folder under `features/<Y>/` or one primitive under `components/`. If neither home exists, **create the named feature folder before writing code** — don't tuck the work inside an unrelated folder.

## Layout (target)

```
apps/www/src/
  app/
    layout.tsx                        # outer chrome
    _providers.tsx                    # app-wide providers ONLY here
    (app)/                            # main app group
      (root)/page.tsx                 # chooser landing
      sink/page.tsx                   # testbed route; retires after parity
      theme/
        layout.tsx                    # cross-layer chrome
        (md)/
          layout.tsx                  # provides <LayerContext value="md">; mounts md-rail
          page.tsx                    # /theme — md canvas
          components/
            page.tsx
            _blocks/                  # route-colocated canvas content
          demos/
            page.tsx
            _demos/
          palette/page.tsx
        (shadcn)/
          shadcn/
            layout.tsx                # provides <LayerContext value="shadcn">; mounts shadcn-rail
            page.tsx                  # /theme/shadcn — shadcn canvas
            components/{page.tsx,_blocks/}
            blocks/{page.tsx,_blocks/}
            dashboard/{page.tsx,_blocks/}
            charts/{page.tsx,_blocks/}
            token-override/page.tsx   # full-page expansion of features/token-override/
  features/                           # workflow + surface features (rule 5)
    # Workflow features (layer-agnostic)
    source-color/
    scheme-variant/
    palette-override/
    custom-colors/
    surface-adjustment/
    token-override/                   # consumed by shadcn-rail tab AND shadcn token-override route
    export/
    # Surface features (layer-keyed allowed)
    md-rail/
    shadcn-rail/
    top-nav/
    testbed/                          # retiring after parity
  components/
    ui/                               # md-styled primitives (BaseUI + tailwind-variants + md tokens) + icons
    shadcn/                           # shadcn-styled primitives
  lib/
    hooks/                            # cross-feature hooks (e.g. use-active-mode)
  styles/
```

Most slots are created on demand. The `app/(app)/theme/(md|shadcn)/layout.tsx` files, the `_providers.tsx`, and the `features/`/`components/` core are not.

## Layer awareness in workflow features

A workflow feature that needs to know which layer it's operating on reads `<LayerContext>` provided by the route layout. **Do not** prop-drill layer through callers. **Do not** branch primitive imports on layer (still banned per ADR-0019).

Allowed: `const layer = useLayer(); const tokens = layer === 'shadcn' ? shadcnTokens : mdTokens`.
Banned: `const Button = layer === 'shadcn' ? ShadcnButton : UiButton`.

Rule of thumb: if removing the context changes *which component renders*, it's the banned pattern. If it changes *what data the same component renders*, it's allowed.

## Locate-test (worked)

| Prompt | Folder(s) to open |
|---|---|
| "Enable token override for shadcn" | `features/token-override/` + `features/shadcn-rail/index.tsx` |
| "Tweak the md rail" | `features/md-rail/` |
| "Top nav settings menu" | `features/top-nav/` |
| "Test surface in www" | `features/testbed/` (or `app/(app)/sink/page.tsx`) |
| "Add a contribution-history block" | `app/(app)/theme/(md)/components/_blocks/` |
| "Tweak source-color picker" | `features/source-color/` |
| Toast provider, app-wide | `app/_providers.tsx` |
| Toast provider, feature-scoped | `features/<x>/providers.tsx` |
| Clipboard wrapper | `lib/` |

## Chrome vs canvas (per ADR-0019)

- **Chrome** = editor shell (rail, top tabs, status strip, modals, settings, cross-route layer switcher). Always sourced from `components/ui/`, on every route. Tonex dogfoods its own md-styled component library regardless of which output the user is generating.
- **Canvas** = preview surface inside `app/(app)/theme/{(md), (shadcn)/shadcn}/...`. Layer-segmented: md canvas reads from `components/ui/`; shadcn canvas reads from `components/shadcn/`.

A shadcn user sees an md-styled editor with a shadcn-styled canvas. That is intentional — the editor IS a tonex product, not a generic shell.

## How to apply

- **New workflow** → does any existing prompt name it? If yes, that's the feature name. If no, name it after the verb the user would say.
- **New surface** → name it after the place. Layer-keyed allowed (`md-rail`, `shadcn-rail`).
- **Tempted to put workflow logic into a surface feature** → refuse. The surface composes; the workflow lives in its own folder.
- **Tempted to fork a workflow per layer** (`features/md-token-override/` + `features/shadcn-token-override/`) → refuse. One workflow feature; layer comes from `<LayerContext>`.
- **Tempted to create `features/shared/`** → refuse. Promote to `components/` if 2+ features need it; otherwise keep private.
- **Tempted to nest sub-features** → refuse. Split into siblings once the trigger fires.
- **Tempted to add runtime primitive switching** → refuse. Route-level segmentation is the layer mechanism (ADR-0019).
- **Tempted to drop a block into `components/`** → refuse. Canvas content is route-colocated under `_<bucket>/`. Promote to a feature only when 2+ pages import it.

## Why these rules exist

Pattern-gravity reframed as agent-locality. The locate-test makes "is this folder right?" falsifiable: if a prompt naming X doesn't land on `features/<X>/` or a primitive, the structure has missed a name. The workflow/surface split (rule 5) resolves the homelessness problem that the original rule 5 created when cross-layer workflows had no shared home. The `<LayerContext>` allowance (in ADR-0019's 2026-05-08 amendment) separates legitimate behavior parameterization from the runtime primitive switching that remains banned.

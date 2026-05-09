> **State:** Living. Edit when the route plan, feature template, or rule set changes.

# www structure

`apps/www/src/` is feature-first under explicit anti-rot rules. Authoritative ADRs: **ADR-0014** (rules 1–4), **ADR-0022** (rules 5–6, supersedes original rule 5). Route plan and chrome/canvas split are fixed by **ADR-0019** (with the `<LayerContext>` clarification in its 2026-05-08 amendment).

## Six rules

1. **One-level features.** `features/<name>/` is the only namespace level. Sub-folders inside a feature are organisational only — never sub-features. If a folder under `features/<name>/` carries a perceivable workflow (its own panel, its own user-facing flow), it splits into a sibling feature. Trigger: ~10+ files **and** a perceivable separate workflow.
2. **`index.ts` per feature.** Every feature exposes a public surface; routes and other features import only from `features/<name>`. **No bare files at `features/` root.**
3. **Providers by scope.** App-wide → `app/_providers.tsx`. Feature-scoped → inside the feature folder. **No top-level `providers/`.**
4. **`components/` is `ui/`(primitives), `shadcn/`(primitives), `shared/`(reusable components across features, only when 2+ features import it) and `icons/`(icons that icon libs are missing).** Single-feature components stay private to their feature.
5. **Two classes of features, both named after what the prompt calls them** (per ADR-0022):
   - **Workflow features** (verb/action — "what the user does"): layer-agnostic. Examples: `features/token-override/`, `features/source-color/`, `features/scheme-variant/`, `features/custom-colors/`, `features/surface-adjustment/`, `features/palette-override/`, `features/export/`.
   - **Surface features** (noun/place — "where the user is"): layer-keyed names allowed and encouraged here, because surfaces ARE the layer-specific composition site. Examples: `features/md-rail/`, `features/shadcn-rail/`, `features/top-nav/`, `features/testbed/`. Surface features compose workflow features; they don't carry workflow logic of their own beyond layout and tab switching.
6. **Locate-test is the design metric** (per ADR-0022). A prompt of the form "do X to Y" must resolve to one folder under `features/<Y>/` or one primitive under `components/`. If neither home exists, **create the named feature folder before writing code** — don't tuck the work inside an unrelated folder.

## Layout

Chrome (rail + top tabs) lives in the per-layer layouts; there is no shared
`theme/layout.tsx`. Each per-layer layout is a Server Component that provides
`<LayerContext>` and renders a tiny client wrapper (`_md-nav-tabs.tsx` /
`_shadcn-nav-tabs.tsx`) which imports its colocated `_nav-config.ts` (typed as
`NavConfig`) and passes it to `<NavTabs>`. The wrapper exists because
`NavConfig` carries lucide forwardRef icons which are not serializable across
the RSC boundary — keeping the config import inside a client module avoids the
crossing without forcing the layout itself to be `'use client'`. The same
config object also feeds `<SiteCommandMenu>` so the two surfaces can't drift.

```
apps/www/src/
  app/
    layout.tsx                        # outer chrome
    _providers.tsx                    # app-wide providers ONLY here
    (app)/                            # main app group
      (root)/page.tsx                 # chooser landing
      sink/page.tsx                   # testbed route; retires after parity
      theme/
        (md)/
          layout.tsx                  # Server: <LayerProvider value="md"> + MdRail + <MdNavTabs/>
          _md-nav-tabs.tsx            # 'use client' — bridges config across RSC boundary
          _nav-config.ts              # mdNavConfig: tabs, exportTabs, crossLink
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
            layout.tsx                # Server: <LayerProvider value="shadcn"> + chrome + ShadcnProvider
            _shadcn-nav-tabs.tsx      # 'use client' — bridges config across RSC boundary
            _nav-config.ts            # shadcnNavConfig
            _provider.tsx             # ShadcnProvider (canvas-scoped)
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
    shadcn-rail/                      # NOT YET — both layouts mount md-rail until this ships
    top-nav/
    testbed/                          # retiring after parity
  components/
    ui/                               # md-styled primitives (BaseUI + tailwind-variants + md tokens)
    shadcn/                           # shadcn-styled primitives
    shared/                           # components that are used by 2+ features
    icons/                            # icons that icon libs are missing
  lib/
    layer-context.tsx                 # LayerProvider + useLayer (ADR-0019 amendment, ADR-0022 c.3)
    nav-config.ts                     # NavTab + NavConfig types (consumed by NavTabs + SiteCommandMenu)
    handles.ts                        # cross-component dialog/popover handles
    hooks/                            # cross-feature hooks
  styles/
```

Most slots are created on demand. The `app/(app)/theme/(md|shadcn)/layout.tsx` files, their `_nav-config.ts`, the `_providers.tsx`, and the `features/`/`components/` core are not.

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
| "Show all md palettes on the palettes page" | `app/(app)/theme/(md)/palettes/page.tsx` (inline) or sibling `_palettes-view.tsx` |
| "Edit md role colors on the color-roles page" | `features/color-roles-list/` |
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
- **Tempted to create `features/<X>/` for content with one route consumer and hardcoded layer-specific naming** → run the discriminator below before deciding. The 2025 prototype mixed display content and workflow into single files; the porting question is which side a given block falls on, not "feature or not."

  **Discriminator** (apply in order):
  1. Does the component **mutate source state** (calls `setSource*`, `setMd3TokenOverride`, store actions)? → **workflow feature**, file under `features/<name>/` even when layer-hardcoded today. Layer-awareness can be added later via `<LayerContext>` without moving the file. Examples: `features/palette-override/`, `features/color-roles-list/`.
  2. Is it **passive display** (reads `useResolvedTokens` / `useSource` selectors only, no mutations) AND hardcodes layer-specific names (`MD_PALETTE_FAMILY_NAMES`, MD3-only roles, shadcn-only tokens) AND has one consumer? → **route-content**, colocate at the route (`page.tsx` inline or sibling `_<view>.tsx`) per ADR-0014 rule 4. Example: `_color-palettes.tsx` under `(md)/palettes/`.
  3. Layer-agnostic, or ≥2 consumers? → **feature**, regardless of mutation.

  The mutation test is decisive because workflow files accrete sub-components, hooks, and utilities (editor popover, swatch, contrast utils) that need a folder to live in. Display files don't — they stay flat.

## Why these rules exist

Pattern-gravity reframed as agent-locality. The locate-test makes "is this folder right?" falsifiable: if a prompt naming X doesn't land on `features/<X>/` or a primitive, the structure has missed a name. The workflow/surface split (rule 5) resolves the homelessness problem that the original rule 5 created when cross-layer workflows had no shared home. The `<LayerContext>` allowance (in ADR-0019's 2026-05-08 amendment) separates legitimate behavior parameterization from the runtime primitive switching that remains banned.
